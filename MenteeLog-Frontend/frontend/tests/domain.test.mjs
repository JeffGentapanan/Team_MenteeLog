import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedData} from '../dist/js/data.js';
import {canAccess,escapeHTML,hoursBetween,approvedHours,visibleStudents,visibleLogs,visibleApplications,validateUpload,csvText,parseCSV,applyToJob,reviewLog} from '../dist/js/domain.js';
import {createApiClient,ApiError} from '../dist/js/api.js';

test('routes isolate each portal',()=>{
  assert.equal(canAccess('Student','users'),false);
  assert.equal(canAccess('Supervisor','reports'),false);
  assert.equal(canAccess('Coordinator','users'),true);
  assert.equal(canAccess('Student','dtr'),true);
  assert.equal(canAccess('Unknown','profile'),false);
  for(const role of ['Student','Supervisor','Coordinator']){
    for(const page of ['goals','messages','program'])assert.equal(canAccess(role,page),false);
  }
  assert.equal(canAccess('Supervisor','applications'),true);
  assert.equal(canAccess('Supervisor','candidates'),true);
  assert.equal(canAccess('Coordinator','jobs'),true);
});
test('attendance calculates overnight shifts and unpaid breaks',()=>{
  assert.equal(hoursBetween('2026-09-25T22:00:00+08:00','2026-09-26T07:00:00+08:00',60),8);
  assert.throws(()=>hoursBetween('2026-09-25T08:00:00Z','2026-09-25T07:00:00Z'));
  assert.throws(()=>hoursBetween('2026-09-25T08:00:00Z','2026-09-25T09:00:00Z',60));
  assert.throws(()=>hoursBetween('bad','date'));
  assert.throws(()=>hoursBetween('2026-09-25T08:00:00Z','2026-09-27T09:00:00Z'));
});
test('only approved hours count and duplicate review is blocked',()=>{
  const db=seedData(),supervisor=db.users.find(u=>u.id==='v1');
  assert.equal(approvedHours(db,'s1'),312);
  reviewLog(db,supervisor,'l4','Approved','Supporting documentation reviewed.','Carlos Jose');
  assert.equal(approvedHours(db,'s1'),320);
  assert.throws(()=>reviewLog(db,supervisor,'l4','Approved','Reviewed','Carlos Jose'));
});
test('supervisors cannot approve another supervisor’s or student’s records',()=>{
  const db=seedData();
  assert.throws(()=>reviewLog(db,{id:'other',role:'Supervisor'},'l5','Approved','OK','Other'));
  assert.throws(()=>reviewLog(db,db.users[0],'l4','Approved','OK','Maria'));
  assert.throws(()=>reviewLog(db,db.users.find(u=>u.id==='v1'),'l5','Approved','','Carlos'));
});
test('record queries enforce assigned scope in the demo',()=>{
  const db=seedData(),u=db.users[0],v=db.users.find(u=>u.id==='v1');
  assert.ok(visibleLogs(db,u).every(l=>l.studentId===u.id));
  assert.equal(visibleStudents(db,v).length,3);
  assert.equal(visibleLogs(db,{role:'Supervisor',id:'unknown'}).length,0);
  assert.ok(visibleApplications(db,u).every(a=>a.studentId===u.id));
});
test('applications reject duplicates, closed jobs, and non-students',()=>{
  const db=seedData(),u=db.users[0];
  assert.throws(()=>applyToJob(db,u,'j1'));
  applyToJob(db,u,'j2');
  assert.throws(()=>applyToJob(db,u,'j2'));
  db.jobs[2].status='Closed';assert.throws(()=>applyToJob(db,u,'j3'));
  assert.throws(()=>applyToJob(db,{id:'v1',role:'Supervisor'},'j4'));
});
test('upload checks reject active content, MIME mismatches and large files',()=>{
  assert.equal(validateUpload({name:'report.pdf',size:100,type:'application/pdf'}),true);
  for(const file of [{name:'payload.svg',type:'image/svg+xml',size:100},{name:'x.pdf',type:'text/html',size:100},{name:'large.pdf',type:'application/pdf',size:6*1024*1024},{name:'empty.pdf',size:0}])assert.throws(()=>validateUpload(file));
});
test('HTML escaping and CSV formula neutralization protect rendered/exported data',()=>{
  assert.equal(escapeHTML('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.match(csvText([['=HYPERLINK("x")','+1','@SUM(A1)','normal']]),/"'=HYPERLINK/);
  assert.deepEqual(parseCSV('identifier,name,email,course\r\n1,"Santos, Maria",m@example.edu,BSCS'),[['identifier','name','email','course'],['1','Santos, Maria','m@example.edu','BSCS']]);
  assert.throws(()=>parseCSV('a,"unclosed'));
});
test('API client requires same-origin URL and CSRF for writes',async()=>{
  assert.throws(()=>createApiClient({baseUrl:'https://other.test/api'}));
  assert.throws(()=>createApiClient({baseUrl:'//other.test/api'}));
  assert.throws(()=>createApiClient({baseUrl:'/\\other.test/api'}));
  let calls=0;
  const api=createApiClient({fetcher:async()=>{calls++;return new Response('{}');}});
  await assert.rejects(()=>api.jobs.create({title:'Intern'}),e=>e instanceof ApiError&&e.status===403);
  assert.equal(calls,0);
});
test('API sends cookies/CSRF, handles unauthorized responses and empty success',async()=>{
  let received;
  const api=createApiClient({csrfToken:()=> 'server-issued-token',fetcher:async(url,options)=>{received={url,options};return new Response(null,{status:204});}});
  assert.equal(await api.auth.logout(),null);
  assert.equal(received.options.credentials,'same-origin');
  assert.equal(received.options.headers['X-CSRF-Token'],'server-issued-token');
  const denied=createApiClient({fetcher:async()=>new Response(JSON.stringify({message:'Session expired'}),{status:401})});
  await assert.rejects(()=>denied.auth.session(),e=>e.status===401&&e.message==='Session expired');
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedData} from '../dist/js/data.js';
import {reviewBatch,assignPlacement,reportRows,reportPDF,candidateImport} from '../dist/js/portal-domain.js';

test('batch review is atomic when one record is stale or outside assigned scope',()=>{
  const db=seedData(),u=db.users.find(s=>s.id==='v1');
  assert.throws(()=>reviewBatch(db,u,['l5','l0'],'Approved','Reviewed','Carlos'));
  assert.equal(db.logs.find(l=>l.id==='l5').status,'Pending');
  db.logs.push({...db.logs.find(l=>l.id==='l5'),id:'foreign',supervisorId:'other'});
  assert.throws(()=>reviewBatch(db,u,['l5','foreign'],'Approved','Reviewed','Carlos'));
  assert.equal(db.logs.find(l=>l.id==='l5').status,'Pending');
  reviewBatch(db,u,['l4','l5'],'Approved','Reviewed','Carlos');
  assert.equal(db.logs.find(l=>l.id==='l5').status,'Approved');
});
test('placement batches preserve capacity and existing assignments on validation failure',()=>{
  const db=seedData(),co=db.users.find(s=>s.id==='c1'),j=db.jobs[0];
  const before=j.slots;
  assert.throws(()=>assignPlacement(db,co,['s4','s1'],'j1',500));
  assert.equal(j.slots,before);assert.equal(db.users.find(s=>s.id==='s4').company,'');
  assert.throws(()=>assignPlacement(db,db.users[0],['s4'],'j1',500));
  assignPlacement(db,co,['s4'],'j1',500);
  assert.equal(j.slots,before-1);assert.equal(db.applications.find(a=>a.studentId==='s4').status,'Accepted');
  assert.throws(()=>assignPlacement(db,co,['s4'],'j1',500));
});
test('CSV preview accepts aliases and rejects duplicates without mutating accounts',()=>{
  const db=seedData(),count=db.users.length;
  const batch=candidateImport(db,'SR Code,Full Name,Email,Program\n2026-9001,Demo Candidate,candidate@example.edu,BSIT');
  assert.equal(batch[0].identifier,'2026-9001');assert.equal(db.users.length,count);
  assert.throws(()=>candidateImport(db,'identifier,name,email,course\n2021-00421,Duplicate,a@example.edu,BSIT'));
  assert.throws(()=>candidateImport(db,'identifier,name,email,course\nx,One,a@example.edu,BSIT\ny,Two,a@example.edu,BSIT'));
});
test('compliance reports honor date and program filters',()=>{
  const db=seedData();const rows=reportRows(db,'compliance',{from:'2026-09-25',to:'2026-09-25',course:'BS Information Technology'});
  assert.equal(rows.length,2);assert.equal(rows[1][0],'Joshua Dilera');
});
test('PDF export produces valid object offsets and paginates escaped text',()=>{
  const pdf=reportPDF('Review (sample)',Array.from({length:100},(_,i)=>['Row '+i,'A \\ B (C)']));
  assert.ok(pdf.startsWith('%PDF-1.4'));assert.match(pdf,/\/Count 3/);assert.match(pdf,/Review \\\(sample\\\)/);
  const start=Number(pdf.match(/startxref\n(\d+)/)[1]);assert.equal(pdf.slice(start,start+4),'xref');
  const entries=pdf.slice(start).split('\n').slice(3).filter(s=>/^\d{10} 00000 n/.test(s));
  entries.forEach((entry,i)=>assert.ok(pdf.slice(Number(entry.slice(0,10))).startsWith((i+1)+' 0 obj')));
});

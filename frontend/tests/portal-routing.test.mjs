import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPortalViews} from '../dist/js/portal-views.js';
import {seedData} from '../dist/js/data.js';
import {escapeHTML,visibleLogs} from '../dist/js/domain.js';

function harness(role){
  const db=seedData(),user=db.users.find(u=>u.role===role);let route={role:role.toLowerCase(),page:'dashboard',sub:'',id:''};
  const html=(label,...values)=>'<div>'+escapeHTML(label)+values.filter(v=>typeof v==='string').join('')+'</div>';
  const context={db,user,view:{search:'',filter:'All',course:'All',mode:'All'},route:()=>route,e:escapeHTML,icon:()=>'',button:html,heading:html,field:html,textarea:html,select:html,badge:html,person:s=>s?.name||'',table:(headers,rows)=>headers.join(' ')+rows.join(''),empty:html,progress:html,date:v=>v||'',time:v=>v||'',today:()=> '2026-09-28',student:id=>db.users.find(s=>s.id===id),job:id=>db.jobs.find(j=>j.id===id),dtrTable:(logs)=>logs.map(l=>l.id).join(','),link:html,visibleIncidents:u=>db.incidents.filter(i=>u.role==='Coordinator'||(u.role==='Student'?i.studentId===u.id:i.supervisorId===u.id)),capture:fn=>{fn();return {title:'Form',body:'Fields',onSubmit:()=>{},label:'Submit'};},legacy:Object.fromEntries(['editJob','studentDetail','incidentNew','incidentDetail','evaluate','logDetail','editHTE'].map(name=>[name,()=>{}])),save(){},notify(){},audit(){},toast(){},render(){}};
  const portals=createPortalViews(context);
  return {db,user,portals,open(page,sub='',id=''){route={role:role.toLowerCase(),page,sub,id};globalThis.location={hash:'#/'+role.toLowerCase()+'/'+page+(sub?'/'+sub:'')+(id?'/'+id:'')};return portals.page(page,user);}};
}
test('portal renderer resolves nested reference screens without runtime failures',()=>{
  const coordinator=harness('Coordinator');
  for(const args of [['hte'],['hte','new','1'],['hte','renew','h1'],['hte','renewals'],['hte','activity'],['candidates'],['candidates','grid'],['candidates','companies'],['candidates','unassigned'],['candidates','cohort'],['candidates','performance'],['candidates','exports'],['candidates','profile','s1'],['candidates','assign','s4'],['candidates','batch'],['dtr'],['dtr','profile','s1'],['dtr','flagged'],['dtr','review','l4'],['reports'],['reports','configure','deployment'],['reports','history'],['reports','analytics'],['users'],['users','registered'],['users','rbac'],['users','import'],['incidents'],['incidents','detail','IR-048'],['incidents','new'],['incidents','investigate','IR-048']])assert.ok(coordinator.open(...args).includes('reference-portal'),args.join('/'));
  const supervisor=harness('Supervisor');for(const args of [['dashboard'],['jobs'],['jobs','archived'],['jobs','detail','j1'],['jobs','edit','j1'],['dtr'],['dtr','profile','s1'],['appraisals'],['appraisals','evaluate','s1'],['incidents'],['incidents','detail','IR-048']])assert.ok(supervisor.open(...args).includes('reference-portal'),args.join('/'));
  const student=harness('Student');for(const args of [['jobs'],['jobs','detail','j1'],['applications'],['dtr'],['documents'],['incidents'],['incidents','new'],['incidents','detail','IR-048'],['appraisals'],['notifications']])assert.ok(student.open(...args).includes('reference-portal'),args.join('/'));
});
test('nested record routes reject unauthorized records and management pages',()=>{
  const student=harness('Student');assert.throws(()=>student.open('hte'));assert.throws(()=>student.open('reports'));assert.throws(()=>student.open('users'));assert.throws(()=>student.open('dtr','profile','s2'));assert.throws(()=>student.open('incidents','investigate','IR-048'));
  const supervisor=harness('Supervisor');assert.throws(()=>supervisor.open('jobs','detail','j2'));assert.throws(()=>supervisor.open('candidates','profile','s4'));assert.throws(()=>supervisor.open('dtr','review','l4'));
});
test('notification lists do not include another user’s notifications',()=>{
  const student=harness('Student');const page=student.open('notifications');assert.ok(page.includes('Your placement is confirmed'));assert.ok(!page.includes('A DTR is ready for review'));
});

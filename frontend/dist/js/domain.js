import {navigation, roles} from './data.js';
export function canAccess(role,page) { return roles.includes(role) && (['profile','notifications'].includes(page)||navigation[role].some(n=>n[0]===page)||(role==='Supervisor'&&['candidates','applications'].includes(page))||(role==='Coordinator'&&page==='jobs')); }
export function escapeHTML(value='') {return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function hoursBetween(start,end,breakMinutes=0) {
  const difference = (new Date(end)-new Date(start))/3600000;
  if(!Number.isFinite(difference)||difference<=0||difference>24||!Number.isFinite(Number(breakMinutes))||breakMinutes<0||breakMinutes>=difference*60) throw new Error('Check the times and break duration. A shift must be between 0 and 24 hours.');
  return Math.round((difference-Number(breakMinutes)/60)*100)/100;
}
export function approvedHours(db,id) {return (db.users.find(u=>u.id===id)?.baseHours||0)+db.logs.filter(l=>l.studentId===id&&l.status==='Approved').reduce((sum,l)=>sum+l.hours,0);}
export function visibleStudents(db,user) {return db.users.filter(u=>u.role==='Student'&&(user.role==='Coordinator'||u.supervisorId===user.id));}
export function visibleLogs(db,user) {return db.logs.filter(l=>user.role==='Student'?l.studentId===user.id:user.role==='Supervisor'?l.supervisorId===user.id:true);}
export function visibleApplications(db,user) {return db.applications.filter(a=>user.role==='Student'?a.studentId===user.id:user.role==='Supervisor'?db.jobs.some(j=>j.id===a.jobId&&j.supervisorId===user.id):true);}
export function validateUpload(file) {
  if(!file||!file.name||file.size===0) throw new Error('Choose a non-empty file.');
  if(file.size>5*1024*1024) throw new Error('Files must be 5 MB or smaller.');
  const allowed={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg'};
  const ext=file.name.split('.').pop().toLowerCase();
  if(!allowed[ext]||(file.type&&file.type!==allowed[ext])) throw new Error('Upload a PDF, PNG, or JPEG file.');
  return true;
}
export function csvText(rows) {return '\uFEFF'+rows.map(row=>row.map(value=>{let v=String(value??'');if(/^[\s]*[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export function parseCSV(text) {
  const rows=[];let row=[],field='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field.trim());field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;}
  if(quoted)throw new Error('The CSV contains an unclosed quoted field.');
  row.push(field.trim());if(row.some(Boolean))rows.push(row);return rows;
}
export function applyToJob(db,user,jobId) {
  if(user.role!=='Student')throw new Error('Only students can submit applications.');
  const job=db.jobs.find(j=>j.id===jobId);
  if(!job||job.status!=='Active'||job.slots<1)throw new Error('This position is no longer open.');
  if(db.applications.some(a=>a.studentId===user.id&&a.jobId===jobId&&a.status!=='Rejected'))throw new Error('You already have an application for this position.');
  const application={id:crypto.randomUUID(),studentId:user.id,jobId,status:'Pending',date:new Date().toISOString().slice(0,10),note:''};
  db.applications.push(application);return application;
}
export function reviewLog(db,user,id,status,remarks,signature) {
  const log=db.logs.find(l=>l.id===id);
  if(user.role!=='Supervisor'||!log||log.supervisorId!==user.id)throw new Error('This attendance record is outside your review scope.');
  if(!['Approved','Rejected','Flagged'].includes(status)||!['Pending','Flagged'].includes(log.status))throw new Error('This record cannot be reviewed in its current state.');
  if(!remarks.trim()||!signature.trim())throw new Error('Review remarks and a typed signature are required.');
  Object.assign(log,{status,remarks,signature,approvedAt:status==='Approved'?new Date().toISOString():null});return log;
}

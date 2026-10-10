const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/portal-views.js', 'utf8');

// 1. Update incidents() submit handler
const incidentsTargetRegex = /let evidence=null;const file=el\.elements\.evidence\.files\[0\];if\(file\)\{validateUpload\(file\);evidence=\{id:crypto\.randomUUID\(\),name:file\.name\};await c\.putFile\(evidence\.id,file\);\}const i=\{[\s\S]*?id:IR-[\s\S]*?meeting:null,_pending:true\};delete i\.studentName;db\(\)\.incidents\.unshift\(i\);c\.render\(\);const \{ error, data: inserted \} = await supabase\.from\('incidents'\)\.insert\(\{[\s\S]*?\}\)\.select\(\)\.single\(\);if \(error \|\| !inserted\) \{db\(\)\.incidents = db\(\)\.incidents\.filter\(x => x\.id !== i\.id\);c\.render\(\);throw new Error\(error \? error\.message : 'Insert failed or was rejected by security rules\.'\);\}/;

const incidentsReplacement = `const incCode = 'IR-' + crypto.randomUUID().slice(0, 8).toUpperCase();
let evidence = null;
const file = el.elements.evidence.files[0];
if (file) {
  validateUpload(file);
  evidence = await c.legacy.uploadEvidence(file, incCode);
}
const i={...v,id:incCode,studentId:sid,supervisorId:s.supervisorId,category:role==='Student'?'Student_Claim':co?v.category:'Disciplinary_Violation',date:today(),status:'Pending',evidence,notes:[],meeting:null,_pending:true};
delete i.studentName;
db().incidents.unshift(i);
c.render();
const { error, data: inserted } = await supabase.from('incidents').insert({ code: i.id, student_id: sid, supervisor_id: s.supervisorId || null, category: i.category, title: i.title, description: i.description, priority: i.priority, status: i.status, date: i.date, log_id: i.logId || null, evidence: i.evidence ? JSON.stringify(i.evidence) : null, notes: i.notes, meeting: i.meeting }).select().single();
if (error || !inserted) {
  if (evidence && evidence.filePath) {
    try { await supabase.storage.from(evidence.bucket).remove([evidence.filePath]); } catch (e) { console.warn('Failed to cleanup orphan evidence', e); }
  }
  db().incidents = db().incidents.filter(x => x.id !== i.id);
  c.render();
  throw new Error(error ? error.message : 'Insert failed or was rejected by security rules.');
}`;

c = c.replace(incidentsTargetRegex, incidentsReplacement);

// 2. Update previewFile
const previewTarget = "if(doc.filePath){";
const previewReplacement = "if(doc.filePath){url=await c.legacy.getSignedUrl(doc.filePath, doc.bucket || 'documents');if(!url)throw new Error('Unable to preview document.');}else if(false){";
// Wait, the original was:
/*
      if(doc.filePath){
         url=await c.legacy.getSignedUrl(doc.filePath);
         if(!url)throw new Error('Unable to preview document.');
      }else{
*/
c = c.replace(
  "url=await c.legacy.getSignedUrl(doc.filePath);",
  "url=await c.legacy.getSignedUrl(doc.filePath, doc.bucket || 'documents');"
);

fs.writeFileSync('frontend-react/src/js/portal-views.js', c);

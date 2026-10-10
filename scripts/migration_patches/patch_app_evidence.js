const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

// 1. Add uploadEvidence
const putFileTarget = "const putFile=(id,file)=>fileOp('put',id,file);";
const helperCode = `async function uploadEvidence(file, incCode) {
  const u = currentUser();
  let safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/^\.+/, '').replace(/\\.{2,}/g, '.').substring(0, 100);
  if (!safeName) safeName = 'file';
  const filePath = \`\${u.id}/\${incCode}/\${Date.now()}-\${safeName}\`;
  const { error: uploadErr } = await supabase.storage.from('incident-evidence').upload(filePath, file, { upsert: false, contentType: file.type });
  if (uploadErr) throw new Error('Evidence upload failed: ' + uploadErr.message);
  return { id: crypto.randomUUID(), name: file.name, filePath, bucket: 'incident-evidence' };
}
const putFile=(id,file)=>fileOp('put',id,file);`;
c = c.replace(putFileTarget, helperCode);

// 2. Add to legacy exports
c = c.replace(
  "legacy:{applicationDetail,editJob,studentDetail,incidentNew,incidentDetail,evaluate,logDetail,editHTE,userNew,importUsers,documentUpload,assignPlacementRemote,getSignedUrl:async(p)=>(await supabase.storage.from('documents').createSignedUrl(p,60)).data?.signedUrl}",
  "legacy:{uploadEvidence,applicationDetail,editJob,studentDetail,incidentNew,incidentDetail,evaluate,logDetail,editHTE,userNew,importUsers,documentUpload,assignPlacementRemote,getSignedUrl:async(p, b='documents')=>(await supabase.storage.from(b==='incident-evidence'?'incident-evidence':'documents').createSignedUrl(p,60)).data?.signedUrl}"
);

// 3. Update file-download
c = c.replace(
  "const {data,error}=await supabase.storage.from('documents').createSignedUrl(doc.filePath,60);",
  "const bucket=(doc.bucket==='incident-evidence'?'incident-evidence':'documents');const {data,error}=await supabase.storage.from(bucket).createSignedUrl(doc.filePath,60);"
);

// 4. Update incidentNew()
const incidentNewTargetRegex = /let evidence=null;const file=form\.elements\.evidence\.files\[0\];if\(file\)\{validateUpload\(file\);evidence=\{id:crypto\.randomUUID\(\),name:file\.name\};await putFile\(evidence\.id,file\);\}const incident=\{id:'IR-'\+crypto\.randomUUID\(\)\.slice\(0,8\)\.toUpperCase\(\),studentId:sid,supervisorId:u\.role==='Supervisor'\?u\.id:u\.supervisorId,category:u\.role==='Student'\?'Student_Claim':'Disciplinary_Violation',title:data\.title,description:data\.description,priority:data\.priority,status:'Pending',date:today\(\),logId:data\.logId\|\|null,evidence,notes:\[\],meeting:null\};\s*const \{ error, data: inserted \} = await supabase\.from\('incidents'\)\.insert\(\{[\s\S]*?\}\)\.select\(\);\s*if \(error \|\| !inserted \|\| inserted\.length === 0\) \{\s*throw new Error\(error \? error\.message : 'Insert failed or was rejected by security rules\.'\);\s*\}/;

const incidentNewReplacement = `const incCode = 'IR-' + crypto.randomUUID().slice(0, 8).toUpperCase();
let evidence = null;
const file = form.elements.evidence.files[0];
if (file) {
  validateUpload(file);
  evidence = await uploadEvidence(file, incCode);
}
const incident = {
  id: incCode,
  studentId: sid,
  supervisorId: u.role === 'Supervisor' ? u.id : u.supervisorId,
  category: u.role === 'Student' ? 'Student_Claim' : 'Disciplinary_Violation',
  title: data.title,
  description: data.description,
  priority: data.priority,
  status: 'Pending',
  date: today(),
  logId: data.logId || null,
  evidence,
  notes: [],
  meeting: null
};
const { error, data: inserted } = await supabase.from('incidents').insert({
  code: incident.id,
  student_id: incident.studentId,
  supervisor_id: incident.supervisorId,
  category: incident.category,
  title: incident.title,
  description: incident.description,
  priority: incident.priority,
  status: incident.status,
  date: incident.date,
  log_id: incident.logId,
  evidence: incident.evidence ? JSON.stringify(incident.evidence) : null,
  notes: incident.notes,
  meeting: incident.meeting
}).select();
if (error || !inserted || inserted.length === 0) {
  if (evidence && evidence.filePath) {
    try { await supabase.storage.from(evidence.bucket).remove([evidence.filePath]); } catch (e) { console.warn('Failed to cleanup orphan evidence', e); }
  }
  throw new Error(error ? error.message : 'Insert failed or was rejected by security rules.');
}`;

c = c.replace(incidentNewTargetRegex, incidentNewReplacement);

fs.writeFileSync('frontend-react/src/js/app.js', c);

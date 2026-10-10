const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/portal-views.js', 'utf8');

const target = `const i={...v,id:'IR-'+crypto.randomUUID().slice(0,8).toUpperCase(),studentId:sid,supervisorId:s.supervisorId,category:role==='Student'?'Student_Claim':co?v.category:'Disciplinary_Violation',date:today(),status:'Pending',evidence,notes:[],meeting:null};delete i.studentName;db().incidents.unshift(i);db().users.filter(v=>v.role==='Coordinator'||v.id===s.supervisorId).forEach(v=>c.notify(v.id,'Incident_Alert','New incident report',i.id+': '+i.title));finish('Incident submitted for coordinator review.');`;

const replacement = `const i={...v,id:'IR-'+crypto.randomUUID().slice(0,8).toUpperCase(),studentId:sid,supervisorId:s.supervisorId,category:role==='Student'?'Student_Claim':co?v.category:'Disciplinary_Violation',date:today(),status:'Pending',evidence,notes:[],meeting:null,_pending:true};delete i.studentName;db().incidents.unshift(i);c.render();const { error, data: inserted } = await supabase.from('incidents').insert({ code: i.id, student_id: sid, supervisor_id: s.supervisorId || null, category: i.category, title: i.title, description: i.description, priority: i.priority, status: i.status, date: i.date, log_id: i.logId || null, evidence: i.evidence ? JSON.stringify(i.evidence) : null, notes: i.notes, meeting: i.meeting }).select().single();if (error || !inserted) {db().incidents = db().incidents.filter(x => x.id !== i.id);c.render();throw new Error(error ? error.message : 'Insert failed or was rejected by security rules.');}delete i._pending;const savedRow = { id: inserted.code, studentId: inserted.student_id, supervisorId: inserted.supervisor_id, category: inserted.category, title: inserted.title, description: inserted.description, priority: inserted.priority, status: inserted.status, date: inserted.date, logId: inserted.log_id, evidence: inserted.evidence ? (typeof inserted.evidence === 'string' ? JSON.parse(inserted.evidence) : inserted.evidence) : null, meeting: inserted.meeting, notes: inserted.notes || [] };const idx = db().incidents.findIndex(x => x.id === i.id);if (idx !== -1) db().incidents[idx] = savedRow;db().users.filter(v=>v.role==='Coordinator'||v.id===s.supervisorId).forEach(v=>c.notify(v.id,'Incident_Alert','New incident report',i.id+': '+i.title));finish('Incident submitted for coordinator review.');`;

if (!c.includes(target)) {
    console.error("Target not found!");
}

c = c.replace(target, replacement);
fs.writeFileSync('frontend-react/src/js/portal-views.js', c);

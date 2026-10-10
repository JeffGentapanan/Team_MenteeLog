const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend-react', 'src', 'js', 'app.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. incidentNew
const oldIncidentNew = `db.incidents.unshift(incident);db.users.filter(v=>v.role==='Coordinator').forEach(v=>notify(v.id,'Incident_Alert','New incident report',incident.id+': '+incident.title));audit('Filed incident '+incident.id);save();toast('Incident saved for coordinator review.');},'Submit report');}`;

const newIncidentNew = `const { error, data: inserted } = await supabase.from('incidents').insert({
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
if (error) throw new Error(error.message);
if (!inserted || inserted.length === 0) throw new Error('Insert failed or rejected by security rules.');
await syncRemote(supabase, db);
const code = inserted[0].code;
db.users.filter(v=>v.role==='Coordinator').forEach(v=>notify(v.id,'Incident_Alert','New incident report',code+': '+incident.title));
audit('Filed incident '+code);
toast('Incident saved for coordinator review.');
},'Submit report');}`;

code = code.replace(oldIncidentNew, newIncidentNew);

// 2. incidentDetail
const oldIncidentDetail = `i.meeting=meeting;i.status=data.status;i.notes.push({text:data.note,author:u.name,date:new Date().toISOString()});notify(i.studentId,'Incident_Alert','Incident '+i.id+' updated',data.status+': '+data.note);if(i.supervisorId)notify(i.supervisorId,'Incident_Alert','Incident '+i.id+' updated',data.status+': '+data.note);audit('Updated incident '+i.id+' to '+i.status);save();toast('Case updated.');}:null,'Update case');}`;

const newIncidentDetail = `const newNotes = [...i.notes, {text:data.note,author:u.name,date:new Date().toISOString()}];
const { error, data: updated } = await supabase.from('incidents').update({ status: data.status, meeting, notes: newNotes }).eq('code', i.id).select();
if (error) throw new Error(error.message);
if (!updated || updated.length === 0) throw new Error('Update failed or rejected by security rules.');
await syncRemote(supabase, db);
notify(i.studentId,'Incident_Alert','Incident '+i.id+' updated',data.status+': '+data.note);
if(i.supervisorId)notify(i.supervisorId,'Incident_Alert','Incident '+i.id+' updated',data.status+': '+data.note);
audit('Updated incident '+i.id+' to '+data.status);
toast('Case updated.');
}:null,'Update case');}`;

code = code.replace(oldIncidentDetail, newIncidentDetail);

// 3. evaluate
const oldEvaluate = `db.appraisals.push({id:crypto.randomUUID(),applicationId:application.id,studentId:id,supervisorId:u.id,ratings,score:ratings.reduce((a,b)=>a+b)/ratings.length,comments:data.comments,signature:data.signature,date:new Date().toISOString()});notify(id,'System','Your performance appraisal is ready','View your supervisorAAA?sAA?zAs rubric scores and feedback.');audit('Submitted appraisal for '+s.name);save();toast('Evaluation submitted. The student can now view it.');},'Submit evaluation');}`;

const newEvaluate = `
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validAppId = uuidRegex.test(application.id) ? application.id : null;
const { error, data: inserted } = await supabase.from('appraisals').insert({
    application_id: validAppId,
    student_id: id,
    supervisor_id: u.id,
    ratings,
    score: ratings.reduce((a,b)=>a+b)/ratings.length,
    comments: data.comments,
    signature: data.signature
}).select();
if (error) throw new Error(error.message);
if (!inserted || inserted.length === 0) throw new Error('Insert failed or rejected by security rules.');
await syncRemote(supabase, db);
notify(id,'System','Your performance appraisal is ready','View your supervisor\\'s rubric scores and feedback.');
audit('Submitted appraisal for '+s.name);
toast('Evaluation submitted. The student can now view it.');
},'Submit evaluation');}`;

// There's some encoding mess in the evaluate string, let's use a regex replace for evaluate
code = code.replace(/db\.appraisals\.push\(\{id:crypto\.randomUUID\(\),applicationId:application\.id,studentId:id,supervisorId:u\.id,ratings,score:ratings\.reduce\(\(a,b\)=>a\+b\)\/ratings\.length,comments:data\.comments,signature:data\.signature,date:new Date\(\)\.toISOString\(\)\}\);notify\(id,'System','Your performance appraisal is ready','View your .*? rubric scores and feedback\.'\);audit\('Submitted appraisal for '\+s\.name\);save\(\);toast\('Evaluation submitted\. The student can now view it\.'\);\},'Submit evaluation'\);\}/g, newEvaluate);

fs.writeFileSync(filePath, code);
console.log('App.js updated successfully');

// Now portal-views.js modifications
const pFilePath = path.join(__dirname, 'frontend-react', 'src', 'js', 'portal-views.js');
let pCode = fs.readFileSync(pFilePath, 'utf8');

// 1. Justification (line ~211)
const oldJustification = `l.justification=v.justification;l.status='Pending';c.notify(l.supervisorId,'DTR_Event','Attendance justification submitted',u().name+' resubmitted '+date(l.date)+' for review.');finish('Justification submitted for supervisor review.','dtr');},'Submit');return true;}}`;

const newJustification = `const { error, data: updated } = await supabase.from('logs').update({ justification: v.justification, status: 'Pending' }).eq('id', l.id).select();
if (error) throw new Error(error.message);
if (!updated || updated.length === 0) throw new Error('Update failed or rejected by security rules.');
await c.syncRemote(supabase, db());
c.notify(l.supervisorId,'DTR_Event','Attendance justification submitted',u().name+' resubmitted '+date(l.date)+' for review.');
finish('Justification submitted for supervisor review.','dtr');},'Submit');return true;}}`;

pCode = pCode.replace(oldJustification, newJustification);

// 2. Coordinator Review (line ~311)
const oldCoordReview = `l.coordinatorRemarks=v.remarks;l.status=v.status;c.notify(l.supervisorId,'DTR_Event','DTR compliance review',c.student(l.studentId).name+': '+v.remarks);finish('Compliance review saved; supervisor sign-off is required.','dtr','flagged');},'Save & Notify Supervisor'));}`;

const newCoordReview = `(async () => {
const { error, data: updated } = await supabase.from('logs').update({ coordinator_remarks: v.remarks, status: v.status }).eq('id', l.id).select();
if (error) { alert(error.message); return; }
if (!updated || updated.length === 0) { alert('Update failed or rejected by security rules.'); return; }
await c.syncRemote(supabase, db());
c.notify(l.supervisorId,'DTR_Event','DTR compliance review',c.student(l.studentId).name+': '+v.remarks);
finish('Compliance review saved; supervisor sign-off is required.','dtr','flagged');
})();
},'Save & Notify Supervisor'));}`;

pCode = pCode.replace(oldCoordReview, newCoordReview);

// Task 4: Student job filters
pCode = pCode.replace(/'BSCS'/g, "'BS Computer Science'");
pCode = pCode.replace(/'Metro Manila'/g, "'BGC, Taguig'");

// Task 5: HTE string match
pCode = pCode.replace(/s\.company===h\.name/g, "(s.company || '').trim().toLowerCase() === (h.name || '').trim().toLowerCase()");

fs.writeFileSync(pFilePath, pCode);
console.log('Portal-views.js updated successfully');

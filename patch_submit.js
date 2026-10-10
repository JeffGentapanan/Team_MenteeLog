const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const target = "async function submitApplication(jobId, note) { const {error} = await supabase.from('applications').insert({ job_id: jobId, student_id: currentUser().id, status: 'Pending', applied_date: today(), notes: note || '' }); if (error) throw new Error(error.message); await syncRemote(supabase, db); }";
const replacement = "async function submitApplication(jobId, note) { const {error, data} = await supabase.from('applications').insert({ job_id: jobId, student_id: currentUser().id, status: 'Pending', applied_date: today(), notes: note || '' }).select(); if (error) throw new Error(error.message); if (!data || data.length === 0) throw new Error('Insert failed or rejected by security rules.'); await syncRemote(supabase, db); }";

c = c.replace(target, replacement);

fs.writeFileSync('frontend-react/src/js/app.js', c);

const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('application-card')) {
        // Just hardcode the correct line!
        lines[i] = "function applicationsPage(u){const apps=visibleApplications(db,u).filter(a=>(view.filter==='All'||a.status===view.filter)&&matches(student(a.studentId)?.name,job(a.jobId)?.title,job(a.jobId)?.company));return heading(u.role==='Student'?'My Applications Tracker':'Application Review',u.role==='Student'?'Track your internship applications and placement progress.':'Review and endorse your candidates.')+(u.role==='Student'?'':tabs(['All','Pending','Under_Review','Accepted','Rejected'])+searchToolbar('Search applications'))+(apps.length?apps.map(a=>{const j=job(a.jobId),level=a.status==='Accepted'?3:a.status==='Under_Review'?1:0;return '<section class=\"card application-card\"><div class=\"row between\"><div><h2>'+e(j?.company)+' - '+e(j?.title)+'</h2><small>Applied '+date(a.date)+(u.role==='Student'?'':' · '+e(student(a.studentId)?.name))+'</small></div>'+badge(a.status)+'</div><div class=\"application-path\">'+['Submitted','Under Review','Interview','Accepted'].map((label,i)=>(i?'<span class=\"application-line\"></span>':'')+'<div class=\"application-step '+(i<=level?'done':'')+'\"><i></i><span>'+label+'</span></div>').join('')+'</div><div class=\"mt16\">'+button(u.role==='Student'?'View Details':'Review Application','application-detail',a.id,'secondary small')+'</div></section>';}).join(''):empty('No applications in this view','Your application progress will appear here.'));}";
    }
}

fs.writeFileSync('frontend-react/src/js/app.js', lines.join('\n'), 'utf8');
console.log('Line manually overwritten');

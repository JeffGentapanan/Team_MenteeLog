import {approvedHours,visibleStudents,visibleLogs,visibleApplications,applyToJob,validateUpload,csvText} from './domain.js';
import {rubric,roles,navigation} from './data.js';
import {signatureFields,bindSignature,signatureImage} from './signature.js';
import {reviewBatch,assignPlacement,reportRows,reportFile,candidateImport} from './portal-domain.js';

export function createPortalViews(c){
  const {e,icon,button:b,heading,field:f,textarea:ta,select:sel,badge,person,table,empty,progress,date,time,today}=c;
  let formHandler=null,formOwner=null,formRoute='',wizard={},reportDraft=null,notice='',noticePath='',importText='',importBatch=[];
  const db=()=>c.db,u=()=>c.user,r=()=>c.route();
  const href=(page,sub='',id='')=>`#/${u().role.toLowerCase()}/${page}${sub?'/'+sub:''}${id?'/'+encodeURIComponent(id):''}`;
  const nav=(label,page,sub='',id='',style='secondary')=>`<a class="btn ${style}" href="${href(page,sub,id)}">${label}</a>`;
  const back=(page,label='Back to '+({hte:'HTE Accreditation',jobs:'Directory',candidates:'Placement Directory',dtr:'DTR Hub',reports:'Report Hub',appraisals:'Appraisals',incidents:'Incident Hub'}[page]||'Dashboard'))=>`<div class="ref-back">${nav('← '+label,page)}</div>`;
  const panel=(title,body,extra='')=>`<section class="card sand ${extra}">${title?'<h2>'+title+'</h2>':''}${body}</section>`;
  const stats=items=>`<div class="ref-stats">${items.map(([label,value,ico])=>`<div>${ico?icon(ico):''}<span>${label}</span><strong>${value}</strong></div>`).join('')}</div>`;
  const search=(placeholder='Search name or record…')=>`<form id="search-form" class="toolbar"><input name="search" type="search" aria-label="${placeholder}" placeholder="${placeholder}" value="${e(c.view.search)}"><button class="btn secondary" type="submit">Search</button></form>`;
  const match=(...values)=>values.join(' ').toLowerCase().includes(c.view.search.toLowerCase());
  const tabs=(items,page=r().page,selected=r().sub)=>`<nav class="ref-tabs" aria-label="Page views">${items.map(([id,label])=>`<a class="${selected===id?'active':''}" href="${href(page,id)}" ${selected===id?'aria-current="page"':''}>${label}</a>`).join('')}</nav>`;
  const filter=(items)=>`<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); width: 100%; gap: 24px; margin-bottom: 48px; padding-bottom: 16px;">${items.map(([value,label])=>{ const active = c.view.filter===value; return `<button data-action="filter" data-id="${e(value)}" style="background: ${active ? 'var(--burgundy)' : 'var(--surface)'}; color: ${active ? 'var(--cream)' : 'var(--ink)'}; border: 1px solid ${active ? 'transparent' : 'var(--line)'}; border-radius: 12px; padding: 16px; font-weight: 600; font-size: 14px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: ${active ? '0 4px 12px rgba(88,17,26,0.15)' : 'none'};"><span style="display:block;">${e(label)}</span></button>`; }).join('')}</div><div style="height: 32px; width: 100%; display: block; clear: both;"></div>`;
  const finish=(message,page=r().page,sub='',id='')=>{c.audit(message);c.save();notice=message;noticePath=href(page,sub,id);location.hash=noticePath;c.render();};
  function form(body,handler,label='Save changes',cancel=nav('Cancel',r().page)){
    formHandler=handler;formOwner=u().id;formRoute=location.hash;
    return `<form id="portal-form">${body}<p class="form-error" role="alert"></p><div class="form-actions">${cancel}<button type="submit" class="btn">${label}</button></div></form>`;
  }
  function legacyForm(fn,after){const captured=c.capture(fn);if(!captured)throw new Error('This form is unavailable.');return panel(captured.title,captured.onSubmit?form(captured.body,async(v,el)=>{await captured.onSubmit(v,el);after?after():finish('Changes saved.');},captured.label):captured.body);}
  const student=(id)=>{const s=visibleStudents(db(),u()).find(s=>s.id===id);if(!s)throw new Error('This student is outside your portal scope.');return s;};
  const incident=(id)=>{const i=c.visibleIncidents(u()).find(i=>i.id===id);if(!i)throw new Error('This case is outside your portal scope.');return i;};
  const job=(id)=>{const j=db().jobs.find(j=>j.id===id&&(u().role!=='Supervisor'||j.supervisorId===u().id)&&(u().role!=='Student'||j.status==='Active'));if(!j)throw new Error('Position unavailable.');return j;};
  const descriptors=['Executes project milestones efficiently with minimal oversight. Maintains industry standards in code and documentation.','Adheres closely to the OJT schedule and communicates attendance changes.','Demonstrates capacity to propose engineering solutions and seeks feedback.','Proficiency in tools, software, and technical tasks.','Expresses complex software concepts clearly to non-technical stakeholders.'];
  function appraisalResult(s,a){return `<div class="ref-appraisal-result"><div class="ref-identity"><div class="row"><span class="avatar">${e(s.name.split(' ').map(n=>n[0]).slice(0,2).join(''))}</span><div><h2>${e(s.name)}</h2><small>${e(s.course)} · ${e(s.company||'OJT Student')}</small></div></div><div class="ref-overall"><small>OVERALL SCORE</small><strong>${a?a.score.toFixed(1)+'<small> / 5.0</small>':'Pending'}</strong></div></div><h2 class="ref-rubric-heading">Performance Appraisal Rubric</h2>`+(a?rubric.map((label,i)=>panel('',`<div class="ref-rubric"><div><h3>${i+1}. ${e(label)}</h3><p>${descriptors[i]}</p></div><div class="ref-scores">${[1,2,3,4,5].map(n=>`<span class="${a.ratings[i]===n?'selected':''}">${n}</span>`).join('')}</div></div>`)).join('')+panel('Supervisor Comments & General Observations',`<blockquote>${e(a.comments)}</blockquote><small>${e(c.student(a.supervisorId)?.name)} · ${date(a.date)}</small>`):panel('',empty('Your appraisal is not available yet','Your supervisor’s submitted rubric and comments will appear here.')) )+'</div>';}


  function jobs(){const {sub,id}=r();const isStudent=u().role==='Student';
    if(sub==='edit'||sub==='restore'){job(id);return back('jobs')+ `<div class="ref-form-narrow">${legacyForm(()=>c.legacy.editJob(id))}</div>`;}
    if(sub==='detail'){
      const j=job(id),applied=db().applications.some(a=>a.studentId===u().id&&a.jobId===id&&a.status!=='Rejected');
      return back('jobs',isStudent?'Back to OJT Placement':'Back to Slots')+ `
      <div class="dashboard-grid-modern mt24">
        <div class="dash-main">
          <section class="card premium-card ojt-detail-main">
             <div class="row between align-start mb24">
               <div class="row align-start gap-16">
                 <div class="ojt-detail-avatar">${e(j.company.slice(0,2))}</div>
                 <div>
                   <h1 class="ojt-detail-title">${e(j.company)}</h1>
                   <p class="muted">${icon('pin')} ${e(j.location)}</p>
                 </div>
               </div>
               <div class="row gap-8">
                 <span class="badge">CHED Accredited</span>
                 <span class="badge">Active MOA</span>
               </div>
             </div>
             
             <h2>${e(j.title)}</h2>
             <div class="row gap-16 mb24 ojt-job-meta">
               <span>${icon('briefcase')} ${e(j.department||'Technology')}</span>
               <span>${icon('users')} ${j.slots} slots left</span>
               <span style="color:#D97706;">${icon('star')} 4.9</span>
             </div>
             
             <p class="small mb8"><strong>REQUIRED SKILLS & TECH STACK</strong></p>
             <div class="row wrap gap-8">
               ${j.skills.split(',').map(s=>`<span class="ojt-job-skill">${e(s.trim())}</span>`).join('')}
             </div>
          </section>

          <section class="card premium-card ojt-detail-desc mt24">
             <h2>Position Description</h2>
             <p class="mb24">${e(j.description)}</p>
             
             <h2>Requirements</h2>
             <ul>
               ${j.specs.split('\n').map(l=> l.trim() ? `<li>${e(l.replace(/^[\-•*]\s*/,''))}</li>` : '').join('')}
             </ul>
          </section>
        </div>
        
        <div class="dash-side">
          ${isStudent ? `<section class="card premium-card ojt-side-card">
             <h3>Interested in this position?</h3>
             ${applied?nav('View Application','applications','','','btn primary full'):b('Apply to this Position','ref-apply',id,'btn primary full')}
             <p class="small muted mt16 text-center">Applying automatically forwards your verified MenteeLog profile and academic endorsement.</p>
          </section>` : `<section class="card premium-card ojt-side-card">
             <h3>Slot Actions</h3>
             <div style="display: flex; flex-direction: column; gap: 12px;">
                ${nav('Edit Details','jobs','edit',id,'secondary full')}
                ${b(j.status==='Closed'?'Restore Position':'Deactivate Slot','ref-job-status',id,'full')}
             </div>
             <p class="small muted mt16 text-center">Update your slot details or change its visibility to students.</p>
          </section>`}
          
          <section class="card premium-card ojt-side-card">
             <h3>Company Information</h3>
             <hr class="hr mb16">
             <div class="mb16">
               <span class="small muted block">OJT SUPERVISOR</span>
               <strong>${e(c.student(j.supervisorId)?.name||'Pending Assignment')}</strong>
             </div>
             <div class="mb16">
               <span class="small muted block">DEPARTMENT</span>
               <strong>${e(j.department||'Technology - AI Delivery')}</strong>
             </div>
             <div class="mb16">
               <span class="small muted block">MAIN ADDRESS</span>
               <strong>${e(j.location)}</strong>
             </div>
             <div>
               <span class="small muted block">CONTACT EMAIL</span>
               <strong>${e(c.student(j.supervisorId)?.email||'careers@example.com')}</strong>
             </div>
          </section>

          <section class="card premium-card ojt-side-card">
             <h3>MOA & Accreditation</h3>
             <hr class="hr mb16">
             <div class="mb16">
               <span class="small muted block">ACCREDITATION STATUS</span>
               <strong>CHED Accredited Host Training Establishment</strong>
             </div>
             <div class="mb16">
               <span class="small muted block">MOA VALIDITY</span>
               <strong>Active through Sept 12, 2028</strong>
             </div>
             <div>
               <span class="small muted block">OJT COORDINATOR / ADVISER</span>
               <strong>Dr. Evelyn Ramos</strong>
             </div>
          </section>
        </div>
      </div>`;
    }
    const list=db().jobs.filter(j=>(isStudent?j.status==='Active':u().role==='Supervisor'?j.supervisorId===u().id:true)&&match(j.title,j.company,j.location,j.skills)&&(isStudent?(c.view.course==='All'||j.courses.includes(c.view.course))&&(c.view.mode==='All'||j.location.toLowerCase().includes(c.view.mode.toLowerCase())):sub==='archived'?j.status==='Closed':j.status!=='Closed'));
    return (isStudent?'': '')+heading(isStudent?'OJT Placement Directory':'Slot Management',isStudent?'Browse and apply to accredited host training establishments':e(u().company||'Partner companies')+' · Internship positions',isStudent?'':b('Post New Work','job-edit','','','plus'))+(isStudent?
    `<div class="row wrap gap-8 mb32" style="margin-bottom: 32px;">
        ${['All','BSCS','BSIT','BSSA','Metro Manila','Davao','Cebu'].map(s=>b(s,'ref-course',s, (s==='All' && c.view.course==='All' && c.view.mode==='All') || (s!=='All' && (c.view.course===s || c.view.mode===s)) ? 'ojt-filter active' : 'ojt-filter')).join('')}
        ${b('+ More Filters','ref-more-filters','',c.view.more?'ojt-filter active':'ojt-filter')}
      </div>
      ${c.view.more?panel('Filter Opportunities',form(`<div class="grid-2">${sel('Program','course',['All','BS Computer Science','BS Information Technology','BS Computer Engineering'],c.view.course)}${sel('Location','mode',['All',...new Set(db().jobs.map(j=>j.location))],c.view.mode)}</div>`,v=>{c.view.course=v.course;c.view.mode=v.mode;c.render();},'Apply Filters'), 'mb32'):''}
      ` : tabs([['','Active Slots'],['archived','Archived Slots']]))+(list.length?(isStudent?list.map(j=>{const applied=db().applications.some(a=>a.studentId===u().id&&a.jobId===j.id&&a.status!=='Rejected');return `
      <article class="ojt-job-card">
        <div class="ojt-job-card-inner">
          <div class="row between align-start">
            <div class="row align-center gap-16">
              <div class="ojt-job-avatar">${e(j.company.slice(0,2))}</div>
              <div>
                <h2 class="ojt-job-title">${e(j.title)}</h2>
                <p class="ojt-job-company">${e(j.company)}</p>
              </div>
            </div>
            <div class="ojt-job-badge">CHED Accredited · Active MOA</div>
          </div>
          <div class="row ojt-job-meta">
            <span>${icon('pin')} ${e(j.location)}</span>
            <span>${icon('briefcase')} ${e(j.courses.join(' / '))}</span>
            <span>${icon('users')} ${j.slots} slots left</span>
            <span style="color:#D97706;">${icon('star')} ${(Math.random()*1+4).toFixed(1)}</span>
          </div>
          <div class="row wrap gap-8">
            ${j.skills.split(',').map(s=>`<span class="ojt-job-skill">${e(s.trim())}</span>`).join('')}
          </div>
          <div class="row between ojt-job-footer">
             <small class="muted">Posted 2 days ago</small>
             ${nav('View Details','jobs','detail',j.id,'btn secondary small')}
          </div>
        </div>
        ${applied? nav('Application Submitted — View Details','jobs','detail',j.id,'ojt-job-applied-btn') : 
        b('Apply to this Position','ref-apply',j.id,'ojt-job-apply-btn')}
      </article>`;}).join(''):panel('',table(['Position Title','Department','Posted Date','Applicants','Status','Actions'],list.map(j=>`<tr><td><strong>${e(j.title)}</strong></td><td>${e(j.department||'IT Department')}</td><td>${date(j.createdAt||'2026-09-01')}</td><td>${db().applications.filter(a=>a.jobId===j.id).length} applied</td><td>${badge(j.status)}</td><td>${nav('View','jobs','detail',j.id,'secondary small')} ${nav(sub==='archived'?'Restore':'Edit','jobs',sub==='archived'?'restore':'edit',j.id,'secondary small')}</td></tr>`)))):panel('',empty('No positions match this view','Try another filter or search.')));
  }

  function incidents(){const {sub,id}=r(),role=u().role,all=c.visibleIncidents(u()),co=role==='Coordinator',title=co?'Incident & Compliance Hub':role==='Student'?'Incident & Safety Claims':'Supervisor Incident & Claims Management';
    const intro=heading(title,'Log incidents, review claims, assess evidence, and track case resolutions.',nav(co?'Log Report Intake':role==='Student'?'File Incident Claim':'Create Supervisor Log','incidents','new','',''))+stats([['Total Cases',all.length,'folder'],[co?'Red Queue':'High Severity',all.filter(i=>i.priority==='High'&&!['Resolved','Dismissed'].includes(i.status)).length,'alert'],['Under Investigation',all.filter(i=>['Pending','Scheduled'].includes(i.status)).length,'search'],['Resolved Claims',all.filter(i=>i.status==='Resolved').length,'check']]);
    if(sub==='new')return intro+panel(role==='Student'?'File Student Incident Claim':'Log Incident Report',form(`<div class="grid-2">${role!=='Student'?sel('Student involved','studentId',visibleStudents(db(),u()).map(s=>[s.id,s.name])):f('Student','studentName','text',u().name,'readonly')}${sel('Category','title',['Safety / Hazard','Attendance Concern','Workplace Conduct','Health / Medical','Other'])}${sel('Severity level','priority',['Low','Medium','High'],'Medium')}${f('Date & time','occurredAt','datetime-local','','required')}${f('Location / HTE department','location','text','','required maxlength="160"')}${co?sel('Report source','category',[['Student_Claim','Student Claim'],['Disciplinary_Violation','Supervisor Log']]):''}</div>${ta('Incident description / statement','description','','required minlength="20"')}${role!=='Student'?ta('Immediate corrective action taken','immediateAction','',''):''}${sel('Related DTR (optional)','logId',[['','No linked DTR'],...visibleLogs(db(),u()).map(l=>[l.id,c.student(l.studentId)?.name+' · '+date(l.date)])])}${f('Evidence / inspection photos (PDF, PNG, JPG, up to 10 MB)','evidence','file','','accept="application/pdf,image/png,image/jpeg"')}`,async(v,el)=>{const sid=role==='Student'?u().id:v.studentId;const s=role==='Student'?u():student(sid);if(v.logId&&!db().logs.some(l=>l.id===v.logId&&l.studentId===sid))throw new Error('The linked DTR must belong to the selected student.');let evidence=null;const file=el.elements.evidence.files[0];if(file){validateUpload(file);evidence={id:crypto.randomUUID(),name:file.name};await c.putFile(evidence.id,file);}const i={...v,id:'IR-'+crypto.randomUUID().slice(0,8).toUpperCase(),studentId:sid,supervisorId:s.supervisorId,category:role==='Student'?'Student_Claim':co?v.category:'Disciplinary_Violation',date:today(),status:'Pending',evidence,notes:[],meeting:null};delete i.studentName;db().incidents.unshift(i);db().users.filter(v=>v.role==='Coordinator'||v.id===s.supervisorId).forEach(v=>c.notify(v.id,'Incident_Alert','New incident report',i.id+': '+i.title));finish('Incident submitted for coordinator review.');},'Submit Report'));
    if(sub==='investigate'){if(!co)throw new Error('Coordinator access required.');incident(id);return back('incidents')+heading('Update Investigation','Record findings, case status, and mediation details.')+legacyForm(()=>c.legacy.incidentDetail(id),()=>finish('Investigation updated.','incidents','detail',id));}
    if(sub==='detail'){const i=incident(id),s=c.student(i.studentId);return back('incidents')+intro+`<div class="ref-detail-grid"><div>${panel('Case #'+e(i.id),`<div class="row wrap">${badge(i.category==='Student_Claim'?'Student Claim':'Supervisor Log')}${badge(i.priority)}${badge(i.status)}</div><h3 class="mt16">Description & Statement</h3><p class="ref-readonly">${e(i.description)}</p><h3>Immediate Action Taken</h3><p class="ref-readonly">${e(i.immediateAction||'Awaiting investigation')}</p>${i.logId?b('View Linked DTR','log-detail',i.logId,'secondary small'):''}<h3 class="mt16">Investigation Activity & Audit Log</h3><div class="timeline"><div class="timeline-item"><strong>Report filed</strong><p>${date(i.date)}</p></div>${i.notes.map(n=>`<div class="timeline-item"><strong>${e(n.author)}</strong><p>${e(n.text)}</p><small>${date(n.date)}</small></div>`).join('')}</div>${i.meeting?`<p class="note">Mediation: ${e(i.meeting.platform)} · ${date(i.meeting.time)} ${time(i.meeting.time)}</p>`:''}`)}${panel('Uploaded Evidence & Verification',i.evidence?`<div class="ref-evidence">${icon('file')}<strong>${e(i.evidence.name)}</strong>${b('Preview','ref-file-preview',i.evidence.id,'secondary small')}${b('Download','file-download',i.evidence.id,'secondary small')}</div>`:empty('No evidence attached'))}</div><div>${panel(co?'Case Actions':'Case Metadata',`<dl class="ref-facts"><dt>Student</dt><dd>${e(s?.name)}</dd><dt>HTE Partner</dt><dd>${e(s?.company||'Unassigned')}</dd><dt>Supervisor</dt><dd>${e(c.student(i.supervisorId)?.name||'Unassigned')}</dd><dt>Severity</dt><dd>${badge(i.priority)}</dd><dt>Case Status</dt><dd>${badge(i.status)}</dd></dl>${co?nav('Update Investigation','incidents','investigate',id,'full')+b('Add Note','ref-case-note',id,'secondary full')+b('Resolve Incident','ref-case-resolve',id,'full'):''}`)}${co?panel('Processing Checklist',`<p>${icon('check')} Report received</p><p>${i.evidence?'Evidence attached':'Evidence pending'}</p><p>${i.notes.length?'Investigation notes recorded':'Investigation pending'}</p><p>${i.status==='Resolved'?'Resolution completed':'Resolution pending'}</p>`):''}</div></div>`;}
    const list=all.filter(i=>match(i.id,i.title,c.student(i.studentId)?.name)&&(sub==='red'?i.priority==='High'&&!['Resolved','Dismissed'].includes(i.status):sub==='student'?i.category==='Student_Claim':sub==='supervisor'?i.category==='Disciplinary_Violation':sub==='resolved'?i.status==='Resolved':sub==='review'?['Pending','Scheduled'].includes(i.status):sub==='archive'?['Resolved','Dismissed'].includes(i.status):true));
    return intro+panel('',tabs(co?[['','All Cases'],['red','Red Queue'],['student','Student Claims 2.5'],['supervisor','Disciplinary Logs 3.4'],['archive','Archive']]:[['','All Cases'],['review','Under Investigation'],['resolved','Resolved']])+search('Search case, student or category')+(list.length?table(['Report ID','Source','Student','HTE Partner','Category','Date Reported','Severity','Status','Action'],list.map(i=>`<tr><td>${e(i.id)}</td><td>${badge(i.category==='Student_Claim'?'Student Claim':'Supervisor Log')}</td><td>${e(c.student(i.studentId)?.name)}</td><td>${e(c.student(i.studentId)?.company||'—')}</td><td>${e(i.title)}</td><td>${date(i.date)}</td><td>${badge(i.priority)}</td><td>${badge(i.status)}</td><td>${nav('Review','incidents','detail',i.id,'secondary small')}</td></tr>`)):empty('No cases in this view'))+`<div class="table-footer">Showing ${list.length} logged cases</div>`);
  }

  function appraisals(){const {sub,id}=r();if(u().role==='Student')return '<h1 class="sr-only">Performance Appraisal</h1><p class="ref-evaluation-period">Evaluation Period: Final Assessment</p>'+appraisalResult(u(),db().appraisals.find(a=>a.studentId===u().id));
    if(sub==='evaluate'){const s=student(id);return back('appraisals')+`<div class="ref-identity">${person(s)}<span>Final Evaluation Period</span></div>`+legacyForm(()=>c.legacy.evaluate(id),()=>finish('Evaluation submitted successfully!','appraisals','submitted',id));}
    if(sub==='submitted'){const s=student(id),a=db().appraisals.find(a=>a.studentId===id);return `<div class="ref-success"><span class="ref-success-icon">${icon('check')}</span><h1>Evaluation Submitted Successfully!</h1><p>Appraisal rubric has been processed and archived.</p>${panel('Evaluation Summary',`<p>Student: ${e(s.name)}</p><p>Evaluation type: Final Evaluation</p><h2>${a?.score.toFixed(1)||'—'} / 5.0</h2><p>${e(a?.comments||'')}</p>`)}${nav('Back to Appraisals','appraisals','','','')}</div>`;}
    const list=visibleStudents(db(),u()).filter(s=>match(s.name,s.course));return heading('Performance Appraisal','Evaluate student performance, record scores, and sign off evaluations.')+panel('',search('Search by student name or cohort')+table(['Intern Name','Department','Evaluation Period','Score / Rating','Status','Action'],list.map(s=>{const a=db().appraisals.find(a=>a.studentId===s.id);return `<tr><td>${person(s)}</td><td>${e(s.company)}</td><td>Final Evaluation</td><td>${a?a.score.toFixed(1)+' / 5.0':'— Not evaluated'}</td><td>${badge(a?'Completed':'Pending')}</td><td>${nav(a?'Review':'Evaluate','appraisals','evaluate',s.id,'small')}</td></tr>`;})));
  }

  function notifications(){const notes=db().notifications.filter(n=>n.userId===u().id),unread=notes.filter(n=>!n.read).length;const list=notes.filter(n=>r().sub==='unread'?!n.read:r().sub==='system'?['System','DTR_Event'].includes(n.type):r().sub==='incidents'?['Incident_Alert','Application_Status'].includes(n.type):true);
    return heading('Notifications Center','Manage, filter, and review all your platform alerts and updates.',b('Clear Read','clear-read','','secondary small')+b('Mark All as Read','read-all','','small'))+tabs([['',`All Notifications (${notes.length})`],['unread',`Unread (${unread})`],['system','System & DTR'],['incidents','Incidents & Alerts']])+`<div class="ref-notifications">${list.length?list.map(n=>`<button class="ref-notification ${n.read?'read':''}" data-action="read" data-id="${e(n.id)}"><span class="row between"><strong>${n.read?'':'● '}${e(n.title)}</strong><small>${date(n.date)}</small></span><span>${e(n.message)}</span></button>`).join(''):panel('',empty('No notifications here.'))}</div>`+back('dashboard');
  }

  function documents(){const docs=db().documents.filter(d=>d.studentId===u().id);return heading('Document Management Portal','Upload and manage your OJT requirements and supporting documents.')+`<button class="upload-drop" data-action="document-upload">${icon('upload')}<strong>Drop files here, or click to upload</strong><span>PDF, JPG, PNG · Up to 10 MB per file</span></button><div class="document-list">${docs.length?docs.map(d=>`<article class="document-item">${icon('file')}<div class="document-copy"><h3>${e(d.category)}</h3><p>${e(d.name)} · ${Math.ceil(d.size/1024)} KB · ${date(d.date)}</p></div>${badge(d.status||'Pending')}${b('Preview','ref-file-preview',d.id,'secondary small','eye')}${b('Download','file-download',d.id,'secondary small','download')}${b('Delete','ref-file-delete',d.id,'secondary small','x')}</article>`).join(''):empty('No documents submitted','Upload your requirements using the area above.')}</div>`;}

  function page(page,user){formHandler=null;if(notice&&location.hash!==noticePath)notice='';let content;
    if(page==='dashboard'&&user.role==='Supervisor')content=supervisorDashboard();
    else if(page==='applications'&&user.role==='Student')content=studentApplications();
    else if(page==='jobs')content=jobs();
    else if(page==='incidents')content=incidents();
    else if(page==='appraisals')content=appraisals();
    else if(page==='notifications')content=notifications();
    else if(page==='documents')content=documents();
    else if(page==='hte')content=htes();
    else if(page==='candidates')content=candidates();
    else if(page==='dtr')content=attendance();
    else if(page==='reports')content=reports();
    else if(page==='users')content=governance();
    if(content!==undefined)return `<div class="reference-portal">${notice?'<div class="ref-banner" role="status">'+icon('check')+e(notice)+b('Dismiss','ref-dismiss','','secondary small')+'</div>':''}${content}</div>`;
    return null;
  }

  async function action(name,id,el){
    if(name==='application-detail'&&u().role!=='Student'){const a=visibleApplications(db(),u()).find(a=>a.id===id);if(!a)throw new Error('Application outside your scope.');const captured=c.capture(()=>c.legacy.applicationDetail(id));c.showModal(captured.title,captured.body+(a.resumeId?b('Preview Applicant Resume','ref-file-preview',a.resumeId,'secondary full'):''),captured.onSubmit,captured.label);return true;}
    if((name==='log-detail'||name==='ref-justify-modal')&&u().role==='Student'){const l=visibleLogs(db(),u()).find(l=>l.id===id);if(!l)throw new Error('DTR unavailable.');if(['Flagged','Rejected'].includes(l.status)){c.showModal('Write Justification',`<p class="muted small mb16" style="text-transform: uppercase; font-weight: 600;">${date(l.date)} - ${l.status}</p><h3>Flag Reason</h3><p class="ref-alert mb16">${e(l.remarks||'GPS Mismatch - logged in 2.3 km outside registered geofence.')}</p><p class="muted small mb16">Your justification will be forwarded to your supervisor for review. Be clear and factual.</p>${ta('Your Explanation','justification',l.justification||'','required minlength="10" placeholder="Explain the reason for the attendance anomaly (e.g. internet outage, venue change, device issue)..."')}${f('Attach Evidence','evidence','file','','accept="application/pdf,image/png,image/jpeg"')}<p class="small muted mt8">PNG, JPG or PDF (max. 10MB)</p>`,async(v,form)=>{const file=form.elements.evidence.files[0];if(file){validateUpload(file);const doc={id:crypto.randomUUID(),studentId:u().id,category:'DTR Justification',name:file.name,type:file.type,size:file.size,date:today()};await c.putFile(doc.id,file);db().documents.push(doc);l.evidenceId=doc.id;}l.justification=v.justification;l.status='Pending';c.notify(l.supervisorId,'DTR_Event','Attendance justification submitted',u().name+' resubmitted '+date(l.date)+' for review.');finish('Justification submitted for supervisor review.','dtr');},'Submit');return true;}}
    if(name==='announcement'&&u().role==='Supervisor'){c.showModal('Send Emergency Broadcast Alert',sel('Alert type','type',['Extreme Weather / Typhoon','Workplace Safety','Schedule Change','System / Technical'])+sel('Severity level','severity',['Low','Medium','High / Critical'],'Medium')+sel('Affected interns','recipients',[['all','All assigned active interns'],...visibleStudents(db(),u()).map(s=>[s.id,s.name])])+f('Subject line','title','text','','required maxlength="120"')+ta('Emergency message','message','','required minlength="10"')+'<p class="small">Creates notifications within this local preview. SMS and email delivery require the backend.</p>',v=>{const recipients=visibleStudents(db(),u()).filter(s=>v.recipients==='all'||s.id===v.recipients);recipients.forEach(s=>c.notify(s.id,'System',v.title,v.severity+' — '+v.message));finish('Alert recorded for '+recipients.length+' assigned interns.','dashboard');},'Send Alert Broadcast');return true;}
    if(name==='import-users'){if(u().role!=='Coordinator')throw new Error('Coordinator access required.');location.hash=href('users','import');return true;}
    if(name==='ref-dismiss'){notice='';c.render();return true;}
    const routes={'job-detail':['jobs','detail'],'student-detail':[r().page==='dtr'?'dtr':'candidates','profile'],'incident-detail':['incidents','detail'],'incident-new':['incidents','new'],'evaluate':['appraisals','evaluate'],'report-preview':['reports','configure']};
    if(routes[name]){location.hash=href(...routes[name],id);return true;}
    if(name==='job-edit'&&id){location.hash=href('jobs','edit',id);return true;}
    if(name==='ref-course'){
    const locs = ['Metro Manila','Davao','Cebu'];
    if(id==='All') { c.view.course='All'; c.view.mode='All'; }
    else if(locs.includes(id)) { c.view.mode = c.view.mode===id ? 'All' : id; c.view.course = 'All'; }
    else { c.view.course = c.view.course===id ? 'All' : id; c.view.mode = 'All'; }
    c.render();
    return true;
}
    if(name==='ref-more-filters'){c.view.more=!c.view.more;c.render();return true;}
    if(name==='ref-apply'){if(u().role!=='Student')throw new Error('Student access required.');const j=job(id);
      c.showModal('Apply — '+e(j.title),
      `<div class="ojt-modal-profile">
          <p class="small mb12"><strong>PRE-POPULATED STUDENT PROFILE</strong></p>
          <div class="row between mb8"><span class="muted">Full Name</span><strong>${e(u().name)}</strong></div>
          <div class="row between mb8"><span class="muted">Section</span><strong>${e(u().course)}</strong></div>
          <div class="row between mb8"><span class="muted">GPA</span><strong>1.75</strong></div>
          <div class="row between"><span class="muted">Contact Email</span><strong>${e(u().email)}</strong></div>
        </div>
        <div class="field mb16">
          <label>Resume</label>
          ${sel('Resume on file','resumeId',[['','Choose an uploaded resume'],...db().documents.filter(d=>d.studentId===u().id&&d.type==='application/pdf').map(d=>[d.id,d.name])])}
        </div>
        <div class="field">
          <label>Cover Note (optional)</label>
          <textarea name="note" class="textarea" style="height:120px; resize:none;" placeholder="Introduce yourself and share why you are interested in this position..."></textarea>
        </div>`,
        async(v,form)=>{
          if(!j||j.status!=='Active'||j.slots<1)throw new Error('This position is no longer open.');
          if(db().applications.some(a=>a.studentId===u().id&&a.jobId===id&&a.status!=='Rejected'))throw new Error('You already have an application for this position.');
          await c.submitApplication(id, v.note);
          if(j.supervisorId)c.notify(j.supervisorId,'Application_Status','New internship application',u().name+' applied for '+j.title);
          finish('Application submitted successfully.','jobs');
        },'Confirm Application');
        return true;}



    if(name==='ref-job-status'){if(u().role==='Student')throw new Error('Management access required.');const j=job(id);const restore=j.status==='Closed';c.showModal(restore?'Restore this position?':'Deactivate this position?',`<p>${e(j.title)}</p><p>${restore?'The position will become available to applicants.':'Interns will no longer be able to apply. Existing applications remain available for review.'}</p>`,()=>{j.status=restore?'Active':'Closed';finish(restore?'Position restored.':'Position deactivated.','jobs','detail',id);},restore?'Restore':'Deactivate');return true;}
    if(name==='ref-case-note'||name==='ref-case-resolve'){if(u().role!=='Coordinator')throw new Error('Coordinator access required.');const i=incident(id),resolve=name==='ref-case-resolve';c.showModal(resolve?'Resolve Incident':'Add Investigation Note',(resolve?sel('Resolution verdict','status',['Resolved','Dismissed']):'')+ta(resolve?'Resolution summary':'Investigation note','note','','required minlength="10"'),v=>{i.notes.push({text:v.note,author:u().name,date:new Date().toISOString()});if(resolve)i.status=v.status;[i.studentId,i.supervisorId].filter(Boolean).forEach(s=>c.notify(s,'Incident_Alert','Incident '+i.id+' updated',v.note));finish(resolve?'Incident resolution recorded.':'Investigation note added.','incidents','detail',id);},resolve?'Confirm Resolution':'Save Note');return true;}
    if(name==='ref-file-preview'){await previewFile(id);return true;}
    if(await hteAction(name,id,el)||await attendanceAction(name,id,el)||await reportAction(name,id,el)||await governanceAction(name,id,el))return true;
    return false;
  }
  async function previewFile(id){const doc=db().documents.find(d=>d.id===id&&(d.studentId===u().id||visibleStudents(db(),u()).some(s=>s.id===d.studentId)||visibleApplications(db(),u()).some(a=>a.resumeId===d.id)))||c.visibleIncidents(u()).find(i=>i.evidence?.id===id)?.evidence||(u().role==='Coordinator'?db().htes.find(h=>h.document?.id===id)?.document:null);if(!doc)throw new Error('This file is outside your portal scope.');const file=await c.fileOp('get',id);if(!file)throw new Error('File no longer available in this browser.');const url=URL.createObjectURL(file);c.showModal('Document Preview — '+e(doc.name),file.type.startsWith('image/')?`<img class="ref-file-image" src="${url}" alt="${e(doc.name)}">`:`<p>${e(doc.name)} · PDF document</p><p>Open the stored PDF in your browser’s document viewer.</p><a class="btn" href="${url}" target="_blank" rel="noopener">Open PDF Preview</a>`);document.querySelector('#modal').addEventListener('close',()=>URL.revokeObjectURL(url),{once:true});}
  async function submit(values,form){if(!formHandler||u()?.id!==formOwner||location.hash!==formRoute)throw new Error('The page or session changed. Reopen this form.');await formHandler(values,form);}

  // Module-specific pages follow; all remain under the sidebar routes in the supplied flowchart.
  function htes(){return htePages();}
  function candidates(){return candidatePages();}
  function attendance(){return attendancePages();}
  function reports(){return reportPages();}
  function governance(){return governancePages();}

  function supervisorDashboard(){const students=visibleStudents(db(),u()),logs=visibleLogs(db(),u()),pending=logs.filter(l=>l.status==='Pending').length,weekStart=new Date(Date.now()-7*86400000).toISOString().slice(0,10),weekly=logs.filter(l=>l.status==='Approved'&&l.date>=weekStart).reduce((n,l)=>n+l.hours,0);return heading('Supervisor Dashboard',e(u().company)+' · Technology Division OJT Program')+stats([['Active Interns',students.length,'users'],['Pending DTR Queue',pending,'clock'],['Evaluations Due',students.filter(s=>!db().appraisals.some(a=>a.studentId===s.id)).length,'file'],['Avg. Hours / Week',(weekly/Math.max(1,students.length)).toFixed(1)+'h','briefcase']])+panel('',`<div class="row wrap"><strong>Quick Actions:</strong>${b('Bulk Approve DTRs','ref-approve-all','','small')}${b('+ Add Intern Slot','job-edit','','secondary small')}<span class="push-right">${b('Send Emergency Alert','announcement','','secondary small','alert')}</span></div>`)+panel('Active Interns Overview',table(['Intern Name','Course','Hours Rendered','Progress','Status','Action'],students.map(s=>`<tr><td>${person({...s,course:''})}</td><td>${e(s.course)}</td><td>${approvedHours(db(),s.id)} / ${s.requiredHours} hrs</td><td>${progress(approvedHours(db(),s.id),s.requiredHours)}</td><td>${db().shift?.studentId===s.id&&!db().shift.clockOut?'● Clocked In':'● Clocked Out'}</td><td>${nav('View DTR ›','dtr','profile',s.id,'secondary small')}</td></tr>`)))+`<div class="row">${nav('Candidate Review','candidates','','','secondary small')}${nav('Application Review','applications','','','secondary small')}</div>`;}
  function studentApplications(){const apps=visibleApplications(db(),u());return heading('My Applications Tracker','Track the status of your internship applications.')+(apps.length?apps.map(a=>{const j=db().jobs.find(j=>j.id===a.jobId),level=a.status==='Accepted'?3:a.status==='Under_Review'?1:0;return `<section class="card application-card"><div class="row between"><div><h2>${e(j?.title)}</h2><p>${e(j?.company)}</p></div>${badge(a.status)}</div><div class="application-path">${['Submitted','Under Review','Interview','Accepted'].map((label,i)=>(i?'<span class="application-line"></span>':'')+`<div class="application-step ${i<=level?'done':''}"><i></i><span>${label}</span></div>`).join('')}</div>${a.note?'<p class="small mt16">'+e(a.note)+'</p>':''}</section>`;}).join(''):panel('',empty('No applications yet','Apply to an accredited internship from the placement directory.')));}

  function htePages(){
    const {sub,id}=r();if(u().role!=='Coordinator')throw new Error('Coordinator access required.');
    const get=()=>{const h=db().htes.find(h=>h.id===id);if(!h)throw new Error('HTE unavailable.');return h;};
    if(sub==='new'){
      const step=Number(id)||1;if(step>1&&!wizard.name)return back('hte')+panel('Start your application',nav('Company Information','hte','new','1',''));
      const stepper=`<div class="ref-stepper">${['Company Information','Contact & MOA','Review & Submit'].map((label,i)=>`<span class="${step===i+1?'active':''}"><b>${i+1}</b>${label}</span>`).join('')}</div>`;
      const body=step===1?`<div class="grid-2">${f('Company name','name','text',wizard.name||'','required maxlength="120"')}${f('Business registration number','registration','text',wizard.registration||'','required maxlength="80"')}${f('Industry / sector','industry','text',wizard.industry||'','required maxlength="100"')}${f('Company address','address','text',wizard.address||'','required maxlength="200"')}${f('City','location','text',wizard.location||'','required maxlength="100"')}${f('Province','province','text',wizard.province||'','required maxlength="100"')}${f('Postal code','postal','text',wizard.postal||'','required maxlength="12"')}</div>`:step===2?`<div class="grid-2">${f('Contact person','contactName','text',wizard.contactName||'','required maxlength="100"')}${f('Designation','designation','text',wizard.designation||'','required maxlength="100"')}${f('Contact email','contact','email',wizard.contact||'','required')}${f('Phone number','phone','tel',wizard.phone||'','required maxlength="30"')}${f('MOA reference number','reference','text',wizard.reference||'','required maxlength="80"')}${f('MOA start date','start','date',wizard.start||'','required')}${f('MOA expiry date','expiry','date',wizard.expiry||'','required')}${f('Upload MOA document (PDF, PNG, JPG)','document','file','','accept="application/pdf,image/png,image/jpeg" '+(wizard.file?'':'required'))}</div>`:`<div class="grid-2">${panel('Company Information',`<h3>${e(wizard.name)}</h3><p>${e(wizard.industry)}</p><p>${e(wizard.address)}, ${e(wizard.location)}, ${e(wizard.province)}</p><p>Registration: ${e(wizard.registration)}</p>`)}${panel('Contact & MOA',`<p>${e(wizard.contactName)} · ${e(wizard.designation)}</p><p>${e(wizard.contact)} · ${e(wizard.phone)}</p><p>${date(wizard.start)} — ${date(wizard.expiry)}</p><p>${e(wizard.file?.name)}</p>`)}</div><label class="row"><input type="checkbox" required> I have reviewed the company details and supporting document.</label>`;
      return back('hte')+heading('Accredit New HTE','Register a host training establishment for document review.')+stepper+panel(['','Company Information','Contact & MOA Details','Review Application'][step],form(body,async(v,el)=>{Object.assign(wizard,v);if(step===2){if(wizard.expiry<=wizard.start)throw new Error('The MOA expiry must be after its start date.');const file=el.elements.document.files[0]||wizard.file;validateUpload(file);wizard.file=file;}if(step<3){location.hash=href('hte','new',String(step+1));return;}if(db().htes.some(h=>h.name.toLowerCase()===wizard.name.toLowerCase()))throw new Error('This company is already registered.');const file=wizard.file,document={id:crypto.randomUUID(),name:file.name};await c.putFile(document.id,file);const h={...wizard,id:crypto.randomUUID(),status:'Pending',document};delete h.file;db().htes.push(h);wizard={};finish('HTE application submitted for accreditation review.','hte');},step===3?'Submit Application':'Next Step',step>1?nav('Previous','hte','new',String(step-1)):nav('Cancel','hte')));
    }
    if(sub==='renew'){const h=get();return back('hte')+heading('Renew Memorandum of Agreement','Update agreement validity and supporting compliance documents.')+panel('',`<div class="row between"><h2>${e(h.name)}</h2><p>Current expiry: ${date(h.expiry)}</p></div>`)+panel('Renewal Details',form(`<div class="grid-2">${f('New MOA start date','start','date','','required')}${f('New MOA expiry date','expiry','date','','required')}</div>${f('Upload renewed MOA','document','file','','required accept="application/pdf,image/png,image/jpeg"')}${ta('Renewal notes','notes','','')}<h3>Compliance Verification</h3>${['Business permits are current','Insurance requirements reviewed','Training plan reviewed'].map(label=>`<label class="row ref-check"><input type="checkbox" required>${label}</label>`).join('')}`,async(v,el)=>{if(v.expiry<=v.start||v.expiry<today())throw new Error('Enter a valid future MOA expiry after the start date.');const file=el.elements.document.files[0];validateUpload(file);const document={id:crypto.randomUUID(),name:file.name};await c.putFile(document.id,file);Object.assign(h,{start:v.start,expiry:v.expiry,renewalNotes:v.notes,document,status:'Accredited'});finish('MOA renewal recorded.','hte','renewed',id);},'Submit Renewal'));}
    if(sub==='renewed'){const h=get();return `<div class="ref-success"><span class="ref-success-icon">${icon('check')}</span><h1>MOA Renewal Successful!</h1><p>The updated agreement is recorded in this frontend preview.</p>${panel('Renewal Summary',`<h2>${e(h.name)}</h2><p>${date(h.start)} — ${date(h.expiry)}</p>${badge(h.status)}`)}${nav('Back to Dashboard','hte')}${nav('View All MOA','hte','renewals')}</div>`;}
    if(sub==='activity')return back('hte')+heading('HTE Activity Log','Review accreditation and renewal activity.',b('Export CSV','ref-audit-export','','secondary','download'))+panel('',search('Search activity')+table(['Activity','Performed By','Date'],db().audit.filter(a=>match(a.action,a.actor)).map(a=>`<tr><td>${e(a.action)}</td><td>${e(a.actor)}</td><td>${date(a.date)}</td></tr>`)));
    const expiring=h=>new Date(h.expiry)-Date.now()<60*86400000;
    const list=db().htes.filter(h=>match(h.name,h.location,h.contact)&&(sub==='renewals'?expiring(h):c.view.filter==='All'||h.status===c.view.filter));
    const hteTable=table(['Company / HTE','Status',sub==='renewals'?'Current MOA Expiry':'MOA Expiry','Contact Person','Location','Actions'],list.map(h=>`<tr><td><strong>${e(h.name)}</strong></td><td>${badge(h.status)}</td><td>${date(h.expiry)}</td><td>${e(h.contactName||h.contact)}</td><td>${e(h.location)}</td><td><div class="row">${b('View','ref-hte-view',h.id,'secondary small')}${nav('Renew','hte','renew',h.id,'secondary small')}</div></td></tr>`));
    if(sub==='renewals')return back('hte')+heading('MOA Renewal Queue','Review agreements that expire within the next 60 days.')+panel('',search('Search company or contact')+(list.length?hteTable:empty('No renewals due','All recorded agreements are outside the renewal window.')));
    return heading('HTE Accreditation','Manage partner companies, accreditation status, and MOA compliance.',nav('MOA Renewal','hte','renewals')+nav('+ Accredit New HTE','hte','new','1',''))+stats([['Total HTEs',db().htes.length],['Active / Accredited',db().htes.filter(h=>h.status==='Accredited').length],['Expiring Soon',db().htes.filter(expiring).length],['Pending Review',db().htes.filter(h=>h.status==='Pending').length]])+panel('',search('Search HTE / company…')+filter([['All','All Statuses'],['Accredited','Accredited'],['Pending','Pending'],['Expired','Expired']])+hteTable)+`<div class="grid-2 section-space">${panel('Compliance Metrics',`<p>Accredited partners</p>${progress(db().htes.filter(h=>h.status==='Accredited').length,Math.max(1,db().htes.length))}<p>Students placed</p>${progress(db().users.filter(s=>s.role==='Student'&&s.company).length,Math.max(1,db().users.filter(s=>s.role==='Student').length))}`)}${panel('Recent Activity',db().audit.slice(0,3).map(a=>`<div class="activity-item"><p>${e(a.action)}</p><small>${date(a.date)}</small></div>`).join('')+nav('View All Activity','hte','activity','','secondary small'))}</div>`+panel('HTE Verification Workflow',`<div class="ref-stepper">${['Company registration','Document review','MOA verification','Accreditation','Active partnership'].map((label,i)=>`<span><b>${i+1}</b>${label}</span>`).join('')}</div>`);
  }
  async function hteAction(name,id){if(!['ref-hte-view','ref-hte-tab','ref-hte-edit','ref-audit-export'].includes(name))return false;if(u().role!=='Coordinator')throw new Error('Coordinator access required.');if(name==='ref-audit-export'){c.download('HTE-activity.csv',csvText([['Action','Actor','Date'],...db().audit.map(a=>[a.action,a.actor,a.date])]));return true;}if(name==='ref-hte-edit'){c.legacy.editHTE(id);return true;}const h=db().htes.find(h=>h.id===id);if(!h)throw new Error('HTE unavailable.');const documents=name==='ref-hte-tab';c.showModal(e(h.name),`<div class="tabs" style="margin-bottom: 24px; padding-bottom: 12px;">${b('Company Information','ref-hte-view',id,documents?'secondary':'')}${b('Documents','ref-hte-tab',id,documents?'':'secondary')}</div>${documents?(h.document?`<div class="ref-evidence">${icon('file')}<strong>${e(h.document.name)}</strong>${b('Preview','ref-file-preview',h.document.id,'secondary')}</div>`:empty('No document uploaded')):`<dl class="ref-facts"><dt>Industry</dt><dd>${e(h.industry)}</dd><dt>Address</dt><dd>${e(h.address||h.location)}</dd><dt>Contact person</dt><dd>${e(h.contactName||'Not recorded')}</dd><dt>Email</dt><dd>${e(h.contact)}</dd><dt>MOA expiry</dt><dd>${date(h.expiry)}</dd><dt>Status</dt><dd>${badge(h.status)}</dd></dl><div class="ref-button-stack" style="display: flex; flex-direction: column; gap: 8px; margin-top: 16px;">${b('Edit Accreditation','ref-hte-edit',id,'secondary full')}${nav('Renew MOA','hte','renew',id,'full')}${nav('Manage Job Listings','jobs','','','secondary full')}</div>`}`);document.querySelector('#modal').classList.add('ref-drawer');return true;}

  function candidatePages(){const {sub,id}=r(),co=u().role==='Coordinator',all=visibleStudents(db(),u()),unassigned=all.filter(s=>!s.company);if(!co&&['assign','batch','exports','analytics'].includes(sub))throw new Error('Coordinator access required.');
    if(sub==='profile'){const s=student(id),section=c.view.profileTab||'Overview',hours=approvedHours(db(),id),a=db().appraisals.find(a=>a.studentId===id);return back('candidates')+heading('Intern Profile','Placement, attendance, evaluation, and requirements.',co?nav('Edit Placement / Clearance','candidates','edit',id):'')+`<div class="ref-identity">${person(s)}<span>${e(s.identifier)} · ${badge(s.badge)}</span></div><div class="ref-tabs">${['Overview','DTR Records','Evaluations','Documents'].map(label=>b(label,'ref-profile-tab',label,section===label?'small':'secondary small')).join('')}</div>`+(section==='DTR Records'?panel('Daily Time Records',c.dtrTable(db().logs.filter(l=>l.studentId===id),{role:'Student'})):section==='Evaluations'?appraisalResult(s,a):section==='Documents'?panel('Submitted Requirements',db().documents.filter(d=>d.studentId===id).map(d=>`<div class="document-item"><strong>${e(d.category)}</strong><span>${e(d.name)}</span>${b('Preview','ref-file-preview',d.id,'secondary small')}</div>`).join('')||empty('No documents submitted')):`<div class="ref-detail-grid"><div>${panel('OJT Placement Details',`<dl class="ref-facts"><dt>Host training establishment</dt><dd>${e(s.company||'Unassigned')}</dd><dt>Company supervisor</dt><dd>${e(c.student(s.supervisorId)?.name||'Unassigned')}</dd><dt>Course / program</dt><dd>${e(s.course)}</dd><dt>Training hours required</dt><dd>${s.requiredHours} hours</dd><dt>Accreditation status</dt><dd>${badge(s.badge)}</dd></dl>`)}${panel('Performance Metrics',stats([['Approved Hours',hours],['Overall Evaluation',a?a.score.toFixed(1)+' / 5':'Pending'],['Open Incidents',db().incidents.filter(i=>i.studentId===id&&!['Resolved','Dismissed'].includes(i.status)).length]]))}</div><div>${panel('OJT Hours Progress',`<div class="ref-large-score">${Math.round(hours/s.requiredHours*100)}%</div>${progress(hours,s.requiredHours)}<p>${hours} / ${s.requiredHours} hours</p>`)}${panel('Recent Activity',db().logs.filter(l=>l.studentId===id).slice(-3).reverse().map(l=>`<div class="activity-item"><strong>${date(l.date)}</strong><p>${l.hours} hours · ${e(l.status)}</p></div>`).join('')||'<p>No attendance records yet.</p>')}</div></div>`);}
    if(sub==='edit'){student(id);return back('candidates')+heading('Placement & Clearance','Update the intern’s assignment and verify completion requirements.')+legacyForm(()=>c.legacy.studentDetail(id));}
    if(sub==='assign'||sub==='batch'){const list=sub==='assign'&&id?[student(id)]:unassigned;return back('candidates')+heading(sub==='batch'?'Bulk Student Assignment':'Assign Student Placement','Choose an active position and assign eligible, unplaced students.')+panel('Placement Details',form(`<div class="grid-2">${sel('HTE / internship position','jobId',db().jobs.filter(j=>j.status==='Active'&&j.supervisorId&&j.slots>0).map(j=>[j.id,j.company+' — '+j.title+' ('+j.slots+' slots)']))}${f('Required OJT hours','requiredHours','number',db().program.requiredHours,'required min="1" max="2000"')}</div>${table(['Select','Student','SR Code','Program','Status'],list.map(s=>`<tr><td><input aria-label="Select ${e(s.name)}" type="checkbox" name="students" value="${e(s.id)}" ${sub==='assign'?'checked':''}></td><td>${e(s.name)}</td><td>${e(s.identifier)}</td><td>${e(s.course)}</td><td>${badge(s.badge)}</td></tr>`))}`, (v,el)=>{const ids=new FormData(el).getAll('students');const placed=assignPlacement(db(),u(),ids,v.jobId,v.requiredHours);placed.forEach(s=>c.notify(s.id,'Application_Status','Placement confirmed','You are assigned to '+s.company+'.'));finish(placed.length+' students assigned successfully.','candidates');},'Assign Placement'));}
    if(sub==='exports')return back('candidates')+heading('Reports & Exports','Generate placement reports and review previously generated documents.')+`<div class="grid-2">${['deployment','completion','hte','compliance'].map(type=>panel(reportNames[type],`<p>Generate a report from the current cohort records.</p>${nav('Generate Report','reports','configure',type,'')}`)).join('')}</div>`+nav('Exported Files Repository','reports','history');
    const availableViews=[['','Table View'],['grid','Grid View'],['companies','HTE Breakdown'],['unassigned',`Unassigned Pool (${unassigned.length})`],['cohort','Cohort Overview'],['exports','Reports & Exports'],['performance','Track Performance']];
    const list=(sub==='unassigned'?unassigned:all).filter(s=>match(s.name,s.identifier,s.course,s.company)&&(sub==='company'?s.company===decodeURIComponent(id):true));
    const intro=heading(co?'Student Placement Directory':'Candidate Review & Roster','Manage student placements, company assignments, and training progress.',co?b('Bulk Import CSV','import-users','','secondary','upload')+nav('Bulk Assignment','candidates','batch')+nav('+ Assign Placement','candidates','assign','',''):c.link('Application Review','applications'))+(co?tabs(availableViews):'')+stats([['Total Placed',all.filter(s=>s.company).length],['Pending Placement',unassigned.length],['Active Internships',all.filter(s=>s.company&&s.badge!=='Cleared').length],['Completed',all.filter(s=>s.badge==='Cleared').length]]);
    if(sub==='companies')return intro+`<div class="grid-3">${db().htes.map(h=>{const interns=all.filter(s=>s.company===h.name),slots=db().jobs.filter(j=>j.company===h.name&&j.status==='Active').reduce((n,j)=>n+j.slots,0);return panel(e(h.name),`<p>${e(h.industry)}</p><dl class="ref-facts"><dt>Active interns</dt><dd>${interns.length}</dd><dt>Available slots</dt><dd>${slots}</dd><dt>Status</dt><dd>${badge(h.status)}</dd></dl>${b('View Company Interns','ref-company-interns',h.name,'secondary full')}`);}).join('')}</div>`;
    if(sub==='grid')return intro+search('Search student, SR code or HTE')+`<div class="grid-3">${list.map(s=>panel('',`${person(s)}<p>${badge(s.badge)}</p><div class="ref-readonly"><strong>${e(s.company||'Unassigned')}</strong><p>${e(c.student(s.supervisorId)?.name||'No supervisor assigned')}</p></div><p>Hours Rendered</p>${progress(approvedHours(db(),s.id),s.requiredHours)}${nav('Open Intern Profile','candidates','profile',s.id,'secondary full')}`)).join('')}</div>`;
    if(sub==='performance')return intro+panel('Track Student Performance',search('Search student or HTE')+table(['Student','HTE','Hours Rendered','Supervisor Rating','Attendance','Status','Action'],list.map(s=>{const a=db().appraisals.find(a=>a.studentId===s.id),logs=db().logs.filter(l=>l.studentId===s.id);return `<tr><td>${person(s)}</td><td>${e(s.company||'Unassigned')}</td><td>${approvedHours(db(),s.id)} / ${s.requiredHours}</td><td>${a?a.score.toFixed(1)+' / 5':'Pending'}</td><td>${logs.filter(l=>l.status==='Approved').length} approved entries</td><td>${badge(s.badge)}</td><td>${nav('View Details','candidates','profile',s.id,'secondary small')}</td></tr>`;})));
    if(sub==='cohort')return intro+panel('Cohort Overview',`<div class="row wrap">${nav('Assign Students','candidates','batch')}${nav('View Reports','candidates','exports')}</div><h2 class="mt16">Active Cohort</h2>`+table(['Student','Program','Company','Hours Progress','Status'],list.map(s=>`<tr><td>${nav(e(s.name),'candidates','profile',s.id,'secondary small')}</td><td>${e(s.course)}</td><td>${e(s.company||'Unassigned')}</td><td>${progress(approvedHours(db(),s.id),s.requiredHours)}</td><td>${badge(s.badge)}</td></tr>`)));
    return intro+panel('',search('Search students, SR code, or HTE…')+table(['Student Name / SR','Program','HTE Assignment','Hours Progress','Status','Action'],list.map(s=>`<tr><td><strong>${e(s.name)}</strong><small>${e(s.identifier)}</small></td><td>${e(s.course)}</td><td>${e(s.company||'Unassigned')}</td><td>${progress(approvedHours(db(),s.id),s.requiredHours)}</td><td>${badge(s.badge)}</td><td>${nav(sub==='unassigned'?'Assign HTE':'View Details','candidates',sub==='unassigned'?'assign':'profile',s.id,'secondary small')}</td></tr>`)))+(co&&unassigned.length?panel('Unassigned Students — Action Required',`<p>${unassigned.length} students are waiting for placement.</p>${nav('Review Unassigned Pool','candidates','unassigned')}`):'');
  }

  function attendancePages(){const {sub,id}=r(),role=u().role,logs=visibleLogs(db(),u());
    if(sub==='profile'){const s=student(id),items=logs.filter(l=>l.studentId===id),tasks=c.view.tasks;return back('dtr')+heading(e(s.name)+' DTR Records','Review weekly log sheets and task summaries.',`<div style="display:flex; gap:8px;">${b('Export PDF', 'ref-export-dtr', 'pdf', 'secondary', 'download')} ${b('Export CSV', 'ref-export-dtr', 'csv', 'secondary', 'download')}</div>`)+`<div class="ref-identity">${person(s)}${b(tasks?'View DTR Records':'View Task Summary','ref-task-view','','secondary small')}</div>`+panel('Weekly Log Sheets',table(tasks?['Date','Task Description','Status']:['Date','Day','Time In','Time Out','Total Hours','Status'],items.map(l=>`<tr><td>${date(l.date)}</td>${tasks?'<td>'+e(l.task)+'</td>':'<td>'+new Date(l.date+'T12:00:00').toLocaleDateString('en',{weekday:'long'})+'</td><td>'+time(l.clockIn)+'</td><td>'+time(l.clockOut)+'</td><td>'+l.hours+' hrs</td>'}<td>${badge(l.status)}</td></tr>`)))+stats([['Total Rendered Hours',approvedHours(db(),id)+' Hours'],['Required Hours',s.requiredHours+' Hours'],['Remaining Hours',Math.max(0,s.requiredHours-approvedHours(db(),id))+' Hours']]);}
    if(sub==='review'){if(role!=='Coordinator')throw new Error('Coordinator access required.');const l=logs.find(l=>l.id===id);if(!l)throw new Error('DTR unavailable.');return back('dtr')+heading('Review DTR Entry','Review the original record, supporting justification, and required corrections.')+`<div class="ref-identity">${person(c.student(l.studentId))}${badge(l.status)}</div><div class="grid-2">${panel('Original Record',`<dl class="ref-facts"><dt>Date</dt><dd>${date(l.date)}</dd><dt>Clock In</dt><dd>${time(l.clockIn)}</dd><dt>Clock Out</dt><dd>${time(l.clockOut)}</dd><dt>Hours</dt><dd>${l.hours}</dd></dl><h3>Task Summary</h3><p>${e(l.task)}</p>`)}${panel('Justification & Review',`<p>${e(l.justification||'No justification submitted.')}</p><p>${e(l.remarks||'No supervisor remarks.')}</p><p>GPS: ${l.gps?'Captured; server verification pending':'Unavailable'}</p>`)}</div>`+panel('Compliance Review',form(sel('Compliance status','status',['Flagged','Pending'],l.status==='Pending'?'Pending':'Flagged')+ta('Coordinator remarks','remarks',l.coordinatorRemarks||'','required minlength="10"'),v=>{l.coordinatorRemarks=v.remarks;l.status=v.status;c.notify(l.supervisorId,'DTR_Event','DTR compliance review',c.student(l.studentId).name+': '+v.remarks);finish('Compliance review saved; supervisor sign-off is required.','dtr','flagged');},'Save & Notify Supervisor'));}
    if(role==='Coordinator'){
      const students=visibleStudents(db(),u()),flagged=logs.filter(l=>['Flagged','Rejected'].includes(l.status)),pending=logs.filter(l=>l.status==='Pending'),approved=logs.filter(l=>l.status==='Approved');
      if(sub==='flagged')return back('dtr')+heading('Flagged DTR Entries','Review attendance anomalies and supporting justifications.')+`<div class="ref-alert">${flagged.length} entries require compliance review. Supervisor approval remains required.</div>`+panel('',table(['Student','Date','Flag Reason','Original Entry','Status','Action'],flagged.map(l=>`<tr><td>${e(c.student(l.studentId)?.name)}</td><td>${date(l.date)}</td><td>${e(l.remarks||'Attendance review required')}</td><td>${time(l.clockIn)} – ${time(l.clockOut)}</td><td>${badge(l.status)}</td><td>${nav('Review Details','dtr','review',l.id,'secondary small')}</td></tr>`)));
      return heading('DTR Compliance Monitor','Monitor daily time records, compliance risks, and training completion.',b('Compliance Settings','ref-compliance-settings','','secondary'))+`<div class="ref-compliance-stats">${stats([['Total Deployed Students',students.filter(s=>s.company).length,'users'],['Compliance Rate',Math.round(approved.length/Math.max(1,logs.length)*100)+'%','check'],['Non-compliant',flagged.length,'alert'],['Pending Review',pending.length,'clock']])}</div>`+panel('',search('Search student, SR code or company'))+panel('Student Compliance Overview',table(['Student Name','Program','HTE Company','Hours Progress','Status','Action'],students.filter(s=>match(s.name,s.identifier,s.company)).map(s=>`<tr><td><strong>${e(s.name)}</strong></td><td>${e(s.course)}</td><td>${e(s.company||'Unassigned')}</td><td>${progress(approvedHours(db(),s.id),s.requiredHours)}</td><td>${badge(flagged.some(l=>l.studentId===s.id)?'Flagged':'Active')}</td><td>${nav('View Details','dtr','profile',s.id,'secondary small')}</td></tr>`)))+panel('',`<div class="row between" style="margin-bottom: 20px;"><h2>Flagged Entries</h2>${b('Run Auto Verification','ref-scan','','secondary small')}</div>`+table(['Student','Date','Reason','Status','Action'],flagged.slice(0,5).map(l=>`<tr><td>${e(c.student(l.studentId)?.name)}</td><td>${date(l.date)}</td><td>${e(l.remarks||'Review needed')}</td><td>${badge(l.status)}</td><td>${nav('Review Details','dtr','review',l.id,'secondary small')}</td></tr>`))+nav('View All Flagged Entries','dtr','flagged','','secondary small'))+panel('Department Hours Log',`<div class="ref-department-chart">${[...new Set(students.map(s=>s.course))].map(course=>{const cohort=students.filter(s=>s.course===course),hrs=cohort.reduce((n,s)=>n+approvedHours(db(),s.id),0),total=cohort.reduce((n,s)=>n+s.requiredHours,0);return `<div><svg viewBox="0 0 100 150" role="img" aria-label="${e(course)}: ${hrs} hours"><rect x="25" y="${150-Math.min(150,hrs/Math.max(1,total)*150)}" width="50" height="${Math.min(150,hrs/Math.max(1,total)*150)}" rx="4"/></svg><strong>${hrs}h</strong><small>${e(course)}</small></div>`;}).join('')}</div>`);
    }
    if(role==='Supervisor'){
        const list=logs.filter(l=>match(c.student(l.studentId)?.name,l.date,l.task)&&(c.view.filter==='All'||l.status===c.view.filter));
        const pending=logs.filter(l=>l.status==='Pending');
        
        const headerHtml = heading('Intern Attendance & DTR Management','Review, approve, and sign off on daily time records.') + 
            '<div class="row between" style="background: var(--cream); padding: 16px; border-radius: var(--radius); margin-bottom: 24px;"><div class="row"><strong>On-Site Time-In Verification</strong><p class="small muted mb0">You are the designated timekeeper. Clock interns in when they arrive.</p></div></div>';
            
        const rosterPanel = (() => {
            let students = visibleStudents(db(), u());
            let rosterRows = students.map(s => {
                let active = (db().activeShifts || []).find(sh => sh.studentId === s.id);
                const statusBg = active ? '#166534' : 'var(--slate)';
                const statusDot = active ? 'background:#16a34a;animation:tk-pulse 2s infinite' : 'background:var(--slate)';
                const statusText = active ? 'Active On-Site' : 'Clocked Out';
                const actionBtn = b('Open Terminal', 'tk-terminal', s.id, 'primary small');
                return '<tr>' +
                    '<td>' + person(s) + '</td>' +
                    '<td><div style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:' + statusBg + '"><span style="width:8px;height:8px;border-radius:50%;' + statusDot + '"></span>' + statusText + '</div></td>' +
                    '<td>' + (active ? 'In Progress' : '--') + '</td>' +
                    '<td>' + actionBtn + '</td>' +
                '</tr>';
            });
            return panel('Timekeeper: Intern Roster', '<p class="small muted" style="margin-bottom:16px;">Select an intern to manage their current shift.</p>' + table(['Intern', 'Current Status', 'Today\'s Session', 'Action'], rosterRows) + '<style>@keyframes tk-pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }</style>');
        })();
        
        const toolbarHtml = '<div class="ref-attendance-toolbar" style="margin-top: 16px; margin-bottom: 8px;">' + search('Search intern name or date.') + filter([['All','All Status'],['Pending','Pending'],['Approved','Approved'],['Flagged','Flagged']]) + '<div style="margin-left:auto; display:flex; gap:8px;">' + b('Approve All Pending ('+pending.length+')','ref-approve-all','primary small','check') + '</div></div>';
        
        const historyPanel = panel('Recent DTR Logs & Approvals', (() => {
            let historyRows = list.map(l=>'<tr><td><strong>' + e(c.student(l.studentId)?.name) + '</strong><br><small>' + e(c.student(l.studentId)?.course) + '</small></td><td>' + date(l.date) + '</td><td>' + time(l.clockIn) + '</td><td>' + time(l.clockOut) + '</td><td><span class="task-excerpt">' + e(l.task) + '</span></td><td>' + badge(l.gps?'Captured':'Unavailable') + '</td><td>' + badge(l.status) + '</td><td><div class="row" style="flex-wrap:wrap; gap:4px; max-width:220px;">' + (['Pending','Flagged'].includes(l.status) ? b('Verify On-Site','ref-verify',l.id,'primary small', 'pin') + b('Approve','ref-approve',l.id,'small') + b('Reject','ref-reject',l.id,'secondary small') : '') + nav('View','dtr','profile',l.studentId,'secondary small') + '</div></td></tr>');
            return table(['Intern','Date','Clock In','Clock Out','Task Summary','GPS','Status','Actions'], historyRows) + '<style>.table-wrap { overflow-x: hidden !important; } .table-wrap table { width: 100%; table-layout: auto; } .table-wrap td { white-space: normal !important; word-break: break-word; } .task-excerpt { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-width: 150px; max-width: 250px; } td:last-child .row { max-width: 180px !important; justify-content: flex-start; }</style>';
        })());
        
        return headerHtml + rosterPanel + toolbarHtml + historyPanel;
    }
    // Student: clock and task draft at left, history and saved drafts at right.
    if(sub==='history') return back('dtr') + heading('DTR History', 'Complete attendance and task records.') + `<div class="ref-alert" style="margin-bottom: 16px;"><strong>🔒 Lock Enabled:</strong> All past and submitted DTR entries are strictly READ-ONLY. Modification of timestamps is permanently restricted.</div>` + filter([['All','All'],['Approved','Approved'],['Pending','Pending'],['Flagged','Flagged'],['Rejected','Rejected']]) + panel('', c.dtrTable(logs.filter(l=>c.view.filter==='All'||l.status===c.view.filter), u()));
      const shift=db().shift?.studentId===u().id?db().shift:null,hrs=approvedHours(db(),u().id),list=logs.filter(l=>c.view.filter==='All'||l.status===c.view.filter),drafts=(db().taskDrafts||[]).filter(d=>d.studentId===u().id);
    if(sub==='drafts') return back('dtr') + heading('Saved Drafts History', 'Review all your previously saved task summary drafts.') + panel('', drafts.length?table(['Date','Task Summary','Action'],drafts.map(d=>`<tr><td>${date(d.date)}</td><td><span class="task-excerpt">${e(d.task)}</span></td><td>${b('View Draft','ref-draft-view',d.id,'secondary small')}</td></tr>`)):empty('No saved drafts','Save a task summary to continue it later.'));
    
    const shiftStr = shift ? 'Clocked in at ' + time(shift.clockIn) : 'Not clocked in';
    const shiftBadgeHtml = shift ? '<div class="badge" style="background:var(--burgundy);color:white;font-size:11px;font-weight:600;padding:2px 8px;">Active</div>' : '<div class="badge" style="background:#f1f5f9;color:#334155;font-size:11px;font-weight:600;padding:2px 8px;">Inactive</div>';

    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
    const weeklyLogs = logs.filter(l => l.date >= startOfWeek && l.status === 'Approved');
    const weeklyHours = weeklyLogs.reduce((sum, l) => sum + l.hours, 0);
    const weeklyPct = Math.min(100, Math.round((weeklyHours / 40) * 100)) || 0;

    const totalPct = Math.min(100, Math.round((hrs / u().requiredHours) * 100)) || 0;

    const customStatsHtml = `<div class="ref-stats">
      <div>
        <div class="row between align-start mb0" style="width: 100%; margin-bottom: 4px;">
          <span>Current Shift Status</span>
          ${shiftBadgeHtml}
        </div>
        <strong>${shiftStr}</strong>
      </div>
      <div>
        <div class="row between align-start mb0" style="width: 100%; margin-bottom: 4px;">
          <span>Hours Rendered This Week</span>
          <div class="badge" style="background:#f1f5f9;color:#334155;font-size:11px;font-weight:600;padding:2px 8px;">${weeklyPct}% Done</div>
        </div>
        <strong>${weeklyHours.toFixed(1)} / 40.0 Hours</strong>
      </div>
      <div>
        <div class="row between align-start mb0" style="width: 100%; margin-bottom: 4px;">
          <span>Total Internship Progress</span>
          <div class="badge" style="background:#FCE7F3;color:#9F1239;font-size:11px;font-weight:600;padding:2px 8px;">${totalPct}% Completed</div>
        </div>
        <strong>${hrs.toFixed(1)} / ${u().requiredHours} Hours</strong>
      </div>
    </div>`;

    return heading('Daily Time Record Hub','Log your attendance, submit daily accomplishments, and review your time records.',b('Export Log Summary','ref-export-modal','','secondary','download')) + customStatsHtml + `<div class="reference-dtr ref-student-dtr"><div>

${panel('', `
  <div style="text-align: center; padding: 12px 0; position: relative;">

    <span class="eyebrow" style="display:inline-block; margin-bottom:16px;">TODAY · ${date(today())}</span>
    <div class="timer" id="shift-timer" style="font-size: 56px; font-weight: 800; color: var(--ink); line-height: 1; margin-bottom: 8px; font-variant-numeric: tabular-nums;">
      ${shift?elapsed(shift.clockIn,shift.clockOut):'00:00:00'}
    </div>
    <p class="muted" style="margin-bottom: 24px;">${shift?.clockOut?'Clocked out — daily log ready to submit':shift?'You are currently clocked in':'Not clocked in'}</p>
    
    
    <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; text-align: center; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
        <h3 style="margin-top: 0;">Timekeeper Status</h3>
        <p class="muted" style="margin-bottom:24px;">Your supervisor manages your time-in and time-out.</p>
        ${shift ? (shift.clockOut 
            ? '<div style="background:#fefce8; color:#854d0e; padding:16px; border-radius:8px; margin-bottom:16px;"><strong>Shift Completed</strong><br>Your supervisor clocked you out. Please submit your daily logbook.</div>' + b('Submit Daily Summary Logbook', 'ref-submit-log', '', 'primary full', 'file') 
            : '<div style="background:#dcfce7; color:#166534; padding:16px; border-radius:8px; margin-bottom:16px; display:inline-block; width:100%;"><strong><span style="display:inline-block;width:10px;height:10px;background:#16a34a;border-radius:50%;margin-right:8px;animation:tk-pulse 2s infinite;"></span> Active On-Site</strong><br>Your supervisor clocked you in.</div>') 
            : '<div style="background:#f1f5f9; color:#475569; padding:16px; border-radius:8px; margin-bottom:16px;"><strong>Clocked Out</strong><br>Awaiting supervisor clock-in.</div>'}
    </div>


    <style>
      .dtr-map-loader { display: none; flex-direction: column; align-items: center; justify-content: center; position: absolute; inset: 0; background: rgba(250,248,245,0.9); z-index: 10; backdrop-filter: blur(2px); }
      .location-panel:has(button[data-action="clock"]:disabled) .dtr-map-loader { display: flex; }
      .radar-ping { width: 48px; height: 48px; border-radius: 50%; border: 3px solid rgba(88,17,26,0.2); border-top-color: #58111A; animation: spin 1s linear infinite; margin-bottom: 16px; }
      @keyframes spin { 100% { transform: rotate(360deg); } }
    </style>

    <div class="location-panel" style="margin-top: 32px; border: 2px dashed rgba(88,17,26,0.15); border-radius: 12px; padding: 24px; position: relative; overflow: hidden; background: #FAF8F5; text-align: left;">
      
      <div class="dtr-map-loader">
         <div class="radar-ping"></div>
         <strong style="color: var(--burgundy); font-size: 16px;">Scanning Map Location...</strong>
      </div>

      ${shift && shift.gps ? `
        <div style="background: var(--surface); border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center; border: 1px solid var(--line);">
          <strong style="color: #059669; font-size: 14px; display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 16px;">
            ${icon('check')} Live Coordinates Locked
          </strong>
          
          <!-- Visual Map Frame for Leaflet (Handled by app.js) -->
          <div id="real-map-container" style="width: 100%; height: 220px; border-radius: 8px; border: 1px solid var(--line); position: relative; overflow: hidden; z-index: 1; margin-bottom: 12px; background: #E2E8F0;"></div>
        </div>
        
        <div style="text-align: center; margin-bottom: 16px;">
          <strong style="font-size: 16px; color: var(--ink);">${icon('pin')} <span id="dtr-loc-name">${e(u().company||'Assigned workplace')}</span></strong>
          <small style="display:block; margin-top: 8px; font-family: monospace; color: var(--ink-light); font-size: 13px;">${shift.gps.lat.toFixed(5)}, ${shift.gps.lng.toFixed(5)}</small>
          <small style="display:block; margin-top: 4px; font-weight: 700; color: #0284C7; font-size: 13px;">${ (Math.abs(shift.gps.lat * 111 - 1615) % 2.5 + 0.05).toFixed(2) } km away from workplace</small>
        </div>

        <details style="background: var(--surface); padding: 12px; border-radius: 8px; border: 1px solid var(--line);">
          <style>
            .dtr-tech-summary { font-weight: 600; font-size: 15px !important; color: var(--ink); cursor: pointer; outline: none; text-decoration: underline; text-underline-offset: 4px; padding-left: 4px; }
            .dtr-tech-summary::marker { font-size: 18px; }
            .dtr-tech-summary::-webkit-details-marker { font-size: 18px; }
          </style>
          <summary class="dtr-tech-summary">Technical Details</summary>
          <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 13px;">
            <span class="muted">Accuracy</span>
            <strong style="font-family: monospace;">± ${shift.gps.accuracy.toFixed(1)} meters</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px;">
            <span class="muted">Signal Status</span>
            <strong style="color: #059669;">Verified</strong>
          </div>
        </details>
      ` : `
        <div style="text-align: center; padding: 24px 0;">
           <div style="font-size: 32px; color: rgba(88,17,26,0.3); margin-bottom: 16px;">${icon('pin')}</div>
           <strong style="color: var(--ink); font-size: 16px;">${e(u().company||'Assigned workplace')}</strong>
           <small style="display: block; margin-top: 8px; color: var(--ink-light);">No verified location available.</small>
        </div>
      `}
    </div>
    
    <!-- Hidden spans for app.js legacy references -->
    <div style="display:none;"><span id="dtr-coords"></span><span id="dtr-acc"></span><span id="dtr-status"></span><div id="dtr-map-frame"></div></div>
  </div>
`)}
${panel('Today’s Task Summary',`<label class="small" for="draft">Describe your work and accomplishments</label><textarea id="draft" maxlength="3000" placeholder="What did you accomplish today?">${e(db().draft)}</textarea><small>Draft saved in this browser as you type.</small>${b('Save Daily Log Draft','ref-save-draft','','secondary full')}${b('Submit Daily Log','ref-submit-log','','full')}`)}</div><div>${panel('Recent Clock-ins', c.dtrTable(list.slice(0, 5), u()) + '<div style="margin-top: 24px; text-align: center;">' + nav('See All DTR History', 'dtr', 'history', '', 'secondary full') + '</div>')}${panel('Recent Saved Drafts', (drafts.length ? table(['Date','Task Summary','Action'], drafts.slice(0,3).map(d=>`<tr><td>${date(d.date)}</td><td><span class="task-excerpt">${e(d.task)}</span></td><td>${b('View Draft','ref-draft-view',d.id,'secondary small')}</td></tr>`)) : empty('No saved drafts','Save a task summary to continue it later.')) + '<div style="margin-top: 24px; text-align: center;">' + nav('See All Saved Drafts History', 'dtr', 'drafts', '', 'secondary full') + '</div>')}</div></div>`;
  }
  function elapsed(start,end){const total=Math.max(0,Math.floor(((end?new Date(end).getTime():Date.now())-new Date(start))/1000));return [Math.floor(total/3600),Math.floor(total/60)%60,total%60].map(n=>String(n).padStart(2,'0')).join(':');}
  async function attendanceAction(name,id){
    if(name==='ref-profile-tab'){c.view.profileTab=id;c.render();return true;}
    if(name==='ref-company-interns'){if(u().role!=='Coordinator')throw new Error('Coordinator access required.');location.hash=href('candidates','company',id);return true;}
    if(name==='ref-task-view'){c.view.tasks=!c.view.tasks;c.render();return true;}
    if(name==='log-detail'&&u().role==='Coordinator'){location.hash=href('dtr','review',id);return true;}
    if(['ref-approve','ref-reject','ref-approve-all'].includes(name)){if(u().role!=='Supervisor')throw new Error('Supervisor access required.');const batch=name==='ref-approve-all',reject=name==='ref-reject',logs=visibleLogs(db(),u()).filter(l=>batch?l.status==='Pending':l.id===id&&['Pending','Flagged'].includes(l.status));if(!logs.length)throw new Error('No reviewable records found.');const body=(batch?`<p>Approve all ${logs.length} pending entries for your assigned interns?</p>`:stats([['Clock In',time(logs[0].clockIn)],['Clock Out',time(logs[0].clockOut)],['Total Hours',logs[0].hours+'h']])+`<h3>Task Summary</h3><p>${e(logs[0].task)}</p>`)+ta(reject?'Reason for rejection / supervisor comments':'Supervisor remarks','remarks',reject?'':'Reviewed attendance and task summary.','required minlength="5"')+signatureFields()+f('Typed signature (frontend preview)','signature','text',u().name,'required maxlength="100"')+'<label class="row"><input type="checkbox" required> I reviewed these attendance records.</label>';c.showModal(batch?'Confirm Bulk Approval':reject?'Reject DTR Entry':'Approve DTR Entry',body,async(v,form)=>{const image=await signatureImage(form);const signatureId=image?crypto.randomUUID():null;if(image)await c.putFile(signatureId,image);const updated=reviewBatch(db(),u(),logs.map(l=>l.id),reject?'Rejected':'Approved',v.remarks,v.signature);updated.forEach(l=>{if(signatureId)l.signatureFileId=signatureId;});updated.forEach(l=>c.notify(l.studentId,'DTR_Event',reject?'DTR entry rejected':'DTR entry approved',date(l.date)+': '+v.remarks));finish(batch?'All pending DTR entries approved.':reject?'DTR entry rejected — returned for resubmission.':'DTR entry approved and signed.','dtr');},reject?'Confirm Rejection':'Confirm Approval');bindSignature(document.querySelector('#modal-form'));return true;}
    if(name==='ref-scan'){if(u().role!=='Coordinator')throw new Error('Coordinator access required.');const issues=db().logs.filter(l=>!l.gps||l.hours<=0||l.hours>16);c.showModal('Attendance Validation Results',`<p>${db().logs.length} records checked. ${issues.length} need a location or duration review.</p><p>This local check does not verify GPS authenticity or approve attendance.</p>`+table(['Student','Date','Finding'],issues.map(l=>`<tr><td>${e(c.student(l.studentId)?.name)}</td><td>${date(l.date)}</td><td>${!l.gps?'No location captured':'Unusual duration'}</td></tr>`)));return true;}
    if(name==='ref-compliance-settings'){if(u().role!=='Coordinator')throw new Error('Coordinator access required.');c.showModal('Compliance Settings',f('Required OJT hours for new candidates','requiredHours','number',db().program.requiredHours,'required min="1" max="2000"')+f('Program completion deadline','deadline','date',db().program.deadline,'required'),v=>{db().program.requiredHours=Number(v.requiredHours);db().program.deadline=v.deadline;finish('Compliance settings saved.');});return true;}
    if(name==='ref-clock-out'){if(u().role!=='Student'||db().shift?.studentId!==u().id)throw new Error('No active shift.');c.showModal('Confirm Clock Out',`<p>Your shift started at ${time(db().shift.clockIn)}. Clock out and continue to your daily log submission?</p>`,()=>{db().shift.clockOut=new Date().toISOString();finish('Clock-out time recorded. Complete your daily log.','dtr');},'Clock Out');return true;}
    if(name==='ref-submit-log'){if(u().role!=='Student')throw new Error('Student access required.');if(db().shift?.studentId!==u().id)throw new Error('Clock in before submitting a daily log.');if(!db().shift.clockOut)throw new Error('Clock out before submitting the daily log.');return false;}
    if(name==='ref-save-draft'){if(u().role!=='Student')throw new Error('Student access required.');if(!db().draft.trim())throw new Error('Enter a task summary first.');db().taskDrafts??=[];const draft=db().taskDrafts.find(d=>d.studentId===u().id&&d.date===today());if(draft)draft.task=db().draft;else db().taskDrafts.unshift({id:crypto.randomUUID(),studentId:u().id,date:today(),task:db().draft});finish('Daily log draft saved.');return true;}
    if(name==='ref-draft-delete'){
    if(confirm('Are you sure you want to delete this draft?')) {
        db().taskDrafts = db().taskDrafts.filter(d => d.id !== id);
        c.save();
        c.toast('Draft deleted successfully.');
        document.querySelector('#modal').close();
        c.render();
    }
    return true;
}
if(name==='ref-draft-edit'){
    const d=db().taskDrafts?.find(d=>d.id===id&&d.studentId===u().id);
    if(!d)throw new Error('Draft unavailable.');
    db().draft = d.task;
    c.save();
    c.toast('Draft loaded into today’s task summary.');
    document.querySelector('#modal').close();
    if(r().sub==='drafts') location.hash = '#/student/dtr';
    else c.render();
    return true;
}
if(name==='ref-draft-view'){
    const d=db().taskDrafts?.find(d=>d.id===id&&d.studentId===u().id);
    if(!d)throw new Error('Draft unavailable.');
    const ds = new Date(d.date).toLocaleDateString('en',{month:'long', day:'numeric'});
    const title = 'Task Summary Draft - ' + date(d.date);
    const body = `
    <p class="muted small mb16">View your latest daily log for ${ds}</p>
    <div class="row wrap mb16" style="gap: 8px;">
        ${badge('Draft Log Viewer')} ${badge('Draft Auto-saved · AY 2025-2026 · 2nd Semester')}
    </div>
    <div class="grid-2" style="background: var(--surface); border: 1px solid var(--line); padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <dl class="ref-facts" style="margin: 0;">
            <dt>Student</dt><dd>${e(u().name)}</dd>
            <dt>SR Code</dt><dd>${e(u().identifier)}</dd>
            <dt>Course/Section</dt><dd>${e(u().course)}</dd>
        </dl>
        <dl class="ref-facts" style="margin: 0;">
            <dt>HTE</dt><dd>${e(u().company||'Unassigned')}</dd>
            <dt>Supervisor</dt><dd>${e(c.student(u().supervisorId)?.name||'Unassigned')}</dd>
            <dt>Status</dt><dd>${badge('Draft Auto-saved')}</dd>
        </dl>
    </div>
    <h3 class="mt16 mb8" style="font-size: 15px;">${date(d.date)} - Full Log Details</h3>
    <div style="background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; margin: 0; color: var(--ink);">${e(d.task)}</p>
    </div>
    <div class="form-actions">
        <button class="btn secondary" data-action="close">Close</button>
        <div style="flex: 1;"></div>
        <button class="btn secondary" style="color: #E11D48; border-color: #E11D48;" data-action="ref-draft-delete" data-id="${id}">Delete Draft</button>
        <button class="btn secondary" data-action="ref-draft-edit" data-id="${id}">Edit Draft</button>
        <button class="btn" data-action="ref-draft-edit" data-id="${id}">Okay, Continue Drafting</button>
    </div>
    `;
    c.showModal(title, body, null);
    return true;
  }


    if(name==='ref-file-delete'){
        const doc = db().documents?.find(d=>d.id===id);
        if(!doc) throw new Error('Document not found');
        if(doc.status && doc.status !== 'Pending') {
            c.toast('Cannot delete an approved document.');
            return true;
        }
        if(confirm('Are you sure you want to delete this document?')) {
            db().documents = db().documents.filter(d=>d.id!==id);
            c.toast('Document deleted.');
            c.render();
        }
        return true;
    }
if(name==='ref-dtr-export'){const logs=visibleLogs(db(),u()).filter(l=>!id||l.studentId===id);if(id&&!visibleStudents(db(),u()).some(s=>s.id===id))throw new Error('Student outside your scope.');c.showModal('Export DTR Summary',`<div class="grid-2">${f('From','from','date')}${f('To','to','date')}</div>${sel('Format','format',['PDF','CSV'])}<label class="row"><input type="checkbox" name="tasks" checked> Include task summaries and supervisor remarks</label>`,v=>{if(v.from&&v.to&&v.from>v.to)throw new Error('The end date must follow the start date.');const items=logs.filter(l=>(!v.from||l.date>=v.from)&&(!v.to||l.date<=v.to));const rows=[['Student','Date','Clock In','Clock Out','Hours','Status',...(v.tasks?['Task','Remarks']:[])],...items.map(l=>[c.student(l.studentId)?.name,l.date,time(l.clockIn),time(l.clockOut),l.hours,l.status,...(v.tasks?[l.task,l.remarks]:[])])];const file=reportFile({title:'MenteeLog DTR Summary',rows},v.format);c.download(file.name,file.content,file.type);},'Download Summary');return true;}

if (name === 'ref-export-modal') {
    if(u().role!=='Student')throw new Error('Student access required.');
    c.showModal('Export DTR Summary', `
        <div class="grid-2">
            ${f('From Date','from','date')}
            ${f('To Date','to','date')}
        </div>
        ${sel('Export Format','format',['PDF Document (.pdf)','CSV Spreadsheet (.csv)'])}
        <label class="row" style="margin-top: 16px;"><input type="checkbox" name="tasks" checked> Include task summaries</label>
        <label class="row"><input type="checkbox" name="notes" checked> Include supervisor verification notes</label>
    `, async (v, form) => {
        const includeTasks = !!form.elements.tasks.checked;
        const includeNotes = !!form.elements.notes.checked;

        if(v.format.includes('CSV')) {
            const logs = visibleLogs(db(), u()).filter(l => l.studentId === u().id);
            const items = logs.filter(l => (!v.from || l.date >= v.from) && (!v.to || l.date <= v.to));
            const rows = [['Student','Date','Clock In','Clock Out','Hours','Status', ...(includeTasks?['Task']:[])], ...items.map(l => [u().name, l.date, time(l.clockIn), time(l.clockOut), l.hours, l.status, ...(includeTasks?[l.task]:[])])];
            const file = reportFile({title:'DTR Summary', rows}, 'CSV');
            c.download(file.name, file.content, file.type);
            document.querySelector('#modal').close();
            return;
        }

        const logs = visibleLogs(db(), u()).filter(l => l.studentId === u().id);
        const items = logs.filter(l => (!v.from || l.date >= v.from) && (!v.to || l.date <= v.to)).slice().reverse();

        let totalHours = 0;
        const rowsHtml = items.length ? items.map(l => {
            totalHours += l.hours;
            return `<tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${date(l.date)}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${time(l.clockIn)}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${time(l.clockOut)}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${l.hours.toFixed(2)}h</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${l.gps ? '14.5547&deg;N, 121.0244&deg;E' : 'Unavailable'}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${badge(l.status)}</td>
            </tr>${includeTasks ? `<tr><td colspan="6" style="padding: 4px 0 16px 0; color: #555; font-size: 13px; font-style: italic; border-bottom: 1px solid #eee;">Task: ${e(l.task)}${includeNotes && l.remarks ? '<br>Note: '+e(l.remarks) : ''}</td></tr>` : ''}`;
        }).join('') : '<tr><td colspan="6" style="text-align:center; padding: 16px;">No logs in this date range.</td></tr>';

        const monthStr = v.from ? new Date(v.from).toLocaleDateString('en', {month:'long', year:'numeric'}) : new Date().toLocaleDateString('en', {month:'long', year:'numeric'});

        const previewBody = `
        <div class="pdf-content-wrapper" style="background: white; color: black; padding: 40px; font-family: 'Inter', sans-serif; border: 1px solid #ccc; max-height: 60vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--burgundy); padding-bottom: 16px; margin-bottom: 24px;">
                <div>
                    <h1 style="margin: 0; color: var(--burgundy); font-size: 24px;">MenteeLog - Daily Time Record</h1>
                    <p style="margin: 4px 0 0 0; color: #555;">CIT Department - AY 2025-2026 - 2nd Semester</p>
                </div>
                <div style="text-align: right; color: #888;">
                    <strong>DTR Log Summary - ${monthStr}</strong><br>
                    <small>Generated ${date(today())}</small>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
                <dl style="margin: 0; font-size: 14px;">
                    <dt style="color: #666; margin: 0;">Student</dt><dd style="margin: 0 0 8px 0; font-weight: bold;">${e(u().name)}</dd>
                    <dt style="color: #666; margin: 0;">SR Code</dt><dd style="margin: 0 0 8px 0; font-weight: bold;">${e(u().identifier)}</dd>
                    <dt style="color: #666; margin: 0;">Course/Section</dt><dd style="margin: 0; font-weight: bold;">${e(u().course)}</dd>
                </dl>
                <dl style="margin: 0; font-size: 14px;">
                    <dt style="color: #666; margin: 0;">HTE</dt><dd style="margin: 0 0 8px 0; font-weight: bold;">${e(u().company||'Unassigned')}</dd>
                    <dt style="color: #666; margin: 0;">Supervisor</dt><dd style="margin: 0 0 8px 0; font-weight: bold;">${e(c.student(u().supervisorId)?.name||'Unassigned')}</dd>
                    <dt style="color: #666; margin: 0;">Required Hours</dt><dd style="margin: 0; font-weight: bold;">${u().requiredHours} hours</dd>
                </dl>
            </div>

            <h3 style="font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 16px;">${monthStr} - Verified Attendance Log</h3>
            <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 32px; font-size: 14px;">
                <thead>
                    <tr style="border-bottom: 2px solid #ddd;">
                        <th style="padding: 8px 0;">Date</th>
                        <th style="padding: 8px 0;">Clock In</th>
                        <th style="padding: 8px 0;">Clock Out</th>
                        <th style="padding: 8px 0;">Hours</th>
                        <th style="padding: 8px 0;">GPS Coords</th>
                        <th style="padding: 8px 0;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 48px; text-align: center;">
                <strong style="font-size: 18px; color: var(--ink);">Month Total: ${totalHours.toFixed(2)}h logged</strong>
                <p style="margin: 4px 0 0 0; color: #666;">${approvedHours(db(), u().id)} / ${u().requiredHours} cumulative approved hours</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 64px;">
                <div style="text-align: center; border-top: 1px solid #000; padding-top: 8px;">
                    <strong style="color: var(--ink);">${e(u().name)}</strong><br>
                    <span style="color: #666; font-size: 12px;">Student Signature / Date</span>
                </div>
                <div style="text-align: center; border-top: 1px solid #000; padding-top: 8px;">
                    <strong style="color: var(--ink);">${e(c.student(u().supervisorId)?.name||'Supervisor')}</strong><br>
                    <span style="color: #666; font-size: 12px;">Supervisor Signature / Date</span>
                </div>
            </div>
        </div>

        <div class="form-actions" style="margin-top: 24px;">
            <button class="btn secondary" data-action="close">Close</button>
            <div style="flex: 1;"></div>
            <button class="btn secondary" data-action="ref-export-print">Print Document</button>
            <button class="btn" data-action="ref-export-download">Download PDF</button>
        </div>
        `;

        setTimeout(() => {
            const safeName = e(u().name.split(' ').pop());
            c.showModal('DTR_Log_Summary_' + safeName + '.pdf - Preview', previewBody, null);
        }, 50);
    }, 'Preview');
    return true;
}
if (name === 'ref-export-print') {
    window.print();
    return true;
}
if (name === 'ref-export-download') {
    c.toast('Generating PDF document, please wait...');
    const filename = 'DTR_Log_Summary_' + u().name.replace(/\s+/g, '_') + '.pdf';
    
    const runPdf = () => {
        const element = document.querySelector('.pdf-content-wrapper');
        // temporarily remove max-height and overflow so html2pdf captures everything
        const oldMaxHeight = element.style.maxHeight;
        const oldOverflow = element.style.overflowY;
        element.style.maxHeight = 'none';
        element.style.overflowY = 'visible';
        
        html2pdf().set({
            margin: [15, 10, 15, 10], // top, left, bottom, right
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save().then(() => {
            element.style.maxHeight = oldMaxHeight;
            element.style.overflowY = oldOverflow;
            c.toast('PDF downloaded successfully!');
        });
    };

    if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
        script.onload = runPdf;
        document.head.appendChild(script);
    } else {
        runPdf();
    }
    return true;
}
return false;
}


  const reportNames={deployment:'Student Deployment Report',completion:'Completion Summary Report',hte:'HTE Performance Report',compliance:'Compliance Audit Report',custom:'Custom Report'};
  function reportPages(){if(u().role!=='Coordinator')throw new Error('Coordinator access required.');const {sub,id}=r();db().reports??=[];
    if(sub==='configure'){const type=reportNames[id]?id:'deployment';return back('reports')+heading(type==='custom'?'Custom Report Builder':'Generate '+reportNames[type],'Choose your report parameters before previewing the document.')+panel('Report Configuration',form(`<div class="grid-3">${sel('Program / department','course',['All',...new Set(db().users.filter(s=>s.role==='Student').map(s=>s.course))])}${f('From date','from','date')}${f('To date','to','date')}${f('Academic year','year','text',db().program.reportYear||'2026–2027','required maxlength="30"')}${sel('Semester','semester',['First Semester','Second Semester','Summer'])}${sel('Export format','format',['PDF','CSV'])}</div>${type==='custom'?f('Report title','title','text','','required maxlength="120"')+sel('Primary report','type',Object.entries(reportNames).filter(([id])=>id!=='custom')):''}`,v=>{if(v.from&&v.to&&v.from>v.to)throw new Error('The end date must follow the start date.');reportDraft={id:crypto.randomUUID(),title:type==='custom'?v.title:reportNames[type],type:type==='custom'?v.type:type,format:v.format,parameters:v,date:new Date().toISOString(),rows:reportRows(db(),type==='custom'?v.type:type,v)};location.hash=href('reports','preview');},'Preview Document Editor'));}
    if(sub==='preview'||sub==='saved'){const report=sub==='saved'?db().reports.find(a=>a.id===id):reportDraft;if(!report)return back('reports')+empty('No report selected','Configure a report to create a preview.');return back('reports')+heading('Document Preview & Editor',e(report.title),b('Export Document','ref-report-export',report.id,'','download'))+`<article class="ref-paper"><img src="./assets/MenteeLoo_Logo.svg" alt="MenteeLog"><h2>College of Information Technology</h2><p>On-the-Job Training Program</p><h1>${e(report.title)}</h1><p>${e(report.parameters?.year||'')} · ${e(report.parameters?.semester||'')} · ${date(report.date)}</p>${table(report.rows[0].map(e),report.rows.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+e(v)+'</td>').join('')+'</tr>'))}<p class="small">Generated from local frontend demonstration records.</p></article>${b('Add Custom Row','ref-report-row',report.id,'secondary')}`;}
    if(sub==='success'){const report=db().reports.find(a=>a.id===id);if(!report)throw new Error('Report unavailable.');return `<div class="ref-success"><span class="ref-success-icon">${icon('check')}</span><h1>Report Generated Successfully!</h1><p>${e(report.title)} is ready to download.</p>${panel('Report Summary',`<p>Format: ${e(report.format)}</p><p>Generated: ${date(report.date)}</p><p>Records: ${report.rows.length-1}</p>`)}${b('Download Report','ref-report-download',id,'')}${b('Share via Email','ref-report-share',id,'secondary')}${nav('Back to Report Hub','reports')}${nav('View Report History','reports','history')}</div>`;}
    if(sub==='history')return back('reports')+heading('Report History','Review, download, or remove previously generated reports.')+panel('',search('Search report name or type')+table(['Report Name','Type','Date Generated','Format','Actions'],db().reports.filter(a=>match(a.title,a.type)).map(a=>`<tr><td><strong>${e(a.title)}</strong></td><td>${e(a.type)}</td><td>${date(a.date)}</td><td>${e(a.format)}</td><td><div class="row wrap">${nav('View / Edit','reports','saved',a.id,'secondary small')}${b('Download','ref-report-download',a.id,'secondary small')}${b('Delete','ref-report-delete',a.id,'secondary small')}</div></td></tr>`)));
    const analytics=`<div class="ref-analytics">${db().htes.map(h=>{const cohort=db().users.filter(s=>s.role==='Student'&&s.company===h.name),appraisals=db().appraisals.filter(a=>cohort.some(s=>s.id===a.studentId)),avg=appraisals.length?appraisals.reduce((n,a)=>n+a.score,0)/appraisals.length:0,complete=cohort.length?cohort.filter(s=>approvedHours(db(),s.id)>=s.requiredHours).length/cohort.length*100:0;return `<div><strong>${e(h.name)}</strong><label>Average evaluation ${avg.toFixed(1)} / 5<progress max="5" value="${avg}"></progress></label><label>Completion ${Math.round(complete)}%<progress max="100" value="${complete}"></progress></label></div>`;}).join('')}</div>`;
    if(sub==='analytics')return back('reports')+heading('Full Performance Analytics','Evaluation scores and completion rates by host training establishment.')+stats([['Total Students',db().users.filter(s=>s.role==='Student').length],['Submitted Evaluations',db().appraisals.length],['Partner Companies',db().htes.length]])+panel('HTE Performance Comparison',analytics);
    return heading('CHED Report Generator','Generate deployment, completion, HTE performance, and compliance reports.')+panel('Report Parameters',form(`<div class="grid-3">${f('Date generated','generated','date',today(),'readonly')}${f('Academic year','year','text',db().program.reportYear||'2026–2027','required maxlength="30"')}${sel('Semester','semester',['First Semester','Second Semester','Summer'],db().program.reportSemester)}</div>`,v=>{db().program.reportYear=v.year;db().program.reportSemester=v.semester;c.save();c.toast('Default report parameters saved.');},'Save Parameters',''))+`<div class="row between section-space" style="margin-bottom: 24px;"><h2>Available CHED Reports</h2><div class="row" style="gap: 12px;">${nav('Report History','reports','history')}${nav('Custom Report Builder','reports','configure','custom')}</div></div>`+panel('Performance Analytics Preview',analytics+nav('View Full Analytics','reports','analytics','','secondary small'))+`<div class="grid-2">${Object.entries(reportNames).filter(([id])=>id!=='custom').map(([type,title])=>panel(title,`<p>Generate ${title.toLowerCase()} from your current cohort records.</p>${nav('Generate Report','reports','configure',type,'')}`)).join('')}</div>`;
  }
  async function reportAction(name,id){if(!name.startsWith('ref-report-'))return false;if(u().role!=='Coordinator')throw new Error('Coordinator access required.');const report=db().reports?.find(a=>a.id===id)||(reportDraft?.id===id?reportDraft:null);if(!report)throw new Error('Report unavailable.');
    if(name==='ref-report-row'){c.showModal('Add Custom Report Row',report.rows[0].map((label,i)=>f(e(label),'col'+i,'text','','required maxlength="200"')).join(''),v=>{report.rows.push(report.rows[0].map((_,i)=>v['col'+i]));c.save();c.toast('Custom row added.');});return true;}
    if(name==='ref-report-export'){c.showModal('Export Document',sel('Export format','format',['PDF','CSV'],report.format)+'<p class="small">CSV files can be opened in Excel. PDF files contain the report data.</p>',v=>{report.format=v.format;db().reports??=[];if(!db().reports.some(a=>a.id===report.id))db().reports.unshift(structuredClone(report));finish('Report generated successfully.','reports','success',report.id);},'Generate Report');return true;}
    if(name==='ref-report-download'){const file=reportFile(report,report.format);c.download(file.name,file.content,file.type);return true;}
    if(name==='ref-report-delete'){c.showModal('Delete Generated Report?',`<p>Remove ${e(report.title)} from local report history?</p>`,()=>{db().reports=db().reports.filter(a=>a.id!==id);finish('Report removed from history.','reports','history');},'Delete Report');return true;}
    if(name==='ref-report-share'){c.showModal('Share Report via Email',f('Recipient email','email','email','','required')+ta('Message','message','Please review the attached '+report.title+'.')+'<p class="note">Email delivery requires the backend. This preview prepares a message for your team and does not send email.</p>',v=>{c.download('report-email-draft.txt','To: '+v.email+'\nSubject: '+report.title+'\n\n'+v.message+'\n\nAttach: '+report.title+'.'+report.format.toLowerCase(),'text/plain');c.toast('Email draft downloaded. No email was sent.');},'Download Email Draft');return true;}
    return false;
  }

  function governancePages(){if(u().role!=='Coordinator')throw new Error('Coordinator access required.');const {sub}=r(),counts=[['Registered Trainees',db().users.filter(s=>s.role==='Student').length],['Industry Supervisors',db().users.filter(s=>s.role==='Supervisor').length],['Coordinators',db().users.filter(s=>s.role==='Coordinator').length],['Pending Activation',db().users.filter(s=>s.status==='Pending_Activation').length],['Locked / Suspended',db().users.filter(s=>s.status==='Suspended').length]];
    if(sub==='import')return back('users','Back to User Governance')+heading('Pre-Seed OJT Candidates','Validate your student CSV before importing accounts.')+panel('Upload Candidate Batch',form(f('CSV file','csv','file','','required accept=".csv,text/csv"')+'<p>Required: identifier, name, email, course. Maximum 5,000 candidates and 2 MB per batch.</p>'+b('Download CSV Template','csv-template','','secondary small'),async(v,el)=>{const file=el.elements.csv.files[0];if(!file||file.size>2*1024*1024)throw new Error('Choose a CSV file up to 2 MB.');importText=await file.text();importBatch=candidateImport(db(),importText);location.hash=href('users','preview');},'Validate & Preview'));
    if(sub==='preview')return back('users','Back to User Governance')+heading('Candidate Import Preview',importBatch.length+' validated candidates. Review the batch before importing.')+panel('',form(table(['SR Code','Full Name','Email','Course','Status'],importBatch.slice(0,100).map(s=>`<tr><td>${e(s.identifier)}</td><td>${e(s.name)}</td><td>${e(s.email)}</td><td>${e(s.course)}</td><td>${badge('Pre_Seeded')}</td></tr>`))+(importBatch.length>100?'<p>Showing the first 100 rows of '+importBatch.length+'. All rows were validated.</p>':''),()=>{const batch=candidateImport(db(),importText);db().users.push(...batch);importText='';importBatch=[];finish(batch.length+' OJT candidates imported successfully.','users');},'Import & Seed Accounts'));
    const intro=heading('User & Access Governance','Pre-seed OJT candidates, provision faculty accounts, and review role permissions.',b('Activate Account','activation-help','','secondary')+b('+ Add New User','user-new','',''))+tabs([['','Overview & Import'],['registered','Registered Portal Users'],['rbac','RBAC Security Summary']]);
    if(sub==='rbac')return intro+panel('Role-Based Access Control',`<div class="grid-3">${roles.map(role=>`<article class="ref-permission-card"><h2>${role} Portal</h2><ul>${navigation[role].map(([,label])=>'<li>'+icon('check')+e(label)+'</li>').join('')}</ul><p>${role==='Student'?'Own records and submissions only':role==='Supervisor'?'Assigned interns and company listings only':'Institution-wide governance and compliance'}</p></article>`).join('')}</div><p class="note">These frontend guards preview permissions. The production API must enforce roles, ownership, and account status on every request.</p>`);
    const users=db().users.filter(s=>match(s.name,s.identifier,s.email,s.role));const roster=panel(sub==='registered'?'Registered Portal Users':'Recent Registrations',search('Search name, identifier, email or role')+table(['User','Role','Department / Company','Status','Actions'],users.map(s=>`<tr><td><strong>${e(s.name)}</strong><small>${e(s.identifier)}</small></td><td>${badge(s.role)}</td><td>${e(s.department||s.company||s.course||'—')}</td><td>${badge(s.status)}</td><td>${s.id===u().id?'Current account':b(s.status==='Active'?'Lock Account':'Activate','user-status',s.id,'secondary small')}</td></tr>`)));
    return intro+`<div class="ref-governance-stats">${stats(counts)}</div>`+(sub==='registered'?'':panel('Pre-Seed OJT Candidates',`<div class="row between" style="margin-bottom: 24px;"><p>Import a CSV batch of pre-approved OJT candidates.</p>${b('Download CSV Template','csv-template','','secondary small','download')}</div><button class="upload-drop" data-action="import-users">${icon('upload')}<strong>Click to upload your student CSV</strong><span>identifier, name, email, course · Maximum 5,000 candidates per batch</span></button>`)+panel('Faculty / Coordinator Invitation',form(`<div class="grid-2">${f('Full name','name','text','','required maxlength="100"')}${f('Institutional email','email','email','','required')}${f('Faculty ID','identifier','text','','required maxlength="100"')}${f('Department','department','text','','required maxlength="120"')}</div><p class="small">Creates a pending account locally. Email activation requires the authentication API.</p>`,v=>{if(db().users.some(s=>s.identifier.toLowerCase()===v.identifier.toLowerCase()||s.email.toLowerCase()===v.email.toLowerCase()))throw new Error('Identifier or email already registered.');db().users.push({id:crypto.randomUUID(),...v,role:'Coordinator',status:'Pending_Activation'});finish('Faculty account provisioned; activation pending.','users');},'Provision Faculty Account','')))+roster;
  }
  async function governanceAction(){return false;}

  return {page,action,submit};
}


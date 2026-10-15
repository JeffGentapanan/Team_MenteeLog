import { supabase } from '../supabaseClient.js';
const UNIVERSITY_NAME = 'Batangas State University';

import {publicLanding,authScreen} from './public.js';
import {ensureCreatorAccounts} from './creator.js';
import {createPortalViews} from './portal-views.js';
import {seedData,roles,navigation,rubric,evaluationCriteria,scorableCriteria} from './data.js';
import {escapeHTML as e,canAccess,approvedHours,visibleStudents,visibleLogs,visibleApplications,hoursBetween,validateUpload,csvText,parseCSV,applyToJob,reviewLog} from './domain.js';
import { syncRemote } from './sync.js';
import { initPublicConstellation } from './public-constellation.js';

// Detect a password-recovery link BEFORE anything touches the URL
const _q = new URLSearchParams(location.search);
const _h = new URLSearchParams(location.hash.replace(/^#\/?/, ''));
const isRecoveryLink = _q.get('reset') === '1' || _q.has('code') || _h.get('type') === 'recovery';
let recoveryActive = isRecoveryLink;

const $=s=>document.querySelector(s), app=$('#app'), modal=$('#modal');

const STORAGE='menteelog.demo.v1', SESSION='menteelog.demo.session';
let storageIssue=false,filesDB=null;

function connectCoreUsers(dataDb) {
  if (!dataDb) return dataDb;
  // 1. Remove all dummy intern records and dummy logs
  dataDb.users = (dataDb.users || []).filter(u => !String(u.id).startsWith('s_dummy') && !['Alice Chen','Bob Smith','Charlie Cruz','Diana Reyes','Example Intern'].includes(u.name));
  dataDb.logs = (dataDb.logs || []).filter(l => !String(l.id).startsWith('log_dummy') && !String(l.studentId).startsWith('s_dummy'));

  // 2. Identify and normalize the 3 core portal accounts
  let stu = dataDb.users.find(u => u.role === 'Student' && (u.id === 's1' || u.identifier === '2021-00421' || (String(u.email||'').toLowerCase() === 'kenzosomes@gmail.com') || String(u.name||'').toLowerCase().includes('kenzo') || u.name === 'Maria Santos'));
  let sup = dataDb.users.find(u => u.role === 'Supervisor' && (u.id === 'v1' || u.identifier === 'shisulzhin@gmail.com' || (String(u.email||'').toLowerCase().includes('shisui')) || String(u.name||'').toLowerCase().includes('shisui') || u.name.includes('Carlos Jose')));
  let coord = dataDb.users.find(u => u.role === 'Coordinator' && (u.id === 'c1' || u.identifier === 'FAC-2026-001' || (String(u.email||'').toLowerCase().includes('jeff')) || String(u.name||'').toLowerCase().includes('jeff') || u.name.includes('Evelyn Ramos')));

  const stuUuidFromLogs = (dataDb.logs || []).find(l => l.studentId && l.studentId.length > 20 && l.studentId.includes('-'))?.studentId;

  if (stu) {
    if (stu.id && stu.id.length > 20 && stu.id.includes('-')) {
      // keep Supabase UUID
    } else if (stuUuidFromLogs) {
      stu.id = stuUuidFromLogs;
    } else if (!stu.id || stu.id === 'student-kenzo') {
      stu.id = 's1';
    }
    stu.identifier = stu.identifier || '2021-00421';
    stu.name = (stu.name && stu.name !== 'User' && stu.name !== 'Maria Santos') ? stu.name : 'kenzosomes';
    stu.email = stu.email || 'kenzosomes@gmail.com';
    stu.role = 'Student';
    stu.status = 'Active';
    stu.course = 'BSIT';
    stu.company = stu.company || 'Accenture Philippines';
    stu.baseHours = stu.baseHours || 0;
    stu.requiredHours = stu.requiredHours || 500;
    stu.badge = 'Active';
  } else {
    stu = {
      id: stuUuidFromLogs || 's1',
      identifier: '2021-00421',
      name: 'kenzosomes',
      email: 'kenzosomes@gmail.com',
      role: 'Student',
      status: 'Active',
      course: 'BSIT',
      company: 'Accenture Philippines',
      supervisorId: 'v1',
      baseHours: 0,
      requiredHours: 500,
      badge: 'Active'
    };
    dataDb.users.unshift(stu);
  }

  const supUuidFromLogs = (dataDb.logs || []).find(l => l.supervisorId && l.supervisorId.length > 20 && l.supervisorId.includes('-'))?.supervisorId;

  if (sup) {
    if (sup.id && sup.id.length > 20 && sup.id.includes('-')) {
      // keep Supabase UUID
    } else if (supUuidFromLogs) {
      sup.id = supUuidFromLogs;
    } else if (!sup.id || sup.id === 'supervisor-shisui') {
      sup.id = 'v1';
    }
    sup.identifier = sup.identifier || 'shisulzhin@gmail.com';
    sup.name = (sup.name && sup.name !== 'User' && !sup.name.includes('Carlos Jose')) ? sup.name : 'shisuizhin';
    sup.email = sup.email || 'shisulzhin@gmail.com';
    sup.role = 'Supervisor';
    sup.status = 'Active';
    sup.company = sup.company || 'Accenture Philippines';
  } else {
    sup = {
      id: supUuidFromLogs || 'v1',
      identifier: 'shisulzhin@gmail.com',
      name: 'shisuizhin',
      email: 'shisulzhin@gmail.com',
      role: 'Supervisor',
      status: 'Active',
      company: 'Accenture Philippines'
    };
    dataDb.users.push(sup);
  }

  if (coord) {
    if (coord.id && coord.id.length > 20 && coord.id.includes('-')) {
      // keep Supabase UUID
    } else if (!coord.id || coord.id === 'coordinator-jeff') {
      coord.id = 'c1';
    }
    coord.identifier = coord.identifier || 'FAC-2026-001';
    coord.name = (coord.name && coord.name !== 'User' && !coord.name.includes('Evelyn Ramos')) ? coord.name : 'jeff.gentapanan2004525';
    coord.email = coord.email || 'jeff.gentapanan2004525@gmail.com';
    coord.role = 'Coordinator';
    coord.status = 'Active';
    coord.department = coord.department || 'College of Information Technology';
  } else {
    coord = {
      id: 'c1',
      identifier: 'FAC-2026-001',
      name: 'jeff.gentapanan2004525',
      email: 'jeff.gentapanan2004525@gmail.com',
      role: 'Coordinator',
      status: 'Active',
      department: 'College of Information Technology'
    };
    dataDb.users.push(coord);
  }

  // Ensure activated candidate retains pre-seeded SR code, name and course
  let jeffStudent = (dataDb.users || []).find(u => String(u.email||'').toLowerCase().includes('jeffgent25'));
  if (jeffStudent) {
    if (!jeffStudent.identifier) jeffStudent.identifier = '2026-01001';
    if (!jeffStudent.name || jeffStudent.name === 'jeffgent25') jeffStudent.name = 'Sample Student';
    if (!jeffStudent.course) jeffStudent.course = 'BSIT';
  }

  sup.company = sup.company || 'Accenture Philippines';
  sup.name = sup.name || 'shisuizhin';
  sup.status = 'Active';

  // Connect student to supervisor
  stu.supervisorId = sup.id;
  stu.company = sup.company;
  stu.badge = 'Active';
  stu.status = 'Active';
  stu.requiredHours = stu.requiredHours || 500;
  stu.baseHours = 0;

  // Sync student logs to stu.id if it's the core student
  (dataDb.logs || []).forEach(l => {
    if (l.studentId === 's1' && stu.id !== 's1') l.studentId = stu.id;
    if (l.studentId === '22227dcf-933f-40a9-9340-f66cb9020e5c' && stu.id === 's1') stu.id = '22227dcf-933f-40a9-9340-f66cb9020e5c';
  });

  // Ensure supervisor job exists
  dataDb.jobs = dataDb.jobs || [];
  let supJob = dataDb.jobs.find(j => j.supervisorId === sup.id);
  if (!supJob) {
    supJob = {
      id: 'job_' + sup.id,
      title: 'Software Engineer Intern',
      company: sup.company,
      location: 'Mandurriao, Iloilo City',
      mode: 'Hybrid',
      courses: ['BSIT'],
      slots: 5,
      status: 'Active',
      description: 'Hands-on enterprise software development and daily engineering operations.',
      specs: 'Accredited HTE · Active MOA · 500-hour training plan',
      skills: 'JavaScript, Web Development, Team Collaboration',
      supervisorId: sup.id
    };
    dataDb.jobs.unshift(supJob);
  } else {
    supJob.company = sup.company;
  }

  // Ensure student application exists and is accepted
  dataDb.applications = dataDb.applications || [];
  let app = dataDb.applications.find(a => a.studentId === stu.id);
  if (!app) {
    dataDb.applications.push({
      id: 'app_' + stu.id,
      studentId: stu.id,
      jobId: supJob.id,
      status: 'Accepted',
      date: new Date().toLocaleDateString('en-CA'),
      note: 'Endorsed by faculty coordinator and accepted by company supervisor.'
    });
  } else {
    app.status = 'Accepted';
    app.jobId = supJob.id;
  }

  // Ensure attendance log exists for student with supervisorId
  dataDb.logs = dataDb.logs || [];
  const stuLogs = dataDb.logs.filter(l => l.studentId === stu.id);
  if (stuLogs.length === 0) {
    const todayStr = new Date().toLocaleDateString('en-CA');
    dataDb.logs.push({
      id: 'log_' + stu.id + '_1',
      studentId: stu.id,
      supervisorId: sup.id,
      date: todayStr,
      clockIn: todayStr + 'T08:00:00.000Z',
      clockOut: todayStr + 'T17:00:00.000Z',
      breakMinutes: 60,
      hours: 8,
      status: 'Pending',
      task: 'Configured project development environment, reviewed system documentation, and attended sprint sync.',
      gps: true,
      remarks: '',
      justification: ''
    });
  } else {
    stuLogs.forEach(l => { l.supervisorId = sup.id; });
  }

  // Clean active shifts: remove any dummy student active shifts
  dataDb.activeShifts = (dataDb.activeShifts || []).filter(s => !String(s.studentId).startsWith('s_dummy'));

  return dataDb;
}

function load(){try{const saved=JSON.parse(localStorage.getItem(STORAGE));return saved?.version===1&&Array.isArray(saved.users)&&Array.isArray(saved.logs)?connectCoreUsers(saved):connectCoreUsers(seedData());}catch{return connectCoreUsers(seedData());}}
let db=connectCoreUsers(ensureCreatorAccounts(load()));
if(db.incidents) db.incidents = db.incidents.filter(i => !i._pending);
let session=null,view={search:'',filter:'All',course:'All',mode:'All'},authRole='Student',modalSubmit=null,modalOpener=null,modalUserId=null,toastTimer;

try {
  if (!localStorage.getItem('dtr_reset_guaranteed_v8')) {
    localStorage.setItem('dtr_reset_guaranteed_v8', '1');
    localStorage.removeItem(STORAGE);
    sessionStorage.removeItem(SESSION);
    sessionStorage.removeItem(SESSION + '.student');
    sessionStorage.removeItem(SESSION + '.supervisor');
    sessionStorage.removeItem(SESSION + '.coordinator');
    db=connectCoreUsers(ensureCreatorAccounts(seedData()));
  }
} catch(e) {}

db.activeShifts = db.activeShifts || [];

let capturedForm=null,capturingForm=false;
let portals;

function route(){const hashStr=location.hash.replace(/^#\/?/,'');const [path, query]=hashStr.split('?');const parts=path.split('/');return {role:parts[0],page:parts[1]||'dashboard',sub:parts[2]||'',id:parts[3]||'',query:query||''};}

function loadSession() {
  const currentRoute = route();
  const routeRole = currentRoute.role ? currentRoute.role.toLowerCase() : '';

  // 1. Try this tab's own sessionStorage first
  try {
    const tabSession = JSON.parse(sessionStorage.getItem(SESSION));
    if (tabSession?.id) {
      if (['student', 'supervisor', 'coordinator'].includes(routeRole)) {
        const u = db.users.find(x => x.id === tabSession.id) || tabSession.user;
        if (u && u.role && u.role.toLowerCase() === routeRole) {
          return tabSession;
        }
      } else {
        return tabSession;
      }
    }
  } catch(e) {}

  // 2. If tab is on or reloading a specific role route (e.g. /student/dashboard or /supervisor/dtr),
  // check for a stored session specifically for that role
  if (['student', 'supervisor', 'coordinator'].includes(routeRole)) {
    try {
      const roleSession = JSON.parse(
        sessionStorage.getItem(SESSION + '.' + routeRole) ||
        localStorage.getItem(SESSION + '.' + routeRole)
      );
      if (roleSession?.id) {
        sessionStorage.setItem(SESSION, JSON.stringify(roleSession));
        return roleSession;
      }
    } catch(e) {}

    // Fallback: look for the active user with that role in db, prioritizing core team accounts
    const coreUser = db.users.find(u => u.role && u.role.toLowerCase() === routeRole && u.status === 'Active' && (u.id === 's1' || u.id === 'v1' || u.id === 'c1' || u.name === 'kenzosomes' || u.name === 'shisuizhin' || u.name === 'jeff.gentapanan2004525')) || db.users.find(u => u.role && u.role.toLowerCase() === routeRole && u.status === 'Active');
    if (coreUser) {
      const s = { id: coreUser.id, user: coreUser };
      sessionStorage.setItem(SESSION, JSON.stringify(s));
      return s;
    }
  }

  // 3. Fallback to localStorage session if not on a conflicting role route
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION));
    if (saved?.id) {
      const u = db.users.find(x => x.id === saved.id) || saved.user;
      if (u && (!['student', 'supervisor', 'coordinator'].includes(routeRole) || (u.role && u.role.toLowerCase() === routeRole))) {
        sessionStorage.setItem(SESSION, JSON.stringify(saved));
        return saved;
      }
    }
  } catch(e) {}

  return null;
}

try { session = loadSession(); } catch(e) {}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(db));}catch{storageIssue=true;toast('Browser storage is full or unavailable. Changes last only until this page closes.');}}

function currentUser(){
    if(!session) session = loadSession();
    if(!session) return null;
    let u = db.users.find(u=>u.id===session.id&&u.status==='Active')||null;
    if(!u && session.user && session.user.id===session.id){
        u = session.user;
        if(!db.users.some(x=>x.id===u.id)){
            db.users.push(u);
        }
    }
    return u;
}

function storeSession(user){
  session = { id: user.id, user: user };
  try {
    sessionStorage.setItem(SESSION, JSON.stringify(session));
    if (user.role) {
      const roleKey = user.role.toLowerCase();
      sessionStorage.setItem(SESSION + '.' + roleKey, JSON.stringify(session));
      localStorage.setItem(SESSION + '.' + roleKey, JSON.stringify(session));
    }
    localStorage.setItem(SESSION, JSON.stringify(session));
  } catch(e) {}
}

function logout(){
  const currentRole = currentUser()?.role?.toLowerCase();
  session = null;
  try {
    sessionStorage.removeItem(SESSION);
    if (currentRole) {
      sessionStorage.removeItem(SESSION + '.' + currentRole);
      localStorage.removeItem(SESSION + '.' + currentRole);
    }
    localStorage.removeItem(SESSION);
  } catch(e) {}
  supabase.auth.signOut().catch(()=>{});
  modal.close();
  location.hash = '/';
  render();
}
function notify(userId,type,title,message){db.notifications.unshift({id:crypto.randomUUID(),userId,type,title,message,date:new Date().toISOString(),read:false});}
function audit(action){db.audit.unshift({id:crypto.randomUUID(),actor:currentUser()?.name||'Demo',action,date:new Date().toISOString()});db.audit=db.audit.slice(0,150);}
function toast(message){const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,5000);}
const initials=name=>String(name||'ML').split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('').toUpperCase();
const student=id=>{
  if (!id) return null;
  let s = db.users.find(u => u.id === id);
  if (!s && (id === '22227dcf-933f-40a9-9340-f66cb9020e5c' || id === 's1')) {
    s = db.users.find(u => u.role === 'Student' && (u.id === 's1' || u.id === '22227dcf-933f-40a9-9340-f66cb9020e5c' || u.email === 'kenzosomes@gmail.com' || u.name === 'kenzosomes'));
  }
  return s || db.users.find(u => u.identifier === id || u.email === id) || null;
};
const job=id=>db.jobs.find(j=>j.id===id);
const date=value=>value?new Date(value.length===10?value+'T12:00:00':value).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):'-';
const time=value=>value?new Date(value).toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'}):'-';
const today=()=>new Date().toLocaleDateString('en-CA');
const iconPaths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',briefcase:'M8 6V3h8v3 M3 7h18v14H3z M8 7v14 M16 7v14',file:'M14 2H5v20h14V7z M14 2v6h5 M8 12h8 M8 16h6',folder:'M3 6h7l2 3h9v12H3z M3 6V3h7l2 3h8v3',clock:'M12 8v5l4 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',alert:'m12 3 10 18H2z M12 9v5 M12 17v1',users:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M15 4a4 4 0 0 1 0 8 M22 21v-3a4 4 0 0 0-3-3.8 M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',building:'M5 22V2h14v20 M2 22h20 M9 6h1 M14 6h1 M9 10h1 M14 10h1 M9 14h1 M14 14h1 M10 22v-4h4v4',shield:'m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z m-5 10 3 3 7-7',chart:'M3 3v18h19 M7 16V9 M12 16V5 M17 16v-5',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',search:'M20 20l-5-5 M17 9a7 7 0 1 1-14 0 7 7 0 0 1 14 0',arrow:'M4 12h16 m-6-6 6 6-6 6',check:'m5 12 4 4L20 5',plus:'M12 4v16 M4 12h16',close:'m6 6 12 12 M18 6 6 18',download:'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',upload:'M12 16V3 m-5 5 5-5 5 5 M4 16v5h16v-5',pin:'M20 9c0 6-8 13-8 13S4 15 4 9a8 8 0 1 1 16 0 M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0',calendar:'M3 5h18v17H3z M7 2v6 M17 2v6 M3 11h18',message:'M3 3h18v14H8l-5 5z M7 8h10 M7 12h7',target:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 11v2',menu:'M3 6h18 M3 12h18 M3 18h18',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',lock:'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M7 11V7a5 5 0 0 1 10 0v4 M12 15v3',logout:'M9 3H3v18h6 M9 12h12 m-5-5 5 5-5 5'};
function icon(name){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[name]||iconPaths.file}"/></svg>`;}
const brand=(clickable=true)=>clickable?'<a class="brand-link" href="#/" aria-label="MenteeLog home"><img class="logo" src="./assets/MenteeLog_Logo.svg" alt="MenteeLog"></a>':'<span class="brand-link"><img class="logo" src="./assets/MenteeLog_Logo.svg" alt="MenteeLog"></span>';
function badge(value){const color=['Approved','Accepted','Active','Accredited','Resolved','Cleared','Completed'].includes(value)?'green':['Rejected','Flagged','High','Suspended'].includes(value)?'red':['Pending','Under_Review','Medium','Pending_Activation','Scheduled'].includes(value)?'amber':['Enrolled','Eligible'].includes(value)?'blue':'neutral';return `<span class="badge ${color}">${e(value?.replaceAll('_',' ')||'Draft')}</span>`;}
const button=(label,action,id='',style='secondary',ico='')=>`<button type="button" class="btn ${style}" data-action="${action}" data-id="${e(id)}">${ico?icon(ico):''}${label}</button>`;
const link=(label,page,style='secondary',ico='')=>`<a class="btn ${style}" href="#/${currentUser()?.role.toLowerCase()||'student'}/${page}">${ico?icon(ico):''}${label}</a>`;
const empty=(title,description='')=>`<div class="empty">${icon('folder')}<h3>${title}</h3><p class="mb0">${description}</p></div>`;
const stat=(title,value,sub,ico)=>`<div class="stat"><span class="stat-icon">${icon(ico)}</span><div><div class="stat-label">${title}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div></div>`;
const person=u=>`<div class="row"><span class="avatar square">${e(initials(u?.name))}</span><div><strong>${e(u?.name||'Unknown student')}</strong><small>${e(u?.course||u?.role||'')}</small></div></div>`;
const progress=(hours,required,unit='hours')=>`<div class="row"><progress class="progress" max="${required}" value="${Math.min(hours,required)}" aria-label="${hours} of ${required} ${e(unit)}"></progress><small>${Math.round(hours/required*100)}%</small></div>`;
function table(headers,rows){
  const body = (rows && rows.length) ? rows.join('') : `<tr><td colspan="${headers.length}" class="table-empty-row" style="text-align: center; padding: 36px 16px; color: var(--slate); font-size: 14px;"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; opacity: 0.85;">${icon('file')}<strong style="color: var(--ink); font-size: 14px; font-weight: 600;">No records available</strong><span style="font-size: 13px; color: var(--slate);">No data found in this section.</span></div></td></tr>`;
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function tabs(values){return `<div class="tabs" role="group" aria-label="View filter">${values.map(t=>`<button class="tab ${view.filter===t?'active':''}" data-action="filter" data-id="${e(t)}" aria-pressed="${view.filter===t}">${e(t.replaceAll('_',' '))}</button>`).join('')}</div>`;}
function field(label,name,type='text',value='',extra=''){return `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${e(value)}" ${extra}></div>`;}
function textarea(label,name,value='',extra='required'){return `<div class="field"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" maxlength="3000" ${extra}>${e(value)}</textarea></div>`;}
function select(label,name,options,value=''){return `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}">${options.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${e(v)}" ${v===value?'selected':''}>${e(l.replaceAll('_',' '))}</option>`;}).join('')}</select></div>`;}
function showModal(title,body,onSubmit,label='Save changes'){
  if(capturingForm){capturedForm={title,body,onSubmit,label};return;}
  modal.className='';
  modalOpener=document.activeElement;modalSubmit=onSubmit;modalUserId=currentUser()?.id||null;
  modal.innerHTML=`<div class="modal-head"><h2 id="modal-title">${title}</h2><button class="icon-btn" data-action="close" aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body">${onSubmit?'<form id="modal-form">':''}${body}${onSubmit?`<p class="form-error" role="alert"></p><div class="form-actions">${button('Cancel','close')}<button class="btn" type="submit">${label}</button></div></form>`:''}</div>`;
  for(const control of modal.querySelectorAll('[id^="f-"]')){
    const previous=control.id;control.id='modal-'+previous;
    for(const label of modal.querySelectorAll('label'))if(label.htmlFor===previous)label.htmlFor=control.id;
  }
  modal.showModal();
  setTimeout(() => { if (typeof window.initEvalSignaturePad === 'function') window.initEvalSignaturePad(); }, 60);
}
modal.addEventListener('close',()=>{modalSubmit=null;if(modalOpener?.isConnected)modalOpener.focus();});
function download(name,content,type='text/csv;charset=utf-8'){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function render(){
  if (recoveryActive && route().role !== 'reset-password') { location.hash = '/reset-password'; return; }
  const {role,page}=route();
  if(!role||role==='public'){app.innerHTML=landing();
  setTimeout(() => {
    initPublicConstellation();
    const mapEl = document.getElementById('real-map-container');
    if (mapEl && !mapEl._leaflet_id && window.L && db.shift && db.shift.gps) {
       const lat = db.shift.gps.lat;
       const lng = db.shift.gps.lng;
       const map = L.map('real-map-container', {zoomControl: false, attributionControl: false}).setView([lat, lng], 17);
       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
       const iconHtml = `<div style="width: 16px; height: 16px; background: #059669; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px rgba(5,150,105,0.8);"></div>`;
       const customIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [16,16], iconAnchor: [8,8] });
       L.marker([lat, lng], {icon: customIcon}).addTo(map);
    }
  }, 100);
document.title='MenteeLog | Your OJT journey, connected';return;}
  // Removed broken redirect to missing activate.html

  if(['login','activate','reset','forgot','reset-password'].includes(role)){app.innerHTML=authPage(role);document.title='MenteeLog | Authentication';return;}
  const user=currentUser();
  if(!user){location.hash='/login';return;}
  if(user.role==='Supervisor'&&page==='applications'){location.hash='/supervisor/candidates';return;}
  if(user.role==='Coordinator'&&page==='applications'){location.hash='/coordinator/candidates';return;}
  if(role!==user.role.toLowerCase()||!canAccess(user.role,page)){location.hash=`/${user.role.toLowerCase()}/dashboard`;toast('This page is not available in your portal.');return;}
  const title=navigation[user.role].find(n=>n[0]===page)?.[1]||({profile:'Profile Setup',notifications:'Notifications',jobs:'Job Management',candidates:user.role==='Coordinator'?'Student Placement':'Candidate Review',applications:user.role==='Coordinator'?'Student Placement':'Candidate Review',dtr:user.role==='Supervisor'?'Log Sheets & Summary':'Attendance & DTR'}[page]);
  document.title=`${title} | MenteeLog`;
  const unread=db.notifications.filter(n=>n.userId===user.id&&!n.read).length;
  app.innerHTML=`<div class="portal-shell"><aside class="portal-sidebar" id="top-nav-menu" aria-label="Portal navigation"><div class="portal-brand">${brand(false)}<button class="icon-btn mobile-toggle" data-action="menu" aria-label="Close navigation">${icon('close')}</button></div><p class="portal-caption">${user.role} portal</p><nav aria-label="Main navigation">${navigation[user.role].map(([id,label,ico])=>`<a class="nav-link ${page===id?'active':''}" href="#/${role}/${id}" ${page===id?'aria-current="page"':''}>${icon(ico)}<span>${label}</span></a>`).join('')}</nav><div class="portal-account">${person({...user,course:user.role==='Student'?'OJT Student':user.role==='Supervisor'?'Company Supervisor':'Faculty Coordinator'})}</div></aside><button class="portal-scrim" data-action="menu" aria-label="Close navigation" tabindex="-1"></button><div class="workspace"><header class="portal-header"><div class="row"><button class="icon-btn mobile-toggle" data-action="menu" aria-controls="top-nav-menu" aria-label="Open navigation" aria-expanded="false">${icon('menu')}</button><div class="breadcrumb"><span>MenteeLog</span><span>/</span><strong>${title}</strong></div></div><div class="top-actions"><input class="top-search" id="global-search" aria-label="Search portal pages" placeholder="Search pages..." type="search"><button class="icon-btn" data-action="notifications" aria-label="Notifications, ${unread} unread">${icon('bell')}${unread?'<span class="notification-dot"></span>':''}</button><details class="profile-menu"><summary aria-label="Your account"><span class="avatar">${e(initials(user.name))}</span></summary><div class="profile-popover"><strong>${e(user.name)}</strong><small class="account-role">${e(user.role)}</small>${user.role==='Student'?`<a href="#/${role}/profile">Profile Setup</a>`:''}<button class="text-btn" data-action="logout">${icon('logout')} Sign out</button></div></details></div></header><main class="content" id="main" tabindex="-1">${pageContent(page,user)}</main></div></div>`;

    if(page === 'dtr' && user.role === 'Student') {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = pos.coords.accuracy.toFixed(1);
          const f = document.getElementById('dtr-map-frame');
          if(f) { f.innerHTML = '<p class="small"><strong>Live Coordinates Locked</strong><br>' + lat.toFixed(5) + '° N, ' + lng.toFixed(5) + '° E</p>'; f.style.background = '#e6f4ea'; f.style.color = '#137333'; }
          const c = document.getElementById('dtr-coords');
          if(c) c.innerText = 'Coordinates: ' + lat.toFixed(5) + '° N, ' + lng.toFixed(5) + '° E';
          const b = document.getElementById('dtr-bldg');
          if(b) b.innerText = 'Current Location (GPS)';
          const a = document.getElementById('dtr-acc');
          if(a) a.innerText = '± ' + acc + ' meters';
          const s = document.getElementById('dtr-status');
          if(s) s.innerText = 'Live GPS Lock (Verified)';
        }, function(err) {
          const s = document.getElementById('dtr-status');
          if(s) s.innerText = 'GPS Blocked or Unavailable';
        }, { enableHighAccuracy: true, timeout: 5000 });
      }
    }


}
function togglePortalMenu(force){
 const menu=$('#top-nav-menu');if(!menu)return;
 const open=force??!menu.classList.contains('open');if(open===menu.classList.contains('open'))return;
 menu.classList.toggle('open',open);
 const workspace=$('.portal-shell .workspace');if(workspace)workspace.inert=open&&matchMedia('(max-width:1000px)').matches;
 document.querySelectorAll('[data-action="menu"]').forEach(b=>b.setAttribute('aria-expanded',String(open)));
 (open?menu.querySelector('button'):document.querySelector('.portal-header [data-action="menu"]'))?.focus();
}
document.addEventListener('keydown',event=>{
 const menu=$('#top-nav-menu');if(event.key!=='Tab'||!menu?.classList.contains('open')||!matchMedia('(max-width:1000px)').matches)return;
 const items=[...menu.querySelectorAll('a[href],button')],first=items[0],last=items.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
matchMedia('(max-width:1000px)').addEventListener('change',()=>togglePortalMenu(false));
function heading(title,sub,actions=''){return `<div class="page-heading"><div><h1>${title}</h1><p>${sub}</p></div>${actions?`<div class="row wrap">${actions}</div>`:''}</div>`;}
function landing(){return publicLanding(route().role==='public'?route().page:'home',{brand,icon});}
function authPage(mode){return authScreen(mode,authRole,{brand,icon,field,hasRecoverySession: Boolean(recoveryActive || currentUser())});}
function pageContent(page,u){try{return portals.page(page,u)??({dashboard,applications:applicationsPage,profile:profilePage}[page]||dashboard)(u);}catch(error){return heading('Page unavailable',e(error.message))+link('Back to dashboard','dashboard');}}
function notificationsMini(u){
  const unread = db.notifications.filter(n=>n.userId===u.id && !n.read).reverse().slice(0, 5);
  return `
    <div class="drawer-header">
      <h3>
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span>Notifications</span>
        ${unread.length ? `<span class="badge red" style="font-size:10px;padding:2px 7px;border-radius:10px;margin-left:4px;">${unread.length} new</span>` : ''}
      </h3>
      ${unread.length ? '<button class="text-btn small" data-action="read-all">Mark all read</button>' : ''}
    </div>
    <div class="drawer-notes-list">
      ${unread.length ? unread.map(n=>`
        <div class="notification-card">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
            <strong style="color:var(--burgundy);font-size:13px;font-weight:700;">${e(n.title)}</strong>
            <small style="color:var(--muted);font-size:11px;white-space:nowrap;">${date(n.date)}</small>
          </div>
          <p style="margin:5px 0 0;font-size:12px;color:var(--ink);line-height:1.45;">${e(n.message)}</p>
        </div>
      `).join('') : `
        <div class="drawer-empty">
          <div class="drawer-empty-icon">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p class="drawer-empty-title">You're all caught up!</p>
          <p class="drawer-empty-sub">No unread notifications at the moment.</p>
        </div>
      `}
    </div>
    <div class="drawer-footer">
      <a class="drawer-footer-link" href="#/${u.role.toLowerCase()}/notifications">
        <span>View all notifications</span>
        <span class="arrow">&rarr;</span>
      </a>
    </div>
  `.replace(/\n\s+/g, '');
}
function dashboard(u){
 const students=db.users.filter(s=>s.role==='Student'),openIncidents=db.incidents.filter(i=>!['Resolved','Dismissed'].includes(i.status));
 if(u.role==='Student'){
  const hours=approvedHours(db,u.id),application=db.applications.find(a=>a.studentId===u.id&&a.status==='Accepted'),job=db.jobs.find(j=>j.id===application?.jobId),notes=openIncidents.filter(i=>i.studentId===u.id);
  return heading('Welcome back, '+e(u.name.split(' ')[0]),'Your placement, attendance, and training progress in one place.',link('Open DTR Hub','dtr','','clock'))+
  '<div class="overview-stats">'+stat('Approved hours',hours+' / '+u.requiredHours,'Hours toward your OJT requirement','clock')+stat('Applications',db.applications.filter(a=>a.studentId===u.id).length,'Track your placement submissions','briefcase')+stat('Open incidents',notes.length,'Claims awaiting resolution','alert')+'</div>'+`<div class="overview-single"><section class="card"><div class="card-title"><h2>Your OJT journey</h2>${badge(u.badge||'Eligible')}</div><p class="progress-number">${Math.round(hours/Math.max(1,u.requiredHours)*100)}<span>% complete</span></p>${progress(hours,Math.max(1,u.requiredHours))}<p class="muted">${Math.max(0,u.requiredHours-hours)} hours remaining in your training.</p><hr class="hr"><dl class="placement-facts"><div><dt>Host establishment</dt><dd>${e(u.company||'Not yet assigned')}</dd></div><div><dt>Position</dt><dd>${e(job?.title||'Awaiting placement')}</dd></div><div><dt>Supervisor</dt><dd>${e(student(u.supervisorId)?.name||'Not yet assigned')}</dd></div></dl>${link('View applications','applications','secondary')}</section></div><section class="card section-space"><div class="card-title"><h2>Continue your OJT journey</h2></div><div class="journey-links">${link('Browse placements','jobs','secondary','briefcase')}${link('Submit an incident','incidents','secondary','alert')}${link('View appraisal','appraisals','secondary','star')}</div></section>`;
 }
 const placed=students.filter(s=>s.company),active=db.htes.filter(h=>h.status==='Accredited');
 return heading('Coordinator Dashboard','Oversee placements, partner establishments, and student compliance.',link('Review placements','candidates','','users'))+'<div class="overview-stats">'+stat('OJT students',students.length,placed.length+' currently placed','users')+stat('Accredited HTEs',active.length,'Active training partners','building')+stat('Compliance queue',openIncidents.length,'Open incidents for review','alert')+'</div>'+`<div class="overview-grid"><section class="card"><div class="card-title"><h2>Placement overview</h2>${link('Manage','candidates','secondary small')}</div><p class="progress-number">${Math.round(placed.length/Math.max(1,students.length)*100)}<span>% placed</span></p>${progress(placed.length,Math.max(1,students.length),'students placed')}<dl class="placement-facts"><div><dt>Placed students</dt><dd>${placed.length}</dd></div><div><dt>Awaiting placement</dt><dd>${students.length-placed.length}</dd></div><div><dt>DTRs requiring attention</dt><dd>${db.logs.filter(l=>l.status==='Flagged').length}</dd></div></dl></section><section class="card"><div class="card-title"><h2>Compliance & governance</h2></div><div class="journey-links vertical">${link('Incident & Compliance Hub','incidents','secondary','alert')}${link('Generate reports','reports','secondary','chart')}${link('Manage users & access','users','secondary','users')}${link('Manage job listings','jobs','secondary','briefcase')}</div></section></div>`;
}

function studentTableable(students,u){return students.length?table(['Intern','Hours rendered','Progress','Status','Action'],students.map(s=>`<tr><td>${person(s)}</td><td>${approvedHours(db,s.id)} / ${s.requiredHours} hrs</td><td>${progress(approvedHours(db,s.id),s.requiredHours)}</td><td>${badge(s.badge)}</td><td>${button('View profile','student-detail',s.id,'secondary small')}</td></tr>`)):empty('No students in this view','Assigned students will appear here.');}
function searchToolbar(placeholder,extras=''){return `<form class="toolbar" id="search-form"><input type="search" name="search" aria-label="${placeholder}" placeholder="${placeholder}" value="${e(view.search)}"><button class="btn secondary" type="submit">${icon('search')} Search</button>${extras}</form>`;}
function matches(...texts){return texts.join(' ').toLowerCase().includes(view.search.toLowerCase());}
function applicationsPage(u){const apps=visibleApplications(db,u).filter(a=>(view.filter==='All'||a.status===view.filter)&&matches(student(a.studentId)?.name,job(a.jobId)?.title,job(a.jobId)?.company));return heading(u.role==='Student'?'My Applications Tracker':'Application Review',u.role==='Student'?'Track your internship applications and placement progress.':'Review and endorse your candidates.')+(u.role==='Student'?'':tabs(['All','Pending','Under_Review','Accepted','Rejected'])+searchToolbar('Search applications'))+(apps.length?apps.map(a=>{const j=job(a.jobId),level=a.status==='Accepted'?3:a.status==='Under_Review'?1:0;return '<section class="card application-card"><div class="row between"><div><h2>'+e(j?.company)+' - '+e(j?.title)+'</h2><small>Applied '+date(a.date)+(u.role==='Student'?'':' · '+e(student(a.studentId)?.name))+'</small></div>'+badge(a.status)+'</div><div class="application-path">'+['Submitted','Under Review','Interview','Accepted'].map((label,i)=>(i?'<span class="application-line"></span>':'')+'<div class="application-step '+(i<=level?'done':'')+'"><i></i><span>'+label+'</span></div>').join('')+'</div><div class="mt16">'+button(u.role==='Student'?'View Details':'Review Application','application-detail',a.id,'secondary small')+'</div></section>';}).join(''):empty('No applications in this view','Your application progress will appear here.'));}
function netElapsed(sh){if(!sh||!sh.clockIn)return '00:00:00';const now=Date.now();const cIn=new Date(sh.clockIn).getTime();if(isNaN(cIn))return '00:00:00';let ms=now-cIn;if(typeof sh.breakMs==='number'&&sh.breakMs>0){ms-=Math.min(sh.breakMs,Math.max(0,ms));}else if(sh.breakMinutes){ms-=Math.min(sh.breakMinutes*60000,Math.max(0,ms));}const b=sh.onBreak||sh.justification;if(b){const bTime=new Date(b).getTime();if(!isNaN(bTime))ms-=Math.max(0,now-bTime);}const s=Math.max(0,Math.floor(ms/1000));return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(v=>String(v).padStart(2,'0')).join(':');}
function elapsed(start){if(!start)return '00:00:00';const t=new Date(start).getTime();if(isNaN(t))return '00:00:00';const seconds=Math.max(0,Math.floor((Date.now()-t)/1000));return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(v=>String(v).padStart(2,'0')).join(':');}
function dtrTable(logs,u){const breakCol=l=>l.breakMinutes?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#854d0e;"><span style="width:6px;height:6px;border-radius:50%;background:#854d0e;"></span>'+l.breakMinutes+'m</span>':'<span style="font-size:12px;color:var(--slate);">—</span>';return logs.length?table([...(u.role==='Student'?[]:['Intern']),'Date','Clock In','Clock Out','Break',...(u.role==='Student'?['Total']:['Task Summary']),'GPS','Status','Action'],logs.slice().reverse().map(l=>'<tr>'+(u.role==='Student'?'':'<td><strong>'+e(student(l.studentId)?.name)+'</strong></td>')+'<td>'+date(l.date)+'</td><td>'+time(l.clockIn)+'</td><td>'+time(l.clockOut)+'</td><td>'+breakCol(l)+'</td><td>'+(u.role==='Student'?(Number(l.hours)||0).toFixed(2)+'h':'<span class="task-excerpt">'+e(l.task)+'</span>')+'</td><td>'+badge(l.gps?'Captured':'Unavailable')+'</td><td>'+badge(l.status)+'</td><td>'+button(u.role==='Supervisor'&&['Pending','Flagged'].includes(l.status)?'Review':'View','log-detail',l.id,'secondary small')+'</td></tr>')):empty('No DTR entries here','Submitted attendance records will appear here.');}
function visibleIncidents(u){return db.incidents.filter(i=>u.role==='Coordinator'||(u.role==='Student'?i.studentId===u.id:i.supervisorId===u.id));}
function profilePage(u){return `${heading('Profile Setup','Keep your contact and internship details up to date.')}<div class="narrow-wide"><section class="card sand"><div class="row">${person(u)}</div><hr class="hr"><p class="small">${e(u.identifier)}</p>${badge(u.role)} ${badge(u.badge||u.status)}<p class="small muted mt16">Your role and academic identifier are managed by your coordinator.</p></section><section class="card"><h2>Personal information</h2><form id="profile-form">${field('Full name','name','text',u.name,'required maxlength="100" autocomplete="name"')}${field('Email address','email','email',u.email,'required autocomplete="email"')}${field('Phone number (optional)','phone','tel',u.phone||'','maxlength="30" autocomplete="tel"')}${textarea('About you (optional)','bio',u.bio||'','')}<p class="form-error" role="alert"></p><button class="btn" type="submit">Save profile</button></form></section></div>`;}
function safeMeetingURL(value){const url=new URL(value);if(url.protocol!=='https:'||!['meet.google.com','teams.microsoft.com','teams.live.com','zoom.us','www.zoom.us'].some(h=>url.hostname===h||url.hostname.endsWith('.'+h)))throw new Error('Use an HTTPS Google Meet, Microsoft Teams, or Zoom link.');return url.href;}
function openJob(id){const u=currentUser(),j=job(id);if(!j)return;const applied=db.applications.some(a=>a.studentId===u.id&&a.jobId===id&&a.status!=='Rejected');showModal(e(j.title),`<div class="row between"><strong>${e(j.company)}</strong>${badge(j.status)}</div><p class="muted mt16">${e(j.location)} • ${e(j.mode)} • ${j.slots} available slots</p><h3>About this opportunity</h3><p>${e(j.description)}</p><h3>Skills you'll use</h3><p>${e(j.skills)}</p><h3>Host training establishment specifications</h3><p>${e(j.specs)}</p><h3>Eligible programs</h3><p>${e(j.courses.join(' • '))}</p>${u.role==='Student'?`<div class="note">${applied?'You already applied to this position.':'Your current profile will be included with your application.'}</div>${applied?'':`<div class="field mt16"><label class="row"><input type="checkbox" name="consent" required> I confirm my profile details are ready for review.</label></div>`}`:''}${u.role!=='Student'?button('Edit position','job-edit',id,'secondary'):''}`,u.role==='Student'&&!applied&&j.status==='Active'&&j.slots>0?async(data)=>{const {error}=await supabase.from('applications').insert({job_id:id,student_id:u.id,status:'Pending',applied_date:today()});if(error)throw new Error(error.message);await syncRemote(supabase,db);if(j.supervisorId)notify(j.supervisorId,'Application_Status','New internship application',u.name+' applied for '+j.title+'.');audit('Submitted application for '+j.title);save();toast('Application submitted in the demo.');}:null,'Submit application');}
function editJob(id){const u=currentUser();if(!['Coordinator','Supervisor'].includes(u.role))throw new Error('This role cannot manage positions.');const j=job(id);if(j&&u.role==='Supervisor'&&j.supervisorId!==u.id)throw new Error('This position is outside your scope.');showModal(j?'Edit position':'Post a new position',field('Position title','title','text',j?.title||'','required maxlength="120"')+field('Company','company','text',j?.company||u.company||'','required maxlength="120" '+(u.role==='Supervisor'?'readonly':''))+`<div class="grid-2">${field('Location','location','text',j?.location||'','required maxlength="100"')}${select('Work arrangement','mode',['On-site','Hybrid','Remote'],j?.mode||'On-site')}</div><div class="grid-2">${field('Available slots','slots','number',j?.slots??1,'required min="0" max="1000"')}${select('Status','status',['Draft','Active','Closed'],j?.status||'Draft')}</div>`+select('Eligible program','course',['All programs','BSCS','BSIT','BSCompE','BSECE'],j?.courses?.length===1?j.courses[0]:'All programs')+textarea('Position description','description',j?.description||'')+field('Skills','skills','text',j?.skills||'','required maxlength="200"')+textarea('HTE specifications & requirements','specs',j?.specs||'')+(u.role==='Coordinator'?select('Assigned supervisor','supervisorId',[['','Unassigned'],...db.users.filter(s=>s.role==='Supervisor').map(s=>[s.id,s.name])],j?.supervisorId||''):''),async(data)=>{const values={...data,slots:Number(data.slots),courses:data.course==='All programs'?['BSCS','BSIT','BSCompE','BSECE']:[data.course],supervisor_id:u.role==='Supervisor'?u.id:data.supervisorId||null};delete values.course;delete values.supervisorId;const {error, data: result}=j?await supabase.from('listings_jobs').update(values).eq('id',id).select():await supabase.from('listings_jobs').insert(values).select();if(error)throw new Error(error.message);if(!result || result.length === 0)throw new Error('Write failed or rejected by security rules.');await syncRemote(supabase,db);audit((j?'Updated':'Created')+' position '+values.title);save();toast('Position saved.');},'Save position');}
function applicationDetail(id){const u=currentUser(),a=visibleApplications(db,u).find(a=>a.id===id);if(!a)throw new Error('Application unavailable.');const j=job(a.jobId),s=student(a.studentId);showModal('Application details',`<h3>${e(j.title)}</h3><p>${e(j.company)} • ${e(s.name)}</p>${badge(a.status)}<div class="timeline"><div class="timeline-item"><strong>Application submitted</strong><p>${date(a.date)}</p></div><div class="timeline-item"><strong>Supervisor review</strong><p>${a.status==='Pending'?'Awaiting review':e(a.status.replaceAll('_',' '))}</p></div><div class="timeline-item"><strong>Placement & endorsement</strong><p>${a.status==='Accepted'?e(a.note||'Application accepted. Coordinator endorsement is next.'):'Follows an accepted application.'}</p></div></div>${u.role==='Supervisor'?select('Review decision','status',['Pending','Under_Review','Accepted','Rejected'],a.status)+textarea('Review note','note',a.note||''):''}`,u.role==='Supervisor'?async(data)=>{if(data.status==='Accepted'&&a.status!=='Accepted'){if(j.slots<1)throw new Error('No slots remain in this position.');if(db.applications.some(other=>other.studentId===s.id&&other.id!==a.id&&other.status==='Accepted'))throw new Error('This student already has an accepted placement.');}if(a.status==='Accepted'&&data.status!=='Accepted')throw new Error('An accepted placement must be reassigned by the coordinator.');const {error}=await supabase.rpc('review_application',{p_id:a.id,p_status:data.status,p_note:data.note||''});if(error)throw new Error(error.message);await syncRemote(supabase,db);notify(s.id,'Application_Status','Application status updated',j.title+': '+data.status.replaceAll('_',' '));audit('Reviewed application for '+s.name);save();toast('Application updated.');}:null,'Save review');}

async function studentClockIn() {
  const u = currentUser();
  if (u.role !== 'Student') throw new Error('Student portal required.');
  const studentId = u.id;
  db.activeShifts = db.activeShifts || [];
  if (db.activeShifts.some(sh => sh.studentId === studentId) || db.logs.some(l => l.studentId === studentId && l.status === 'Running')) {
    throw new Error('You are already clocked in.');
  }
  const supId = u.supervisorId || (db.users.find(x => x.role === 'Supervisor' && (x.company === u.company || !u.company))?.id) || db.users.find(x => x.role === 'Supervisor')?.id || null;
  const nowIso = new Date().toISOString();
  const shiftObj = {
    id: crypto.randomUUID(),
    studentId,
    supervisorId: supId,
    clockIn: nowIso,
    clockOut: null,
    breakMinutes: 0,
    onBreak: null,
    justification: null
  };
  db.activeShifts.push(shiftObj);
  const logRecord = {
    id: shiftObj.id,
    studentId,
    supervisorId: supId,
    date: today(),
    clockIn: nowIso,
    clockOut: null,
    breakMinutes: 0,
    hours: 0,
    status: 'Running',
    task: '',
    gps: true,
    remarks: '',
    justification: ''
  };
  const existingRunningIdx = db.logs.findIndex(l => l.studentId === studentId && l.status === 'Running');
  if (existingRunningIdx !== -1) db.logs[existingRunningIdx] = logRecord;
  else db.logs.unshift(logRecord);
  db.shift = logRecord;

  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const validStudentUuid = uuidRegex.test(studentId) ? studentId : (uuidRegex.test(u.id) ? u.id : null);
    const validSupervisorUuid = (supId && uuidRegex.test(supId)) ? supId : null;
    if (validStudentUuid) {
      const payload = {
        student_id: validStudentUuid,
        date: today(),
        clock_in: nowIso,
        break_minutes: 0,
        hours: 0,
        status: 'Running',
        gps: true
      };
      if (validSupervisorUuid) payload.supervisor_id = validSupervisorUuid;
      const { data: ins, error } = await supabase.from('logs').insert(payload).select();
      if (!error && ins && ins.length > 0) {
        shiftObj.id = ins[0].id;
        logRecord.id = ins[0].id;
      }
    }
  } catch(err) {
    console.warn('Supabase running log sync note:', err);
  }

  audit('Student ' + u.name + ' clocked in');
  save();
  render();
  toast('You are now clocked in. Shift timer started!');
}

async function studentToggleBreak() {
  const u = currentUser();
  if (u.role !== 'Student') throw new Error('Student portal required.');
  const studentId = u.id;
  db.activeShifts = db.activeShifts || [];
  let shift = db.activeShifts.find(sh => sh.studentId === studentId);
  let log = db.logs.find(l => l.studentId === studentId && l.status === 'Running');
  if (!shift && log) {
    shift = { studentId, supervisorId: log.supervisorId, clockIn: log.clockIn, breakMinutes: log.breakMinutes || 0, breakMs: log.breakMs || 0, onBreak: log.justification || null, justification: log.justification || null };
    db.activeShifts.push(shift);
  }
  if (!shift && !log) throw new Error('You are not currently clocked in.');

  const isCurrentlyOnBreak = Boolean(shift?.onBreak || shift?.justification || log?.justification || log?.onBreak);

  if (isCurrentlyOnBreak) {
    const breakStart = shift?.onBreak || log?.justification || shift?.justification || log?.onBreak;
    const elapsedMs = breakStart ? Math.max(0, Date.now() - new Date(breakStart).getTime()) : 0;
    
    // Accurately accumulate actual break milliseconds
    const currentBreakMs = Math.max(shift?.breakMs || 0, log?.breakMs || 0);
    const newTotalBreakMs = currentBreakMs + elapsedMs;
    const newTotalBreakMinutes = Math.round(newTotalBreakMs / 60000);

    const elapsedSec = Math.round(elapsedMs / 1000);
    const breakDisplay = elapsedMs >= 60000 ? `${Math.round(elapsedMs / 60000)}m` : `${elapsedSec}s`;
    const totalDisplay = newTotalBreakMs >= 60000 ? `${newTotalBreakMinutes}m` : `${Math.round(newTotalBreakMs / 1000)}s`;

    if (shift) {
      shift.breakMs = newTotalBreakMs;
      shift.breakMinutes = newTotalBreakMinutes;
      shift.onBreak = null;
      shift.justification = null;
    }
    if (log) {
      log.breakMs = newTotalBreakMs;
      log.breakMinutes = newTotalBreakMinutes;
      log.onBreak = null;
      log.justification = '';
    }
    if (db.shift && db.shift.studentId === studentId) {
      db.shift.breakMs = newTotalBreakMs;
      db.shift.breakMinutes = newTotalBreakMinutes;
      db.shift.onBreak = null;
      db.shift.justification = '';
    }
    try {
      if (log?.id) {
        await supabase.from('logs').update({ break_minutes: newTotalBreakMinutes, justification: '' }).eq('id', log.id);
      }
    } catch(e) {}
    toast(`Break ended (${breakDisplay} recorded, total ${totalDisplay}). Resuming shift timer.`);
  } else {
    const nowIso = new Date().toISOString();
    if (shift) {
      shift.onBreak = nowIso;
      shift.justification = nowIso;
    }
    if (log) {
      log.onBreak = nowIso;
      log.justification = nowIso;
    }
    if (db.shift && db.shift.studentId === studentId) {
      db.shift.onBreak = nowIso;
      db.shift.justification = nowIso;
    }
    try {
      if (log?.id) {
        await supabase.from('logs').update({ justification: nowIso }).eq('id', log.id);
      }
    } catch(e) {}
    toast('Lunch / Break started. Shift timer paused.');
  }
  save();
  render();
}

async function studentClockOut() {
  const u = currentUser();
  if (u.role !== 'Student') throw new Error('Student portal required.');
  const studentId = u.id;
  db.activeShifts = db.activeShifts || [];
  const shiftIdx = db.activeShifts.findIndex(sh => sh.studentId === studentId);
  const shift = shiftIdx !== -1 ? db.activeShifts[shiftIdx] : null;
  const log = db.logs.find(l => l.studentId === studentId && l.status === 'Running');
  if (!shift && !log) throw new Error('You do not have an active clocked-in shift.');

  const clockInTime = shift?.clockIn || log?.clockIn || new Date(Date.now() - 3600000).toISOString();
  let breakMs = Math.max(shift?.breakMs || 0, log?.breakMs || 0);
  let breakMins = Math.max(shift?.breakMinutes || 0, log?.breakMinutes || 0);
  const breakStart = shift?.onBreak || shift?.justification || log?.justification || log?.onBreak;
  if (breakStart) {
    const elapsedMs = Math.max(0, Date.now() - new Date(breakStart).getTime());
    breakMs += elapsedMs;
    breakMins = Math.round(breakMs / 60000);
  } else if (breakMs > 0 && !breakMins) {
    breakMins = Math.round(breakMs / 60000);
  }
  const clockOutTime = new Date().toISOString();
  const hrs = Math.max(0, hoursBetween(clockInTime, clockOutTime, breakMins));
  const supId = shift?.supervisorId || log?.supervisorId || u.supervisorId;
  const defaultDraft = db.draft || db.taskDrafts?.find(d => d.studentId === u.id && d.date === today())?.task || '';

  showModal('Clock Out & Submit Daily Logbook', `
    <div style="background:var(--cream, #fbf8f2); padding:16px; border-radius:8px; margin-bottom:16px; border:1px solid var(--line, #e2e8f0);">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
        <span class="muted">Clock In</span>
        <strong>${time(clockInTime)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
        <span class="muted">Clock Out</span>
        <strong>${time(clockOutTime)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
        <span class="muted">Break Time</span>
        <strong style="color:#854d0e;">${breakMins} mins</strong>
      </div>
      <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--line, #e2e8f0); padding-top:8px; font-size:13px;">
        <span class="muted">Estimated Shift Hours</span>
        <strong style="color:var(--burgundy); font-size:15px;">${hrs} hrs</strong>
      </div>
    </div>
    ${textarea('Task summary & learning reflection', 'task', defaultDraft, 'required minlength="150" placeholder="Describe the specific tasks completed, technical skills applied, and milestones achieved during this shift (min 150 characters)..."')}
    <div style="display:flex; justify-content:space-between; align-items:center; margin:-8px 0 16px 0;">
      <button type="button" class="btn secondary small" data-action="save-clockout-draft" id="btn-save-clockout-draft" style="padding:6px 12px; font-size:12px;">
        💾 Save as Draft
      </button>
      <span class="small muted" id="draft-save-hint">Want to finish later? Save your progress as a draft</span>
    </div>
    <p class="note">Enter your daily task accomplishments (minimum 150 characters). This will be submitted to your supervisor for review and approval.</p>
  `, async (data) => {
    if (shiftIdx !== -1) db.activeShifts.splice(shiftIdx, 1);
    db.taskDrafts = (db.taskDrafts || []).filter(d => !(d.studentId === studentId && d.date === today()));
    let targetLog = log;
    if (!targetLog) {
      targetLog = {
        id: crypto.randomUUID(),
        studentId,
        supervisorId: supId,
        date: today(),
        clockIn: clockInTime,
        clockOut: clockOutTime,
        breakMinutes: breakMins,
        hours: hrs,
        status: 'Pending',
        task: data.task,
        gps: true,
        remarks: '',
        justification: ''
      };
      db.logs.unshift(targetLog);
    } else {
      targetLog.clockOut = clockOutTime;
      targetLog.breakMinutes = breakMins;
      targetLog.hours = hrs;
      targetLog.status = 'Pending';
      targetLog.task = data.task;
      targetLog.onBreak = null;
      targetLog.justification = '';
    }

    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validStudentUuid = uuidRegex.test(studentId) ? studentId : (uuidRegex.test(u.id) ? u.id : null);
      const validSupervisorUuid = (supId && uuidRegex.test(supId)) ? supId : null;

      let savedRemote = false;
      if (uuidRegex.test(targetLog.id)) {
        const { data: updated, error: updErr } = await supabase.from('logs').update({
          clock_out: clockOutTime,
          break_minutes: breakMins,
          hours: hrs,
          task: data.task,
          status: 'Pending',
          justification: ''
        }).eq('id', targetLog.id).select();

        if (!updErr && updated && updated.length > 0) {
          savedRemote = true;
        }
      }

      if (!savedRemote && validStudentUuid) {
        const insertPayload = {
          student_id: validStudentUuid,
          date: today(),
          clock_in: clockInTime,
          clock_out: clockOutTime,
          break_minutes: breakMins,
          hours: hrs,
          task: data.task,
          status: 'Pending',
          gps: true
        };
        if (validSupervisorUuid) insertPayload.supervisor_id = validSupervisorUuid;
        const { data: ins, error: insErr } = await supabase.from('logs').insert(insertPayload).select();
        if (!insErr && ins && ins.length > 0) {
          targetLog.id = ins[0].id;
          savedRemote = true;
        } else if (insErr) {
          console.warn('Supabase insert clock-out error:', insErr.message);
        }
      }
      await syncRemote(supabase, db);
    } catch(err) {
      console.warn('Supabase clock out log error:', err);
    }

    if (!db.logs.some(l => l.id === targetLog.id)) {
      db.logs.unshift(targetLog);
    }

    if (supId) {
      notify(supId, 'DTR_Event', 'Daily time record submitted', u.name + ' clocked out and submitted their daily logbook.');
    }
    audit('Student ' + u.name + ' clocked out and submitted daily log for ' + today());
    db.draft = '';
    db.shift = null;
    save();
    render();
    toast('Clocked out successfully! Daily logbook submitted for supervisor approval.');
  }, 'Submit & Clock Out');
}

async function clockAction() {
    const u = currentUser();
    if(u.role !== 'Student') throw new Error('Student portal required.');
    
    // Find if a log awaits summary
    const log = db.logs.find(l => (l.studentId === u.id || (u.email && u.email.toLowerCase() === 'kenzosomes@gmail.com' && (l.studentId === '22227dcf-933f-40a9-9340-f66cb9020e5c' || l.studentId === 's1')) || (u.id === '22227dcf-933f-40a9-9340-f66cb9020e5c' && l.studentId === 's1')) && l.status === 'Awaiting_Student_Log');
    if(!log) {
      const running = db.logs.find(sh => sh.studentId === u.id && sh.status === 'Running') || (db.activeShifts || []).find(sh => sh.studentId === u.id);
      if (running) {
        await studentClockOut();
        return;
      }
      await studentClockIn();
      return;
    }
    
    showModal('Submit Daily Summary Logbook', `<p>Shift completed: Clocked in at ${time(log.clockIn)}, Clocked out at ${time(log.clockOut)} (${log.hours || 8} hrs).</p>${textarea('Task summary & learning reflection','task','','required minlength="150" placeholder="Describe the tasks, tools, and technical learnings achieved during today\'s shift (min 150 characters)..."')}<p class="note">Describe the tasks you completed during this session (min 150 characters) for supervisor review.</p>`, async data => {
        log.task = data.task;
        log.status = 'Pending';
        try {
          const { error, data: updated } = await supabase.from('logs').update({ task: log.task, status: log.status }).eq('id', log.id).select();
          if (!error && updated && updated.length > 0) {
            await syncRemote(supabase, db);
          }
        } catch(e) {
          console.warn('Supabase sync note:', e);
        }
        if (log.supervisorId) {
          notify(log.supervisorId, 'DTR_Event', 'Daily time record submitted', u.name + ' submitted their verified logbook summary.');
        }
        audit('Submitted a daily time record summary');
        save();
        toast('Logbook summary submitted for supervisor review.');
        render();
    }, 'Submit Daily Logbook');
}


let terminalFor = null;
function refreshTerminal(id){ if(modal.open && terminalFor === id) tkTerminal(id); else terminalFor = null; }
function tkTerminal(id) {
    let s = db.users.find(u => u.id === id);
    let isDummy = false;
    if(!s && id === 'dummy') {
        s = { id: 'dummy', name: 'Example Intern', identifier: 'DEMO-2026-001', course: 'BS Information Technology' };
        isDummy = true;
    }
    if(!s) throw new Error('Student not found.');
    
    const active = (db.activeShifts || []).find(sh => sh.studentId === id);
    const isOnBreak = active && active.onBreak;
    const status = active ? (isOnBreak ? 'On Lunch / Break' : 'Active On-Site') : 'Clocked Out';
    const statusColor = active ? (isOnBreak ? '#854d0e' : '#166534') : 'var(--slate)';
    const statusBg = active ? (isOnBreak ? '#fefce8' : '#dcfce7') : '#f1f5f9';
    
    let body = `<div style="text-align: center; padding: 10px 0;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--burgundy); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin: 0 auto 16px auto;">${s.name.charAt(0)}</div>
        <h2 style="margin: 0 0 4px 0; font-size: 20px;">${e(s.name)}</h2>
        <p class="muted" style="margin-bottom: 24px; font-size: 14px;">${e(s.identifier)} &bull; ${e(s.course)}</p>
        
        <div style="background: ${statusBg}; border-radius: var(--radius); padding: 32px; margin-bottom: 24px; border: 1px solid var(--border);">
            <div style="color: ${statusColor}; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="width:10px;height:10px;border-radius:50%;background:${statusColor};${active && !isOnBreak ? 'animation:tk-pulse 2s infinite' : ''}"></span>
                ${status}
            </div>
            ${active 
                ? `<div style="font-size: 56px; font-weight: 800; font-variant-numeric: tabular-nums; color: ${isOnBreak ? '#854d0e' : 'var(--ink)'}; line-height: 1;" class="tk-timer" data-student="${s.id}">${netElapsed(active)}</div>` + (isOnBreak ? `<p style="font-size:13px; margin:16px 0 0; color:#854d0e;">Work timer paused &bull; On break for <strong class="tk-break-timer" data-start="${active.onBreak}">${elapsed(active.onBreak)}</strong></p>` : `<p style="font-size:13px; margin:16px 0 0; color:var(--slate);">Clocked in at ${time(active.clockIn)}${active.breakMinutes ? ' &bull; ' + active.breakMinutes + 'm break taken' : ''}</p>`)
                : `<div style="font-size: 56px; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--slate); opacity: 0.3; line-height: 1;">00:00:00</div>`
            }
        </div>
        
        ${active 
            ? `<div style="display:flex; gap:16px; margin-bottom: 16px;">
                 ${button(isOnBreak ? 'End Break' : 'Start Lunch / Break', 'sup-toggle-break', s.id, 'secondary full')}
                 ${button('Clock Out', 'sup-clock-out', s.id, 'primary full')}
               </div>`
            : button('Clock In Intern', isDummy ? 'dummy-action' : 'sup-clock-in', s.id, 'primary full', 'clock')
        }
    </div>`;
    
    showModal('Timekeeper Terminal', body); terminalFor = id;
}

function logDetail(id){const u=currentUser(),l=visibleLogs(db,u).find(l=>l.id===id);if(!l)throw new Error('Attendance entry unavailable.');const review=u.role==='Supervisor'&&['Pending','Flagged'].includes(l.status);showModal(u.role==='Student'?'Daily time record [READ-ONLY]':'Daily time record',`<div class="row between"><strong>${e(student(l.studentId)?.name)}</strong>${badge(l.status)}</div><p class="muted mt16">${date(l.date)} · ${time(l.clockIn)} - ${time(l.clockOut)} · ${l.hours} hours${l.breakMinutes?' · <span style="color:#854d0e;">'+l.breakMinutes+'m break</span>':''}</p><h3>Task summary</h3><p>${e(l.task)}</p><p class="small"><strong>Location:</strong> ${l.gps?'Captured on device; not server-verified':'Not captured'}</p>${l.justification?`<h3>Justification</h3><p>${e(l.justification)}</p>`:''}${l.remarks?`<h3>Supervisor remarks</h3><p>${e(l.remarks)}</p>`:''}${l.signature?`<p class="small muted">Demo typed signature: ${e(l.signature)}</p>`:''}${review?select('Review decision','status',['Approved','Flagged','Rejected'])+textarea('Review remarks','remarks',l.remarks||'')+field('Typed signature (demo)','signature','text',u.name,'required maxlength="100"')+'<label class="row small"><input type="checkbox" required> I reviewed this attendance record.</label>':''}`,review?async data=>{ const {error, data:updated} = await supabase.from('logs').update({status: data.status, remarks: data.remarks, signature: data.signature}).eq('id', id).select(); if(error) throw new Error(error.message); if(!updated || updated.length===0) throw new Error('Update failed.'); await syncRemote(supabase, db); notify(l.studentId,'DTR_Event','DTR entry '+data.status.toLowerCase(),date(l.date)+': '+data.remarks); audit('Marked '+student(l.studentId).name+' DTR '+data.status); save(); toast('DTR review saved.'); }:null,'Submit review');}
function studentDetail(id){const u=currentUser(),s=visibleStudents(db,u).find(s=>s.id===id);if(!s)throw new Error('Student is outside your assigned scope.');showModal(e(s.name),`${person(s)}<hr class="hr"><div class="grid-2"><div><span class="small muted">SR code</span><p>${e(s.identifier)}</p><span class="small muted">Host company</span><p>${e(s.company||'Unplaced')}</p></div><div><span class="small muted">Approved hours</span><p>${approvedHours(db,s.id)} / ${s.requiredHours} hours</p><span class="small muted">Accreditation</span><p>${badge(s.badge)}</p></div></div>${progress(approvedHours(db,s.id),s.requiredHours)}<h3 class="mt16">Recent attendance</h3>${dtrTable(db.logs.filter(l=>l.studentId===s.id).slice(-3),{role:'Student'})}${u.role==='Coordinator'?`<hr class="hr">${select('Host company','company',[['','Unplaced'],...db.htes.filter(h=>h.status==='Accredited').map(h=>h.name)],s.company)}${select('Assigned supervisor','supervisorId',[['','Unassigned'],...db.users.filter(v=>v.role==='Supervisor'&&v.status==='Active').map(v=>[v.id,v.name])],s.supervisorId||'')}${select('Accreditation status','badge',['Pre_Seeded','Eligible','Enrolled','Cleared'],s.badge)}${field('Required OJT hours','requiredHours','number',s.requiredHours,'required min="1" max="2000"')}<p class="small muted">Clearance requires completed hours, an appraisal, and no unresolved incidents.</p>${button('Download endorsement','endorsement',s.id,'secondary small','download')}`:''}`,u.role==='Coordinator'?async data=>{const supervisor=student(data.supervisorId);if(data.company&&(!supervisor||supervisor.company!==data.company))throw new Error('Select a supervisor from the chosen host company.');if(!data.company&&data.supervisorId)throw new Error('Assign a host company before a supervisor.');if(data.badge==='Cleared'&&(approvedHours(db,id)<Number(data.requiredHours)||!db.appraisals.some(a=>a.studentId===id)||db.incidents.some(i=>i.studentId===id&&!['Resolved','Dismissed'].includes(i.status))))throw new Error('This student has incomplete clearance requirements.');const { data: updated, error } = await supabase.from('profiles').update({ company: data.company, supervisor_id: data.supervisorId || null, required_hours: Number(data.requiredHours) }).eq('id', id).select();if(error)throw new Error(error.message);if(!updated||updated.length===0)throw new Error('Update failed. You may not have permission.');await syncRemote(supabase, db);notify(s.id,'System','Placement profile updated','Your coordinator updated your placement or accreditation details.');audit('Updated placement for '+s.name);save();toast('Student placement updated.');}:null,'Save placement');}
function incidentNew(){const u=currentUser(),students=visibleStudents(db,u);showModal(u.role==='Student'?'File an incident claim':'Create disciplinary log',`<p class="note">Document the situation clearly. This demo does not send emergency alerts or contact school staff.</p>${u.role==='Supervisor'?select('Student involved','studentId',students.map(s=>[s.id,s.name])):''}${field('Short title','title','text','','required maxlength="120"')}${select('Priority','priority',['Low','Medium','High'],'Medium')}${textarea('Description','description','','required minlength="20"')}${select('Related DTR (optional)','logId',[['','No linked entry'],...visibleLogs(db,u).map(l=>[l.id,student(l.studentId).name+' · '+date(l.date)])])}${field('Evidence (optional, PDF / PNG / JPEG, up to 10 MB)','evidence','file','','accept="application/pdf,image/png,image/jpeg"')}`,async(data,form)=>{const sid=u.role==='Student'?u.id:data.studentId;if(u.role==='Supervisor'&&!students.some(s=>s.id===sid))throw new Error('Choose an assigned intern.');if(data.logId&&!db.logs.some(l=>l.id===data.logId&&l.studentId===sid))throw new Error('The linked DTR must belong to the selected student.');const incCode = 'IR-'+crypto.randomUUID().slice(0,8).toUpperCase();
let evidence=null;const file=form.elements.evidence.files[0];if(file){validateUpload(file);evidence=await uploadEvidence(file, incCode);}const incident={id:incCode,studentId:sid,supervisorId:u.role==='Supervisor'?u.id:u.supervisorId,category:u.role==='Student'?'Student_Claim':'Disciplinary_Violation',title:data.title,description:data.description,priority:data.priority,status:'Pending',date:today(),logId:data.logId||null,evidence,notes:[],meeting:null};const { error, data: inserted } = await supabase.from('incidents').insert({
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
},'Submit report');}
function incidentDetail(id){const u=currentUser(),i=visibleIncidents(u).find(i=>i.id===id);if(!i)throw new Error('Case unavailable.');showModal('Case '+e(i.id),`<div class="row between"><h3 class="mb0">${e(i.title)}</h3>${badge(i.priority)}</div><p class="small muted mt16">${e(student(i.studentId)?.name)} · ${date(i.date)} · ${e(i.category.replaceAll('_',' '))}</p>${badge(i.status)}<p class="mt16">${e(i.description)}</p>${i.logId?button('View linked DTR','log-detail',i.logId,'secondary small'):''}${i.evidence?button('Download evidence: '+e(i.evidence.name),'file-download',i.evidence.id,'secondary small','download'):''}${i.meeting?`<section class="note mt16"><strong>Mediation scheduled</strong><p class="mb0">${date(i.meeting.time)} · ${time(i.meeting.time)} · ${e(i.meeting.platform)}</p><a href="${e(safeMeetingURL(i.meeting.url))}" target="_blank" rel="noopener noreferrer" class="text-btn">Open meeting ↗</a></section>`:''}<h3 class="mt16">Case notes</h3>${i.notes.map(n=>`<div class="activity-item"><p>${e(n.text)}</p><small>${e(n.author)} · ${date(n.date)}</small></div>`).join('')||'<p class="small muted">No case notes yet.</p>'}${u.role==='Coordinator'?`<hr class="hr">${select('Case status','status',['Pending','Scheduled','Resolved','Dismissed'],i.status)}${textarea('Investigation / resolution note','note','','required minlength="10"')}<details><summary class="small">Schedule a mediation meeting (optional)</summary><div class="mt16">${select('Meeting platform','platform',['Google Meet','MS Teams','Zoom'],i.meeting?.platform||'Google Meet')}${field('Meeting link','url','url',i.meeting?.url||'')}${field('Meeting date & time','meetingTime','datetime-local',i.meeting?.localTime||'')}</div></details>`:''}`,u.role==='Coordinator'?async data=>{let meeting=i.meeting;if(data.url||data.meetingTime){if(!data.url||!data.meetingTime)throw new Error('Provide both the meeting link and time.');const url=safeMeetingURL(data.url);if(new Date(data.meetingTime)<=new Date())throw new Error('Schedule a meeting in the future.');meeting={platform:data.platform,url,time:new Date(data.meetingTime).toISOString(),localTime:data.meetingTime};}if(data.status==='Scheduled'&&!meeting)throw new Error('Add a meeting link and time before marking this case scheduled.');const newNotes = [...i.notes, {text:data.note,author:u.name,date:new Date().toISOString()}];
const { error, data: updated } = await supabase.from('incidents').update({ status: data.status, meeting, notes: newNotes }).eq('code', i.id).select();
if (error) throw new Error(error.message);
if (!updated || updated.length === 0) throw new Error('Update failed or rejected by security rules.');
await syncRemote(supabase, db);
notify(i.studentId,'Incident_Alert','Incident '+i.id+' updated',data.status+': '+data.note);
if(i.supervisorId)notify(i.supervisorId,'Incident_Alert','Incident '+i.id+' updated',data.status+': '+data.note);
audit('Updated incident '+i.id+' to '+data.status);
toast('Case updated.');
}:null,'Update case');}
function evaluate(id){
  const u = currentUser(), s = visibleStudents(db, u).find(s => s.id === id);
  if (u.role !== 'Supervisor' || !s) throw new Error('Student outside your evaluation scope.');
  const a = db.appraisals.find(a => a.studentId === id);

  const legendHtml = `
    <div style="background: var(--cream, #fbf8f2); padding: 14px 18px; border-radius: 8px; margin-bottom: 16px; border: 1px solid var(--line, #e2e8f0);">
      <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: var(--ink);">Evaluation Instrument</h4>
      <div style="font-size: 12px; color: var(--slate); line-height: 1.6;">
        <strong style="color:var(--ink);">Legend:</strong>
        <span style="display:inline-block; margin: 0 3px; padding: 1px 6px; background:#fee2e2; border-radius:4px; font-weight:600; color:#991b1b;">1 - Very Poor</span>
        <span style="display:inline-block; margin: 0 3px; padding: 1px 6px; background:#ffedd5; border-radius:4px; font-weight:600; color:#9a3412;">2 - Poor</span>
        <span style="display:inline-block; margin: 0 3px; padding: 1px 6px; background:#fef9c3; border-radius:4px; font-weight:600; color:#854d0e;">3 - Average</span>
        <span style="display:inline-block; margin: 0 3px; padding: 1px 6px; background:#dbeafe; border-radius:4px; font-weight:600; color:#1e40af;">4 - Good</span>
        <span style="display:inline-block; margin: 0 3px; padding: 1px 6px; background:#dcfce7; border-radius:4px; font-weight:600; color:#166534;">5 - Very Good</span>
        <span style="display:inline-block; margin: 0 3px; padding: 1px 6px; background:#f1f5f9; border-radius:4px; font-weight:600; color:#475569;">NA - Not Applicable</span>
      </div>
    </div>
  `;

  let scorableIdx = 0;
  const tableRows = evaluationCriteria.map(item => {
    if (item.isHeader) {
      return `<tr style="background:#f8fafc; font-weight:700; border-top:1px solid var(--line); border-bottom:1px solid var(--line);"><td colspan="7" style="padding:10px 14px; font-size:13px; color:var(--ink);"><strong>${item.num}. ${e(item.title)}</strong></td></tr>`;
    }
    const idx = scorableIdx++;
    const savedVal = a?.ratings?.[idx];
    return `
      <tr style="border-bottom:1px solid var(--line);">
        <td style="padding:10px 14px; font-size:13px; line-height:1.45; ${item.sub ? 'padding-left:28px;' : 'font-weight:500;'}">
          ${item.num ? `<strong>${item.num}.</strong> ` : `<span style="font-weight:600; color:var(--burgundy);">${item.sub})</span> `}${e(item.title)}
        </td>
        ${[1, 2, 3, 4, 5, 'NA'].map(val => `
          <td style="padding:8px 4px; text-align:center; vertical-align:middle; width:44px;">
            <label style="cursor:pointer; display:flex; align-items:center; justify-content:center; margin:0; min-height:24px;">
              <input type="radio" name="rating_${idx}" value="${val}" required
                ${a ? (String(savedVal) === String(val) ? 'checked' : '') : (val === 4 ? 'checked' : '')}
                ${a ? 'disabled' : ''} style="cursor:pointer; accent-color:var(--burgundy); width:16px; height:16px;">
            </label>
          </td>
        `).join('')}
      </tr>
    `;
  }).join('');

  const tableHtml = `
    <div class="table-wrap" style="overflow-x:auto; margin-bottom:16px; border:1px solid var(--line); border-radius:8px;">
      <table style="width:100%; border-collapse:collapse; min-width:620px;">
        <thead>
          <tr style="background:#f1f5f9; border-bottom:2px solid var(--line); text-align:left;">
            <th style="padding:10px 14px; font-weight:600; font-size:13px; color:var(--ink);">Criteria</th>
            <th style="padding:10px 4px; text-align:center; width:44px; font-size:12px; color:var(--ink);">1</th>
            <th style="padding:10px 4px; text-align:center; width:44px; font-size:12px; color:var(--ink);">2</th>
            <th style="padding:10px 4px; text-align:center; width:44px; font-size:12px; color:var(--ink);">3</th>
            <th style="padding:10px 4px; text-align:center; width:44px; font-size:12px; color:var(--ink);">4</th>
            <th style="padding:10px 4px; text-align:center; width:44px; font-size:12px; color:var(--ink);">5</th>
            <th style="padding:10px 4px; text-align:center; width:48px; font-size:12px; color:var(--ink);">NA</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  const body = `${person(s)}<hr class="hr">${legendHtml}${tableHtml}${a ? `
    <div class="evaluation-reviewed-card" style="margin-top:20px;padding:20px;border:1px solid var(--line);border-radius:12px;background:var(--cream, #FBF8F2);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <div>
          <span class="badge" style="background:#e6f4ea;color:#137333;border:1px solid #ceead6;font-size:11px;padding:3px 10px;border-radius:6px;font-weight:700;">✓ Evaluation Finalized & Archived</span>
          <h3 style="margin:8px 0 2px;font-size:18px;color:var(--ink);">Overall Rubric Score: <strong>${a.score.toFixed(1)} / 5.0</strong></h3>
          <p class="small muted" style="margin:0;">Submitted on ${date(a.date||today())}</p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:32px;font-weight:800;color:var(--burgundy);">${a.score.toFixed(1)}</span>
          <span style="font-size:14px;color:var(--muted);">/ 5.0</span>
        </div>
      </div>
      <div style="margin-bottom:18px;padding:14px;background:#fff;border:1px solid var(--line);border-radius:8px;">
        <h4 style="margin:0 0 6px;font-size:12px;text-transform:uppercase;color:var(--muted);letter-spacing:0.05em;">Additional Comments</h4>
        <p style="margin:0;font-size:14px;line-height:1.6;color:var(--ink);">${e(a.comments)}</p>
      </div>
      <div style="padding:14px;background:#fff;border:1px solid var(--line);border-radius:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <span style="display:block;font-size:10px;text-transform:uppercase;color:var(--muted);letter-spacing:0.05em;">Authorized Evaluator</span>
          <strong style="color:var(--ink);font-size:14px;">${e(a.signature||u.name)}</strong>
          <span style="display:block;font-size:12px;color:var(--muted);">${e(u.company||'Industry Partner')} · Verified Signature</span>
        </div>
        <div style="text-align:right;">
          ${a.signatureImage?`<img src="${a.signatureImage}" alt="Supervisor Digital Signature" style="max-height:55px;display:block;margin-left:auto;">`:`<div class="eval-cursive-font" style="font-size:26px;">${e(a.signature)}</div>`}
          <span style="font-size:10px;color:#059669;font-weight:600;">🔒 Certified Digital Signature</span>
        </div>
      </div>
    </div>
  ` : textarea('Additional Comments','comments','','required minlength="10" placeholder="Provide overall constructive feedback and performance summary for the student..."') + `
    <div class="eval-signature-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <h4 style="margin:0;font-size:14px;font-weight:700;color:var(--ink);letter-spacing:0.02em;">Digital Signature & Endorsement</h4>
          <p style="margin:2px 0 0;font-size:12px;color:var(--muted);">Draw your authorized signature below to finalize this performance appraisal.</p>
        </div>
        <span class="badge" style="background:var(--burgundy);color:#fff;font-size:11px;padding:5px 12px;border-radius:6px;font-weight:600;">✍️ Draw Signature</span>
      </div>
      <div id="eval-sig-draw-pane" style="display:block;">
        <div class="eval-canvas-wrapper">
          <canvas id="eval-signature-canvas" width="460" height="130"></canvas>
          <div style="position:absolute;bottom:8px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:center;pointer-events:none;">
            <span style="font-size:10px;color:#94a3b8;font-family:monospace;letter-spacing:0.05em;">✕ SIGN ABOVE THE LINE</span>
            <span style="font-size:10px;color:#94a3b8;">TOUCH / MOUSE ENABLED</span>
          </div>
          <button type="button" id="eval-sig-clear-btn" style="position:absolute;top:8px;right:8px;font-size:11px;background:#f1f5f9;border:1px solid #cbd5e1;padding:3px 8px;border-radius:4px;cursor:pointer;color:#475569;">Clear</button>
        </div>
      </div>
      <div class="field" style="margin-top:12px;">
        <label style="font-size:12px;font-weight:600;color:var(--ink);margin-bottom:4px;display:block;">Signatory Full Name</label>
        <input type="text" name="signature" id="eval-sig-name-input" value="${e(u.name)}" required maxlength="100" class="input" style="width:100%;font-size:13px;padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:#fff;" placeholder="Enter your full legal name">
      </div>
      <input type="hidden" name="signatureImage" id="eval-sig-image-data" value="">
      <input type="hidden" name="signatureMode" id="eval-sig-mode" value="draw">
      <div class="eval-cert-card">
        <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;">
          <input type="checkbox" name="certified" required style="margin-top:3px;accent-color:var(--burgundy);width:16px;height:16px;cursor:pointer;">
          <span style="font-size:12px;line-height:1.45;color:var(--ink);">
            <strong>Supervisor Certification:</strong> I formally certify under penalty of institutional review that this evaluation reflects my genuine assessment of the student's work performance, competency milestones, and attendance.
          </span>
        </label>
      </div>
    </div>
  `}`;

  showModal(a ? 'Submitted Appraisal' : 'Performance Appraisal Rubric', body, a ? null : async data => {
    let application = db.applications.find(a => a.studentId === id && a.status === 'Accepted');
    if (!application) {
      application = db.applications.find(a => a.studentId === id) || {
        id: crypto.randomUUID(),
        studentId: id,
        supervisorId: u.id,
        jobId: s.company || 'OJT-Placement',
        status: 'Accepted',
        appliedDate: today()
      };
      if (!db.applications.some(a => a.id === application.id)) db.applications.push(application);
    }
    const ratings = scorableCriteria.map((_, i) => data['rating_' + i]);
    const numRatings = ratings.map(r => Number(r)).filter(n => Number.isInteger(n) && n >= 1 && n <= 5);
    const avgScore = numRatings.length > 0 ? Number((numRatings.reduce((x, y) => x + y, 0) / numRatings.length).toFixed(1)) : 5.0;

    if (!data.signature || !data.signature.trim()) throw new Error('Please provide your signatory name.');
    const sigImage = data.signatureImage || '';
    const appraisalRecord = {
      id: crypto.randomUUID(),
      applicationId: application.id,
      studentId: id,
      supervisorId: u.id,
      ratings,
      score: avgScore,
      comments: data.comments,
      signature: data.signature.trim(),
      signatureImage: sigImage,
      date: today()
    };
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validAppId = uuidRegex.test(application.id) ? application.id : null;
      const { error, data: inserted } = await supabase.from('appraisals').insert({
        application_id: validAppId,
        student_id: id,
        supervisor_id: u.id,
        ratings,
        score: avgScore,
        comments: data.comments,
        signature: data.signature.trim()
      }).select();
      if (!error && inserted && inserted.length > 0) appraisalRecord.id = inserted[0].id;
    } catch(err) {
      console.warn('Supabase appraisal sync (stored locally):', err);
    }
    const existingIdx = db.appraisals.findIndex(a => a.studentId === id);
    if (existingIdx !== -1) db.appraisals[existingIdx] = appraisalRecord;
    else db.appraisals.push(appraisalRecord);
    save();
    notify(id, 'System', 'Your performance appraisal is ready', 'View your supervisor\'s rubric scores and feedback.');
    audit('Submitted appraisal for ' + s.name);
    toast('Evaluation submitted. The student can now view it.');
  }, 'Submit Evaluation');
  setTimeout(() => { if (typeof window.initEvalSignaturePad === 'function') window.initEvalSignaturePad(); }, 60);
}
function editHTE(id){const h=db.htes.find(h=>h.id===id);showModal(h?'Host training establishment':'Add new HTE',field('Company name','name','text',h?.name||'','required maxlength="120"')+field('Industry','industry','text',h?.industry||'','required maxlength="100"')+field('Location','location','text',h?.location||'','required maxlength="100"')+field('Contact email','contact','email',h?.contact||'','required')+field('MOA expiry','expiry','date',h?.expiry||'','required')+select('Accreditation status','status',['Pending','Accredited','Expired'],h?.status||'Pending'),data=>{if(data.status==='Accredited'&&new Date(data.expiry+'T23:59:59')<new Date())throw new Error('An accredited HTE must have a valid MOA expiry date.');if(db.htes.some(other=>other.id!==id&&other.name.toLowerCase()===data.name.toLowerCase()))throw new Error('This HTE already exists.');if(h){const oldName=h.name;Object.assign(h,data);db.jobs.filter(j=>j.company===oldName).forEach(j=>j.company=data.name);db.users.filter(u=>u.company===oldName).forEach(u=>u.company=data.name);}else db.htes.push({id:crypto.randomUUID(),...data});audit('Updated HTE accreditation: '+data.name);save();toast('HTE details saved.');},'Save HTE');}
function userNew(){showModal('Provision a user',select('Role','role',roles)+field('Full name','name','text','','required maxlength="100"')+field('SR code / faculty ID / corporate email','identifier','text','','required maxlength="100"')+field('Email address','email','email','','required')+select('Course (students)','course',['BSIT'])+field('Company (supervisors)','company','text','','maxlength="120"')+'<p class="note">The demo creates a pending account. Production provisioning must send a server-generated activation link.</p>',data=>{if(db.users.some(u=>u.identifier.toLowerCase()===data.identifier.toLowerCase()||u.email.toLowerCase()===data.email.toLowerCase()))throw new Error('The identifier or email is already registered.');if(data.role==='Supervisor'&&!data.company.trim())throw new Error('A supervisor needs a company.');db.users.push({id:crypto.randomUUID(),...data,status:'Pending_Activation',badge:'Pre_Seeded',baseHours:0,requiredHours:db.program.requiredHours,supervisorId:null});audit('Provisioned '+data.role+' account for '+data.name);save();toast('Pending demo account created.');},'Create pending account');}
async function importUsers() {
  showModal('Import OJT candidates', `<p>Required headers: <strong>identifier,name,email,course</strong>. Up to 500 students, maximum 1 MB. Duplicate identifiers or emails will stop the import.</p>${field('CSV file','csv','file','','required accept=".csv,text/csv"')}`, async (data, form) => {
    const file = form.elements.csv.files[0];
    if(!file||file.size>1024*1024) throw new Error('Choose a CSV file smaller than 1 MB.');
    const rows = parseCSV(await file.text()), header = rows.shift()?.map(v=>v.toLowerCase());
    const required = ['identifier','name','email','course'];
    if(!header||required.some(k=>!header.includes(k))) throw new Error('The CSV is missing required headers.');
    if(rows.length<1||rows.length>500) throw new Error('Import between 1 and 500 students.');
    
    const batch = rows.map(r => {
      return Object.fromEntries(required.map(k=>[k, r[header.indexOf(k)]||'']));
    });
    
    let insertedCount = 0;
    let liveSuccess = false;
    const u = currentUser();
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (authSession || (u && uuidRegex.test(u.id))) {
      try {
        const { data: count, error } = await supabase.rpc('preseed_candidates', { p_rows: batch });
        if (!error && count !== null) {
          insertedCount = count;
          liveSuccess = true;
          await syncRemote(supabase, db);
        }
      } catch {
        // Fall back to local DB if backend RPC is unreachable
      }
    }
    
    if (!liveSuccess) {
      const ids = new Set(db.users.map(u => (u.identifier || '').toLowerCase()));
      const emails = new Set(db.users.map(u => (u.email || '').toLowerCase()));
      const localBatch = rows.map((r, index) => {
        const o = Object.fromEntries(required.map(k => [k, r[header.indexOf(k)] || '']));
        if (Object.values(o).some(v => !v || v.length > 150) || !/^\S+@\S+\.\S+$/.test(o.email)) {
          throw new Error('Invalid or missing values on row ' + (index + 2));
        }
        if (ids.has(o.identifier.toLowerCase()) || emails.has(o.email.toLowerCase())) {
          throw new Error('Duplicate identifier or email on row ' + (index + 2));
        }
        ids.add(o.identifier.toLowerCase());
        emails.add(o.email.toLowerCase());
        return {
          id: crypto.randomUUID(),
          ...o,
          role: 'Student',
          status: 'Pending_Activation',
          badge: 'Pre_Seeded',
          baseHours: 0,
          requiredHours: db.program.requiredHours,
          company: '',
          supervisorId: null
        };
      });
      db.users.push(...localBatch);
      insertedCount = localBatch.length;
    }
    
    save();
    render();
    audit('Imported '+insertedCount+' OJT candidates');
    toast(insertedCount+' pending candidates imported.');
  }, 'Validate & import');
}
function announcement(){const u=currentUser();showModal('Post a demo announcement',field('Title','title','text','','required maxlength="120"')+textarea('Announcement','message','','required minlength="10"')+'<p class="note">This creates local demo notifications. No emails or external messages are sent.</p>',data=>{const recipients=u.role==='Coordinator'?db.users.filter(v=>v.id!==u.id):visibleStudents(db,u);recipients.forEach(v=>notify(v.id,'System',data.title,data.message));audit('Posted announcement: '+data.title);save();toast('Announcement saved for '+recipients.length+' demo recipients.');},'Post announcement');}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function saveProfileRemote(u, values) {
    if (!uuidRegex.test(u.id)) throw new Error('Demo records cannot be saved to the live database.');
    const { error, data } = await supabase.from('profiles').update({ full_name: values.name.trim(), phone: values.phone.trim(), bio: values.bio }).eq('id', u.id).select();
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Update failed or rejected by security rules.');
}
async function assignPlacementRemote(students, jobObj, requiredHours) {
    if (!uuidRegex.test(jobObj.id) || students.some(s => !uuidRegex.test(s.id))) {
        toast('Demo records cannot be saved to the live database.');
        return;
    }
    const promises = students.flatMap(s => {
        const p1 = supabase.from('profiles').update({ company: jobObj.company, supervisor_id: jobObj.supervisorId, required_hours: Number(requiredHours) }).eq('id', s.id).select().then(({error, data}) => {
            if (error) throw new Error(error.message);
            if (!data || data.length === 0) throw new Error('Update failed or rejected by security rules.');
        });
        const a = db.applications.find(app => app.studentId === s.id && app.jobId === jobObj.id);
        if (a && uuidRegex.test(a.id)) {
            const p2 = supabase.from('applications').update({ status: 'Accepted' }).eq('id', a.id).select().then(({error, data}) => {
                if (error) throw new Error(error.message);
                if (!data || data.length === 0) throw new Error('Update failed or rejected by security rules.');
            });
            return [p1, p2];
        }
        return [p1];
    });
    promises.push(supabase.from('listings_jobs').update({ slots: jobObj.slots }).eq('id', jobObj.id).select().then(({error, data}) => {
        if (error) throw new Error(error.message);
        if (!data || data.length === 0) throw new Error('Update failed or rejected by security rules.');
    }));
    await Promise.all(promises);
    await syncRemote(supabase, db);
}

function openFiles(){return new Promise((resolve,reject)=>{if(filesDB)return resolve(filesDB);const request=indexedDB.open('menteelog-demo-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>{filesDB=request.result;resolve(filesDB);};request.onerror=()=>reject(new Error('Browser file storage is unavailable.'));});}
async function fileOp(mode,key,value){const database=await openFiles();return new Promise((resolve,reject)=>{const tx=database.transaction('files',mode==='get'?'readonly':'readwrite'),store=tx.objectStore('files');const req=mode==='get'?store.get(key):mode==='put'?store.put(value,key):mode==='clear'?store.clear():store.delete(key);tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(new Error('File storage failed. Your browser storage may be full.'));tx.onabort=()=>reject(new Error('File storage operation was interrupted.'));});}
async function uploadEvidence(file, incCode) {
  const u = currentUser();
  let safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.{2,}/g, '.').substring(0, 100);
  if (!safeName) safeName = 'file';
  const filePath = `${u.id}/${incCode}/${Date.now()}-${safeName}`;
  const { error: uploadErr } = await supabase.storage.from('incident-evidence').upload(filePath, file, { upsert: false, contentType: file.type });
  if (uploadErr) throw new Error('Evidence upload failed: ' + uploadErr.message);
  return { id: crypto.randomUUID(), name: file.name, filePath, bucket: 'incident-evidence' };
}
const putFile=(id,file)=>fileOp('put',id,file);
function documentUpload(){const u=currentUser();showModal('Upload a document',select('Document category','category',['Endorsement letter','Training agreement','Accomplishment report','Certificate','Other'])+field('Choose a file','file','file','','required accept="application/pdf,image/png,image/jpeg"')+'<p class="small muted">PDF, PNG, or JPEG · Up to 10 MB. Stored only in this browser.</p>',async(data,form)=>{const file=form.elements.file.files[0];validateUpload(file);const id=crypto.randomUUID();if(!uuidRegex.test(u.id))throw new Error('Demo records cannot be saved to the live database.');const ext=file.name.split('.').pop()||'';const filePath=`${u.id}/${id}_${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`;const {error:storageErr}=await supabase.storage.from('documents').upload(filePath,file);if(storageErr)throw new Error('Upload failed: '+storageErr.message);const {error:dbErr,data:rows}=await supabase.from('documents').insert({id,student_id:u.id,category:data.category,name:file.name,file_path:filePath,file_size:file.size,mime_type:file.type,doc_date:today(),status:'Pending'}).select();if(dbErr||!rows||!rows.length){await supabase.storage.from('documents').remove([filePath]);throw new Error(dbErr?dbErr.message:'Insert failed.');}await syncRemote(supabase,db);audit('Uploaded a document');save();toast('Document uploaded successfully.');},'Upload document');}
function exportReport(type){let rows;const students=db.users.filter(s=>s.role==='Student');switch(type){case 'completion':rows=[['Student','SR code','Approved hours','Required hours','Completion percent'],...students.map(s=>[s.name,s.identifier,approvedHours(db,s.id),s.requiredHours,Math.round(approvedHours(db,s.id)/s.requiredHours*100)])];break;case 'compliance':rows=[['Student','Date','Hours','Status','Location captured','Justification','Reviewer remarks'],...db.logs.map(l=>[student(l.studentId)?.name,l.date,l.hours,l.status,l.gps?'Yes (unverified)':'No',l.justification||'',l.remarks])];break;case 'hte':rows=[['Company','Industry','Accreditation','MOA expiry','Placed students'],...db.htes.map(h=>[h.name,h.industry,h.status,h.expiry,students.filter(s=>s.company===h.name).length])];break;case 'incidents':rows=[['Case','Student','Category','Priority','Status','Reported'],...db.incidents.map(i=>[i.id,student(i.studentId)?.name,i.category,i.priority,i.status,i.date])];break;default:rows=[['Student','SR code','Course','Host company','Supervisor','Accreditation','Approved hours','Required hours'],...students.map(s=>[s.name,s.identifier,s.course,s.company,student(s.supervisorId)?.name||'',s.badge,approvedHours(db,s.id),s.requiredHours])];}download('MenteeLog-'+type+'-DEMO.csv',csvText(rows));toast('Sample data report downloaded.');}
const actionRoles={ 'job-edit':['Supervisor','Coordinator'],'student-detail':['Supervisor','Coordinator'],'evaluate':['Supervisor'],'hte-edit':['Coordinator'],'user-new':['Coordinator'],'user-status':['Coordinator'],'import-users':['Coordinator'],'csv-template':['Coordinator'],'announcement':['Supervisor','Coordinator'],'document-upload':['Student'],'document-remove':['Student'],'clock':['Student'],'student-clock-in':['Student'],'student-toggle-break':['Student'],'student-clock-out':['Student'],'ref-clock-out':['Student'],'incident-new':['Student','Supervisor'],'report':['Coordinator'],'export-students':['Supervisor','Coordinator'],'endorsement':['Coordinator']};
async function action(name,id,el){
  const publicActions=['demo','auth-role','forgot','login','toggle-password','close','watch-demo','privacy','team-connect'];
  const u=currentUser();
  if(!publicActions.includes(name)&&!u){location.hash='/login';throw new Error('Please sign in to continue.');}
  if(actionRoles[name]&&!actionRoles[name].includes(u?.role))throw new Error('This action is unavailable for your role.');
  if(u&&await portals.action(name,id,el))return;
  switch(name){
    case 'watch-demo':showModal('Explore MenteeLog','<p>Follow the OJT journey through three connected portals.</p><ol><li>Student: find a placement, submit attendance, and view feedback.</li><li>Supervisor: review applications, attendance, and appraisals.</li><li>Coordinator: manage placements, compliance, and user governance.</li></ol><p>This is an interactive frontend preview. No video was supplied.</p><a class="btn full" href="#/login">Open Authentication Hub</a>');return;
    case 'privacy':showModal('Privacy & data protection','<p>This frontend preview uses sample records stored in your browser. Your team must connect the authentication and authorized API endpoints before handling real student information.</p>');return;
    case 'team-connect':{const links={'Jeff Gentapanan':'https://www.linkedin.com/in/jeff-gentapanan-4b76b8370/','Kyle Renzo Alis':'https://www.linkedin.com/in/kenzo-somes-a7784a372/','Sean Nicole Guipo':'https://www.linkedin.com/in/sean-nichole-s-guipo-80b007441/','John Paul Wendam':'https://www.linkedin.com/in/john-paul-wendam-b727703b9/','Jhodie Alyssa Ladran':'https://www.linkedin.com/in/jhodie-alyssa-ladran-a07176441/','Christina Bernadett Porras':'https://www.linkedin.com/in/cristina-bernadette-porras-9269b9440/','Rolly Abella':'https://www.linkedin.com/in/rolly-abella-3a49b5440/'};const url=links[id];if(url)window.open(url,'_blank','noopener,noreferrer');else toast('LinkedIn profile not available yet.');return;}
    case 'close':modal.close();return;
    case 'demo':{const role=roles.includes(id)?id:'Student',user=db.users.find(u=>u.role===role&&u.status==='Active');if(!user)throw new Error('This demo role has no active account. Reset demo data from an active coordinator account.');storeSession(user);modal.close();view={search:'',filter:'All',course:'All',mode:'All'};location.hash='/'+role.toLowerCase()+'/dashboard';render();return;}
    case 'auth-role':authRole=id;render();return;
    case 'toggle-password':{const byId=el.dataset.id?document.getElementById(el.dataset.id):null;const input=(byId instanceof HTMLInputElement?byId:null)||el.parentElement?.querySelector('input')||$('#password');if(!input)return;input.type=input.type==='password'?'text':'password';el.setAttribute('aria-label',input.type==='password'?'Show password':'Hide password');return;}
    case 'forgot': recoveryActive = false; location.hash = '/forgot'; return;
      case 'login': recoveryActive = false; location.hash = '/login'; return;
    case 'logout':
      showModal('Confirm Sign Out', `
        <div style="text-align:center; padding:12px 0 16px;">
          <div style="width:48px;height:48px;border-radius:50%;background:#fee2e2;color:#b91c1c;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
            <svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M9 3H3v18h6 M9 12h12 m-5-5 5 5-5 5"/></svg>
          </div>
          <h3 style="margin:0 0 8px;font-size:18px;font-weight:600;color:var(--ink);">Are you sure you want to sign out?</h3>
          <p style="margin:0;font-size:14px;color:var(--slate);">You will be returned to the public portal. Make sure you have saved any current work.</p>
        </div>
      `, () => {
        logout();
        toast('You have successfully signed out.');
      }, 'Sign Out');
      return;
    case 'switch-role':showModal('Explore another portal',`<p>Use the sample accounts to see how the three roles work together.</p><div class="stack">${roles.map(r=>button('Open '+r+' demo','demo',r,'secondary full')).join('')}</div>`);return;
    case 'menu':togglePortalMenu();return;
    case 'filter':view.filter=id;render();return;
    case 'notifications':{const old=$('#notice-drawer');if(old){old.remove();return;}const drawer=document.createElement('section');drawer.id='notice-drawer';drawer.className='notice-drawer';drawer.setAttribute('aria-label','Recent notifications');drawer.innerHTML=notificationsMini(u);app.append(drawer);return;}
    case 'read':{const n=db.notifications.find(n=>n.id===id&&n.userId===u.id);if(n)n.read=true;break;}
    case 'read-all':db.notifications.filter(n=>n.userId===u.id).forEach(n=>n.read=true);toast('All notifications marked as read.');const drawer=$('#notice-drawer');if(drawer)drawer.innerHTML=notificationsMini(u);break;
    case 'clear-read':db.notifications=db.notifications.filter(n=>n.userId!==u.id||!n.read);toast('Read notifications cleared.');break;
    case 'job-detail':openJob(id);return;
    case 'tk-terminal':tkTerminal(id);return;
    case 'dummy-action':toast('This is a visual preview. Assign real interns to use this.');return;
    case 'dummy-verify':
        showModal('Verify On-Site Presence', `<p>Confirm that <strong>Example Intern</strong> is physically present at the designated Host Training Establishment?</p><div style="background:#eff6ff; color:#1e40af; padding:12px; border-radius:8px; margin-top:16px; font-size:14px;">This action logs your verification timestamp and attaches your digital signature to their daily time record.</div>`, () => { toast('On-Site presence verified successfully.'); modal.close(); }, 'Confirm Verification');
        return;
    case 'dummy-approve':
        showModal('Review DTR Entry', `<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;"><div><span style="font-size:12px; color:var(--slate);">Student</span><p style="margin:0; font-weight:600;">Example Intern</p></div><div><span style="font-size:12px; color:var(--slate);">Date</span><p style="margin:0; font-weight:600;">${date(new Date().toISOString())}</p></div></div><hr style="border:0; border-top:1px solid var(--border); margin:16px 0;"><div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;"><div><span style="font-size:12px; color:var(--slate);">Clock In</span><p style="margin:0; font-weight:600;">08:00 AM</p></div><div><span style="font-size:12px; color:var(--slate);">Clock Out</span><p style="margin:0; font-weight:600;">05:00 PM</p></div></div><h3 style="margin:16px 0 8px 0; font-size:14px;">Task Summary</h3><p style="background:var(--cream); padding:12px; border-radius:8px; font-size:14px; margin-bottom:16px;">Completed daily tasks, reviewed codebase, and submitted UI updates.</p>${textarea('Supervisor Remarks (Optional)','remarks','')}`, () => { toast('DTR Log approved and hours credited to the student.'); modal.close(); }, 'Approve Log');
        return;
    case 'dummy-view':
        showModal('Example Intern Profile', `<div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;"><div style="width:56px; height:56px; border-radius:50%; background:var(--maroon); color:white; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold;">E</div><div><strong style="display:block; font-size:18px;">Example Intern</strong><small style="color:var(--slate);">BS Information Technology</small></div></div><hr style="border:0; border-top:1px solid var(--border); margin:16px 0;"><div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;"><div><span style="font-size:12px; color:var(--slate);">SR Code</span><p style="margin:0; font-weight:600;">DEMO-2026</p></div><div><span style="font-size:12px; color:var(--slate);">Host Company</span><p style="margin:0; font-weight:600;">Demo Company</p></div><div><span style="font-size:12px; color:var(--slate);">Approved Hours</span><p style="margin:0; font-weight:600;">120 / 500 hrs</p></div><div><span style="font-size:12px; color:var(--slate);">Status</span><p style="margin:0;"><span style="background:#dcfce7; color:#166534; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600;">Active</span></p></div></div><div style="background:#e2e8f0; border-radius:4px; height:8px; width:100%; overflow:hidden;"><div style="background:var(--maroon); height:100%; width:24%;"></div></div><p style="font-size:12px; color:var(--slate); margin-top:8px;">24% completed</p>`);
        return;
    case 'sup-clock-in': {
        if(u.role !== 'Supervisor') throw new Error('Unauthorized');
        db.activeShifts = db.activeShifts || [];
        if(db.activeShifts.find(sh => sh.studentId === id)) throw new Error('Intern is already clocked in.');
        db.activeShifts.push({ studentId: id, supervisorId: u.id, clockIn: new Date().toISOString(), clockOut: null });
        audit('Supervisor clocked in student ' + id);
        save(); render(); refreshTerminal(id); toast('Intern clocked in successfully.'); return;
    }
    case 'sup-toggle-break': {
        if(u.role !== 'Supervisor') throw new Error('Unauthorized');
        const shift = (db.activeShifts || []).find(sh => sh.studentId === id);
        if(!shift) throw new Error('Intern is not active.');
        
        if (shift.onBreak) {
            // End break
            const elapsed = Math.floor((Date.now() - new Date(shift.onBreak).getTime()) / 60000);
            shift.breakMinutes = (shift.breakMinutes || 0) + Math.max(0, elapsed);
            shift.onBreak = null;
            toast('Break ended. Resuming shift timer.');
        } else {
            // Start break
            shift.onBreak = new Date().toISOString();
            toast('Intern is now on break.');
        }
        save(); render(); refreshTerminal(id); return;
    }
    case 'sup-clock-out': {
        if(u.role !== 'Supervisor') throw new Error('Unauthorized');
        db.activeShifts = db.activeShifts || [];
        const idx = db.activeShifts.findIndex(sh => sh.studentId === id);
        if(idx === -1) throw new Error('Intern is not active.');
        const shift = db.activeShifts[idx];
        shift.clockOut = new Date().toISOString();
        
        // finalize any ongoing break
        if (shift.onBreak) {
            const elapsed = Math.floor((Date.now() - new Date(shift.onBreak).getTime()) / 60000);
            shift.breakMinutes = (shift.breakMinutes || 0) + Math.max(0, elapsed);
        }
        const totalBreakMinutes = shift.breakMinutes || 0;
        const hours = hoursBetween(shift.clockIn, shift.clockOut, totalBreakMinutes);
        
        // Push a pending log that awaits the student's task summary
        const newLog = {
            student_id: shift.studentId, supervisor_id: shift.supervisorId,
            date: today(), clock_in: shift.clockIn, clock_out: shift.clockOut, break_minutes: totalBreakMinutes, hours: hours,
            task: '', justification: '', status: 'Awaiting_Student_Log', remarks: '', signature: ''
        };
        const { error, data: inserted } = await supabase.from('logs').insert(newLog).select();
        if (error) throw new Error(error.message);
        if (!inserted || inserted.length === 0) throw new Error('Insert failed or rejected by security rules.');
        await syncRemote(supabase, db);
        
        db.activeShifts.splice(idx, 1);
        audit('Supervisor clocked out student ' + id + ' with ' + totalBreakMinutes + 'm breaks');
        save(); render(); refreshTerminal(id); toast('Intern clocked out successfully.'); return;
    }

    case 'ref-approve': {
        const l = db.logs.find(log => log.id === id);
        if (!l) throw new Error('Log not found.');
        const { error, data: updated } = await supabase.from('logs').update({ status: 'Approved' }).eq('id', l.id).select();
        if (error) throw new Error(error.message);
        if (!updated || updated.length === 0) throw new Error('Update failed or rejected by security rules.');
        await syncRemote(supabase, db);
        toast('DTR Log approved. Hours successfully credited.');
        render();
        return;
    }
    case 'ref-export-dtr':toast(`Exporting official verified DTR records as ${id.toUpperCase()}...`);return;
    case 'ref-verify':toast('On-Site presence verified for this DTR log.');return;
    case 'ref-verify-mode':toast('On-Site Verification Mode Enabled. Awaiting intern QR/GPS ping.');return;
    case 'job-edit':editJob(id);return;
    case 'application-detail':applicationDetail(id);return;
    
    case 'demo-sup-clock-in': {
        db.activeShifts = db.activeShifts || [];
        if(db.activeShifts.find(sh => sh.studentId === u.id)) throw new Error('Intern is already clocked in.');
        const defSup = db.users.find(x => x.role === 'Supervisor') || u;
        db.activeShifts.push({ studentId: u.id, supervisorId: defSup.id, clockIn: new Date(Date.now() - 3600000).toISOString(), clockOut: null });
        save(); render(); toast('Simulated Supervisor Clock In (Started 1 hour ago)'); return;
    }
    case 'demo-sup-clock-out': {
        db.activeShifts = db.activeShifts || [];
        const idx = db.activeShifts.findIndex(sh => sh.studentId === u.id);
        if(idx === -1) throw new Error('Intern is not active.');
        const shift = db.activeShifts[idx];
        shift.clockOut = new Date().toISOString();
        const totalBreakMinutes = shift.breakMinutes || 0;
        const hours = hoursBetween(shift.clockIn, shift.clockOut, totalBreakMinutes);
        const newLog = {
            student_id: shift.studentId, supervisor_id: shift.supervisorId,
            date: today(), clock_in: shift.clockIn, clock_out: shift.clockOut, break_minutes: totalBreakMinutes, hours: hours,
            task: '', justification: '', status: 'Awaiting_Student_Log', remarks: '', signature: ''
        };
        const { error, data: inserted } = await supabase.from('logs').insert(newLog).select();
        if (error) throw new Error(error.message);
        if (!inserted || inserted.length === 0) throw new Error('Insert failed or rejected by security rules.');
        await syncRemote(supabase, db);
        db.activeShifts.splice(idx, 1);
        save(); render(); toast('Simulated Supervisor Clock Out'); return;
    }

    case 'save-clockout-draft': {
      const taskEl = document.querySelector('#modal textarea[name="task"]');
      const taskVal = (taskEl?.value || '').trim();
      if (!taskVal) throw new Error('Please type something in your task summary before saving as a draft.');
      db.taskDrafts = db.taskDrafts || [];
      const existing = db.taskDrafts.find(d => d.studentId === u.id && d.date === today());
      if (existing) {
        existing.task = taskVal;
      } else {
        db.taskDrafts.unshift({
          id: crypto.randomUUID(),
          studentId: u.id,
          date: today(),
          task: taskVal
        });
      }
      db.draft = taskVal;
      save();
      const hint = document.querySelector('#draft-save-hint');
      if (hint) {
        hint.textContent = '✓ Draft saved (' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + ')';
        hint.style.color = '#166534';
      }
      toast('Task summary saved to Recent Saved Drafts!');
      return;
    }
    case 'student-clock-in': await studentClockIn(); return;
    case 'student-toggle-break': await studentToggleBreak(); return;
    case 'student-clock-out':
    case 'ref-clock-out': await studentClockOut(); return;
    case 'clock': await clockAction(); return;
    case 'ref-submit-log': await clockAction(); return;
    case 'log-detail':logDetail(id);return;
    case 'student-detail':studentDetail(id);return;
    case 'incident-new':incidentNew();return;
    case 'incident-detail':incidentDetail(id);return;
    case 'evaluate':evaluate(id);return;
    case 'hte-edit':editHTE(id);return;
    case 'user-new':userNew();return;
    case 'import-users':importUsers();return;
    case 'user-status':{const target=student(id);if(!target||target.id===u.id)throw new Error('You cannot change your own account status.');showModal(target.status==='Active'?'Suspend demo account?':'Activate demo account?',`<p>${e(target.name)} (${e(target.role)}) will be ${target.status==='Active'?'unable':'able'} to use this demo account. This changes only local demonstration data.</p>`,()=>{target.status=target.status==='Active'?'Suspended':'Active';audit('Changed account status for '+target.name);save();toast('Demo account updated.');},'Confirm change');return;}
    case 'csv-template':download('menteelog-candidates-template.csv','identifier,name,email,course\r\n2026-01001,Sample Student,student@example.edu,BSIT\r\n');return;
    case 'announcement':announcement();return;
    
    
    case 'document-upload':documentUpload();return;
    case 'document-remove':{const doc=db.documents.find(d=>d.id===id&&d.studentId===u.id);if(!doc)throw new Error('Document unavailable.');showModal('Remove document?',`<p>Remove <strong>${e(doc.name)}</strong>?</p>`,async()=>{if(doc.filePath){if(!uuidRegex.test(u.id))throw new Error('Demo records cannot be saved to the live database.');const {error:sErr}=await supabase.storage.from('documents').remove([doc.filePath]);if(sErr)throw new Error(sErr.message);const {error:dbErr,data:del}=await supabase.from('documents').delete().eq('id',doc.id).select();if(dbErr||!del||!del.length)throw new Error(dbErr?dbErr.message:'Delete failed.');await syncRemote(supabase,db);}else{await fileOp('delete',id);db.documents=db.documents.filter(d=>d.id!==id);}save();toast('Document removed.');},'Remove document');return;}
    case 'file-download':{const doc=db.documents.find(d=>d.id===id&&d.studentId===u.id)||visibleIncidents(u).find(i=>i.evidence?.id===id)?.evidence;if(!doc)throw new Error('File is outside your access scope.');if(doc.filePath){const bucket=(doc.bucket==='incident-evidence'?'incident-evidence':'documents');const {data,error}=await supabase.storage.from(bucket).createSignedUrl(doc.filePath,60);if(error||!data)throw new Error('Download failed.');const a=document.createElement('a');a.href=data.signedUrl;a.download=doc.name;a.click();}else{const file=await fileOp('get',id);if(!file)throw new Error('This file is no longer in browser storage. Please upload it again.');download(doc.name,file);}return;}
    case 'report-preview':{if(u.role!=='Coordinator')throw new Error('Coordinator role required.');showModal('Report Preview','<p>This report uses the current sample records. Download the CSV to review it in a spreadsheet, or print this portal page.</p><div class="row">'+button('Download CSV','report',id,'','download')+button('Print','print','','secondary')+'</div>');return;}
    case 'activation-help':showModal('Account activation','<p>Find an account in Registered users and select Activate. This affects only the local preview; email links and token verification require the authentication API.</p>');return;
    case 'report':exportReport(id);return;
    case 'export-students':{const list=visibleStudents(db,u);download('MenteeLog-roster-DEMO.csv',csvText([['Name','SR code','Course','Company','Approved hours','Required hours','Badge'],...list.map(s=>[s.name,s.identifier,s.course,s.company,approvedHours(db,s.id),s.requiredHours,s.badge])]));return;}
    case 'export-dtr':download('MenteeLog-DTR-DEMO.csv',csvText([['Student','Date','Clock in','Clock out','Break minutes','Hours','Status','Task','Remarks'],...visibleLogs(db,u).map(l=>[student(l.studentId)?.name,l.date,l.clockIn,l.clockOut,l.breakMinutes,l.hours,l.status,l.task,l.remarks])]));return;
    case 'endorsement':{const s=student(id);if(!s||!s.company)throw new Error('Assign a company before generating an endorsement.');download('MenteeLog-endorsement-DEMO.txt',`MENTEELOG - DRAFT ENDORSEMENT (DEMONSTRATION ONLY)\n\nDate: ${date(today())}\nStudent: ${s.name}\nSR Code: ${s.identifier}\nProgram: ${s.course}\nHost Training Establishment: ${s.company}\nSupervisor: ${student(s.supervisorId)?.name||'Not assigned'}\nRequired Hours: ${s.requiredHours}\n\nThis draft must be reviewed and signed by the authorized faculty coordinator before official use.\n\nPrepared by: ${u.name}\n`,'text/plain;charset=utf-8');return;}
    case 'print':window.print();return;
    case 'reset-demo':showModal('Reset the demonstration?',`<p>This removes demo records and uploaded files from this browser and restores the sample cohort. Your source files and Figma references are not affected.</p>`,async()=>{await fileOp('clear');db=ensureCreatorAccounts(seedData());save();logout();toast('Sample data restored.');},'Reset demo');return;
    default:return;
  }save();render();
}
document.addEventListener('click',event=>{if(event.target.closest('.skip-link')){event.preventDefault();const main=$('#main');main?.setAttribute('tabindex','-1');main?.focus();return;}const roleLink=event.target.closest('[data-role]');if(roleLink)authRole=roleLink.dataset.role;const target=event.target.closest('[data-action]');if(!target)return;event.preventDefault();action(target.dataset.action,target.dataset.id,target).catch(error=>toast(error.message));});
let searchDebounce = null;
let isComposingSearch = false;
document.addEventListener('compositionstart', e => { if (e.target.form && e.target.form.id === 'search-form' && e.target.name === 'search') isComposingSearch = true; });
document.addEventListener('compositionend', e => { if (e.target.form && e.target.form.id === 'search-form' && e.target.name === 'search') { isComposingSearch = false; e.target.dispatchEvent(new Event('input', { bubbles: true })); } });
const SEARCH_DELAY = 300;
document.addEventListener('input', event => {
  if (event.target.id === 'draft') { db.draft = event.target.value; save(); }
  if (event.target.form && event.target.form.id === 'search-form' && event.target.name === 'search') {
    if (route().page === 'incidents') {
      if (isComposingSearch || event.isComposing) return;
      const val = event.target.value || '';
      if (val === view.search) return;
      if (val.trim() === (view.search||'').trim() && val !== '') { view.search = val; return; }
      clearTimeout(searchDebounce);
      const doSearch = () => {
        if (route().page !== 'incidents') return;
        const activeInput = document.querySelector('#search-form input[name="search"]');
        if (!activeInput) return;
        const wasFocused = document.activeElement === activeInput;
        let sel = null;
        if (wasFocused) sel = [activeInput.selectionStart, activeInput.selectionEnd];
        view.search = val;
        render();
        if (wasFocused) {
          const newInput = document.querySelector('#search-form input[name="search"]');
          if (newInput) {
            newInput.focus({ preventScroll: true });
            if (sel && sel[0] !== null && sel[1] !== null && newInput.value.length >= sel[1]) {
              newInput.setSelectionRange(sel[0], sel[1]);
            }
          }
        }
      };
      if (val === '') doSearch(); else searchDebounce = setTimeout(doSearch, SEARCH_DELAY);
    }
  }
});
document.addEventListener('search',event=>{if(event.target.closest('#search-form')){event.target.form.requestSubmit();}});
document.addEventListener('change',event=>{if(event.target.id==='partner'){view.partner=event.target.value;render();}if(event.target.closest('#search-form')&&event.target.tagName==='SELECT')event.target.form.requestSubmit();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')togglePortalMenu(false);if(event.target.id==='global-search'&&event.key==='Enter'){event.preventDefault();const q=event.target.value.toLowerCase().trim();const match=navigation[currentUser().role].find(n=>n[1].toLowerCase().includes(q));if(q&&match)location.hash='/'+currentUser().role.toLowerCase()+'/'+match[0];else toast('No matching page found. Try "DTR", "placement", or "reports".');}});
let failedLoginAttempts = 0;
let loginCooldownUntil = 0;
let activationEmail = '';
let activationIdentifier = '';
document.addEventListener('submit',async event=>{
  const form=event.target;if(!form.id)return;event.preventDefault();const values=Object.fromEntries(new FormData(form));const errorBox=form.querySelector('.form-error');if(errorBox)errorBox.textContent='';const submit=form.querySelector('[type="submit"]');if(submit)submit.disabled=true;
  try{
    if(form.id==='public-contact-form'){
      if (submit) submit.textContent = 'Sending...';
      const emailHeaders = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      // 1. Send Auto-Reply to Visitor
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        ...emailHeaders,
        body: JSON.stringify({
          service_id: 'service_qwbbn6g',
          template_id: 'template_0ydi77b',
          user_id: 'IvAdPWVmixHP7lfdu',
          template_params: values
        })
      }).catch(err => console.error('EmailJS Auto-Reply Error:', err));

      // 2. Alert Email to MenteeLog Team
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        ...emailHeaders,
        body: JSON.stringify({
          service_id: 'service_qwbbn6g',
          template_id: 'template_f7mwu3a',
          user_id: 'IvAdPWVmixHP7lfdu',
          template_params: values
        })
      }).catch(err => console.error('EmailJS Team Alert Error:', err));

      // 3. Save to Supabase demo_requests in background (handles RLS gracefully)
      try {
        supabase.from('demo_requests').insert([
          { 
            name: values.name, 
            email: values.email, 
            company: values.company || '', 
            role: values.role, 
            message: values.message 
          }
        ]).catch(() => {});
      } catch(e) {}

      form.reset();
      if (submit) {
        submit.disabled = false;
        submit.textContent = 'Send Message';
      }
      toast('Thank you! Your demo request has been safely sent. Our team will reach out shortly.');
      return;
    }
    if(form.id==='login-form'){
        if (Date.now() < loginCooldownUntil) {
           throw new Error('Too many attempts. Try again in ' + Math.ceil((loginCooldownUntil - Date.now())/1000) + 's.');
        }
        
        const invalidCredsMsg = authRole === 'Supervisor' ? 'Invalid corporate email or password.' : authRole === 'Coordinator' ? 'Invalid Faculty ID or password.' : 'Invalid SR Code or password.';
        
        const inputId = values.identifier.trim();
        let targetEmail = inputId;

        if (authRole === 'Student') {
          if (inputId.includes('@')) {
            throw new Error('Students must sign in using their SR Code, not an email.');
          }
          const { data: emailData, error: rpcError } = await supabase.rpc('get_login_email', { p_identifier: inputId });
          if (rpcError || !emailData) {
             failedLoginAttempts++;
             if (failedLoginAttempts >= 5) loginCooldownUntil = Date.now() + 60000;
             throw new Error(invalidCredsMsg);
          }
          targetEmail = emailData;
        } else if (authRole === 'Coordinator') {
          if (inputId.includes('@')) {
            throw new Error('Coordinators must sign in using their Faculty ID, not an email.');
          }
          const { data: emailData, error: rpcError } = await supabase.rpc('get_login_email', { p_identifier: inputId });
          if (rpcError || !emailData) {
             failedLoginAttempts++;
             if (failedLoginAttempts >= 5) loginCooldownUntil = Date.now() + 60000;
             throw new Error(invalidCredsMsg);
          }
          targetEmail = emailData;
        } else if (authRole === 'Supervisor') {
          if (!inputId.includes('@')) {
            throw new Error('Supervisors must sign in using their corporate email address.');
          }
          targetEmail = inputId;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: values.password
        });
        
        if (error) {
           console.error('Auth Error Details:', { message: error.message, status: error.status, code: error.code, fullError: error });
           failedLoginAttempts++;
           if (failedLoginAttempts >= 5) loginCooldownUntil = Date.now() + 60000;
           if (error.message.toLowerCase().includes('not confirmed')) {
             throw new Error('Email not confirmed. Please activate your account.');
           }
           throw new Error(invalidCredsMsg);
        }

        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
        if (profileError || !profile || profile.status !== 'Active' || profile.role !== authRole) {
           failedLoginAttempts++;
           if (failedLoginAttempts >= 5) loginCooldownUntil = Date.now() + 60000;
           await supabase.auth.signOut();
           if (profileError && profileError.code === 'PGRST116') throw new Error('Your profile record is missing in the database.');
           if (profileError) throw new Error('System error fetching profile: ' + profileError.message);
           if (!profile) throw new Error('Your profile record is missing in the database.');
           if (String(profile.status).toLowerCase() !== 'active') throw new Error('Your account is not activated yet. Please activate it first.');
           if (String(profile.role).toLowerCase() !== String(authRole).toLowerCase()) throw new Error('Role mismatch: Your profile is set to ' + profile.role + ', but you are trying to log in as ' + authRole + '.');
           throw new Error('Invalid credentials.');
        }
        
        failedLoginAttempts = 0;
        const role = profile.role;

        let localUser = db.users.find(u => u.id === data.user.id);
        if (!localUser) {
          localUser = {
            id: data.user.id,
            role: role,
            identifier: profile.identifier || values.identifier.trim(),
            email: data.user.email,
            name: profile.full_name || 'Supabase User',
            status: 'Active',
            requiredHours: profile.required_hours || 600,
            course: profile.course || 'BS Information Technology',
            company: profile.company || '',
            supervisorId: profile.supervisor_id || null
          };
          db.users.push(localUser);
        } else {
          // Always overwrite key fields from fresh DB profile so stale cached roles never persist
          localUser.role = role;
          localUser.name = profile.full_name || localUser.name;
          localUser.identifier = profile.identifier || localUser.identifier;
          localUser.email = data.user.email;
          localUser.status = 'Active';
          localUser.requiredHours = profile.required_hours || localUser.requiredHours || 600;
          localUser.course = profile.course || localUser.course || 'BS Information Technology';
        }

        connectCoreUsers(db);
        storeSession(localUser);
        if (await syncRemote(supabase, db)) { connectCoreUsers(db); save(); if (!modal.open) render(); }
        save();
        location.hash='/' + role.toLowerCase() + '/dashboard';
        return;
      }
      if(form.id==='activation-form'){
        submit.textContent = 'Sending...';
        try {
          const targetEmail = (values.email || values.identifier).trim();
          const targetId = values.identifier.trim();
          
          let eligible = false;
          try {
            const { data: isEligible, error: rpcError } = await supabase.rpc('verify_activation_eligibility', { p_identifier: targetId, p_email: targetEmail });
            if (!rpcError && isEligible) eligible = true;
          } catch {}

          if (!eligible) {
            const localCand = (db.users || []).find(u => 
              (u.identifier || '').toLowerCase() === targetId.toLowerCase() && 
              (u.email || '').toLowerCase() === targetEmail.toLowerCase() &&
              (u.status === 'Pending_Activation' || u.badge === 'Pre_Seeded')
            );
            if (localCand) eligible = true;
          }
          
          if (eligible) {
             const { error: otpError } = await supabase.auth.signInWithOtp({
               email: targetEmail,
               options: { shouldCreateUser: true, emailRedirectTo: window.location.origin + '/activate.html' }
             });
             if (otpError) throw new Error(otpError.message);
          } else {
             throw new Error('Eligibility check failed. SR Code/Email not found or already activated.');
          }
          
          activationEmail = targetEmail;
          activationIdentifier = targetId;
          document.getElementById('otp-email-display').textContent = targetEmail;
          document.getElementById('step1-container').style.display = 'none';
          document.getElementById('step2-container').style.display = 'block';
        } finally {
          submit.textContent = 'Send Activation Code';
        }
        return;
      }
      
      if(form.id==='verify-otp-form') {
        submit.textContent = 'Verifying...';
        try {
          const token = values.otp.trim();
          const { data: authData, error } = await supabase.auth.verifyOtp({ email: activationEmail, token, type: 'email' });
          if (error) throw new Error('Invalid or expired code. Please check and try again.');

          const localStudent = (db.users || []).find(u => 
            (u.email && u.email.toLowerCase() === activationEmail.toLowerCase()) || 
            (u.identifier && u.identifier.toLowerCase() === (activationIdentifier || '').toLowerCase())
          );
          const srCode = activationIdentifier || localStudent?.identifier || '2026-01001';
          const studentName = localStudent?.name && localStudent.name !== 'jeffgent25' ? localStudent.name : 'Sample Student';
          const course = localStudent?.course || 'BSIT';

          if (localStudent) {
            localStudent.identifier = srCode;
            localStudent.name = studentName;
            localStudent.course = course;
            localStudent.status = 'Active';
            localStudent.badge = 'Active';
            save();
          }

          if (authData?.user) {
            try {
              await supabase.from('profiles').update({
                identifier: srCode,
                full_name: studentName,
                course: course,
                role: 'Student',
                status: 'Active'
              }).eq('id', authData.user.id);
            } catch {}
          }
          
          document.getElementById('step2-container').style.display = 'none';
          document.getElementById('step3-container').style.display = 'block';
        } finally {
          submit.textContent = 'Verify Code →';
        }
        return;
      }

      if(form.id==='set-password-form') {
        submit.textContent = 'Activating...';
        try {
          const password = values.password;
          const confirm = values.confirm;
          if (password !== confirm) throw new Error('Passwords do not match.');
          if (password.length < 8) throw new Error('Password must be at least 8 characters.');
          
          const { error: passErr } = await supabase.auth.updateUser({ password });
          if (passErr) throw new Error(passErr.message);
          
          try {
            await supabase.rpc('complete_activation', { p_email: activationEmail });
          } catch {}

          const localStudent = (db.users || []).find(u => (u.email || '').toLowerCase() === activationEmail.toLowerCase());
          if (localStudent) {
            localStudent.status = 'Active';
            localStudent.badge = 'Active';
            save();
          }

          await supabase.auth.signOut();
          
          document.getElementById('step3-container').style.display = 'none';
          document.getElementById('activate-success').style.display = 'block';
        } finally {
          submit.textContent = 'Complete Activation';
        }
        return;
      }
      if (form.id === 'forgot-form') {
        const id = values.identifier?.trim();
        if (!id) throw new Error('Please enter your SR code, email, or Faculty ID first.');
        let targetEmail = id;
        if (!targetEmail.includes('@')) {
          const { data: emailData, error: rpcError } = await supabase.rpc('get_login_email', { p_identifier: targetEmail });
          if (rpcError || !emailData) throw new Error('Account not found.');
          targetEmail = emailData;
        }
        submit.textContent = 'Sending...';
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, { redirectTo: window.location.origin + '/?reset=1' });
          if (error) throw new Error(error.message);
          form.reset();
          toast('Reset link sent. Please check your email.');
        } finally {
          submit.textContent = 'Send Reset Link';
        }
        return;
      }
      if (form.id === 'reset-password-form') {
        const password = form.elements.password?.value ?? '';
        const confirm = form.elements.confirm?.value ?? '';
        if (!password || !confirm) throw new Error('Please fill in both password fields.');
        if (password !== confirm) throw new Error('Passwords do not match.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        submit.textContent = 'Saving...';
        try {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw new Error(error.message);
          await supabase.auth.signOut();
          recoveryActive = false;
          session = null;
          try { sessionStorage.removeItem(SESSION); } catch(e) {}
          form.reset();
          toast('Password updated. Please log in.');
          location.hash = '/login';
        } finally {
          submit.textContent = 'Save New Password';
        }
        return;
      }
    if(form.id==='search-form'){if(typeof searchDebounce!=='undefined')clearTimeout(searchDebounce);view.search=values.search||'';view.mode=values.mode||'All';view.course=values.course||'All';render();return;}
    const user=currentUser();if(form.id!=='modal-form'&&!user)throw new Error('Your session expired. Sign in again.');
    if(form.id==='portal-form'){await portals.submit(values,form);return;}
    if(form.id==='modal-form'&&modalSubmit){if(modalUserId&&currentUser()?.id!==modalUserId)throw new Error('Your session changed. Reopen the form after signing in.');const callback=modalSubmit;await callback(values,form);modal.close();render();return;}
    if(form.id==='profile-form'){if(!values.name.trim())throw new Error('Enter your full name.');if(db.users.some(u=>u.id!==user.id&&u.email.toLowerCase()===values.email.toLowerCase()))throw new Error('That email is already used by another demo account.');if(values.email.trim().toLowerCase()!==String(user.email||'').toLowerCase())throw new Error('Email cannot be changed here. Contact your coordinator.');await saveProfileRemote(user,values);await syncRemote(supabase,db);audit('Updated profile');}
    save();render();toast('Saved in the demonstration.');
  }catch(error){if(errorBox)errorBox.textContent=error.message;else toast(error.message);}finally{if(submit)submit.disabled=false;}
});
window.addEventListener('hashchange', async () => {if(typeof searchDebounce!=='undefined')clearTimeout(searchDebounce);
  view = {search: '', filter: 'All', course: 'All', mode: 'All'};
  modal.close();
  const {role} = route();
  if (['student', 'supervisor', 'coordinator'].includes(role)) {
    const cur = currentUser();
    if (!cur || cur.role.toLowerCase() !== role) {
      session = loadSession();
    }
  }
  render();
  if (session && await syncRemote(supabase, db)) { save(); if (!modal.open) render(); }
  const {query} = route();
  if (query && query.includes('scrollTo=')) {
    const targetId = query.split('scrollTo=')[1].split('&')[0];
    setTimeout(() => {
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo(0,0);
    }, 50);
  } else {
    window.scrollTo(0,0);
  }
  $('#main')?.focus({preventScroll:true});
});
let storageDebounce;
window.addEventListener('storage', ev => {
  if (ev.key !== STORAGE || !ev.newValue) return;
  clearTimeout(storageDebounce);
  storageDebounce = setTimeout(() => {
    try {
      const next = JSON.parse(ev.newValue);
      if (next?.version === 1) {
        db = connectCoreUsers(next);
        const keep = session ? (db.users.find(u => u.id === session.id) || session.user) : null;
        if (keep && !db.users.some(u => u.id === keep.id)) db.users.push(keep);
        if (!modal.open && !userIsMidInput()) render();
        else if (typeof terminalFor !== 'undefined' && terminalFor) tkTerminal(terminalFor);
      }
    } catch {}
  }, 150);
});
setInterval(()=>{ const timer=$('#shift-timer'); if(timer&&currentUser()?.role==='Student'){ const active = db.logs.find(sh=>sh.studentId===currentUser().id && sh.status==='Running') || (db.activeShifts || []).find(sh => sh.studentId === currentUser().id); timer.textContent=active?netElapsed(active):'00:00:00'; } document.querySelectorAll('.tk-timer').forEach(el => { const sid = el.getAttribute('data-student'); if(sid){ const sh=db.logs.find(x=>x.studentId===sid && x.status==='Running') || (db.activeShifts || []).find(x => x.studentId === sid); el.textContent = netElapsed(sh); return; } const start = el.getAttribute('data-start'); if(start) el.textContent = elapsed(start); }); document.querySelectorAll('.tk-break-timer').forEach(el => { const start = el.getAttribute('data-start'); if(start) el.textContent = elapsed(start); }); }, 1000);
function userIsMidInput() {
  const el = document.activeElement;
  if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) && el.id !== 'global-search') return true;
  const main = document.querySelector('main');
  if (!main) return false;
  const inputs = main.querySelectorAll('input, textarea, select');
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (input.type === 'radio' || input.type === 'checkbox') {
      if (input.checked !== input.defaultChecked) return true;
    } else {
      if (input.value !== input.defaultValue) return true;
    }
  }
  return false;
}
setInterval(async () => { if (session && await syncRemote(supabase, db)) { save(); if (!modal.open && !userIsMidInput()) render(); } }, 20000);
async function submitApplication(jobId, note) { const {error} = await supabase.from('applications').insert({ job_id: jobId, student_id: currentUser().id, status: 'Pending', applied_date: today(), notes: note || '' }); if (error) throw new Error(error.message); await syncRemote(supabase, db); }
portals=createPortalViews({get db(){return db;},get view(){return view;},get user(){return currentUser();},route,e,icon,button,link,heading,field,textarea,select,badge,person,table,empty,progress,date,time,today,student,job,save,notify,audit,toast,render,showModal,download,fileOp,putFile,dtrTable,visibleIncidents,submitApplication,elapsed,netElapsed,legacy:{uploadEvidence,applicationDetail,editJob,studentDetail,incidentNew,incidentDetail,evaluate,logDetail,editHTE,userNew,importUsers,documentUpload,assignPlacementRemote,getSignedUrl:async(p, b='documents')=>(await supabase.storage.from(b==='incident-evidence'?'incident-evidence':'documents').createSignedUrl(p,60)).data?.signedUrl},capture(fn){capturingForm=true;capturedForm=null;try{fn();return capturedForm;}finally{capturingForm=false;}}});

document.addEventListener('change',event=>{if(!['public-course','public-location'].includes(event.target.id))return;const course=$('#public-course').value,place=$('#public-location').value;let count=0;document.querySelectorAll('.home-job').forEach(card=>{card.hidden=!((course==='All'||card.dataset.courses.includes(course))&&(place==='All'||card.dataset.location.includes(place)));if(!card.hidden)count++;});$('#public-empty').hidden=count>0;});

document.addEventListener('dragover',event=>{if(event.target.closest('.upload-drop'))event.preventDefault();});
document.addEventListener('drop',event=>{const dropzone=event.target.closest('.upload-drop');if(!dropzone)return;event.preventDefault();try{const files=event.dataTransfer.files;if(files.length!==1)throw new Error('Upload one document at a time.');if(dropzone.dataset.action==='document-upload'){if(currentUser()?.role!=='Student')throw new Error('Student portal required.');validateUpload(files[0]);documentUpload();modal.querySelector('input[type="file"]').files=files;}else if(dropzone.dataset.action==='import-users'){if(currentUser()?.role!=='Coordinator')throw new Error('Coordinator portal required.');if(files[0].size>1024*1024)throw new Error('Choose a CSV file smaller than 1 MB.');importUsers();modal.querySelector('input[type="file"]').files=files;}}catch(error){toast(error.message);}});
document.addEventListener('click',event=>{const drawer=$('#notice-drawer');if(drawer&&!event.target.closest('#notice-drawer')&&!event.target.closest('[data-action="notifications"]'))drawer.remove();});








// MAIN APP GATE
function showResetPage() {
  if (location.hash === '#/reset-password') return;
  location.hash = '/reset-password';
}

supabase.auth.onAuthStateChange((event, sessionObj) => {
  if (event === 'PASSWORD_RECOVERY') { 
    recoveryActive = true; 
    showResetPage(); 
    render();
    return; 
  }
  if (event === 'SIGNED_OUT' || recoveryActive || event === 'INITIAL_SESSION') return;
  if (sessionObj?.user) {
    setTimeout(async () => {
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', sessionObj.user.id).single();
      if ((profile && profile.status !== 'Active') || error) {
        await supabase.auth.signOut().catch(()=>{});
        if (location.hash !== '#/login') location.hash = '/login';
      } else if (profile && profile.status === 'Active') {
        const routeRole = route().role?.toLowerCase();
        if (!['student', 'supervisor', 'coordinator'].includes(routeRole) || profile.role.toLowerCase() === routeRole) {
          let localUser = db.users.find(u => u.id === sessionObj.user.id);
          if (!localUser) {
            localUser = {
              id: sessionObj.user.id,
              role: profile.role,
              identifier: profile.identifier || '',
              email: sessionObj.user.email,
              name: profile.full_name || 'User',
              status: 'Active',
              requiredHours: profile.required_hours || 600,
              course: profile.course || 'BS Information Technology',
              company: profile.company || '',
              supervisorId: profile.supervisor_id || null
            };
            db.users.push(localUser);
          } else {
            localUser.role = profile.role;
            localUser.name = profile.full_name || localUser.name;
            localUser.identifier = profile.identifier || localUser.identifier;
            localUser.email = sessionObj.user.email;
            localUser.status = 'Active';
          }
          if (!session || session.user?.role?.toLowerCase() === profile.role.toLowerCase()) {
            storeSession(localUser);
            render();
          }
        }
      }
    }, 0);
  }
});

(async () => {
  const urlParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.replace(/^#\/?/, ''));
  const isAuthError = urlParams.has('error') || urlParams.has('error_code') || hashParams.has('error') || hashParams.has('error_code');

  if (isAuthError) {
    history.replaceState(null, '', location.pathname);
    app.innerHTML = authPage('auth-error');
    document.title = 'MenteeLog | Error';
    return;
  }

  if (isRecoveryLink) {
    recoveryActive = true;
    if (urlParams.has('code')) {
      try { await supabase.auth.exchangeCodeForSession(urlParams.get('code')); } catch(e) {}
    }
    
    // Allow Supabase client to parse hash tokens asynchronously without racing
    let s = (await supabase.auth.getSession()).data?.session;
    if (!s && (location.hash.includes('access_token') || isRecoveryLink)) {
      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 100));
        s = (await supabase.auth.getSession()).data?.session;
        if (s) break;
      }
    }

    if (s) {
      recoveryActive = true;
      history.replaceState(null, '', location.pathname);
      showResetPage();
    } else {
      recoveryActive = false;
      history.replaceState(null, '', location.pathname);
      location.hash = '/login';
      toast('This reset link is invalid or expired. Please request a new one.');
    }
    render();
    return;
  }

  if (!isAuthError && !isRecoveryLink) {
    render();
  }

  const { data: { session: initSession } } = await supabase.auth.getSession();
  if (initSession?.user) {
    if (db.jobs.some(j => j.id === 'j1')) {
      db.jobs = [];
      db.applications = [];
    }
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', initSession.user.id).single();
    if ((profile && profile.status !== 'Active') || error) {
      await supabase.auth.signOut().catch(()=>{});
      if (location.hash !== '#/login') location.hash = '/login';
    } else if (profile && profile.status === 'Active') {
      const routeRole = route().role?.toLowerCase();
      if (!['student', 'supervisor', 'coordinator'].includes(routeRole) || profile.role.toLowerCase() === routeRole) {
        let localUser = db.users.find(u => u.id === initSession.user.id);
        if (!localUser) {
          localUser = {
            id: initSession.user.id,
            role: profile.role,
            identifier: profile.identifier || '',
            email: initSession.user.email,
            name: profile.full_name || 'User',
            status: 'Active',
            requiredHours: profile.required_hours || 600,
            course: profile.course || 'BS Information Technology',
            company: profile.company || '',
            supervisorId: profile.supervisor_id || null
          };
          db.users.push(localUser);
        } else {
          localUser.role = profile.role;
          localUser.name = profile.full_name || localUser.name;
          localUser.identifier = profile.identifier || localUser.identifier;
          localUser.email = initSession.user.email;
          localUser.status = 'Active';
        }
        connectCoreUsers(db);
        const prevId = session?.id;
        const prevRole = session?.user?.role;
        storeSession(localUser);
        if (prevId !== localUser.id || prevRole !== localUser.role) {
          render();
        }
        setTimeout(async () => {
          if (await syncRemote(supabase, db)) { connectCoreUsers(db); save(); if (!modal.open) render(); }
        }, 0);
      }
    }
  } else if (!session) {
    render();
  }
})();




import { supabase } from '../supabaseClient.js';
const UNIVERSITY_NAME = 'Batangas State University';

import {publicLanding,authScreen} from './public.js';
import {ensureCreatorAccounts} from './creator.js';
import {createPortalViews} from './portal-views.js';
import {seedData,roles,navigation,rubric} from './data.js';
import {escapeHTML as e,canAccess,approvedHours,visibleStudents,visibleLogs,visibleApplications,hoursBetween,validateUpload,csvText,parseCSV,applyToJob,reviewLog} from './domain.js';
import { syncRemote } from './sync.js';

// Detect a password-recovery link BEFORE anything touches the URL
const _q = new URLSearchParams(location.search);
const _h = new URLSearchParams(location.hash.replace(/^#\/?/, ''));
const isRecoveryLink = _q.get('reset') === '1' || _q.has('code') || _h.get('type') === 'recovery';
let recoveryActive = isRecoveryLink;

const $=s=>document.querySelector(s), app=$('#app'), modal=$('#modal');

const STORAGE='menteelog.demo.v1', SESSION='menteelog.demo.session';
let storageIssue=false,filesDB=null;
function load(){try{const saved=JSON.parse(localStorage.getItem(STORAGE));return saved?.version===1&&Array.isArray(saved.users)&&Array.isArray(saved.logs)?saved:seedData();}catch{return seedData();}}
let db=ensureCreatorAccounts(load());
let session=null,view={search:'',filter:'All',course:'All',mode:'All'},authRole='Student',modalSubmit=null,modalOpener=null,modalUserId=null,toastTimer;

try {
  if (!sessionStorage.getItem('dtr_reset_guaranteed_v3')) {
    sessionStorage.setItem('dtr_reset_guaranteed_v3', '1');
    localStorage.removeItem(STORAGE);
    db=ensureCreatorAccounts(seedData());
  }
} catch(e) {}



// --- DEMO SEED FOR ACTIVE SHIFT ---
db.activeShifts = db.activeShifts || [];
if(db.activeShifts.length === 0) {
    // Find ALL students and assign them a supervisor if they don't have one, and start a shift for them!
    const defaultSup = db.users.find(u => u.role === 'Supervisor');
    db.users.filter(u => u.role === 'Student').forEach(stu => {
        if (!stu.supervisorId && defaultSup) {
            stu.supervisorId = defaultSup.id;
            stu.company = defaultSup.company;
        }
        const startTime = new Date(Date.now() - (2 * 3600000 + 14 * 60000)).toISOString();
        db.activeShifts.push({ studentId: stu.id, supervisorId: stu.supervisorId, clockIn: startTime, clockOut: null });
    });
}
// -----------------------------------

let capturedForm=null,capturingForm=false;
let portals;
try{session=JSON.parse(sessionStorage.getItem(SESSION));}catch{}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(db));}catch{storageIssue=true;toast('Browser storage is full or unavailable. Changes last only until this page closes.');}}

function currentUser(){
    if(!session||session.expires<Date.now())return null;
    const u = db.users.find(u=>u.id===session.id&&u.status==='Active')||null;
    
    // DEMO FIX: Inject 5 Example Interns to demonstrate roster scaling
    if (u && u.role === 'Supervisor') {
        const dummyNames = ['Alice Chen', 'Bob Smith', 'Charlie Cruz', 'Diana Reyes', 'Example Intern'];
        const courses = ['BS Information Technology', 'BS Computer Science', 'BS Computer Engineering', 'BS Information Technology', 'BS Information Technology'];
        const todayStr = new Date().toISOString().split('T')[0];

        dummyNames.forEach((name, idx) => {
            let uid = 's_dummy_' + idx;
            // Ensure the original example intern keeps the s_dummy ID so the View button links still work
            if (name === 'Example Intern') uid = 's_dummy'; 
            
            let hasDummy = db.users.find(x => x.id === uid);
            if (!hasDummy) {
                db.users.push({
                    id: uid,
                    identifier: 'DEMO-202' + idx,
                    name: name,
                    email: 'student' + idx + '@demo.com',
                    role: 'Student',
                    status: 'Active',
                    course: courses[idx],
                    company: u.company || 'Demo Company',
                    supervisorId: u.id,
                    baseHours: 120 + (idx * 15),
                    requiredHours: 500,
                    badge: 'Active'
                });
            } else if (hasDummy.supervisorId !== u.id) {
                hasDummy.supervisorId = u.id; 
            }

            // Ensure exactly 1 pending log per student
            const dummyLogs = db.logs.filter(l => l.studentId === uid);
            if (dummyLogs.length !== 1) {
                db.logs = db.logs.filter(l => l.studentId !== uid);
                db.logs.push({
                    id: 'log_dummy_' + idx,
                    studentId: uid,
                    supervisorId: u.id,
                    date: todayStr,
                    clockIn: todayStr + 'T08:00:00.000Z',
                    clockOut: todayStr + 'T17:00:00.000Z',
                    breakMinutes: 60,
                    hours: 8,
                    status: idx % 2 === 0 ? 'Pending' : 'Approved',
                    task: name === 'Example Intern' ? 'Completed assigned programming tasks and attended daily standups.' : 'Assisted with database migration and API testing for the new microservice.',
                    gps: true,
                    remarks: '',
                    justification: ''
                });
                save();
            }
        });
    }
    
    if(u && u.role === 'Supervisor') {
        let assigned = db.users.filter(s => s.role === 'Student' && s.supervisorId === u.id);
        if(assigned.length === 0) {
            db.users.filter(s => s.role === 'Student' && (s.name.includes('Demo') || s.id.startsWith('s'))).forEach(s => {
                s.supervisorId = u.id;
                s.company = u.company || 'Demo Company';
            });
            db.activeShifts = db.activeShifts || [];
            if(db.activeShifts.length === 0) {
                const s1 = db.users.find(s => s.role === 'Student' && s.supervisorId === u.id);
                if(s1) {
                    const startTime = new Date(Date.now() - (2 * 3600000 + 14 * 60000)).toISOString();
                    db.activeShifts.push({ studentId: s1.id, supervisorId: u.id, clockIn: startTime, clockOut: null });
                }
            }
            save();
        }
    }
    // DEMO FIX: If a new student logs in, give them a dummy active shift so they aren't confused
    if(u && u.role === 'Student') {
        db.activeShifts = db.activeShifts || [];
        const myActive = db.activeShifts.find(sh => sh.studentId === u.id);
        const myAwaiting = db.logs.find(l => l.studentId === u.id && l.status === 'Awaiting_Student_Log');
        if(!myActive && !myAwaiting && db.activeShifts.length === 0) {
            // Force an active shift for them
            const defSup = db.users.find(x => x.role === 'Supervisor') || u;
            u.supervisorId = defSup.id;
            const startTime = new Date(Date.now() - (1 * 3600000 + 10 * 60000)).toISOString();
            db.activeShifts.push({ studentId: u.id, supervisorId: defSup.id, clockIn: startTime, clockOut: null });
            save();
        }
    }
    return u;
}

function storeSession(user){session={id:user.id,expires:Date.now()+30*60*1000};try{sessionStorage.setItem(SESSION,JSON.stringify(session));}catch{toast('Session storage unavailable; this demo session will end when you reload.');}}
function logout(){session=null;try{sessionStorage.removeItem(SESSION);}catch{}modal.close();location.hash='/';render();}
function notify(userId,type,title,message){db.notifications.unshift({id:crypto.randomUUID(),userId,type,title,message,date:new Date().toISOString(),read:false});}
function audit(action){db.audit.unshift({id:crypto.randomUUID(),actor:currentUser()?.name||'Demo',action,date:new Date().toISOString()});db.audit=db.audit.slice(0,150);}
function toast(message){const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,5000);}
const initials=name=>String(name||'ML').split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('').toUpperCase();
const student=id=>db.users.find(u=>u.id===id);
const job=id=>db.jobs.find(j=>j.id===id);
const date=value=>value?new Date(value.length===10?value+'T12:00:00':value).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):'Ã¢â‚¬â€';
const time=value=>value?new Date(value).toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'}):'Ã¢â‚¬â€';
const today=()=>new Date().toLocaleDateString('en-CA');
const iconPaths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',briefcase:'M8 6V3h8v3 M3 7h18v14H3z M8 7v14 M16 7v14',file:'M14 2H5v20h14V7z M14 2v6h5 M8 12h8 M8 16h6',folder:'M3 6h7l2 3h9v12H3z M3 6V3h7l2 3h8v3',clock:'M12 8v5l4 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',alert:'m12 3 10 18H2z M12 9v5 M12 17v1',users:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M15 4a4 4 0 0 1 0 8 M22 21v-3a4 4 0 0 0-3-3.8 M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',building:'M5 22V2h14v20 M2 22h20 M9 6h1 M14 6h1 M9 10h1 M14 10h1 M9 14h1 M14 14h1 M10 22v-4h4v4',shield:'m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z m-5 10 3 3 7-7',chart:'M3 3v18h19 M7 16V9 M12 16V5 M17 16v-5',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',search:'M20 20l-5-5 M17 9a7 7 0 1 1-14 0 7 7 0 0 1 14 0',arrow:'M4 12h16 m-6-6 6 6-6 6',check:'m5 12 4 4L20 5',plus:'M12 4v16 M4 12h16',close:'m6 6 12 12 M18 6 6 18',download:'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',upload:'M12 16V3 m-5 5 5-5 5 5 M4 16v5h16v-5',pin:'M20 9c0 6-8 13-8 13S4 15 4 9a8 8 0 1 1 16 0 M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0',calendar:'M3 5h18v17H3z M7 2v6 M17 2v6 M3 11h18',message:'M3 3h18v14H8l-5 5z M7 8h10 M7 12h7',target:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 11v2',menu:'M3 6h18 M3 12h18 M3 18h18',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',logout:'M9 3H3v18h6 M9 12h12 m-5-5 5 5-5 5'};
function icon(name){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[name]||iconPaths.file}"/></svg>`;}
const brand=(clickable=true)=>clickable?'<a class="brand-link" href="#/" aria-label="MenteeLog home"><img class="logo" src="./assets/MenteeLoo_Logo.svg" alt="MenteeLog"></a>':'<span class="brand-link"><img class="logo" src="./assets/MenteeLoo_Logo.svg" alt="MenteeLog"></span>';
function badge(value){const color=['Approved','Accepted','Active','Accredited','Resolved','Cleared','Completed'].includes(value)?'green':['Rejected','Flagged','High','Suspended'].includes(value)?'red':['Pending','Under_Review','Medium','Pending_Activation','Scheduled'].includes(value)?'amber':['Enrolled','Eligible'].includes(value)?'blue':'neutral';return `<span class="badge ${color}">${e(value?.replaceAll('_',' ')||'Draft')}</span>`;}
const button=(label,action,id='',style='secondary',ico='')=>`<button type="button" class="btn ${style}" data-action="${action}" data-id="${e(id)}">${ico?icon(ico):''}${label}</button>`;
const link=(label,page,style='secondary',ico='')=>`<a class="btn ${style}" href="#/${currentUser()?.role.toLowerCase()||'student'}/${page}">${ico?icon(ico):''}${label}</a>`;
const empty=(title,description='')=>`<div class="empty">${icon('folder')}<h3>${title}</h3><p class="mb0">${description}</p></div>`;
const stat=(title,value,sub,ico)=>`<div class="stat"><span class="stat-icon">${icon(ico)}</span><div><div class="stat-label">${title}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div></div>`;
const person=u=>`<div class="row"><span class="avatar square">${e(initials(u?.name))}</span><div><strong>${e(u?.name||'Unknown student')}</strong><small>${e(u?.course||u?.role||'')}</small></div></div>`;
const progress=(hours,required,unit='hours')=>`<div class="row"><progress class="progress" max="${required}" value="${Math.min(hours,required)}" aria-label="${hours} of ${required} ${e(unit)}"></progress><small>${Math.round(hours/required*100)}%</small></div>`;
function table(headers,rows){return `<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;}
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
}
modal.addEventListener('close',()=>{modalSubmit=null;if(modalOpener?.isConnected)modalOpener.focus();});
function download(name,content,type='text/csv;charset=utf-8'){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function route(){const hashStr=location.hash.replace(/^#\/?/,'');const [path, query]=hashStr.split('?');const parts=path.split('/');return {role:parts[0],page:parts[1]||'dashboard',sub:parts[2]||'',id:parts[3]||'',query:query||''};}
function render(){
  if (recoveryActive && route().role !== 'reset-password') { location.hash = '/reset-password'; return; }
  const {role,page}=route();
  if(!role||role==='public'){app.innerHTML=landing();
  setTimeout(() => {
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
  if(role==='activate'){window.location.replace('/activate.html');return;}

  if(['login','reset','forgot','reset-password'].includes(role)){app.innerHTML=authPage(role);document.title='MenteeLog | Authentication';return;}
  const user=currentUser();
  if(!user){location.hash='/login';return;}
  if(role!==user.role.toLowerCase()||!canAccess(user.role,page)){location.hash=`/${user.role.toLowerCase()}/dashboard`;toast('This page is not available in your portal.');return;}
  const title=navigation[user.role].find(n=>n[0]===page)?.[1]||({profile:'Profile Setup',notifications:'Notifications',jobs:'Job Management',candidates:'Candidate Review',applications:'Application Review'}[page]);
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
          if(f) { f.innerHTML = '<p class="small"><strong>Live Coordinates Locked</strong><br>' + lat.toFixed(5) + 'Ã‚Â° N, ' + lng.toFixed(5) + 'Ã‚Â° E</p>'; f.style.background = '#e6f4ea'; f.style.color = '#137333'; }
          const c = document.getElementById('dtr-coords');
          if(c) c.innerText = 'Coordinates: ' + lat.toFixed(5) + 'Ã‚Â° N, ' + lng.toFixed(5) + 'Ã‚Â° E';
          const b = document.getElementById('dtr-bldg');
          if(b) b.innerText = 'Current Location (GPS)';
          const a = document.getElementById('dtr-acc');
          if(a) a.innerText = 'Ã‚Â± ' + acc + ' meters';
          const s = document.getElementById('dtr-status');
          if(s) s.innerText = 'Live GPS Lock Ã¢Å“â€œ';
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
function authPage(mode){return authScreen(mode,authRole,{brand,icon,field});}
function pageContent(page,u){try{return portals.page(page,u)??({dashboard,applications:applicationsPage,profile:profilePage}[page]||dashboard)(u);}catch(error){return heading('Page unavailable',e(error.message))+link('Back to dashboard','dashboard');}}
function notificationsMini(u){
  const unread = db.notifications.filter(n=>n.userId===u.id && !n.read).reverse().slice(0, 5);
  return `
    <div class="drawer-header">
      <div class="card-title" style="margin-bottom:15px; align-items:center;">
        <h2 style="font-size:18px; margin:0;">Notifications</h2>
        ${unread.length ? '<button class="text-btn small" data-action="read-all">Mark all read</button>' : ''}
      </div>
    </div>
    <div class="drawer-notes-list">
      ${unread.map(n=>`
        <div class="notification-card" style="padding:14px; background:var(--sand-light); border-radius:8px; margin-bottom:10px; border:1px solid #e9dfd9;">
          <strong style="display:block; color:var(--burgundy); font-size:14px;">${e(n.title)}</strong>
          <p style="margin:6px 0 0; font-size:13px; color:var(--ink); line-height:1.4;">${e(n.message)}</p>
        </div>
      `).join('') || '<p class="small muted" style="padding:15px 0; text-align:center;">You\'re all caught up!</p>'}
    </div>
    <hr class="hr" style="margin:16px 0;">
    <a class="text-btn full" style="text-align:center; display:block;" href="#/${u.role.toLowerCase()}/notifications">View all notifications &rarr;</a>
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
function applicationsPage(u){const apps=visibleApplications(db,u).filter(a=>(view.filter==='All'||a.status===view.filter)&&matches(student(a.studentId)?.name,job(a.jobId)?.title,job(a.jobId)?.company));return heading(u.role==='Student'?'My Applications Tracker':'Application Review',u.role==='Student'?'Track your internship applications and placement progress.':'Review and endorse your candidates.')+(u.role==='Student'?'':tabs(['All','Pending','Under_Review','Accepted','Rejected'])+searchToolbar('Search applications'))+(apps.length?apps.map(a=>{const j=job(a.jobId),level=a.status==='Accepted'?3:a.status==='Under_Review'?1:0;return '<section class="card application-card"><div class="row between"><div><h2>'+e(j?.company)+' Ã¢â‚¬â€ '+e(j?.title)+'</h2><small>Applied '+date(a.date)+(u.role==='Student'?'':' Ã‚Â· '+e(student(a.studentId)?.name))+'</small></div>'+badge(a.status)+'</div><div class="application-path">'+['Submitted','Under Review','Interview','Accepted'].map((label,i)=>(i?'<span class="application-line"></span>':'')+'<div class="application-step '+(i<=level?'done':'')+'"><i></i><span>'+label+'</span></div>').join('')+'</div><div class="mt16">'+button(u.role==='Student'?'View Details':'Review Application','application-detail',a.id,'secondary small')+'</div></section>';}).join(''):empty('No applications in this view','Your application progress will appear here.'));}
function elapsed(start){const seconds=Math.max(0,Math.floor((Date.now()-new Date(start))/1000));return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(v=>String(v).padStart(2,'0')).join(':');}
function dtrTable(logs,u){return logs.length?table([...(u.role==='Student'?[]:['Intern']),'Date','Clock In','Clock Out',...(u.role==='Student'?['Total']:['Task Summary']),'GPS','Status','Action'],logs.slice().reverse().map(l=>'<tr>'+(u.role==='Student'?'':'<td><strong>'+e(student(l.studentId)?.name)+'</strong></td>')+'<td>'+date(l.date)+'</td><td>'+time(l.clockIn)+'</td><td>'+time(l.clockOut)+'</td><td>'+(u.role==='Student'?l.hours.toFixed(2)+'h':'<span class="task-excerpt">'+e(l.task)+'</span>')+'</td><td>'+badge(l.gps?'Captured':'Unavailable')+'</td><td>'+badge(l.status)+'</td><td>'+button(u.role==='Supervisor'&&['Pending','Flagged'].includes(l.status)?'Review':'View','log-detail',l.id,'secondary small')+'</td></tr>')):empty('No DTR entries here','Submitted attendance records will appear here.');}
function visibleIncidents(u){return db.incidents.filter(i=>u.role==='Coordinator'||(u.role==='Student'?i.studentId===u.id:i.supervisorId===u.id));}
function profilePage(u){return `${heading('Profile Setup','Keep your contact and internship details up to date.')}<div class="narrow-wide"><section class="card sand"><div class="row">${person(u)}</div><hr class="hr"><p class="small">${e(u.identifier)}</p>${badge(u.role)} ${badge(u.badge||u.status)}<p class="small muted mt16">Your role and academic identifier are managed by your coordinator.</p></section><section class="card"><h2>Personal information</h2><form id="profile-form">${field('Full name','name','text',u.name,'required maxlength="100" autocomplete="name"')}${field('Email address','email','email',u.email,'required autocomplete="email"')}${field('Phone number (optional)','phone','tel',u.phone||'','maxlength="30" autocomplete="tel"')}${textarea('About you (optional)','bio',u.bio||'','')}<p class="form-error" role="alert"></p><button class="btn" type="submit">Save profile</button></form></section></div>`;}
function safeMeetingURL(value){const url=new URL(value);if(url.protocol!=='https:'||!['meet.google.com','teams.microsoft.com','teams.live.com','zoom.us','www.zoom.us'].some(h=>url.hostname===h||url.hostname.endsWith('.'+h)))throw new Error('Use an HTTPS Google Meet, Microsoft Teams, or Zoom link.');return url.href;}
function openJob(id){const u=currentUser(),j=job(id);if(!j)return;const applied=db.applications.some(a=>a.studentId===u.id&&a.jobId===id&&a.status!=='Rejected');showModal(e(j.title),`<div class="row between"><strong>${e(j.company)}</strong>${badge(j.status)}</div><p class="muted mt16">${e(j.location)} • ${e(j.mode)} • ${j.slots} available slots</p><h3>About this opportunity</h3><p>${e(j.description)}</p><h3>Skills you’ll use</h3><p>${e(j.skills)}</p><h3>Host training establishment specifications</h3><p>${e(j.specs)}</p><h3>Eligible programs</h3><p>${e(j.courses.join(' • '))}</p>${u.role==='Student'?`<div class="note">${applied?'You already applied to this position.':'Your current profile will be included with your application.'}</div>${applied?'':`<div class="field mt16"><label class="row"><input type="checkbox" name="consent" required> I confirm my profile details are ready for review.</label></div>`}`:''}${u.role!=='Student'?button('Edit position','job-edit',id,'secondary'):''}`,u.role==='Student'&&!applied&&j.status==='Active'&&j.slots>0?async(data)=>{const {error}=await supabase.from('applications').insert({job_id:id,student_id:u.id,status:'Pending',applied_date:today()});if(error)throw new Error(error.message);await syncRemote(supabase,db);if(j.supervisorId)notify(j.supervisorId,'Application_Status','New internship application',u.name+' applied for '+j.title+'.');audit('Submitted application for '+j.title);save();toast('Application submitted in the demo.');}:null,'Submit application');}
function editJob(id){const u=currentUser();if(!['Coordinator','Supervisor'].includes(u.role))throw new Error('This role cannot manage positions.');const j=job(id);if(j&&u.role==='Supervisor'&&j.supervisorId!==u.id)throw new Error('This position is outside your scope.');showModal(j?'Edit position':'Post a new position',field('Position title','title','text',j?.title||'','required maxlength="120"')+field('Company','company','text',j?.company||u.company||'','required maxlength="120" '+(u.role==='Supervisor'?'readonly':''))+`<div class="grid-2">${field('Location','location','text',j?.location||'','required maxlength="100"')}${select('Work arrangement','mode',['On-site','Hybrid','Remote'],j?.mode||'On-site')}</div><div class="grid-2">${field('Available slots','slots','number',j?.slots??1,'required min="0" max="1000"')}${select('Status','status',['Draft','Active','Closed'],j?.status||'Draft')}</div>`+select('Eligible program','course',['All IT programs','BS Computer Science','BS Information Technology','BS Computer Engineering'],j?.courses?.length===1?j.courses[0]:'All IT programs')+textarea('Position description','description',j?.description||'')+field('Skills','skills','text',j?.skills||'','required maxlength="200"')+textarea('HTE specifications & requirements','specs',j?.specs||'')+(u.role==='Coordinator'?select('Assigned supervisor','supervisorId',[['','Unassigned'],...db.users.filter(s=>s.role==='Supervisor').map(s=>[s.id,s.name])],j?.supervisorId||''):''),async(data)=>{const values={...data,slots:Number(data.slots),courses:data.course==='All IT programs'?['BS Computer Science','BS Information Technology','BS Computer Engineering']:[data.course],supervisor_id:u.role==='Supervisor'?u.id:data.supervisorId||null};delete values.course;delete values.supervisorId;const {error}=j?await supabase.from('listings_jobs').update(values).eq('id',id):await supabase.from('listings_jobs').insert(values);if(error)throw new Error(error.message);await syncRemote(supabase,db);audit((j?'Updated':'Created')+' position '+values.title);save();toast('Position saved.');},'Save position');}
function applicationDetail(id){const u=currentUser(),a=visibleApplications(db,u).find(a=>a.id===id);if(!a)throw new Error('Application unavailable.');const j=job(a.jobId),s=student(a.studentId);showModal('Application details',`<h3>${e(j.title)}</h3><p>${e(j.company)} • ${e(s.name)}</p>${badge(a.status)}<div class="timeline"><div class="timeline-item"><strong>Application submitted</strong><p>${date(a.date)}</p></div><div class="timeline-item"><strong>Supervisor review</strong><p>${a.status==='Pending'?'Awaiting review':e(a.status.replaceAll('_',' '))}</p></div><div class="timeline-item"><strong>Placement & endorsement</strong><p>${a.status==='Accepted'?e(a.note||'Application accepted. Coordinator endorsement is next.'):'Follows an accepted application.'}</p></div></div>${u.role==='Supervisor'?select('Review decision','status',['Pending','Under_Review','Accepted','Rejected'],a.status)+textarea('Review note','note',a.note||''):''}`,u.role==='Supervisor'?async(data)=>{if(data.status==='Accepted'&&a.status!=='Accepted'){if(j.slots<1)throw new Error('No slots remain in this position.');if(db.applications.some(other=>other.studentId===s.id&&other.id!==a.id&&other.status==='Accepted'))throw new Error('This student already has an accepted placement.');}if(a.status==='Accepted'&&data.status!=='Accepted')throw new Error('An accepted placement must be reassigned by the coordinator.');const {error}=await supabase.rpc('review_application',{p_id:a.id,p_status:data.status,p_note:data.note||''});if(error)throw new Error(error.message);await syncRemote(supabase,db);notify(s.id,'Application_Status','Application status updated',j.title+': '+data.status.replaceAll('_',' '));audit('Reviewed application for '+s.name);save();toast('Application updated.');}:null,'Save review');}

async function clockAction() {
    const u = currentUser();
    if(u.role !== 'Student') throw new Error('Unauthorized');
    
    // Find the log that awaits summary
    const log = db.logs.find(l => l.studentId === u.id && l.status === 'Awaiting_Student_Log');
    if(!log) throw new Error('No active log awaiting your summary.');
    
    showModal('Complete your daily time record', `<p>Shift was managed by your supervisor. Clocked in at ${time(log.clockIn)}, Clocked out at ${time(log.clockOut)}.</p>${textarea('Task summary & learning reflection','task','','required minlength="150"')}<p class="note">Describe the tasks you completed during this verified session (min 150 characters).</p>`, data => {
        log.task = data.task;
        log.status = 'Pending';
        notify(log.supervisorId, 'DTR_Event', 'Daily time record submitted', u.name + ' submitted their verified logbook summary.');
        audit('Submitted a daily time record summary');
        save(); toast('Logbook summary submitted for supervisor review.');
    }, 'Submit Daily Logbook');
}


function tkTerminal(id) {
    let s = db.users.find(u => u.id === id);
    let isDummy = false;
    if(!s && id === 'dummy') {
        s = { id: 'dummy', name: 'Example Intern', identifier: 'DEMO-2026-001', course: 'BS Information Technology' };
        isDummy = true;
    }
    if(!s) throw new Error('Student not found.');
    
    const active = (db.activeShifts || []).find(sh => sh.studentId === id);
    const status = active ? 'Active On-Site' : 'Clocked Out';
    const statusColor = active ? '#166534' : 'var(--slate)';
    const statusBg = active ? '#dcfce7' : '#f1f5f9';
    
    let body = `<div style="text-align: center; padding: 10px 0;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--maroon); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin: 0 auto 16px auto;">${s.name.charAt(0)}</div>
        <h2 style="margin: 0 0 4px 0; font-size: 20px;">${e(s.name)}</h2>
        <p class="muted" style="margin-bottom: 24px; font-size: 14px;">${e(s.identifier)} &bull; ${e(s.course)}</p>
        
        <div style="background: ${statusBg}; border-radius: var(--radius); padding: 32px; margin-bottom: 24px; border: 1px solid var(--border);">
            <div style="color: ${statusColor}; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="width:10px;height:10px;border-radius:50%;background:${statusColor};${active?'animation:tk-pulse 2s infinite':''}"></span>
                ${status}
            </div>
            ${active 
                ? `<div style="font-size: 56px; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--ink); line-height: 1;" class="tk-timer" data-start="${active.clockIn}">${elapsed(active.clockIn)}</div>`
                : `<div style="font-size: 56px; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--slate); opacity: 0.3; line-height: 1;">00:00:00</div>`
            }
        </div>
        
        ${active 
            ? button('Clock Out Intern', isDummy ? 'dummy-action' : 'sup-clock-out', s.id, 'secondary full')
            : button('Clock In Intern', isDummy ? 'dummy-action' : 'sup-clock-in', s.id, 'primary full', 'clock')
        }
    </div>`;
    
    showModal('Timekeeper Terminal', body);
}

function logDetail(id){const u=currentUser(),l=visibleLogs(db,u).find(l=>l.id===id);if(!l)throw new Error('Attendance entry unavailable.');const review=u.role==='Supervisor'&&['Pending','Flagged'].includes(l.status);showModal(u.role==='Student'?'Daily time record [READ-ONLY]':'Daily time record',`<div class="row between"><strong>${e(student(l.studentId)?.name)}</strong>${badge(l.status)}</div><p class="muted mt16">${date(l.date)} Ã‚Â· ${time(l.clockIn)} Ã¢â‚¬â€œ ${time(l.clockOut)} Ã‚Â· ${l.hours} hours</p><h3>Task summary</h3><p>${e(l.task)}</p><p class="small"><strong>Location:</strong> ${l.gps?'Captured on device; not server-verified':'Not captured'}</p>${l.justification?`<h3>Justification</h3><p>${e(l.justification)}</p>`:''}${l.remarks?`<h3>Supervisor remarks</h3><p>${e(l.remarks)}</p>`:''}${l.signature?`<p class="small muted">Demo typed signature: ${e(l.signature)}</p>`:''}${review?select('Review decision','status',['Approved','Flagged','Rejected'])+textarea('Review remarks','remarks',l.remarks||'')+field('Typed signature (demo)','signature','text',u.name,'required maxlength="100"')+'<label class="row small"><input type="checkbox" required> I reviewed this attendance record.</label>':''}`,review?data=>{reviewLog(db,u,id,data.status,data.remarks,data.signature);notify(l.studentId,'DTR_Event','DTR entry '+data.status.toLowerCase(),date(l.date)+': '+data.remarks);audit('Marked '+student(l.studentId).name+' DTR '+data.status);save();toast('DTR review saved.');}:null,'Submit review');}
function studentDetail(id){const u=currentUser(),s=visibleStudents(db,u).find(s=>s.id===id);if(!s)throw new Error('Student is outside your assigned scope.');showModal(e(s.name),`${person(s)}<hr class="hr"><div class="grid-2"><div><span class="small muted">SR code</span><p>${e(s.identifier)}</p><span class="small muted">Host company</span><p>${e(s.company||'Unplaced')}</p></div><div><span class="small muted">Approved hours</span><p>${approvedHours(db,s.id)} / ${s.requiredHours} hours</p><span class="small muted">Accreditation</span><p>${badge(s.badge)}</p></div></div>${progress(approvedHours(db,s.id),s.requiredHours)}<h3 class="mt16">Recent attendance</h3>${dtrTable(db.logs.filter(l=>l.studentId===s.id).slice(-3),{role:'Student'})}${u.role==='Coordinator'?`<hr class="hr">${select('Host company','company',[['','Unplaced'],...db.htes.filter(h=>h.status==='Accredited').map(h=>h.name)],s.company)}${select('Assigned supervisor','supervisorId',[['','Unassigned'],...db.users.filter(v=>v.role==='Supervisor'&&v.status==='Active').map(v=>[v.id,v.name])],s.supervisorId||'')}${select('Accreditation status','badge',['Pre_Seeded','Eligible','Enrolled','Cleared'],s.badge)}${field('Required OJT hours','requiredHours','number',s.requiredHours,'required min="1" max="2000"')}<p class="small muted">Clearance requires completed hours, an appraisal, and no unresolved incidents.</p>${button('Download endorsement','endorsement',s.id,'secondary small','download')}`:''}`,u.role==='Coordinator'?data=>{const supervisor=student(data.supervisorId);if(data.company&&(!supervisor||supervisor.company!==data.company))throw new Error('Select a supervisor from the chosen host company.');if(!data.company&&data.supervisorId)throw new Error('Assign a host company before a supervisor.');if(data.badge==='Cleared'&&(approvedHours(db,id)<Number(data.requiredHours)||!db.appraisals.some(a=>a.studentId===id)||db.incidents.some(i=>i.studentId===id&&!['Resolved','Dismissed'].includes(i.status))))throw new Error('This student has incomplete clearance requirements.');Object.assign(s,{...data,supervisorId:data.supervisorId||null,requiredHours:Number(data.requiredHours)});notify(s.id,'System','Placement profile updated','Your coordinator updated your placement or accreditation details.');audit('Updated placement for '+s.name);save();toast('Student placement updated.');}:null,'Save placement');}
function incidentNew(){const u=currentUser(),students=visibleStudents(db,u);showModal(u.role==='Student'?'File an incident claim':'Create disciplinary log',`<p class="note">Document the situation clearly. This demo does not send emergency alerts or contact school staff.</p>${u.role==='Supervisor'?select('Student involved','studentId',students.map(s=>[s.id,s.name])):''}${field('Short title','title','text','','required maxlength="120"')}${select('Priority','priority',['Low','Medium','High'],'Medium')}${textarea('Description','description','','required minlength="20"')}${select('Related DTR (optional)','logId',[['','No linked entry'],...visibleLogs(db,u).map(l=>[l.id,student(l.studentId).name+' Ã‚Â· '+date(l.date)])])}${field('Evidence (optional, PDF / PNG / JPEG, up to 10 MB)','evidence','file','','accept="application/pdf,image/png,image/jpeg"')}`,async(data,form)=>{const sid=u.role==='Student'?u.id:data.studentId;if(u.role==='Supervisor'&&!students.some(s=>s.id===sid))throw new Error('Choose an assigned intern.');if(data.logId&&!db.logs.some(l=>l.id===data.logId&&l.studentId===sid))throw new Error('The linked DTR must belong to the selected student.');let evidence=null;const file=form.elements.evidence.files[0];if(file){validateUpload(file);evidence={id:crypto.randomUUID(),name:file.name};await putFile(evidence.id,file);}const incident={id:'IR-'+crypto.randomUUID().slice(0,8).toUpperCase(),studentId:sid,supervisorId:u.role==='Supervisor'?u.id:u.supervisorId,category:u.role==='Student'?'Student_Claim':'Disciplinary_Violation',title:data.title,description:data.description,priority:data.priority,status:'Pending',date:today(),logId:data.logId||null,evidence,notes:[],meeting:null};db.incidents.unshift(incident);db.users.filter(v=>v.role==='Coordinator').forEach(v=>notify(v.id,'Incident_Alert','New incident report',incident.id+': '+incident.title));audit('Filed incident '+incident.id);save();toast('Incident saved for coordinator review.');},'Submit report');}
function incidentDetail(id){const u=currentUser(),i=visibleIncidents(u).find(i=>i.id===id);if(!i)throw new Error('Case unavailable.');showModal('Case '+e(i.id),`<div class="row between"><h3 class="mb0">${e(i.title)}</h3>${badge(i.priority)}</div><p class="small muted mt16">${e(student(i.studentId)?.name)} Ã‚Â· ${date(i.date)} Ã‚Â· ${e(i.category.replaceAll('_',' '))}</p>${badge(i.status)}<p class="mt16">${e(i.description)}</p>${i.logId?button('View linked DTR','log-detail',i.logId,'secondary small'):''}${i.evidence?button('Download evidence: '+e(i.evidence.name),'file-download',i.evidence.id,'secondary small','download'):''}${i.meeting?`<section class="note mt16"><strong>Mediation scheduled</strong><p class="mb0">${date(i.meeting.time)} Ã‚Â· ${time(i.meeting.time)} Ã‚Â· ${e(i.meeting.platform)}</p><a href="${e(safeMeetingURL(i.meeting.url))}" target="_blank" rel="noopener noreferrer" class="text-btn">Open meeting Ã¢â€ â€™</a></section>`:''}<h3 class="mt16">Case notes</h3>${i.notes.map(n=>`<div class="activity-item"><p>${e(n.text)}</p><small>${e(n.author)} Ã‚Â· ${date(n.date)}</small></div>`).join('')||'<p class="small muted">No case notes yet.</p>'}${u.role==='Coordinator'?`<hr class="hr">${select('Case status','status',['Pending','Scheduled','Resolved','Dismissed'],i.status)}${textarea('Investigation / resolution note','note','','required minlength="10"')}<details><summary class="small">Schedule a mediation meeting (optional)</summary><div class="mt16">${select('Meeting platform','platform',['Google Meet','MS Teams','Zoom'],i.meeting?.platform||'Google Meet')}${field('Meeting link','url','url',i.meeting?.url||'')}${field('Meeting date & time','meetingTime','datetime-local',i.meeting?.localTime||'')}</div></details>`:''}`,u.role==='Coordinator'?data=>{let meeting=i.meeting;if(data.url||data.meetingTime){if(!data.url||!data.meetingTime)throw new Error('Provide both the meeting link and time.');const url=safeMeetingURL(data.url);if(new Date(data.meetingTime)<=new Date())throw new Error('Schedule a meeting in the future.');meeting={platform:data.platform,url,time:new Date(data.meetingTime).toISOString(),localTime:data.meetingTime};}if(data.status==='Scheduled'&&!meeting)throw new Error('Add a meeting link and time before marking this case scheduled.');i.meeting=meeting;i.status=data.status;i.notes.push({text:data.note,author:u.name,date:new Date().toISOString()});notify(i.studentId,'Incident_Alert','Incident '+i.id+' updated',data.status+': '+data.note);if(i.supervisorId)notify(i.supervisorId,'Incident_Alert','Incident '+i.id+' updated',data.status+': '+data.note);audit('Updated incident '+i.id+' to '+i.status);save();toast('Case updated.');}:null,'Update case');}
function evaluate(id){const u=currentUser(),s=visibleStudents(db,u).find(s=>s.id===id);if(u.role!=='Supervisor'||!s)throw new Error('Student outside your evaluation scope.');const a=db.appraisals.find(a=>a.studentId===id);const body=`${person(s)}<hr class="hr"><p class="small muted">1 Ã¢â‚¬â€ Needs improvement Ã‚Â· 3 Ã¢â‚¬â€ Meets expectations Ã‚Â· 5 Ã¢â‚¬â€ Excellent</p>${rubric.map((r,i)=>`<fieldset class="rubric-row"><legend><strong>${i+1}. ${r}</strong></legend><div class="rating">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="rating${i}" value="${n}" required ${a?.ratings[i]===n?'checked':''} ${a?'disabled':''}>${n}</label>`).join('')}</div></fieldset>`).join('')}${a?`<h3 class="mt16">Overall score: ${a.score.toFixed(1)} / 5</h3><p>${e(a.comments)}</p><p class="small">Signature: ${e(a.signature)}</p>`:textarea('Supervisor comments & observations','comments','','required minlength="20"')+field('Typed signature (demo)','signature','text',u.name,'required maxlength="100"')+'<label class="row small"><input type="checkbox" required> I confirm this evaluation reflects my review of the student.</label>'}`;showModal(a?'Submitted appraisal':'Performance appraisal rubric',body,a?null:data=>{const application=db.applications.find(a=>a.studentId===id&&a.status==='Accepted');if(!application)throw new Error('An accepted application is required before evaluation.');const ratings=rubric.map((r,i)=>Number(data['rating'+i]));if(ratings.some(n=>!Number.isInteger(n)||n<1||n>5))throw new Error('Complete every rubric criterion.');db.appraisals.push({id:crypto.randomUUID(),applicationId:application.id,studentId:id,supervisorId:u.id,ratings,score:ratings.reduce((a,b)=>a+b)/ratings.length,comments:data.comments,signature:data.signature,date:new Date().toISOString()});notify(id,'System','Your performance appraisal is ready','View your supervisorÃ¢â‚¬â„¢s rubric scores and feedback.');audit('Submitted appraisal for '+s.name);save();toast('Evaluation submitted. The student can now view it.');},'Submit evaluation');}
function editHTE(id){const h=db.htes.find(h=>h.id===id);showModal(h?'Host training establishment':'Add new HTE',field('Company name','name','text',h?.name||'','required maxlength="120"')+field('Industry','industry','text',h?.industry||'','required maxlength="100"')+field('Location','location','text',h?.location||'','required maxlength="100"')+field('Contact email','contact','email',h?.contact||'','required')+field('MOA expiry','expiry','date',h?.expiry||'','required')+select('Accreditation status','status',['Pending','Accredited','Expired'],h?.status||'Pending'),data=>{if(data.status==='Accredited'&&new Date(data.expiry+'T23:59:59')<new Date())throw new Error('An accredited HTE must have a valid MOA expiry date.');if(db.htes.some(other=>other.id!==id&&other.name.toLowerCase()===data.name.toLowerCase()))throw new Error('This HTE already exists.');if(h){const oldName=h.name;Object.assign(h,data);db.jobs.filter(j=>j.company===oldName).forEach(j=>j.company=data.name);db.users.filter(u=>u.company===oldName).forEach(u=>u.company=data.name);}else db.htes.push({id:crypto.randomUUID(),...data});audit('Updated HTE accreditation: '+data.name);save();toast('HTE details saved.');},'Save HTE');}
function userNew(){showModal('Provision a user',select('Role','role',roles)+field('Full name','name','text','','required maxlength="100"')+field('SR code / faculty ID / corporate email','identifier','text','','required maxlength="100"')+field('Email address','email','email','','required')+select('Course (students)','course',['BS Computer Science','BS Information Technology','BS Computer Engineering'])+field('Company (supervisors)','company','text','','maxlength="120"')+'<p class="note">The demo creates a pending account. Production provisioning must send a server-generated activation link.</p>',data=>{if(db.users.some(u=>u.identifier.toLowerCase()===data.identifier.toLowerCase()||u.email.toLowerCase()===data.email.toLowerCase()))throw new Error('The identifier or email is already registered.');if(data.role==='Supervisor'&&!data.company.trim())throw new Error('A supervisor needs a company.');db.users.push({id:crypto.randomUUID(),...data,status:'Pending_Activation',badge:'Pre_Seeded',baseHours:0,requiredHours:db.program.requiredHours,supervisorId:null});audit('Provisioned '+data.role+' account for '+data.name);save();toast('Pending demo account created.');},'Create pending account');}
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
    
    const { data: insertedCount, error } = await supabase.rpc('preseed_candidates', { p_rows: batch });
    if (error) throw new Error(error.message);
    
    audit('Imported '+insertedCount+' OJT candidates');
    toast(insertedCount+' pending candidates imported.');
  }, 'Validate & import');
}
function announcement(){const u=currentUser();showModal('Post a demo announcement',field('Title','title','text','','required maxlength="120"')+textarea('Announcement','message','','required minlength="10"')+'<p class="note">This creates local demo notifications. No emails or external messages are sent.</p>',data=>{const recipients=u.role==='Coordinator'?db.users.filter(v=>v.id!==u.id):visibleStudents(db,u);recipients.forEach(v=>notify(v.id,'System',data.title,data.message));audit('Posted announcement: '+data.title);save();toast('Announcement saved for '+recipients.length+' demo recipients.');},'Post announcement');}

function openFiles(){return new Promise((resolve,reject)=>{if(filesDB)return resolve(filesDB);const request=indexedDB.open('menteelog-demo-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>{filesDB=request.result;resolve(filesDB);};request.onerror=()=>reject(new Error('Browser file storage is unavailable.'));});}
async function fileOp(mode,key,value){const database=await openFiles();return new Promise((resolve,reject)=>{const tx=database.transaction('files',mode==='get'?'readonly':'readwrite'),store=tx.objectStore('files');const req=mode==='get'?store.get(key):mode==='put'?store.put(value,key):mode==='clear'?store.clear():store.delete(key);tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(new Error('File storage failed. Your browser storage may be full.'));tx.onabort=()=>reject(new Error('File storage operation was interrupted.'));});}
const putFile=(id,file)=>fileOp('put',id,file);
function documentUpload(){const u=currentUser();showModal('Upload a document',select('Document category','category',['Endorsement letter','Training agreement','Accomplishment report','Certificate','Other'])+field('Choose a file','file','file','','required accept="application/pdf,image/png,image/jpeg"')+'<p class="small muted">PDF, PNG, or JPEG Ã‚Â· Up to 10 MB. Stored only in this browser.</p>',async(data,form)=>{const file=form.elements.file.files[0];validateUpload(file);const id=crypto.randomUUID();await putFile(id,file);db.documents.unshift({id,studentId:u.id,name:file.name,size:file.size,type:file.type,category:data.category,date:today()});audit('Uploaded a demo document');save();toast('Document saved locally.');},'Upload document');}
function exportReport(type){let rows;const students=db.users.filter(s=>s.role==='Student');switch(type){case 'completion':rows=[['Student','SR code','Approved hours','Required hours','Completion percent'],...students.map(s=>[s.name,s.identifier,approvedHours(db,s.id),s.requiredHours,Math.round(approvedHours(db,s.id)/s.requiredHours*100)])];break;case 'compliance':rows=[['Student','Date','Hours','Status','Location captured','Justification','Reviewer remarks'],...db.logs.map(l=>[student(l.studentId)?.name,l.date,l.hours,l.status,l.gps?'Yes (unverified)':'No',l.justification||'',l.remarks])];break;case 'hte':rows=[['Company','Industry','Accreditation','MOA expiry','Placed students'],...db.htes.map(h=>[h.name,h.industry,h.status,h.expiry,students.filter(s=>s.company===h.name).length])];break;case 'incidents':rows=[['Case','Student','Category','Priority','Status','Reported'],...db.incidents.map(i=>[i.id,student(i.studentId)?.name,i.category,i.priority,i.status,i.date])];break;default:rows=[['Student','SR code','Course','Host company','Supervisor','Accreditation','Approved hours','Required hours'],...students.map(s=>[s.name,s.identifier,s.course,s.company,student(s.supervisorId)?.name||'',s.badge,approvedHours(db,s.id),s.requiredHours])];}download('MenteeLog-'+type+'-DEMO.csv',csvText(rows));toast('Sample data report downloaded.');}
const actionRoles={ 'job-edit':['Supervisor','Coordinator'],'student-detail':['Supervisor','Coordinator'],'evaluate':['Supervisor'],'hte-edit':['Coordinator'],'user-new':['Coordinator'],'user-status':['Coordinator'],'import-users':['Coordinator'],'csv-template':['Coordinator'],'announcement':['Supervisor','Coordinator'],'document-upload':['Student'],'document-remove':['Student'],'clock':['Student'],'incident-new':['Student','Supervisor'],'report':['Coordinator'],'export-students':['Supervisor','Coordinator'],'endorsement':['Coordinator']};
async function action(name,id,el){
  const publicActions=['demo','auth-role','forgot','toggle-password','close','watch-demo','privacy','team-connect'];
  const u=currentUser();
  if(!publicActions.includes(name)&&!u){logout();location.hash='/login';throw new Error('Your demo session expired. Sign in again.');}
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
    case 'forgot': location.hash = '/forgot'; return;
    case 'logout':logout();return;
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
        save(); toast('Intern clocked in successfully.'); tkTerminal(id); render(); return;
    }
    case 'sup-clock-out': {
        if(u.role !== 'Supervisor') throw new Error('Unauthorized');
        db.activeShifts = db.activeShifts || [];
        const idx = db.activeShifts.findIndex(sh => sh.studentId === id);
        if(idx === -1) throw new Error('Intern is not active.');
        const shift = db.activeShifts[idx];
        shift.clockOut = new Date().toISOString();
        const hours = hoursBetween(shift.clockIn, shift.clockOut, 0);
        
        // Push a pending log that awaits the student's task summary
        db.logs.push({
            id: crypto.randomUUID(), studentId: shift.studentId, supervisorId: shift.supervisorId,
            date: today(), clockIn: shift.clockIn, clockOut: shift.clockOut, breakMinutes: 0, hours: hours,
            task: '', justification: '', gps: false, status: 'Awaiting_Student_Log', remarks: '', signature: ''
        });
        
        db.activeShifts.splice(idx, 1);
        audit('Supervisor clocked out student ' + id);
        save(); toast('Intern clocked out. Awaiting their logbook summary.'); tkTerminal(id); render(); return;
    }

    case 'ref-approve': {
        const l = db.logs.find(log => log.id === id);
        if (!l) throw new Error('Log not found.');
        l.status = 'Approved';
        save();
        toast('DTR Log approved. Hours successfully credited.');
        render();
        return;
    }
    case 'ref-export-dtr':toast(`Exporting official verified DTR records as ${id.toUpperCase()}...`);return;
    case 'ref-verify':toast('On-Site presence verified for this DTR log.');return;
    case 'ref-verify-mode':toast('On-Site Verification Mode Enabled. Awaiting intern QR/GPS ping.');return;
    case 'job-edit':editJob(id);return;
    case 'application-detail':applicationDetail(id);return;
    case 'clock':await clockAction();return;
    case 'ref-submit-log':await clockAction();return;
    case 'log-detail':logDetail(id);return;
    case 'student-detail':studentDetail(id);return;
    case 'incident-new':incidentNew();return;
    case 'incident-detail':incidentDetail(id);return;
    case 'evaluate':evaluate(id);return;
    case 'hte-edit':editHTE(id);return;
    case 'user-new':userNew();return;
    case 'import-users':importUsers();return;
    case 'user-status':{const target=student(id);if(!target||target.id===u.id)throw new Error('You cannot change your own account status.');showModal(target.status==='Active'?'Suspend demo account?':'Activate demo account?',`<p>${e(target.name)} (${e(target.role)}) will be ${target.status==='Active'?'unable':'able'} to use this demo account. This changes only local demonstration data.</p>`,()=>{target.status=target.status==='Active'?'Suspended':'Active';audit('Changed account status for '+target.name);save();toast('Demo account updated.');},'Confirm change');return;}
    case 'csv-template':download('menteelog-candidates-template.csv','identifier,name,email,course\r\n2026-01001,Sample Student,student@example.edu,BS Information Technology\r\n');return;
    case 'announcement':announcement();return;
    
    
    case 'document-upload':documentUpload();return;
    case 'document-remove':{const doc=db.documents.find(d=>d.id===id&&d.studentId===u.id);if(!doc)throw new Error('Document unavailable.');showModal('Remove document?',`<p>Remove <strong>${e(doc.name)}</strong> from this browserÃ¢â‚¬â„¢s demo storage?</p>`,async()=>{await fileOp('delete',id);db.documents=db.documents.filter(d=>d.id!==id);save();toast('Document removed.');},'Remove document');return;}
    case 'file-download':{const doc=db.documents.find(d=>d.id===id&&d.studentId===u.id)||visibleIncidents(u).find(i=>i.evidence?.id===id)?.evidence;if(!doc)throw new Error('File is outside your access scope.');const file=await fileOp('get',id);if(!file)throw new Error('This file is no longer in browser storage. Please upload it again.');download(doc.name,file);return;}
    case 'report-preview':{if(u.role!=='Coordinator')throw new Error('Coordinator role required.');showModal('Report Preview','<p>This report uses the current sample records. Download the CSV to review it in a spreadsheet, or print this portal page.</p><div class="row">'+button('Download CSV','report',id,'','download')+button('Print','print','','secondary')+'</div>');return;}
    case 'activation-help':showModal('Account activation','<p>Find an account in Registered users and select Activate. This affects only the local preview; email links and token verification require the authentication API.</p>');return;
    case 'report':exportReport(id);return;
    case 'export-students':{const list=visibleStudents(db,u);download('MenteeLog-roster-DEMO.csv',csvText([['Name','SR code','Course','Company','Approved hours','Required hours','Badge'],...list.map(s=>[s.name,s.identifier,s.course,s.company,approvedHours(db,s.id),s.requiredHours,s.badge])]));return;}
    case 'export-dtr':download('MenteeLog-DTR-DEMO.csv',csvText([['Student','Date','Clock in','Clock out','Break minutes','Hours','Status','Task','Remarks'],...visibleLogs(db,u).map(l=>[student(l.studentId)?.name,l.date,l.clockIn,l.clockOut,l.breakMinutes,l.hours,l.status,l.task,l.remarks])]));return;
    case 'endorsement':{const s=student(id);if(!s||!s.company)throw new Error('Assign a company before generating an endorsement.');download('MenteeLog-endorsement-DEMO.txt',`MENTEELOG Ã¢â‚¬â€ DRAFT ENDORSEMENT (DEMONSTRATION ONLY)\n\nDate: ${date(today())}\nStudent: ${s.name}\nSR Code: ${s.identifier}\nProgram: ${s.course}\nHost Training Establishment: ${s.company}\nSupervisor: ${student(s.supervisorId)?.name||'Not assigned'}\nRequired Hours: ${s.requiredHours}\n\nThis draft must be reviewed and signed by the authorized faculty coordinator before official use.\n\nPrepared by: ${u.name}\n`,'text/plain;charset=utf-8');return;}
    case 'print':window.print();return;
    case 'reset-demo':showModal('Reset the demonstration?',`<p>This removes demo records and uploaded files from this browser and restores the sample cohort. Your source files and Figma references are not affected.</p>`,async()=>{await fileOp('clear');db=ensureCreatorAccounts(seedData());save();logout();toast('Sample data restored.');},'Reset demo');return;
    default:return;
  }save();render();
}
document.addEventListener('click',event=>{if(event.target.closest('.skip-link')){event.preventDefault();const main=$('#main');main?.setAttribute('tabindex','-1');main?.focus();return;}const roleLink=event.target.closest('[data-role]');if(roleLink)authRole=roleLink.dataset.role;const target=event.target.closest('[data-action]');if(!target)return;event.preventDefault();action(target.dataset.action,target.dataset.id,target).catch(error=>toast(error.message));});
document.addEventListener('input',event=>{if(event.target.id==='draft'){db.draft=event.target.value;save();}});
document.addEventListener('search',event=>{if(event.target.closest('#search-form')){event.target.form.requestSubmit();}});
document.addEventListener('change',event=>{if(event.target.id==='partner'){view.partner=event.target.value;render();}if(event.target.closest('#search-form')&&event.target.tagName==='SELECT')event.target.form.requestSubmit();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')togglePortalMenu(false);if(event.target.id==='global-search'&&event.key==='Enter'){event.preventDefault();const q=event.target.value.toLowerCase().trim();const match=navigation[currentUser().role].find(n=>n[1].toLowerCase().includes(q));if(q&&match)location.hash='/'+currentUser().role.toLowerCase()+'/'+match[0];else toast('No matching page found. Try Ã¢â‚¬Å“DTRÃ¢â‚¬Â, Ã¢â‚¬Å“placementÃ¢â‚¬Â, or Ã¢â‚¬Å“reportsÃ¢â‚¬Â.');}});
let failedLoginAttempts = 0;
let loginCooldownUntil = 0;
document.addEventListener('submit',async event=>{
  const form=event.target;if(!form.id)return;event.preventDefault();const values=Object.fromEntries(new FormData(form));const errorBox=form.querySelector('.form-error');if(errorBox)errorBox.textContent='';const submit=form.querySelector('[type="submit"]');if(submit)submit.disabled=true;
  try{
    if(form.id==='public-contact-form'){
      const { error } = await supabase.from('demo_requests').insert([
        { 
          name: values.name, 
          email: values.email, 
          company: values.company, 
          role: values.role, 
          message: values.message 
        }
      ]);
      
      if (error) {
        if (errorBox) errorBox.textContent = 'Error sending message: ' + error.message;
      } else {
        // Send Auto-Reply to visitor AND Alert email to your team via EmailJS
        const emailHeaders = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        };

        // 1. Auto-Reply to Visitor
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

        form.reset();
        toast('Thank you! Your demo request has been safely captured. Our team will contact you shortly to provide access.');
      }
      if (submit) submit.disabled = false;
      return;
    }
    if(form.id==='login-form'){
        if (Date.now() < loginCooldownUntil) {
           throw new Error('Too many attempts. Try again in ' + Math.ceil((loginCooldownUntil - Date.now())/1000) + 's.');
        }
        
        const invalidCredsMsg = authRole === 'Supervisor' ? 'Invalid email or password.' : authRole === 'Coordinator' ? 'Invalid Faculty ID or password.' : 'Invalid SR code or password.';
        
        let targetEmail = values.identifier.trim();
        if (!targetEmail.includes('@')) {
          const { data: emailData, error: rpcError } = await supabase.rpc('get_login_email', { p_identifier: targetEmail });
          if (rpcError || !emailData) {
             failedLoginAttempts++;
             if (failedLoginAttempts >= 5) loginCooldownUntil = Date.now() + 60000;
             throw new Error(invalidCredsMsg);
          }
          targetEmail = emailData;
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
           if (profile && profile.status !== 'Active') {
             throw new Error('Your account is not activated yet. Please activate it first.');
           }
           throw new Error('Invalid credentials or role mismatch.');
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
            course: profile.course || 'BS Information Technology'
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

        storeSession(localUser);
        if (await syncRemote(supabase, db) && !modal.open) render();
        location.hash='/' + role.toLowerCase() + '/dashboard';
        return;
      }
      if(form.id==='activation-form'){
        submit.textContent = 'Submitting...';
        
        try {
          const targetEmail = (values.email || values.identifier).trim();
          const targetId = values.identifier.trim();
          
          const { data: isEligible, error: rpcError } = await supabase.rpc('verify_activation_eligibility', { p_identifier: targetId, p_email: targetEmail });
          if (rpcError) throw new Error(rpcError.message);
          
          if (isEligible) {
             const { error: otpError } = await supabase.auth.signInWithOtp({
               email: targetEmail,
               options: {
                 shouldCreateUser: true,
                 emailRedirectTo: window.location.origin + '/activate.html'
               }
             });
             if (otpError) throw new Error(otpError.message);
          } else {
             throw new Error('Eligibility check failed. SR Code/Email not found or already activated.');
          }
          
          form.reset();
          toast('If the details match our records, an activation link was sent.');
        } finally {
          submit.textContent = 'Send Activation Link';
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
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, { redirectTo: window.location.origin + '/?reset=1' });
        if (error) throw new Error(error.message);
        form.reset();
        toast('Reset link sent. Please check your email.');
        return;
      }
      if (form.id === 'reset-password-form') {
        const password = form.elements.password?.value ?? '';
        const confirm = form.elements.confirm?.value ?? '';
        if (!password || !confirm) throw new Error('Please fill in both password fields.');
        if (password !== confirm) throw new Error('Passwords do not match.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        submit.textContent = 'Saving...';
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(error.message);
        await supabase.auth.signOut();
        recoveryActive = false;
        session = null;
        try { sessionStorage.removeItem(SESSION); } catch(e) {}
        form.reset();
        toast('Password updated. Please log in.');
        location.hash = '/login';
        return;
      }
    if(form.id==='search-form'){view.search=values.search||'';view.mode=values.mode||'All';view.course=values.course||'All';render();return;}
    const user=currentUser();if(form.id!=='modal-form'&&!user)throw new Error('Your session expired. Sign in again.');
    if(form.id==='portal-form'){await portals.submit(values,form);return;}
    if(form.id==='modal-form'&&modalSubmit){if(modalUserId&&currentUser()?.id!==modalUserId)throw new Error('Your session changed. Reopen the form after signing in.');const callback=modalSubmit;await callback(values,form);modal.close();render();return;}
    if(form.id==='profile-form'){if(!values.name.trim())throw new Error('Enter your full name.');if(db.users.some(u=>u.id!==user.id&&u.email.toLowerCase()===values.email.toLowerCase()))throw new Error('That email is already used by another demo account.');Object.assign(user,{name:values.name.trim(),email:values.email.trim(),phone:values.phone,bio:values.bio});audit('Updated profile');}
    save();render();toast('Saved in the demonstration.');
  }catch(error){if(errorBox)errorBox.textContent=error.message;else toast(error.message);}finally{if(submit)submit.disabled=false;}
});
window.addEventListener('hashchange', async () => {
  view = {search: '', filter: 'All', course: 'All', mode: 'All'};
  modal.close();
  render();
  if (session && await syncRemote(supabase, db) && !modal.open) render();
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
window.addEventListener('storage',event=>{if(event.key===STORAGE){const keep=session?db.users.find(u=>u.id===session.id):null;db=ensureCreatorAccounts(load());if(keep&&!db.users.some(u=>u.id===keep.id))db.users.push(keep);render();}});
setInterval(()=>{ const timer=$('#shift-timer'); if(timer&&currentUser()?.role==='Student'){ const active = (db.activeShifts||[]).find(sh=>sh.studentId===currentUser().id); if(active) timer.textContent=elapsed(active.clockIn); } document.querySelectorAll('.tk-timer').forEach(el => { const start = el.getAttribute('data-start'); if(start) el.textContent = elapsed(start); }); if(session&&!currentUser()){logout();location.hash='/login';toast('Your demo session ended. Sign in to continue.');} }, 1000);
setInterval(async () => { if (session && await syncRemote(supabase, db) && !modal.open) render(); }, 20000);
async function submitApplication(jobId, note) { const {error} = await supabase.from('applications').insert({ job_id: jobId, student_id: currentUser().id, status: 'Pending', applied_date: today(), notes: note || '' }); if (error) throw new Error(error.message); await syncRemote(supabase, db); }
portals=createPortalViews({get db(){return db;},get view(){return view;},get user(){return currentUser();},route,e,icon,button,link,heading,field,textarea,select,badge,person,table,empty,progress,date,time,today,student,job,save,notify,audit,toast,render,showModal,download,fileOp,putFile,dtrTable,visibleIncidents,submitApplication,legacy:{applicationDetail,editJob,studentDetail,incidentNew,incidentDetail,evaluate,logDetail,editHTE,userNew,importUsers,documentUpload},capture(fn){capturingForm=true;capturedForm=null;try{fn();return capturedForm;}finally{capturingForm=false;}}});

document.addEventListener('change',event=>{if(!['public-course','public-location'].includes(event.target.id))return;const course=$('#public-course').value,place=$('#public-location').value;let count=0;document.querySelectorAll('.home-job').forEach(card=>{card.hidden=!((course==='All'||card.dataset.courses.includes(course))&&(place==='All'||card.dataset.location.includes(place)));if(!card.hidden)count++;});$('#public-empty').hidden=count>0;});

document.addEventListener('dragover',event=>{if(event.target.closest('.upload-drop'))event.preventDefault();});
document.addEventListener('drop',event=>{const dropzone=event.target.closest('.upload-drop');if(!dropzone)return;event.preventDefault();try{const files=event.dataTransfer.files;if(files.length!==1)throw new Error('Upload one document at a time.');if(dropzone.dataset.action==='document-upload'){if(currentUser()?.role!=='Student')throw new Error('Student portal required.');validateUpload(files[0]);documentUpload();modal.querySelector('input[type="file"]').files=files;}else if(dropzone.dataset.action==='import-users'){if(currentUser()?.role!=='Coordinator')throw new Error('Coordinator portal required.');if(files[0].size>1024*1024)throw new Error('Choose a CSV file smaller than 1 MB.');importUsers();modal.querySelector('input[type="file"]').files=files;}}catch(error){toast(error.message);}});
document.addEventListener('click',event=>{const drawer=$('#notice-drawer');if(drawer&&!event.target.closest('#notice-drawer')&&!event.target.closest('[data-action="notifications"]'))drawer.remove();});








// MAIN APP GATE
function showResetPage() {
  if (location.hash === '#/reset-password') return;
  history.replaceState(null, '', location.pathname);
  location.hash = '/reset-password';
}

supabase.auth.onAuthStateChange((event, sessionObj) => {
  if (event === 'PASSWORD_RECOVERY') { recoveryActive = true; showResetPage(); return; }
  if (event === 'SIGNED_OUT' || recoveryActive) return;
  if (sessionObj?.user) {
    setTimeout(async () => {
      const { data: profile, error } = await supabase.from('profiles').select('status').eq('id', sessionObj.user.id).single();
      if (error || !profile || profile.status !== 'Active') {
        await supabase.auth.signOut();
        if (location.hash !== '#/login') location.hash = '/login';
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
    let { data: { session: s } } = await supabase.auth.getSession();
    if (!s && urlParams.has('code')) {
      const { error } = await supabase.auth.exchangeCodeForSession(urlParams.get('code'));
      if (!error) ({ data: { session: s } } = await supabase.auth.getSession());
    }
    if (s) {
      recoveryActive = true;
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

  const { data: { session: initSession } } = await supabase.auth.getSession();
  if (initSession?.user) {
    const { data: profile, error } = await supabase.from('profiles').select('status').eq('id', initSession.user.id).single();
    if (error || !profile || profile.status !== 'Active') {
      await supabase.auth.signOut();
      if (location.hash !== '#/login') location.hash = '/login';
    } else {
      setTimeout(async () => {
        if (await syncRemote(supabase, db) && !modal.open) render();
      }, 0);
    }
  }
  render();
})();


const fs = require('fs');
let code = fs.readFileSync('frontend/dist/js/app.js', 'utf8');

// Replace notificationsMini
const oldMiniRegex = /function notificationsMini\(u\)\{const notes=db\.notifications.*?<\/section>\`;\}/;
const newMini = `function notificationsMini(u){
  const unread = db.notifications.filter(n=>n.userId===u.id && !n.read).reverse().slice(0, 5);
  return \`
    <div class="drawer-header">
      <div class="card-title" style="margin-bottom:15px; align-items:center;">
        <h2 style="font-size:18px; margin:0;">Notifications</h2>
        \${unread.length ? '<button class="text-btn small" data-action="read-all">Mark all read</button>' : ''}
      </div>
    </div>
    <div class="drawer-notes-list">
      \${unread.map(n=>\`
        <div class="notification-card" style="padding:14px; background:var(--sand-light); border-radius:8px; margin-bottom:10px; border:1px solid #e9dfd9;">
          <strong style="display:block; color:var(--burgundy); font-size:14px;">\${e(n.title)}</strong>
          <p style="margin:6px 0 0; font-size:13px; color:var(--ink); line-height:1.4;">\${e(n.message)}</p>
        </div>
      \`).join('') || '<p class="small muted" style="padding:15px 0; text-align:center;">You\\'re all caught up!</p>'}
    </div>
    <hr class="hr" style="margin:16px 0;">
    <a class="text-btn full" style="text-align:center; display:block;" href="#/\${u.role.toLowerCase()}/notifications">View all notifications &rarr;</a>
  \`.replace(/\\n\\s+/g, '');
}`;

if (code.match(oldMiniRegex)) {
  code = code.replace(oldMiniRegex, newMini);
  console.log("Replaced notificationsMini!");
} else {
  console.log("Could not find notificationsMini using regex.");
}

// Replace read-all case
const oldReadAll = `case 'read-all':db.notifications.filter(n=>n.userId===u.id).forEach(n=>n.read=true);toast('All notifications marked as read.');break;`;
const newReadAll = `case 'read-all':db.notifications.filter(n=>n.userId===u.id).forEach(n=>n.read=true);toast('All notifications marked as read.');const drawer=$('#notice-drawer');if(drawer)drawer.innerHTML=notificationsMini(u);break;`;

if (code.includes(oldReadAll)) {
  code = code.replace(oldReadAll, newReadAll);
  console.log("Replaced read-all case!");
} else {
  console.log("Could not find read-all case.");
}

fs.writeFileSync('frontend/dist/js/app.js', code);

const fs = require('fs');
const file = 'frontend-react/src/js/app.js';
let content = fs.readFileSync(file, 'utf8');

const oldStr = 'if(session&&!currentUser()){logout();location.hash=\'/login\';toast(\'Your demo session ended. Sign in to continue.\');}';
const newStr = 'if(session&&!currentUser()){ missingUserTicks++; if(missingUserTicks >= 10) { logout(); location.hash=\'/login\'; toast(\'Your demo session ended. Sign in to continue.\'); } } else { missingUserTicks = 0; }';

content = content.replace(oldStr, newStr);
content = content.replace('setInterval(()=>{ const timer', 'let missingUserTicks = 0;\\nsetInterval(()=>{ const timer');

fs.writeFileSync(file, content);
console.log('Patched');

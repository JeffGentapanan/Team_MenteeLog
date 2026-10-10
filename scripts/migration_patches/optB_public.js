const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend-react', 'src', 'js', 'public.js');
let content = fs.readFileSync(p, 'utf8');

const regex = /export function authScreen[\s\S]*?return `<div class="auth-reference">[\s\S]*?<\/div>`;}/;
content = content.replace(regex, fs.readFileSync('optB_auth.txt', 'utf8'));

fs.writeFileSync(p, content, 'utf8');

const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend-react', 'src', 'js', 'public.js');
let content = fs.readFileSync(p, 'utf8');

const startIndex = content.indexOf('export function authScreen');
content = content.substring(0, startIndex);
content += fs.readFileSync('new_auth.txt', 'utf8') + '\n';

fs.writeFileSync(p, content, 'utf8');

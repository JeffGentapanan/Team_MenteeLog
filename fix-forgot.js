const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend-react', 'src', 'js', 'app.js');
let content = fs.readFileSync(p, 'utf8');

content = content.replace('const id = #identifier?.value?.trim();', "const id = $('#identifier')?.value?.trim();");

fs.writeFileSync(p, content, 'utf8');

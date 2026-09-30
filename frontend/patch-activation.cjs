const fs = require('fs');
let code = fs.readFileSync('dist/js/public.js', 'utf8');

// Current logic:
// ${field(role==='Supervisor'?'CORPORATE EMAIL':'SR CODE','identifier',role==='Supervisor'?'email':'text','','required')}${field('REGISTERED EMAIL ADDRESS','email','email','','required')}

const oldFields = "${field(role==='Supervisor'?'CORPORATE EMAIL':'SR CODE','identifier',role==='Supervisor'?'email':'text','','required')}${field('REGISTERED EMAIL ADDRESS','email','email','','required')}";
const newFields = "${field(role==='Supervisor'?'CORPORATE EMAIL':'SR CODE','identifier',role==='Supervisor'?'email':'text','','required')}${role==='Supervisor' ? '' : field('REGISTERED EMAIL ADDRESS','email','email','','required')}";

if (code.includes(oldFields)) {
  code = code.replace(oldFields, newFields);
  fs.writeFileSync('dist/js/public.js', code);
  console.log("Fixed redundant email fields for supervisor activation.");
} else {
  console.log("Could not find the exact string.");
}

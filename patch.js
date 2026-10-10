const fs = require('fs');
const file = 'frontend-react/src/js/app.js';
let content = fs.readFileSync(file, 'utf8');

const helper = 'function userIsMidInput() {\n' +
  '  const el = document.activeElement;\n' +
  '  if (el && [\'INPUT\', \'TEXTAREA\', \'SELECT\'].includes(el.tagName) && el.id !== \'global-search\') return true;\n' +
  '  const main = document.querySelector(\'main\');\n' +
  '  if (!main) return false;\n' +
  '  const inputs = main.querySelectorAll(\'input, textarea, select\');\n' +
  '  for (let i = 0; i < inputs.length; i++) {\n' +
  '    const input = inputs[i];\n' +
  '    if (input.type === \'radio\' || input.type === \'checkbox\') {\n' +
  '      if (input.checked !== input.defaultChecked) return true;\n' +
  '    } else {\n' +
  '      if (input.value !== input.defaultValue) return true;\n' +
  '    }\n' +
  '  }\n' +
  '  return false;\n' +
  '}\n';

const oldInterval = 'setInterval(async () => { if (session && await syncRemote(supabase, db)) { save(); if (!modal.open) render(); } }, 20000);';
const newInterval = helper + 'setInterval(async () => { if (session && await syncRemote(supabase, db)) { save(); if (!modal.open && !userIsMidInput()) render(); } }, 20000);';

content = content.replace(oldInterval, newInterval);
fs.writeFileSync(file, content);
console.log('Patched');

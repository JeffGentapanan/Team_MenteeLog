const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const target = `let safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/^.+/, '').replace(/\\.{2,}/g, '.').substring(0, 100);`;
const replacement = `let safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\\.{2,}/g, '.').substring(0, 100);`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("Patched uploadEvidence regex");
} else {
  console.log("Target not found");
}

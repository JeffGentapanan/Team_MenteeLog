const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/portal-views.js', 'utf8');

const target = `let evidence=null;const file=el.elements.evidence.files[0];if(file){validateUpload(file);evidence={id:crypto.randomUUID(),name:file.name};await c.putFile(evidence.id,file);}const i={...v,id:'IR-'+crypto.randomUUID().slice(0,8).toUpperCase()`;
const replacement = `const incCode = 'IR-'+crypto.randomUUID().slice(0,8).toUpperCase();let evidence=null;const file=el.elements.evidence.files[0];if(file){validateUpload(file);evidence=await c.legacy.uploadEvidence(file, incCode);}const i={...v,id:incCode`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend-react/src/js/portal-views.js', c);
  console.log("Patched portal-views.js incident evidence upload");
} else {
  console.log("Target not found in portal-views.js");
}

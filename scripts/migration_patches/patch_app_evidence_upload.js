const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const target = `let evidence=null;const file=form.elements.evidence.files[0];if(file){validateUpload(file);evidence={id:crypto.randomUUID(),name:file.name};await putFile(evidence.id,file);}const incident={id:'IR-'+crypto.randomUUID().slice(0,8).toUpperCase()`;
const replacement = `const incCode = 'IR-'+crypto.randomUUID().slice(0,8).toUpperCase();
let evidence=null;const file=form.elements.evidence.files[0];if(file){validateUpload(file);evidence=await uploadEvidence(file, incCode);}const incident={id:incCode`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("Patched app.js incidentNew");
} else {
  console.log("Target not found in app.js");
}

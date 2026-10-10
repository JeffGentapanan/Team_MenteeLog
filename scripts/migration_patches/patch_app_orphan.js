const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const target = `if (error) throw new Error(error.message);
if (!inserted || inserted.length === 0) throw new Error('Insert failed or rejected by security rules.');`;

const replacement = `if (error || !inserted || inserted.length === 0) {
  if (evidence && evidence.filePath) {
    try { await supabase.storage.from(evidence.bucket).remove([evidence.filePath]); } catch (e) { console.warn('Failed to cleanup orphan evidence', e); }
  }
  throw new Error(error ? error.message : 'Insert failed or rejected by security rules.');
}`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("Patched orphan cleanup in app.js");
} else {
  console.log("Target not found");
}

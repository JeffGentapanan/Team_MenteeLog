const fs = require('fs');
let code = fs.readFileSync('dist/js/public.js', 'utf8');

// The specific chunk of HTML inside authScreen string literal
const oldString = 'First time here? <a href="#/activate">Activate ${role} Account</a></p>';
const newString = '${role === "Coordinator" ? "" : `<p class="activate-link">First time here? <a href="#/activate">Activate ${role} Account</a></p>`}';

// Since the oldString is already wrapped in `<p class="activate-link">...</p>` in the original:
// Original: `<p class="activate-link">First time here? <a href="#/activate">Activate ${role} Account</a></p>`
const fullOldString = '<p class="activate-link">First time here? <a href="#/activate">Activate ${role} Account</a></p>';
const fullNewString = '${role === "Coordinator" ? "" : `<p class="activate-link">First time here? <a href="#/activate">Activate ${role} Account</a></p>`}';

if (code.includes(fullOldString)) {
  code = code.replace(fullOldString, fullNewString);
  fs.writeFileSync('dist/js/public.js', code);
  console.log("Successfully patched authScreen to hide Coordinator activation.");
} else {
  console.log("Could not find the string to replace.");
}

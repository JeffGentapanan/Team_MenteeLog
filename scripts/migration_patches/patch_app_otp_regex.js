const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const targetRegex = /options:\s*\{\s*shouldCreateUser:\s*true\s*\}/;
const replacement = `options: { shouldCreateUser: true, emailRedirectTo: window.location.origin + '/activate.html' }`;

if (targetRegex.test(c)) {
  c = c.replace(targetRegex, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("app.js patched successfully with regex.");
} else {
  console.log("Target regex not found in app.js");
}

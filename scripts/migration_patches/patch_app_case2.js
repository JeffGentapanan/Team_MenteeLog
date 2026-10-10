const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const target = `if (profile.status !== 'Active') throw new Error('Your account is not activated yet.`;
const replacement = `if (String(profile.status).toLowerCase() !== 'active') throw new Error('Your account is not activated yet.`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("Status check made case-insensitive.");
} else {
  console.log("Target not found");
}

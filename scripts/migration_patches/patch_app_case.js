const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const target = `if (profile.role !== authRole) throw new Error('Role mismatch:`;
const replacement = `if (String(profile.role).toLowerCase() !== String(authRole).toLowerCase()) throw new Error('Role mismatch:`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("Role check made case-insensitive.");
} else {
  console.log("Target not found");
}

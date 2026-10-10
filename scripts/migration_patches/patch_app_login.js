const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const targetRegex = /if\s*\(profile\s*&&\s*profile\.status\s*!==\s*'Active'\)\s*\{\s*throw new Error\('Your account is not activated yet\. Please activate it first\.'\);\s*\}\s*throw new Error\('Invalid credentials or role mismatch\.'\);/;

const replacement = `if (profileError) throw new Error('System error fetching profile: ' + profileError.message);
           if (!profile) throw new Error('Your profile record is missing in the database.');
           if (profile.status !== 'Active') throw new Error('Your account is not activated yet. Please activate it first.');
           if (profile.role !== authRole) throw new Error('Role mismatch: Your profile is set to ' + profile.role + ', but you are trying to log in as ' + authRole + '.');
           throw new Error('Invalid credentials.');`;

if (targetRegex.test(c)) {
  c = c.replace(targetRegex, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("Login error messages made more specific.");
} else {
  console.log("Target not found in app.js");
}

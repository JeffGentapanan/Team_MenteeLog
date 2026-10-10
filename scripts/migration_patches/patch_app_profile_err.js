const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const target = `if (profileError) throw new Error('System error fetching profile: ' + profileError.message);
           if (!profile) throw new Error('Your profile record is missing in the database.');`;

const replacement = `if (profileError && profileError.code === 'PGRST116') throw new Error('Your profile record is missing in the database.');
           if (profileError) throw new Error('System error fetching profile: ' + profileError.message);
           if (!profile) throw new Error('Your profile record is missing in the database.');`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("Profile error check improved.");
} else {
  console.log("Target not found");
}

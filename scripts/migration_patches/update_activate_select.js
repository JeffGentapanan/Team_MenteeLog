const fs = require('fs');
let code = fs.readFileSync('frontend-react/src/js/activate.js', 'utf8');

code = code.replace(/select\('is_activated'\)/g, "select('is_activated, role')");
fs.writeFileSync('frontend-react/src/js/activate.js', code);
console.log('Successfully updated activate.js select query');

const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

// The mangled text between company and title
content = content.replace(/ -A\? /g, ' - ');

// The mangled text between applied date and student name
content = content.replace(/ A /g, ' · ');

fs.writeFileSync('frontend-react/src/js/app.js', content, 'utf8');
console.log('Fixed leftover mangled text in app.js');

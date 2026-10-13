const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/portal-views.js', 'utf8');
content = content.replace(/\uFFFD\?"/g, '-');
content = content.replace(/\uFFFD\?T/g, "'");
content = content.replace(/\uFFFD\?/g, '-'); // This specifically targets the replacement character followed by a question mark, which is safe.
fs.writeFileSync('frontend-react/src/js/portal-views.js', content, 'utf8');

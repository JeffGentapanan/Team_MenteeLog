const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

content = content.replace(/Ã¢Å“â€œ/g, '✅');
content = content.replace(/Ã¢â€ â€™/g, '↗');
content = content.replace(/Ã¢â‚¬Å“/g, '"');
content = content.replace(/Ã¢â‚¬Â /g, '"');
content = content.replace(/Ã¢â‚¬Â/g, '"');
content = content.replace(/Ã¢â‚¬â„¢/g, "'");

fs.writeFileSync('frontend-react/src/js/app.js', content, 'utf8');
console.log('Fixed quotes and emojis');

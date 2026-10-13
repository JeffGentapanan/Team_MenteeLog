const fs = require('fs');
function clean(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/Ã¢â‚¬â€œ/g, '-');
    content = content.replace(/Ã¢â‚¬â€ /g, '- ');
    content = content.replace(/Ã¢â‚¬â€/g, '-');
    content = content.replace(/Ã‚Â·/g, '·');
    content = content.replace(/Ã¢â‚¬â„¢/g, "'");
    content = content.replace(/Ã‚Â°/g, '°');
    
    // Fix specific known replacement chars
    content = content.replace(/\?" /g, '- ');
    content = content.replace(/\?Tll/g, "'ll");
    content = content.replace(/\?/g, '·');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed ' + file);
    }
}
['frontend-react/src/js/app.js', 'frontend-react/src/js/portal-views.js'].forEach(clean);

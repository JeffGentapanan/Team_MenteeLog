const fs = require('fs');
function clean(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Clean app.js artifacts
    content = content.replace(/AAA\?sAA,A\? /g, '- ');
    content = content.replace(/A\?sA,A /g, '- ');
    content = content.replace(/AAA\?sAA,A\?/g, '-');
    content = content.replace(/A\?sA,A /g, '- ');
    
    // Clean portal-views.js artifacts
    content = content.replace(/\?"/g, '-');
    content = content.replace(/\?T/g, "'");
    content = content.replace(/\?/g, '-');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed ' + file);
    }
}
['frontend-react/src/js/app.js', 'frontend-react/src/js/portal-views.js'].forEach(clean);

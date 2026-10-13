const fs = require('fs');
function clean(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/Ã¢â‚¬â€œ/g, '-');
    content = content.replace(/Ã¢â‚¬â€ /g, '-');
    content = content.replace(/Ã¢â‚¬â€/g, '-');
    content = content.replace(/Ã‚Â·/g, '·');
    content = content.replace(/Ã¢â‚¬â„¢/g, "'");
    content = content.replace(/Ã‚Â°/g, '°');
    content = content.replace(/\?"/g, '-'); // Replacement character + ? + "
    content = content.replace(/\?T/g, "'");
    content = content.replace(/\?/g, '-');
    
    // Specifically fix 'Your Company Name Ã¢â‚¬â€  IT assistant' issue if it exists exactly
    content = content.replace(/Ã¢â‚¬â€/g, '-'); 
    
    // Specifically fix 'Application Submitted ?" View Details'
    content = content.replace(/Application Submitted .*? View Details/g, 'Application Submitted - View Details');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed ' + file);
    }
}
['frontend-react/src/js/app.js', 'frontend-react/src/js/portal-views.js'].forEach(clean);

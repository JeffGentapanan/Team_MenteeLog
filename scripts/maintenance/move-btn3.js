const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/portal-views.js', 'utf8');

// Find the line containing notifications
const lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes("return heading('Notifications Center'")) {
        // Strip the trailing +back('dashboard');
        let newLine = lines[i].replace("+back('dashboard')", "");
        // Prepend it
        newLine = newLine.replace("return heading", "return back('dashboard')+heading");
        lines[i] = newLine;
    }
}

fs.writeFileSync('frontend-react/src/js/portal-views.js', lines.join('\n'), 'utf8');
console.log('Done moving button');

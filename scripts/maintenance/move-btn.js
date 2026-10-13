const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/portal-views.js', 'utf8');

// Move back('dashboard') to the front of the return statement
content = content.replace(
    /return heading\('Notifications Center'(.*?)\+back\('dashboard'\);/s,
    "return back('dashboard')+heading('Notifications Center';"
);

fs.writeFileSync('frontend-react/src/js/portal-views.js', content, 'utf8');

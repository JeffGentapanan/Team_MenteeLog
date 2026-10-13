const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

// Remove the readonly restriction on the company field for supervisors
content = content.replace(
    /'required maxlength="120" '\+\(u\.role==='Supervisor'\?'readonly':''\)\)/g, 
    "'required maxlength=\"120\"')"
);

fs.writeFileSync('frontend-react/src/js/app.js', content, 'utf8');
console.log('Removed readonly restriction');

const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

c = c.replace(
  "let db=ensureCreatorAccounts(load());",
  "let db=ensureCreatorAccounts(load());\nif(db.incidents) db.incidents = db.incidents.filter(i => !i._pending);"
);

fs.writeFileSync('frontend-react/src/js/app.js', c);

const fs = require('fs');
let code = fs.readFileSync('frontend/dist/js/app.js', 'utf8');

// Remove all instances of the search event listener
const regex = /document\.addEventListener\('search',event=>\{if\(event\.target\.closest\('#search-form'\)\)\{event\.target\.form\.requestSubmit\(\);\}\}\);\r?\n?/g;
code = code.replace(regex, '');

// Inject exactly one instance
code = code.replace("document.addEventListener('change',event=>{", "document.addEventListener('search',event=>{if(event.target.closest('#search-form')){event.target.form.requestSubmit();}});\ndocument.addEventListener('change',event=>{");

fs.writeFileSync('frontend/dist/js/app.js', code);

const fs = require('fs');
let code = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const importRegex = /function importUsers\(\)\{[\s\S]*?'Validate & import'\);\}/;

const importReplacement = `async function importUsers() {
  showModal('Import OJT candidates', \`<p>Required headers: <strong>identifier,name,email,course</strong>. Up to 500 students, maximum 1 MB. Duplicate identifiers or emails will stop the import.</p>\${field('CSV file','csv','file','','required accept=".csv,text/csv"')}\`, async (data, form) => {
    const file = form.elements.csv.files[0];
    if(!file||file.size>1024*1024) throw new Error('Choose a CSV file smaller than 1 MB.');
    const rows = parseCSV(await file.text()), header = rows.shift()?.map(v=>v.toLowerCase());
    const required = ['identifier','name','email','course'];
    if(!header||required.some(k=>!header.includes(k))) throw new Error('The CSV is missing required headers.');
    if(rows.length<1||rows.length>500) throw new Error('Import between 1 and 500 students.');
    
    const batch = rows.map(r => {
      return Object.fromEntries(required.map(k=>[k, r[header.indexOf(k)]||'']));
    });
    
    const { data: insertedCount, error } = await supabase.rpc('preseed_candidates', { p_rows: batch });
    if (error) throw new Error(error.message);
    
    audit('Imported '+insertedCount+' OJT candidates');
    toast(insertedCount+' pending candidates imported.');
  }, 'Validate & import');
}`;

let newCode = code.replace(importRegex, importReplacement);
fs.writeFileSync('frontend-react/src/js/app.js', newCode);
console.log('Successfully replaced importUsers logic');

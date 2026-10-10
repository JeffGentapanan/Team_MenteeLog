const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const target = "const {error}=await supabase.from('applications').insert({job_id:id,student_id:u.id,status:'Pending',applied_date:today()});if(error)throw new Error(error.message);";
const replacement = "const {error,data:inserted}=await supabase.from('applications').insert({job_id:id,student_id:u.id,status:'Pending',applied_date:today()}).select();if(error)throw new Error(error.message);if(!inserted||inserted.length===0)throw new Error('Insert failed or rejected by security rules.');";

c = c.replace(target, replacement);

fs.writeFileSync('frontend-react/src/js/app.js', c);

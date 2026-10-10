const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const regex1 = /async function assignPlacementRemote\(students, jobObj, requiredHours\) \{/;
const rep1 = "const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;\nasync function saveProfileRemote(u, values) {\n    if (!uuidRegex.test(u.id)) throw new Error('Demo records cannot be saved to the live database.');\n    const { error, data } = await supabase.from('profiles').update({ full_name: values.name.trim(), phone: values.phone.trim(), bio: values.bio }).eq('id', u.id).select();\n    if (error) throw new Error(error.message);\n    if (!data || data.length === 0) throw new Error('Update failed or rejected by security rules.');\n}\nasync function assignPlacementRemote(students, jobObj, requiredHours) {";
c = c.replace(regex1, rep1);

const regex2 = /Object\.assign\(user,\{name:values\.name\.trim\(\),email:values\.email\.trim\(\),phone:values\.phone,bio:values\.bio\}\);audit\('Updated profile'\);\}/;
const rep2 = "if(values.email.trim().toLowerCase()!==String(user.email||'').toLowerCase())throw new Error('Email cannot be changed here. Contact your coordinator.');await saveProfileRemote(user,values);await syncRemote(supabase,db);audit('Updated profile');}";
c = c.replace(regex2, rep2);

fs.writeFileSync('frontend-react/src/js/app.js', c);

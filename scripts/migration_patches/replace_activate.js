const fs = require('fs');
let code = fs.readFileSync('frontend-react/src/js/activate.js', 'utf8');

const regex = /const \{ data: \{ session \}, error: sessionError \} = await supabase\.auth\.getSession\(\);/;

const replacement = `const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Ignore specific auth events
    supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_OUT') return;
    });`;

let newCode = code.replace(regex, replacement);
fs.writeFileSync('frontend-react/src/js/activate.js', newCode);
console.log('Successfully replaced activate logic');

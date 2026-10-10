const fs = require('fs');
let code = fs.readFileSync('frontend-react/src/js/activate.js', 'utf8');

const regex = /const \{ error: rpcError \} = await supabase\.rpc\('complete_activation'\);\s*if \(rpcError\) throw new Error\(rpcError\.message\);\s*await supabase\.auth\.signOut\(\);\s*showMessage\('Account activated! Log in with your SR code and password\.', true\);/g;

const replacement = `const { error: rpcError } = await supabase.rpc('complete_activation');
        if (rpcError) throw new Error(rpcError.message);

        const successMsg = profile.role === 'Supervisor' 
          ? 'Account activated! Log in with your corporate email and password.' 
          : 'Account activated! Log in with your SR code and password.';

        await supabase.auth.signOut();
        showMessage(successMsg, true);`;

let newCode = code.replace(regex, replacement);
fs.writeFileSync('frontend-react/src/js/activate.js', newCode);
console.log('Successfully updated activate.js');

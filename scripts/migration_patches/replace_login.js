const fs = require('fs');
let code = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

const regex = /document\.addEventListener\('submit',async event=>\{([\s\S]*?)location\.hash='\/' \+ role\.toLowerCase\(\) \+ '\/dashboard';\s*return;\s*\}/;

const replacement = `let failedLoginAttempts = 0;
let loginCooldownUntil = 0;

document.addEventListener('submit',async event=>{
$1location.hash='/' + role.toLowerCase() + '/dashboard';
        return;
      }`;

// Wait, the regex captures everything up to the end of login form. We want to completely replace the logic INSIDE the login-form if condition!
// Let's match just the login-form block.

const loginRegex = /if\(form\.id==='login-form'\)\{[\s\S]*?location\.hash='\/' \+ role\.toLowerCase\(\) \+ '\/dashboard';\s*return;\s*\}/;

const loginReplacement = `if(form.id==='login-form'){
        if (Date.now() < loginCooldownUntil) {
           throw new Error('Too many attempts. Try again in ' + Math.ceil((loginCooldownUntil - Date.now())/1000) + 's.');
        }
        
        let targetEmail = values.identifier.trim();
        if (!targetEmail.includes('@')) {
          const { data: emailData, error: rpcError } = await supabase.rpc('get_login_email', { p_identifier: targetEmail });
          if (rpcError || !emailData) {
             failedLoginAttempts++;
             if (failedLoginAttempts >= 5) loginCooldownUntil = Date.now() + 60000;
             throw new Error('Invalid SR code or password.');
          }
          targetEmail = emailData;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: values.password
        });
        
        if (error) {
           failedLoginAttempts++;
           if (failedLoginAttempts >= 5) loginCooldownUntil = Date.now() + 60000;
           throw new Error('Invalid SR code or password.');
        }

        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
        if (profileError || !profile || profile.is_activated === false || profile.role !== authRole) {
           failedLoginAttempts++;
           if (failedLoginAttempts >= 5) loginCooldownUntil = Date.now() + 60000;
           await supabase.auth.signOut();
           throw new Error('Invalid SR code or password.');
        }
        
        failedLoginAttempts = 0;
        const role = profile.role;

        let localUser = db.users.find(u => u.id === data.user.id);
        if (!localUser) {
          localUser = {
            id: data.user.id,
            role: role,
            identifier: profile.identifier || values.identifier.trim(),
            email: data.user.email,
            name: profile.full_name || 'Supabase User',
            status: 'Active'
          };
          db.users.push(localUser);
        }

        storeSession(localUser);
        location.hash='/' + role.toLowerCase() + '/dashboard';
        return;
      }`;

let newCode = code.replace(loginRegex, loginReplacement);
newCode = newCode.replace(/document\.addEventListener\('submit',async event=>\{/, "let failedLoginAttempts = 0;\nlet loginCooldownUntil = 0;\ndocument.addEventListener('submit',async event=>{");

fs.writeFileSync('frontend-react/src/js/app.js', newCode);
console.log('Successfully replaced login logic');

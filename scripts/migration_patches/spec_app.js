const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend-react', 'src', 'js', 'app.js');
let content = fs.readFileSync(p, 'utf8');

// 1) Add auth listener
const authListener = `
supabase.auth.onAuthStateChange(async (event, session) => {
  if (!session || event === 'SIGNED_OUT') return;
  if (event === 'PASSWORD_RECOVERY') {
    location.hash = '/reset';
    return;
  }
  const { data: profile } = await supabase.from('profiles').select('is_activated').eq('id', session.user.id).single();
  if (profile && profile.is_activated === false) {
    if (location.hash !== '#/set-password') location.hash = '/set-password';
  }
});

supabase.auth.getSession().then(async ({ data: { session } }) => {
  if (session) {
    const { data: profile } = await supabase.from('profiles').select('is_activated').eq('id', session.user.id).single();
    if (profile && profile.is_activated === false) {
      if (location.hash !== '#/set-password') location.hash = '/set-password';
    }
  }
});

window.loginAttempts = 0;
window.loginTimeout = 0;
`;

if (!content.includes('supabase.auth.onAuthStateChange')) {
  content = content.replace("import { createPortalViews } from './portal-views.js';", "import { createPortalViews } from './portal-views.js';\n" + authListener);
}

// 2) Fix routing
content = content.replace("['login','activate','reset'].includes(role)", "['login','activate','reset','set-password'].includes(role)");

// 3) Replace login-form and activation-form blocks entirely
const oldFormsRegex = /if\(form\.id==='login-form'\)\{[\s\S]*?return;\s*\}\s*if\(form\.id==='activation-form'\)\{[\s\S]*?return;\s*\}/;

const newForms = `if(form.id==='login-form'){
        if (Date.now() < window.loginTimeout) {
           throw new Error('Too many failed attempts. Please wait 30 seconds.');
        }

        let targetEmail = values.identifier.trim();
        if (!targetEmail.includes('@')) {
          const { data: emailData } = await supabase.rpc('get_email_by_identifier', { p_identifier: targetEmail });
          if (!emailData) {
            window.loginAttempts++;
            if (window.loginAttempts >= 5) window.loginTimeout = Date.now() + 30000;
            throw new Error('Invalid SR code or password.');
          }
          targetEmail = emailData;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: values.password
        });
        
        if (error) {
          window.loginAttempts++;
          if (window.loginAttempts >= 5) window.loginTimeout = Date.now() + 30000;
          if (error.message.includes('Email not confirmed')) throw new Error('Please confirm your email first. Check your inbox for the link.');
          throw new Error('Invalid SR code or password.');
        }

        window.loginAttempts = 0;

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
        if (profile && profile.is_activated === false) {
           await supabase.auth.signOut();
           throw new Error('Account is not activated. Please complete setup via the email link.');
        }

        const role = profile?.role || authRole;
        if (authRole === 'Supervisor' || targetEmail.includes('@')) {
           if (role !== 'Supervisor' && authRole === 'Supervisor') {
              await supabase.auth.signOut();
              throw new Error('This email is not approved as a supervisor. Contact your coordinator.');
           }
        }

        let localUser = db.users.find(u => u.id === data.user.id);
        if (!localUser) {
          localUser = {
            id: data.user.id,
            role: role,
            identifier: profile?.identifier || values.identifier.trim(),
            email: data.user.email,
            name: profile?.full_name || 'Supabase User',
            status: 'Active'
          };
          db.users.push(localUser);
        }

        storeSession(localUser);
        location.hash='/' + role.toLowerCase() + '/dashboard';
        return;
      }
      
      if(form.id==='activation-form'){
        submit.textContent = 'Submitting...';
        
        const targetEmail = (values.email || values.identifier).trim();
        const targetId = values.identifier.trim();
        
        const { data: isValid } = await supabase.rpc('verify_activation_eligibility', { 
          p_identifier: targetId, 
          p_email: targetEmail 
        });
        
        if (isValid) {
          await supabase.auth.signInWithOtp({
            email: targetEmail,
            options: {
              shouldCreateUser: true,
              emailRedirectTo: window.location.origin + '/#set-password'
            }
          });
        }
        
        form.reset();
        toast('If the details match our records, an activation link was sent.');
        return;
      }

      if(form.id==='set-password-form'){
        if (values.password.length < 8) throw new Error('Password must be at least 8 characters');
        if (!/[A-Za-z]/.test(values.password) || !/[0-9]/.test(values.password)) throw new Error('Password must contain at least one letter and one number');
        if (values.password !== values.confirm_password) throw new Error('Passwords do not match');
        
        submit.textContent = 'Submitting...';
        
        const { error: updateError } = await supabase.auth.updateUser({ password: values.password });
        if (updateError) throw new Error(updateError.message);
        
        const { error: rpcError } = await supabase.rpc('complete_activation');
        if (rpcError) throw new Error(rpcError.message);
        
        await supabase.auth.signOut();
        toast('Account activated! Log in with your SR code and password.');
        location.hash = '#/login';
        return;
      }`;

content = content.replace(oldFormsRegex, newForms);

fs.writeFileSync(p, content, 'utf8');

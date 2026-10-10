const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend-react', 'src', 'js', 'app.js');
let content = fs.readFileSync(p, 'utf8');

// 1) Add onAuthStateChange at the top after imports and UNIVERSITY_NAME
const authListener = `
supabase.auth.onAuthStateChange((event, session) => {
  if (!session || event === 'SIGNED_OUT') return;
  if (event === 'PASSWORD_RECOVERY') {
    location.hash = '/reset';
    return;
  }
  
  if (sessionStorage.getItem('password_verified') === 'true') return;
  
  if (session.user.user_metadata?.password_set !== true) {
    if (location.hash !== '#/set-password') {
      location.hash = '/set-password';
    }
  }
});

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session && session.user.user_metadata?.password_set !== true && sessionStorage.getItem('password_verified') !== 'true') {
    if (location.hash !== '#/set-password') location.hash = '/set-password';
  }
});
`;

if (!content.includes('supabase.auth.onAuthStateChange')) {
  content = content.replace("const UNIVERSITY_NAME = 'Batangas State University';", "const UNIVERSITY_NAME = 'Batangas State University';\n" + authListener);
}

// 2) Update set-password-form logic
const oldSetPassword = /if\(form\.id==='set-password-form'\)\{[\s\S]*?return;\s*\}/;
const newSetPassword = `if(form.id==='set-password-form'){
        if (values.password.length < 8) throw new Error('Password must be at least 8 characters');
        if (values.password !== values.confirm_password) throw new Error('Passwords do not match');
        submit.textContent = 'Submitting...';
        
        const { error } = await supabase.auth.updateUser({ 
          password: values.password,
          data: { password_set: true }
        });
        
        if (error) throw new Error(error.message);
        
        await supabase.auth.signOut();
        toast('Account activated! Log in with your SR code and password.');
        location.hash = '#/login';
        return;
      }`;
content = content.replace(oldSetPassword, newSetPassword);

// 3) Mark password_verified on login
const oldLoginSuccess = "storeSession(localUser);";
const newLoginSuccess = "sessionStorage.setItem('password_verified', 'true');\n        storeSession(localUser);";
if (!content.includes("setItem('password_verified'")) {
  content = content.replace(oldLoginSuccess, newLoginSuccess);
}

fs.writeFileSync(p, content, 'utf8');

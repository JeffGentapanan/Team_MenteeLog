const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend-react', 'src', 'js', 'app.js');
let content = fs.readFileSync(p, 'utf8');

// 1. Remove auth listener
const authListenerRegex = /supabase\.auth\.onAuthStateChange\([\s\S]*?\}\);\s*supabase\.auth\.getSession\(\)[\s\S]*?\}\);\s*/;
content = content.replace(authListenerRegex, '');

// 2. Fix routing
content = content.replace("['login','activate','reset','set-password'].includes(role)", "['login','activate','reset'].includes(role)");

// 3. Remove password_verified marking
content = content.replace("sessionStorage.setItem('password_verified', 'true');\n        storeSession(localUser);", "storeSession(localUser);");

// 4. Restore activation-form to signUp and remove set-password-form
const formsRegex = /if\(form\.id==='activation-form'\)\{[\s\S]*?return;\s*\}\s*if\(form\.id==='set-password-form'\)\{[\s\S]*?return;\s*\}/;

const revertedForms = `if(form.id==='activation-form'){
        if (values.password.length < 8) throw new Error('Password must be at least 8 characters');
        if (values.password !== values.confirm_password) throw new Error('Passwords do not match');
        
        submit.textContent = 'Submitting...';
        
        let error;
        if (authRole === 'Student') {
          const res = await supabase.auth.signUp({
            email: values.email.trim(),
            password: values.password,
            options: {
              emailRedirectTo: window.location.origin,
              data: { full_name: values.full_name.trim(), university: UNIVERSITY_NAME, identifier: values.identifier.trim(), course: values.course.trim() }
            }
          });
          error = res.error;
        } else {
          const res = await supabase.auth.signUp({
            email: values.identifier.trim(),
            password: values.password,
            options: {
              emailRedirectTo: window.location.origin,
              data: { full_name: values.full_name.trim(), company: values.company.trim() }
            }
          });
          error = res.error;
        }

        if (error) {
          if (error.message.includes('Database error saving new user')) throw new Error('SR code already registered');
          if (error.message.includes('already registered')) throw new Error('Email already registered');
          throw new Error(error.message);
        }

        form.reset();
        toast('Account created! Check your email and click the confirmation link, then log in.');
        location.hash = '#/login';
        return;
      }`;

content = content.replace(formsRegex, revertedForms);

fs.writeFileSync(p, content, 'utf8');

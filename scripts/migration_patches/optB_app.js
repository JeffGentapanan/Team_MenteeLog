const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend-react', 'src', 'js', 'app.js');
let content = fs.readFileSync(p, 'utf8');

// 1) Remove auth listener and routing
content = content.replace(/supabase\.auth\.onAuthStateChange[\s\S]*?window\.loginTimeout = 0;\s*/, '');
content = content.replace("['login','activate','reset','set-password'].includes(role)", "['login','activate','reset'].includes(role)");

// 2) Revert forms block
const newFormsRegex = /if\(form\.id==='login-form'\)\{[\s\S]*?return;\s*\}\s*if\(form\.id==='activation-form'\)\{[\s\S]*?return;\s*\}\s*if\(form\.id==='set-password-form'\)\{[\s\S]*?return;\s*\}/;

const oldForms = `if(form.id==='login-form'){
        let targetEmail = values.identifier.trim();
        if (!targetEmail.includes('@')) {
          const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_identifier', { p_identifier: targetEmail });
          if (rpcError || !emailData) throw new Error('Invalid SR code or password.');
          targetEmail = emailData;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: values.password
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) throw new Error('Please confirm your email first. Check your inbox for the link.');
          throw new Error('Invalid SR code or password.');
        }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
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
        
        const { error } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: window.location.origin,
            data: { 
              identifier: targetId,
              university: UNIVERSITY_NAME
            }
          }
        });

        if (error) throw new Error(error.message);
        
        form.reset();
        toast('Activation link sent. Check your email to continue.');
        return;
      }`;

content = content.replace(newFormsRegex, oldForms);

fs.writeFileSync(p, content, 'utf8');

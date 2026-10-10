const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

// Add the global activationEmail state above the submit listener
if (!c.includes("let activationEmail = '';")) {
  c = c.replace("document.addEventListener('submit',async event=>{", "let activationEmail = '';\ndocument.addEventListener('submit',async event=>{");
}

// Replace the activation-form handler
const target = `      if(form.id==='activation-form'){
        submit.textContent = 'Submitting...';
        
        try {
          const targetEmail = (values.email || values.identifier).trim();
          const targetId = values.identifier.trim();
          
          const { data: isEligible, error: rpcError } = await supabase.rpc('verify_activation_eligibility', { p_identifier: targetId, p_email: targetEmail });
          if (rpcError) throw new Error(rpcError.message);
          
          if (isEligible) {
             const { error: otpError } = await supabase.auth.signInWithOtp({
               email: targetEmail,
               options: {
                 shouldCreateUser: true,
                 emailRedirectTo: window.location.origin + '/activate.html'
               }
             });
             if (otpError) throw new Error(otpError.message);
          } else {
             throw new Error('Eligibility check failed. SR Code/Email not found or already activated.');
          }
          
          form.reset();
          toast('If the details match our records, an activation link was sent.');
        } finally {
          submit.textContent = 'Send Activation Link';
        }
        return;
      }`;

const replacement = `      if(form.id==='activation-form'){
        submit.textContent = 'Sending...';
        try {
          const targetEmail = (values.email || values.identifier).trim();
          const targetId = values.identifier.trim();
          
          const { data: isEligible, error: rpcError } = await supabase.rpc('verify_activation_eligibility', { p_identifier: targetId, p_email: targetEmail });
          if (rpcError) throw new Error(rpcError.message);
          
          if (isEligible) {
             const { error: otpError } = await supabase.auth.signInWithOtp({
               email: targetEmail,
               options: { shouldCreateUser: true }
             });
             if (otpError) throw new Error(otpError.message);
          } else {
             throw new Error('Eligibility check failed. SR Code/Email not found or already activated.');
          }
          
          activationEmail = targetEmail;
          document.getElementById('otp-email-display').textContent = targetEmail;
          document.getElementById('step1-container').style.display = 'none';
          document.getElementById('step2-container').style.display = 'block';
        } finally {
          submit.textContent = 'Send Activation Code';
        }
        return;
      }
      
      if(form.id==='verify-otp-form') {
        submit.textContent = 'Verifying...';
        try {
          const token = values.otp.trim();
          const { error } = await supabase.auth.verifyOtp({ email: activationEmail, token, type: 'email' });
          if (error) throw new Error('Invalid or expired code. Please check and try again.');
          
          document.getElementById('step2-container').style.display = 'none';
          document.getElementById('step3-container').style.display = 'block';
        } finally {
          submit.textContent = 'Verify Code \u2192';
        }
        return;
      }

      if(form.id==='set-password-form') {
        submit.textContent = 'Activating...';
        try {
          const password = values.password;
          const confirm = values.confirm;
          if (password !== confirm) throw new Error('Passwords do not match.');
          if (password.length < 8) throw new Error('Password must be at least 8 characters.');
          
          const { error: passErr } = await supabase.auth.updateUser({ password });
          if (passErr) throw new Error(passErr.message);
          
          await supabase.rpc('complete_activation', { p_email: activationEmail });
          await supabase.auth.signOut();
          
          document.getElementById('step3-container').style.display = 'none';
          document.getElementById('activate-success').style.display = 'block';
        } finally {
          submit.textContent = 'Complete Activation';
        }
        return;
      }`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend-react/src/js/app.js', c);
  console.log("app.js patched successfully.");
} else {
  console.log("Target string not found in app.js");
}

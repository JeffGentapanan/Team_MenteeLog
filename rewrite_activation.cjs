const fs = require('fs');
const htmlPath = 'frontend-react/activate.html';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MenteeLog | Activate Your Account</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="./src/styles.css">
</head>
<body class="auth-page">
  <div class="auth-reference">
    <section class="auth-reference-photo">
      <img src="./assets/photos/group.jpg" alt="" class="auth-photo">
      <div class="auth-tint"></div>
      <img class="auth-watermark" src="./assets/MenteeLoo_Logo.svg" alt="">
      <h1>Join the MenteeLog<br>Journey.<br>Step Forward into<br>Your Future.</h1>
      <span class="auth-rule"></span>
      <p>
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg> 
        Official Student Mentorship Network
      </p>
    </section>
    
    <main class="auth-reference-main" id="main">
      <section class="auth-reference-card">
        <header>
          <div class="logo-lockup">
            <img src="./assets/MenteeLog_Logo.png" alt="MenteeLog Logo">
            <span>enteeLog</span>
          </div>
          <h2>MenteeLog — Activate Your Account</h2>
          <p>Complete the steps below to set up your account</p>
        </header>

        <div class="auth-reference-body">
          <p class="auth-role-label">I AM A...</p>
          <div class="activation-roles">
            <button type="button" class="btn full" id="role-student" onclick="setRole('Student')">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              Student
            </button>
            <button type="button" class="btn secondary full" id="role-supervisor" onclick="setRole('Supervisor')">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
              Supervisor
            </button>
          </div>

          <!-- 1-Step Activation Form -->
          <form id="activation-form" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="field">
              <label for="activate-identifier" id="identifier-label">SR CODE</label>
              <input id="activate-identifier" name="identifier" type="text" required autocomplete="off" placeholder="Enter your SR code">
            </div>
            
            <div class="field" id="student-email-group" style="display: flex;">
              <label for="activate-email">REGISTERED EMAIL ADDRESS</label>
              <input id="activate-email" name="email" type="email" autocomplete="off" placeholder="your@email.com" required>
            </div>
            
            <div class="field">
              <label for="activate-password">CREATE PASSWORD</label>
              <div class="password-field">
                <input id="activate-password" name="password" type="password" required minlength="8" placeholder="Min. 8 characters">
                <button type="button" data-action="toggle-password" aria-label="Show password">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                </button>
              </div>
            </div>
            
            <p class="form-error main-error" id="activation-error" role="alert"></p>
            <button type="submit" class="btn full" id="activate-btn">Activate Account</button>
            <p style="text-align:center; font-size:13px; margin-top:-8px;">
              <a href="/#/login" style="color:var(--maroon);">&larr; Back to Login</a>
            </p>
          </form>

          <!-- Success Message -->
          <div id="activate-message" style="display: none; text-align: center; padding: 20px 0;">
            <p class="form-error main-error" id="success-text" style="margin-bottom: 20px; font-size: 15px; color: #155724; background-color: #d4edda; border-color: #c3e6cb; padding: 15px; border-radius: var(--radius); text-align: center; border: 1px solid;"></p>
            <a href="/#/login" class="btn full">Go to Login Page</a>
          </div>
        </div>
      </section>
    </main>
  </div>

  <script>
    window.selectedRole = 'Student';
    
    function setRole(role) {
      window.selectedRole = role;
      document.getElementById('role-student').className = role === 'Student' ? 'btn full' : 'btn secondary full';
      document.getElementById('role-supervisor').className = role === 'Supervisor' ? 'btn full' : 'btn secondary full';
      
      const label = document.getElementById('identifier-label');
      const input = document.getElementById('activate-identifier');
      const emailGroup = document.getElementById('student-email-group');
      const emailInput = document.getElementById('activate-email');
      
      if (role === 'Supervisor') {
        label.textContent = 'CORPORATE EMAIL';
        input.type = 'email';
        input.placeholder = 'your@email.com';
        emailGroup.style.display = 'none';
        emailInput.removeAttribute('required');
      } else {
        label.textContent = 'SR CODE';
        input.type = 'text';
        input.placeholder = 'Enter your SR code';
        emailGroup.style.display = 'flex';
        emailInput.setAttribute('required', 'true');
      }
    }
  </script>
  <script type="module" src="./src/js/activate.js"></script>
</body>
</html>`;

fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const jsPath = 'frontend-react/src/js/activate.js';
const jsContent = `import { supabase } from '../supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('activation-form');
  const errorText = document.getElementById('activation-error');
  const btn = document.getElementById('activate-btn');
  const messageDiv = document.getElementById('activate-message');
  const successText = document.getElementById('success-text');

  // Toggle password visibility
  document.querySelectorAll('[data-action="toggle-password"]').forEach(b => {
    b.addEventListener('click', (e) => {
      const input = e.currentTarget.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorText.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Activating...';

    const role = window.selectedRole || 'Student';
    const identifier = document.getElementById('activate-identifier').value.trim();
    const email = role === 'Supervisor' ? identifier : document.getElementById('activate-email').value.trim();
    const password = document.getElementById('activate-password').value;

    try {
      // 1. Check if eligible
      const { data: isEligible, error: rpcError } = await supabase
        .rpc('verify_activation_eligibility', { p_identifier: identifier, p_email: email });

      if (rpcError) throw new Error(rpcError.message);
      if (!isEligible) {
        throw new Error('Account not found or already activated. Please check your details.');
      }

      // 2. Create the Auth user using the provided password
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
            throw new Error('This email is already registered in Auth. You may need to Reset Password instead.');
        }
        throw new Error(signUpError.message);
      }

      // 3. Mark the account as activated in school_registry
      // To do this reliably on the frontend, we use an RPC. If the RPC isn't fully ready, 
      // the backend will handle it, but we can try to call it.
      // Wait, if "Confirm email" is OFF, the user is instantly logged in!
      if (authData.session) {
         await supabase.rpc('complete_activation', { p_email: email });
      }

      // 4. Success UI
      form.style.display = 'none';
      messageDiv.style.display = 'block';
      
      // Tell the user if they need to check their email based on whether a session was returned
      if (authData.session) {
          successText.textContent = 'Activation successful! Your account is now active and you can log in.';
      } else {
          successText.textContent = 'Account created! Please check your email inbox (and spam folder) for a confirmation link to complete activation.';
      }

    } catch (err) {
      errorText.textContent = err.message || 'An unexpected error occurred.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Activate Account';
    }
  });
});
`;

fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('done writing completely new flow');

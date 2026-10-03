import { supabase } from '../supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('set-password-form');
  const messageDiv = document.getElementById('activate-message');
  const messageText = messageDiv.querySelector('.form-error');
  const submitBtn = form.querySelector('button[type="submit"]');
  const formError = form.querySelector('.form-error.main-error') || form.querySelector('.form-error');

  const INVALID_MSG = 'This activation link is invalid or expired. Request a new one from the login page.';

  function showMessage(msg, isSuccess = false) {
    form.style.display = 'none';
    messageDiv.style.display = 'block';
    messageText.textContent = msg;
    if (isSuccess) {
      messageText.style.color = '#155724';
      messageText.style.backgroundColor = '#d4edda';
      messageText.style.borderColor = '#c3e6cb';
    } else {
      messageText.style.color = 'var(--error)';
      messageText.style.backgroundColor = '';
      messageText.style.borderColor = '';
    }
  }

  function resetBtn() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Activate Account';
  }

  document.querySelectorAll('[data-action="toggle-password"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const input = e.currentTarget.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  try {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const otpType = params.get('type') || 'email';
    let verified = false; // the token can only be used once

    if (tokenHash) {
      // New flow: do NOT touch the token until the user submits the form
      form.style.display = 'flex';
    } else {
      // Fallback: old-style link that already created a session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return showMessage(INVALID_MSG);
      verified = true;

      const { data: profile, error } = await supabase
        .from('profiles').select('is_activated, role').eq('id', session.user.id).single();
      if (error || !profile) return showMessage('Error retrieving your profile. Please contact support.');
      if (profile.is_activated === true) return showMessage('Account already activated');

      form.style.display = 'flex';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      formError.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Activating...';

      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm_password').value;

      if (password !== confirm) {
        formError.textContent = 'Passwords do not match.';
        return resetBtn();
      }
      
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_]/.test(password);

      if (password.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
        formError.textContent = 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.';
        return resetBtn();
      }

      try {
        // Verify the token now, once. A retry after a later error skips this.
        if (tokenHash && !verified) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });
          if (otpError) return showMessage("Token Error: " + otpError.message);
          verified = true;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return showMessage("Session dead: User not found or deleted from database.");

        const { data: profile, error: profileError } = await supabase
          .from('profiles').select('is_activated, role').eq('id', user.id).single();
        if (profileError || !profile) throw new Error('Error retrieving your profile. Please contact support.');
        if (profile.is_activated === true) {
          await supabase.auth.signOut();
          return showMessage('Account already activated');
        }

        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw new Error(updateError.message);

        const { error: rpcError } = await supabase.rpc('complete_activation');
        if (rpcError) throw new Error(rpcError.message);

        const successMsg = profile.role === 'Supervisor' 
          ? 'Account activated! Log in with your corporate email and password.' 
          : 'Account activated! Log in with your SR code and password.';

        await supabase.auth.signOut();
        showMessage(successMsg, true);
      } catch (err) {
        formError.textContent = err.message;
        resetBtn();
      }
    });
  } catch (err) {
    showMessage('An unexpected error occurred.');
  }
});

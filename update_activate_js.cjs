const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/activate.js', 'utf8');

const oldLogic = `    const identifier = document.getElementById('activate-email').value.trim();
    const role = window.selectedRole || 'Student';

    try {
      // Look up the email in school_registry
      let targetEmail = identifier;

      if (!identifier.includes('@')) {
        // It's an SR code — look up the email
        const { data: emailData, error: rpcError } = await supabase
          .rpc('get_login_email', { p_identifier: identifier });

        if (rpcError || !emailData) {
          throw new Error('SR code not found. Please check your code or contact your coordinator.');
        }
        targetEmail = emailData;
      }`;

const newLogic = `    const identifier = document.getElementById('activate-email').value.trim();
    const role = window.selectedRole || 'Student';
    const studentEmailField = document.getElementById('activate-student-email');
    
    try {
      let targetEmail = identifier;

      if (role === 'Student') {
        if (!studentEmailField.value.trim()) {
          throw new Error('Please enter your registered email address.');
        }
        targetEmail = studentEmailField.value.trim();
      }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('frontend-react/src/js/activate.js', content, 'utf8');
console.log('done');

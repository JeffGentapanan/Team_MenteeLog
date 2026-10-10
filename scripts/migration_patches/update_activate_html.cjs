const fs = require('fs');
let content = fs.readFileSync('frontend-react/activate.html', 'utf8');

const oldField = `<div class="field">
                <label for="activate-email" id="email-label">SR CODE</label>
                <input id="activate-email" name="identifier" type="text" required autocomplete="off" placeholder="Enter your SR code">
              </div>`;

const newField = `<div class="field">
                <label for="activate-email" id="email-label">SR CODE</label>
                <input id="activate-email" name="identifier" type="text" required autocomplete="off" placeholder="Enter your SR code">
              </div>
              <div class="field" id="student-email-group">
                <label for="activate-student-email">REGISTERED EMAIL ADDRESS</label>
                <input id="activate-student-email" name="student_email" type="email" autocomplete="off" placeholder="your@email.com" required>
              </div>`;

content = content.replace(oldField, newField);

const oldScript = `if (role === 'Supervisor') {
        label.textContent = 'CORPORATE EMAIL';
        input.type = 'email';
        input.placeholder = 'your@email.com';
      } else {
        label.textContent = 'SR CODE';
        input.type = 'text';
        input.placeholder = 'Enter your SR code';
      }`;

const newScript = `if (role === 'Supervisor') {
        label.textContent = 'CORPORATE EMAIL';
        input.type = 'email';
        input.placeholder = 'your@email.com';
        document.getElementById('student-email-group').style.display = 'none';
        document.getElementById('activate-student-email').removeAttribute('required');
      } else {
        label.textContent = 'SR CODE';
        input.type = 'text';
        input.placeholder = 'Enter your SR code';
        document.getElementById('student-email-group').style.display = 'flex';
        document.getElementById('activate-student-email').setAttribute('required', 'true');
      }`;

content = content.replace(oldScript, newScript);
fs.writeFileSync('frontend-react/activate.html', content, 'utf8');
console.log('done');

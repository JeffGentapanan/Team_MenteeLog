const fs = require('fs');
let content = fs.readFileSync('frontend-react/src/js/public.js', 'utf8');

content = content.replace('<section class="about-hero reveal-on-scroll">', '<section id="about-us" class="about-hero reveal-on-scroll">');
content = content.replace('<section class="team-section maroon">', '<section id="our-team" class="team-section maroon">');
content = content.replace('<section class="contact-section reveal-on-scroll">', '<section id="contact" class="contact-section reveal-on-scroll">');
content = content.replace('<section class="partner-section ', '<section id="partnerships" class="partner-section ');
content = content.replace('<section class="ojt-success-guide reference-width"', '<section id="compliance-guide" class="ojt-success-guide reference-width"');
content = content.replace('<div class="industry-list reference-width">', '<div id="browse-interns" class="industry-list reference-width">');

const oldFooter = `    <!-- Nav Column: Employers -->
    <div style="flex: 1; min-width: 130px;">
      <p style="font-weight: 700; font-size: 13px; letter-spacing: 0.08em; color: #f2e3df; margin-bottom: 16px; text-transform: uppercase;">Employers</p>
      <a href="#/public/supervisor" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Supervisor Portal</a>
      <a href="#/public/company" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">About MenteeLog</a>
      <a href="#/public/students" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Browse Interns</a>
      <a href="#/public/supervisor" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Request Demo</a>
    </div>

    <!-- Nav Column: Institutions -->
    <div style="flex: 1; min-width: 130px;">
      <p style="font-weight: 700; font-size: 13px; letter-spacing: 0.08em; color: #f2e3df; margin-bottom: 16px; text-transform: uppercase;">Institutions</p>
      <a href="#/public/career-centers" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Career Centers</a>
      <a href="#/public/career-centers" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Partnerships</a>
      <a href="#/public/guide" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Compliance Guide</a>
      <a href="#/public/career-centers" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Request Demo</a>
    </div>

    <!-- Nav Column: Company -->
    <div style="flex: 1; min-width: 130px;">
      <p style="font-weight: 700; font-size: 13px; letter-spacing: 0.08em; color: #f2e3df; margin-bottom: 16px; text-transform: uppercase;">Company</p>
      <a href="#/public/company" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">About Us</a>
      <a href="#/public/company" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Our Team</a>
      <a href="#/public/students" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Press</a>
      <a href="#/public/company" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Contact</a>
    </div>`;

const newFooter = `    <!-- Nav Column: Employers -->
    <div style="flex: 1; min-width: 130px;">
      <p style="font-weight: 700; font-size: 13px; letter-spacing: 0.08em; color: #f2e3df; margin-bottom: 16px; text-transform: uppercase;">Employers</p>
      <a href="#/public/supervisor" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Supervisor Portal</a>
      <a href="#/public/company?scrollTo=about-us" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">About MenteeLog</a>
      <a href="#/public/students?scrollTo=browse-interns" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Browse Interns</a>
      <a href="#/public/supervisor?scrollTo=contact" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Request Demo</a>
    </div>

    <!-- Nav Column: Institutions -->
    <div style="flex: 1; min-width: 130px;">
      <p style="font-weight: 700; font-size: 13px; letter-spacing: 0.08em; color: #f2e3df; margin-bottom: 16px; text-transform: uppercase;">Institutions</p>
      <a href="#/public/career-centers" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Career Centers</a>
      <a href="#/public/career-centers?scrollTo=partnerships" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Partnerships</a>
      <a href="#/public/guide?scrollTo=compliance-guide" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Compliance Guide</a>
      <a href="#/public/career-centers?scrollTo=contact" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Request Demo</a>
    </div>

    <!-- Nav Column: Company -->
    <div style="flex: 1; min-width: 130px;">
      <p style="font-weight: 700; font-size: 13px; letter-spacing: 0.08em; color: #f2e3df; margin-bottom: 16px; text-transform: uppercase;">Company</p>
      <a href="#/public/company?scrollTo=about-us" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">About Us</a>
      <a href="#/public/company?scrollTo=our-team" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Our Team</a>
      <a href="#/public/students" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Press</a>
      <a href="#/public/company?scrollTo=contact" style="display: block; color: #d6babb; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d6babb'">Contact</a>
    </div>`;

content = content.replace(oldFooter, newFooter);
fs.writeFileSync('frontend-react/src/js/public.js', content, 'utf8');
console.log('Successfully updated footer links and IDs');

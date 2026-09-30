const fs = require('fs');
let code = fs.readFileSync('dist/js/public.js', 'utf8');

const newFooter = `function footer(){
  return \`<footer class="reference-footer" style="background-color: var(--burgundy); color: white; padding: 60px 5%; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden; min-height: unset;">
  
  <div class="footer-contact" style="align-self: flex-start; text-align: left; margin-bottom: 20px;">
    <a href="#/" aria-label="MenteeLog home" style="display: block; margin-bottom: 20px;">
      <img class="footer-logo" src="./assets/MenteeLoo_Logo.svg" alt="MenteeLog" style="height: 45px; object-fit: contain; margin-left: -4px;">
    </a>
    <p style="margin: 10px 0; display: flex; align-items: center; gap: 12px; font-size: 15px; color: #f2e3df;">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
      info@menteelog.com
    </p>
    <p style="margin: 10px 0; display: flex; align-items: center; gap: 12px; font-size: 15px; color: #f2e3df;">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      Iloilo, Philippines
    </p>
  </div>
  
  <h2 style="font-size: clamp(28px, 4vw, 42px); line-height: 1.4; font-weight: 700; margin: 40px auto 60px; text-align: center; color: white;">
    Inspiring Excellence.<br>
    Linking Opportunities.<br>
    Transforming the Future.
  </h2>
  
  <div class="footer-legal" style="font-size: 13px; color: #d6babb; text-align: center; width: 100%;">
    <p style="margin-bottom: 12px;">&copy; Copyright 2025 OJT Connect. All Rights Reserved.</p>
    <button class="footer-policy" data-action="privacy" style="background: none; border: none; color: inherit; cursor: pointer; margin-bottom: 30px; font-weight: 500;">Privacy and Cookies Policy</button>
    
    <div class="social-symbols" aria-label="Social media icons" style="display: flex; justify-content: center; gap: 20px;">
      <a href="#/" aria-label="LinkedIn" style="color: white; transition: opacity 0.2s;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
      <a href="#/" aria-label="Facebook" style="color: white; transition: opacity 0.2s;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></a>
      <a href="#/" aria-label="Instagram" style="color: white; transition: opacity 0.2s;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
      <a href="#/" aria-label="TikTok" style="color: white; transition: opacity 0.2s;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-2.61.94-5.3 3.02-6.78 1.65-1.18 3.8-1.61 5.75-1.2l.02 4.13c-1.02-.13-2.09-.07-3.05.34-1.5.6-2.58 2.03-2.65 3.63-.07 1.37.66 2.69 1.83 3.33 1.25.68 2.87.69 4.14-.04 1.47-.85 2.45-2.43 2.46-4.13.03-5.26.02-10.51.02-15.77z"/></svg></a>
      <a href="#/" aria-label="YouTube" style="color: white; transition: opacity 0.2s;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></a>
    </div>
  </div>
</footer>\`;
}`;

const oldFooterRegex = /function footer\(\)\{.*?<\/footer>\`;\n\}/s;

if (oldFooterRegex.test(code)) {
  code = code.replace(oldFooterRegex, newFooter);
  fs.writeFileSync('dist/js/public.js', code);
  console.log("Replaced footer in public.js");
} else {
  console.log("Regex didn't match.");
}

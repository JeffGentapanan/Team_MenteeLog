// Rebuild of the supplied landing/authentication exports. Only photograph
// regions are reused from PNGs; text, navigation, cards and buttons are HTML.
const crops={group:['home',178,2398,500,268],employers:['home',711,2398,497,268],skills:['home',169,1548,318,177],connections:['home',520,1548,319,177],tomorrow:['home',869,1548,318,177],supervisor:['company',97,997,509,287],company:['company',791,997,510,287],career:['company',467,1529,509,286],portrait:['company',246,2427,279,267]};
export function photo(name,cls='',label='MenteeLog students'){const overrides={group:'img1.jpg',employers:'img2.jpg',skills:'img3.jpg',connections:'img4.jpg',tomorrow:'img5.jpg',supervisor:'img6.jpg',company:'img7.jpg',career:'img8.jpg',portrait:'img9.jpg'};const [file,x,y,w,h]=crops[name]||crops.group;if(overrides[name]){return `<svg class="reference-photo ${cls}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}"><image href="./assets/team/${overrides[name]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" /></svg>`;}return `<svg class="reference-photo ${cls}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}"><image href="./assets/references/${file}.png" width="${file==='home'?1359:1400}" height="${file==='home'?4633:5211}"/></svg>`;}
const partners=['Accenture PH','Globe Telecom','BDO Unibank','Meralco','SM Technologies','PLDT','Metrobank','PhilStar Digital'];
function partnerSection(dark=false){return `<section class="partner-section ${dark?'maroon':''}"><h3>ACCREDITED HOST TRAINING ESTABLISHMENTS</h3><div class="partner-list">${partners.map(p=>`<span>${p}</span>`).join('')}</div></section>`;}
function joinSection(safe=true){return `<section class="join-section">${safe?'<p class="public-kicker">— Safe. Verified. Reliable. —</p><h2 class="reveal-on-scroll">Strong Local Partnerships, Nationwide.</h2><p class="public-small">Trusted companies. Real opportunities.</p>':''}<p class="public-kicker">— Join MenteeLog —</p><h2 class="reveal-on-scroll">Where Talent Connects with Opportunity.</h2><p class="public-small">Empowering careers and simplifying hiring: Menteelog makes connecting with skilled Filipino interns effortless.</p><a class="btn" href="#/login">Get Started</a></section>`;}

function contactSection(icon) {
    return `<section class="contact-section reveal-on-scroll">
        <div class="contact-container">
            <!-- Left Side: Photo -->
            <div class="contact-photo">
                ${photo('portrait', 'contact-img')}
            </div>
            <!-- Right Side: Form -->
            <div class="contact-form-card">
                <h3 class="contact-title">Connect with our team to explore partnership or request a demo.</h3>
                <p class="contact-subtitle">Let's Work Together</p>
                
                <form id="public-contact-form" class="contact-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Name <span>*</span></label>
                            <input type="text" placeholder="Your full name" required>
                        </div>
                        <div class="form-group">
                            <label>Email <span>*</span></label>
                            <input type="email" placeholder="you@company.com" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Company / Organization</label>
                            <input type="text" placeholder="Your company (optional)">
                        </div>
                        <div class="form-group">
                            <label>I am a</label>
                            <select required>
                                <option value="Employer">Employer</option>
                                <option value="University">University</option>
                                <option value="Student">Student</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Message <span>*</span></label>
                        <textarea placeholder="Tell us about your inquiry or how we can help..." rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn full contact-submit">Send Message</button>
                </form>
            </div>
        </div>
    </section>`;
}

function footer(){
  return `<footer class="reference-footer" style="background-color: var(--burgundy); color: white; padding: 60px 5%; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden; min-height: unset;">
  
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
</footer>`;
}
const homeJobs=[['A','Technology Analyst Intern','Accenture Philippines','BSCS / BSIT','BGC, Taguig',12],['G','Network Engineering Intern','Globe Telecom','BSEE / BSIT','Pioneer, Mandaluyong',8],['B','FinTech & Systems Intern','BDO Unibank','BSCS / BSBA','Makati CBD',6],['M','ICT Infrastructure Intern','Meralco','BSECE / BSIT','Ortigas, Pasig',4],['P','Software Development Intern','PhilStar Digital','BSCS / BSIT','Makati',5],['S','Business Intelligence Intern','SM Technologies','BSCS / BSBA','Mall of Asia, Pasay',10]];
export function publicLanding(page,{brand,icon}){const selected=['students','supervisor','career-centers','company','guide'].includes(page)?page:'home';const nav=[['home','Home'],['students','Students'],['supervisor','Supervisor'],['career-centers','Career Centers'],['company','Company']];const heroes={home:['One Platform.<br>Every OJT Journey.','Seamlessly connect students, industry supervisors, and OJT<br>coordinators. From placement to completion — fully digital, fully<br>tracked.','Get Started — It’s Free','group','Student'],students:['BE NOTICED. GET PLACED.','Connect with accredited local and international internship opportunities.','Begin Your OJT Journey','connections','Student'],supervisor:['PARTNER SMARTER.<br>MANAGE INTERNS EFFORTLESSLY.','Connect with verified student interns,<br>streamline MOA accreditations, and evaluate performance in one place.','Become a Partner HTE','supervisor','Supervisor'],'career-centers':["STREAMLINE OJT GOVERNANCE & COMPLIANCE",'Manage student placements, track real-time hours, and monitor MOA accreditations in one platform.','Access Coordinator Portal','career','Coordinator'],company:['MENTEELOG','Manage student placements, track real-time hours, and monitor MOA accreditations in one platform','Get Started','company','Student'], guide:['THE COMPLETE OJT GUIDE','Master every module of the MenteeLog ecosystem from onboarding to graduation.','Enter MenteeLog','group','Student']};const [title,subtitle,cta,img,role]=heroes[selected];return `<div class="public-site public-${selected}"><header class="reference-header">${brand()}<nav aria-label="Public navigation">${nav.map(([id,label])=>`<a href="#/${id==='home'?'':'public/'+id}" class="${selected===id?'selected':''}" ${selected===id?'aria-current="page"':''}>${label}</a>`).join('')}</nav><a class="btn" href="#/login">Sign In</a></header><main id="main" tabindex="-1"><section class="reference-hero">${photo(img,'hero-photo')}<div class="hero-overlay"></div><div class="reference-hero-content"><span class="hero-pill">${icon('shield')} Real-time OJT Placement & Tracking</span><h1>${title}</h1><p>${subtitle}</p><div class="hero-cta"><a class="btn" data-role="${role}" href="#/login">${cta}</a>${selected==='home'?'<button class="btn watch-button" data-action="watch-demo">Watch Demo</button>':''}</div></div></section>${selected==='home'?homeBody(icon):selected==='company'?companyBody(icon):selected==='guide'?guideBody(icon):roleBody(selected,icon)}${selected==='home'?partnerSection()+joinSection()+faqSection():selected==='company'?joinSection(false):partnerSection(selected!=='students')+joinSection()}${['students', 'supervisor', 'career-centers', 'company'].includes(selected) ? contactSection(icon) : ''}</main>${footer()}</div>`;}
function homeBody(icon){return `<section class="opportunities reference-width"><div class="row between"><div><h2 class="reveal-on-scroll">Open OJT Opportunities</h2><p>Currently accepting applications for AY 2025–2026</p></div><div class="public-filters"><select id="public-course" aria-label="Filter opportunities by course"><option value="All">All Courses</option><option>BSCS</option><option>BSIT</option><option>BSBA</option><option>BSEE</option><option>BSECE</option></select><select id="public-location" aria-label="Filter opportunities by location"><option value="All">All Locations</option>${['Taguig','Mandaluyong','Makati','Pasig','Pasay'].map(v=>`<option>${v}</option>`).join('')}</select></div></div><div class="home-jobs">${homeJobs.map(([initial,title,company,courses,location,slots])=>`<article class="home-job reveal-on-scroll" data-courses="${courses}" data-location="${location}"><div class="row"><span class="home-job-logo">${initial}</span><div><h3>${title}</h3><p>${company}</p></div></div><ul><li>${icon('users')} ${courses}</li><li>${icon('pin')} ${location}</li><li>${icon('users')} ${slots} slots available</li></ul><a class="btn" href="#/login">Apply Now</a></article>`).join('')}</div><p id="public-empty" class="small" hidden>No opportunities match these filters.</p></section><section class="why-section reference-width"><p class="section-kicker reveal-on-scroll">— Why MenteeLog is the Right Choice —</p><h2 class="reveal-on-scroll">Aligning skills with opportunities:<br>connecting driven interns and trusted employers.</h2><p class="public-small">Simplifying local internships through trusted listings and authentic paths to employment.</p><div class="public-stats">${[['1,240+','Registered Students'],['86','Accredited HTEs'],['98%','Placement Rate'],['500K+','DTR Hours Logged']].map(([n,l])=>`<div><strong>${n}</strong><span>${l}</span></div>`).join('')}</div><div class="benefit-grid">${[['skills','Unlocking Capabilities','— Grow Your Skills —','Build confidence, gain experience, and step directly into your field. Menteelog gives you guided app features and verified internships to fast-track your career growth.'],['connections','Connecting Opportunities','— Step Into Your Career —','Discover relevant roles, apply fast, and step directly into your field. Menteelog aligns your skills with real-world opportunities across the Philippines and beyond.'],['tomorrow','Building a Stronger Tomorrow','— Define Your Career Path —','Build your future on a solid foundation. Menteelog brings interns and companies together through trusted opportunities designed for real career advancement.']].map(([p,t,k,d])=>`<article class="benefit-card reveal-on-scroll">${photo(p)}<div><h3>${t}</h3><p class="card-kicker">${k}</p><p>${d}</p><a class="btn" href="#/public/students">Learn more</a></div></article>`).join('')}</div></section><section class="how-section"><p class="section-kicker reveal-on-scroll">— How MenteeLog Works —</p><h2 class="reveal-on-scroll">Simplifying Internship Hiring for Students and Verified Companies</h2><p class="public-small">Post opportunities, submit applications, and connect directly—Menteelog streamlines your entire internship workflow.</p><div class="how-grid reference-width">${[['group','For Interns','— Your Path to the Right Internship —','Find opportunities that truly fit your goals.',['Explore verified job listings from global companies','Search by role, skills, location, setup, and date posted','Apply to multiple listings with ease','Track your applications inside the platform','Get interview invites directly from employers','Build early exposure to real industry environments'],'students'],['employers','For Employers','— A Simpler Way to Find Talent —','Connect with skilled and dependable Filipino interns.',['Post clear and detailed OJT listings','Access a diverse pool of student applicants','Message and manage candidates on the platform','Schedule interviews in-app','Streamline your entire OJT recruitment workflow','Gain visibility across hundreds of active student users'],'supervisor']].map(([p,t,k,d,items,to])=>`<article class="how-card reveal-on-scroll">${photo(p)}<div><h3>${t}</h3><p class="card-kicker">${k}</p><p>${d}</p><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul><a class="btn" href="#/public/${to}">Learn more</a></div></article>`).join('')}</div></section>`;}
function roleBody(page,icon){let title,kicker,sub,items;if(page==='students'){title='YOUR SEAMLESS PATH TO PLACEMENT';kicker='— How MenteeLog Works —';sub='Discover accredited opportunities, log your hours, track performance, and fulfill your OJT requirements—all in one platform.';items=[['pin','Discover','accredited listings from partner HTEs'],['search','Apply','with one-click resume attachments'],['file','Track','to multiple listings with ease'],['chart','Filter','by program, required skills, and location'],['users','Log','GPS-verified clock-ins and daily task summaries'],['briefcase','Complete','supervisor approvals and live hour count']];}else if(page==='supervisor'){title='A STREAMLINED PATHWAY FOR INDUSTRY PARTNERS';kicker='— Host Training Establishment (HTE) Ecosystem —';sub='Onboard student interns, satisfy institutional compliance, and review performance seamlessly.';items=[['plus','Post Placements','Publish OJT roles tied to degree tracks'],['users','Review Applicants','Screen verified student profiles and resumes'],['briefcase','Track Candidates','Manage application pipelines and offers'],['users','Verify DTR','Approve GPS clock-ins and daily task logs workflow'],['chart','Manage MOAs','Track company accreditations and renewals'],['star','Evaluate Interns','Submit final supervisor performance reviews']];}else{title="ELEVATE YOUR INSTITUTION’S OJT MANAGEMENT";kicker='';sub='';items=[['users','Manage HTEs','Accredit partner companies and track active listings'],['briefcase','Place Students','Match interns with accredited host companies'],['target','Resolve Incidents','Handle student reports, mediation, and reassignments'],['chart','Monitor Hours','Audit GPS-verified DTR logs and progress live'],['file','Govern MOAs','Track document renewals and legal compliance'],['star','Generate Reports','Export batch certificates and partner analytics']];}return `<section class="role-info ${page==='students'?'maroon':''}"><p class="section-kicker reveal-on-scroll">${kicker}</p><h2 class="reveal-on-scroll">${title}</h2>${sub?`<p>${sub}</p>`:''}<div class="role-feature-grid reference-width">${items.map(([i,t,d])=>`<article><span class="feature-icon">${icon(i)}</span><div><h3>${t}</h3><p>${d}</p></div></article>`).join('')}</div>${page==='students'?`<div class="industry-list reference-width"><p class="section-kicker reveal-on-scroll">— Explore By Industry & Specialization —</p><h2 class="reveal-on-scroll">Find Internships Across Popular Fields</h2><p>Browse accredited host training establishments by domain, academic track, or career interest.</p>
<div class="marquee-container">
    <div class="marquee-track track-left">
        <a href="#/login">Design & UI/UX</a><a href="#/login">Marketing</a><a href="#/login">Others</a><a href="#/login">Computer and Technology</a><a href="#/login">Retail</a><a href="#/login">Finance</a><a href="#/login">Advertising and Marketing</a><a href="#/login">Design & UI/UX</a><a href="#/login">Marketing</a><a href="#/login">Others</a><a href="#/login">Computer and Technology</a><a href="#/login">Retail</a><a href="#/login">Finance</a><a href="#/login">Advertising and Marketing</a><a href="#/login">Design & UI/UX</a><a href="#/login">Marketing</a><a href="#/login">Others</a><a href="#/login">Computer and Technology</a><a href="#/login">Retail</a><a href="#/login">Finance</a><a href="#/login">Advertising and Marketing</a><a href="#/login">Design & UI/UX</a><a href="#/login">Marketing</a><a href="#/login">Others</a><a href="#/login">Computer and Technology</a><a href="#/login">Retail</a><a href="#/login">Finance</a><a href="#/login">Advertising and Marketing</a>
    </div>
    <div class="marquee-track track-right">
        <a href="#/login">Design</a><a href="#/login">Development</a><a href="#/login">Multimedia</a><a href="#/login">Software Engineering</a><a href="#/login">Supply Chain</a><a href="#/login">Administration</a><a href="#/login">Data Science / Analytics</a><a href="#/login">Design</a><a href="#/login">Development</a><a href="#/login">Multimedia</a><a href="#/login">Software Engineering</a><a href="#/login">Supply Chain</a><a href="#/login">Administration</a><a href="#/login">Data Science / Analytics</a><a href="#/login">Design</a><a href="#/login">Development</a><a href="#/login">Multimedia</a><a href="#/login">Software Engineering</a><a href="#/login">Supply Chain</a><a href="#/login">Administration</a><a href="#/login">Data Science / Analytics</a><a href="#/login">Design</a><a href="#/login">Development</a><a href="#/login">Multimedia</a><a href="#/login">Software Engineering</a><a href="#/login">Supply Chain</a><a href="#/login">Administration</a><a href="#/login">Data Science / Analytics</a>
    </div>
    <div class="marquee-track track-left">
        <a href="#/login">Human Resources</a><a href="#/login">Project Management</a><a href="#/login">Information Technology</a><a href="#/login">Customer Services</a><a href="#/login">Sales</a><a href="#/login">Business</a><a href="#/login">Research</a><a href="#/login">Human Resources</a><a href="#/login">Project Management</a><a href="#/login">Information Technology</a><a href="#/login">Customer Services</a><a href="#/login">Sales</a><a href="#/login">Business</a><a href="#/login">Research</a><a href="#/login">Human Resources</a><a href="#/login">Project Management</a><a href="#/login">Information Technology</a><a href="#/login">Customer Services</a><a href="#/login">Sales</a><a href="#/login">Business</a><a href="#/login">Research</a><a href="#/login">Human Resources</a><a href="#/login">Project Management</a><a href="#/login">Information Technology</a><a href="#/login">Customer Services</a><a href="#/login">Sales</a><a href="#/login">Business</a><a href="#/login">Research</a>
    </div>
</div></div>
  <section class="ojt-success-guide reference-width" style="margin-top: 64px; padding-bottom: 64px;">
      <div style="text-align: center; margin-bottom: 48px;">
          <p class="guide-kicker">OJT Success Guide</p>
          <h2 class="guide-heading">Get Ready for Your OJT Journey</h2>
          <p class="guide-subtext">Essential steps to complete your profile, track your training hours, and maintain OJT compliance on MenteeLog.</p>
      </div>
      
      <div class="guide-grid">
          <!-- Card 1 -->
          <article class="guide-card reveal-on-scroll">
              <div class="guide-gradient">${icon('users')}</div>
              <div class="guide-content">
                  <span class="guide-subtitle">Modules 2.1 & 2.2 • Quick Setup Guide</span>
                  <h3>Step 1: Complete Setup & Apply for HTE Slots</h3>
                  <p class="excerpt">Before submitting applications, set up your SR Code profile, upload required clearance documents, and browse accredited Host Training Establishments (HTEs).</p>
                  
                  <button class="btn secondary guide-toggle">Read Guide ${icon('chevron-down')}</button>
                  <div class="guide-drawer">
                      <div class="guide-drawer-inner">
                          <div class="guide-drawer-content">
                              <ol>
                                  <li>Navigate to Profile Setup (2.1) and complete personal details.</li>
                                  <li>Upload clearance documents in Requirements (2.7).</li>
                                  <li>Browse approved HTE slots in Job Browse (2.2) and click Apply.</li>
                              </ol>
                              <a href="#/login" class="btn">Go to Job Browse -></a>
                          </div>
                      </div>
                  </div>
              </div>
          </article>

          <!-- Card 2 -->
          <article class="guide-card reveal-on-scroll">
              <div class="guide-gradient">${icon('clock')}</div>
              <div class="guide-content">
                  <span class="guide-subtitle">Module 2.4 • Compliance Rules</span>
                  <h3>Step 2: Master Your Daily Time Record (DTR)</h3>
                  <p class="excerpt">Ensure your OJT hours count by logging daily clock-ins, enabling GPS location verification, and writing daily summaries with at least 150 characters.</p>
                  
                  <button class="btn secondary guide-toggle">Read Guide ${icon('chevron-down')}</button>
                  <div class="guide-drawer">
                      <div class="guide-drawer-inner">
                          <div class="guide-drawer-content">
                              <ol>
                                  <li>Clock in upon arrival at your HTE site; verify GPS location marker.</li>
                                  <li>Draft your logbook entry during the day (auto-saves draft).</li>
                                  <li>Submit daily summary (minimum 150 characters) for Supervisor approval.</li>
                              </ol>
                              <a href="#/login" class="btn">Open DTR Hub -></a>
                          </div>
                      </div>
                  </div>
              </div>
          </article>

          <!-- Card 3 -->
          <article class="guide-card reveal-on-scroll">
              <div class="guide-gradient">${icon('star')}</div>
              <div class="guide-content">
                  <span class="guide-subtitle">Modules 2.5 & 2.6 • Support & Evaluation</span>
                  <h3>Step 3: Track Appraisals & Handle Incidents</h3>
                  <p class="excerpt">View supervisor rubric evaluation scores and submit incident claims with evidence if workplace issues or DTR discrepancies arise.</p>
                  
                  <button class="btn secondary guide-toggle">Read Guide ${icon('chevron-down')}</button>
                  <div class="guide-drawer">
                      <div class="guide-drawer-inner">
                          <div class="guide-drawer-content">
                              <ol>
                                  <li>Review performance appraisal scores and supervisor feedback in Module 2.6.</li>
                                  <li>If an issue occurs, file a report via the Student Incident Module (2.5) with attachments.</li>
                                  <li>Track resolution status routed through the Coordinator Incident Hub (4.4).</li>
                              </ol>
                              <a href="#/login" class="btn">View Incident Hub -></a>
                          </div>
                      </div>
                  </div>
              </div>
          </article>
      </div>
  <div style="text-align: center; margin-top: 48px;"><a href="#/public/guide" style="color: #D85A63; font-weight: bold; text-decoration: none; font-size: 16px;">Browse all OJT Success Guides →</a></div>
  </section>
`:''}</section>`;}

function faqSection() {
    const faqs = [
        ['Is MenteeLog free for students and partner universities?', 'Yes! MenteeLog provides a centralized platform for OJT student interns, host company supervisors, and university coordinators to manage daily time records (DTR), placements, and performance appraisals seamlessly.'],
        ['How does MenteeLog ensure the validity of student DTR logs?', 'MenteeLog features built-in verification mechanisms including geolocation boundary checks, daily summary character validation (minimum 150 characters), and direct digital supervisor approvals to prevent manual errors or falsified hours.'],
        ['What user roles are supported on the platform?', 'MenteeLog features dedicated role-based portals for Students (SR Code access for DTR & logbooks), Company Supervisors (corporate email for verification & performance appraisal rubrics), and University Coordinators (faculty ID for candidate placement & compliance tracking).'],
        ['How does MenteeLog handle disciplinary or workplace incident reports?', 'Students and supervisors can log incident claims directly with supporting evidence attachments. These automatically route into the Central Compliance Drawer (Incident Hub 4.4) for coordinator review and resolution tracking.'],
        ['How do students get started on MenteeLog?', 'Students sign in through the Multi-Role Auth Gateway using their university credentials, complete their profile setup, upload required clearance documents, and browse approved host establishment listings.']
    ];

    return `<section class="faq-section reveal-on-scroll">
        <p class="section-kicker">- Frequently Asked Questions -</p>
        <h2>Frequently Asked Questions</h2>
        <div class="faq-container">
            ${faqs.map(([q, a]) => `
            <div class="faq-item">
                <button class="faq-header" aria-expanded="false">
                    <span class="faq-question">${q}</span>
                    <span class="faq-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                </button>
                <div class="faq-content">
                    <div class="faq-inner">
                        <p>${a}</p>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </section>`;
}

function companyBody(icon){return `
        <!-- SECTION A: HERO OVERVIEW -->
        <section class="about-hero reveal-on-scroll">
            <p class="about-hero-kicker">ABOUT MENTEELOG</p>
            <h2>Bridging Academics and Industry through Seamless OJT Management</h2>
            <p class="about-hero-intro">MenteeLog is a centralized On-the-Job Training (OJT) management platform designed to streamline student internships, employer supervision, and university compliance. By unifying daily time tracking, incident reporting, and performance evaluations into one intelligent gateway, MenteeLog ensures transparency and efficiency across every step of the internship journey.</p>
        </section>

        <!-- SECTION B: CORE MISSION & VISION (2-COLUMN) -->
        <section class="about-grid-2">
            <article class="about-card reveal-on-scroll">
                <div class="about-card-icon">${icon('target')}</div>
                <h3>Our Mission</h3>
                <p>To provide a simple, reliable platform that helps students track their OJT hours while allowing schools and supervisors to easily monitor attendance and evaluate performance.</p>
            </article>
            <article class="about-card reveal-on-scroll">
                <div class="about-card-icon">${icon('eye')}</div>
                <h3>Our Vision</h3>
                <p>To create a seamless, stress-free OJT experience that connects students, schools, and companies in one easy-to-use digital workspace.</p>
            </article>
        </section>

        <!-- SECTION C: PLATFORM PILLARS (3-COLUMN) -->
        <section class="about-grid-3">
            <article class="about-card reveal-on-scroll" style="padding: 0; overflow: hidden; border-radius: 16px;">
                <div style="height: 200px; width: 100%;">
                    ${photo('supervisor')}
                </div>
                <div style="padding: 24px;">
                    <h3>Verified Time Tracking</h3>
                    <p>Built-in geolocation verification and daily logbook validation ensure accurate, tampered-proof DTR records.</p>
                </div>
            </article>
            <article class="about-card reveal-on-scroll" style="padding: 0; overflow: hidden; border-radius: 16px;">
                <div style="height: 200px; width: 100%;">
                    ${photo('company')}
                </div>
                <div style="padding: 24px;">
                    <h3>Centralized Compliance</h3>
                    <p>Dedicated Coordinator tools and Incident Hubs keep student clearances, accreditation records, and safety claims organized.</p>
                </div>
            </article>
            <article class="about-card reveal-on-scroll" style="padding: 0; overflow: hidden; border-radius: 16px;">
                <div style="height: 200px; width: 100%;">
                    ${photo('career')}
                </div>
                <div style="padding: 24px;">
                    <h3>Multi-Role Collaboration</h3>
                    <p>Tailored portals for Students, Supervisors, and Faculty Coordinators enable real-time messaging, evaluations, and instant approvals.</p>
                </div>
            </article>
        </section>

        <!-- SECTION D: INSTITUTIONAL PLATFORM STATS -->
        <section class="about-stats-banner reveal-on-scroll">
            <div class="about-stats-grid">
                <div class="about-stat-item">
                    <h4>3</h4>
                    <p>Dedicated Role Portals<br>(Student, Supervisor, Coordinator)</p>
                </div>
                <div class="about-stat-item">
                    <h4>100%</h4>
                    <p>Verifiable DTR & GPS<br>Logbook Auditing</p>
                </div>
                <div class="about-stat-item">
                    <h4>150+</h4>
                    <p>Min. Character Daily<br>Summary Quality Gate</p>
                </div>
            </div>
        </section>

        <section class="team-section maroon"><h2 class="reveal-on-scroll">THE TEAM BEHIND MENTEELOG</h2><p>Driven by Innovation: The Team Building Menteelog</p><div class="team-grid">${[['Jeff Gentapanan','Lead / Project Manager'],['Kyle Renzo Alis','Software Generalist'],['Sean Nicole Guipo','UI/UX Designer'],['John Paul Wendam','Frontend Developer'],['Jhodie Alyssa Ladran','Backend Developer'],['Christina Bernadett Porras','Backend Developer'],['Rolly Abella','Researcher']].map(([n,r])=>`<article class="reveal-on-scroll"><img src="./assets/team/${n}.jpg" alt="${n}" class="reference-photo" style="height: 350px !important; object-fit: cover; object-position: top; width: 100%; border-radius: var(--radius); border-bottom-left-radius: 0; border-bottom-right-radius: 0;"><div><h3>${n}</h3><em>${r}</em><p style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;opacity:0.8"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Philippines</p><button class="btn" data-action="team-connect" data-id="${n}">Connect</button></div></article>`).join('')}</div></section>`;
}

function guideBody(icon) {
    const categories = [
        {
            title: "Phase 1: Setup & Placement",
            cards: [
                ['2.1', 'Profile Setup & Authentication', 'Complete your basic profile, connect your SR Code, and set up your MenteeLog credentials securely.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>Navigate to your Account Profile settings.</li><li>Ensure your SR Code and institutional email are correctly entered.</li><li>Select your specific academic department (e.g., BS Information Technology).</li><li>Save changes; this data is required before you can apply to any HTEs.</li></ul>'],
                ['2.2', 'Browsing HTE Opportunities', 'Filter through accredited companies, check required skills, and find the perfect OJT match.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>Open the OJT Placement directory from your dashboard.</li><li>Use the filters to sort by Location, Industry, or Work Mode (Remote/Hybrid/Onsite).</li><li>Review the "Required Skills" on each listing to ensure you meet the criteria.</li><li>Click "Apply" to send your profile directly to the industry supervisor.</li></ul>'],
                ['2.3', 'Application Tracking', 'Monitor your application statuses from "Under Review" to "Accepted" directly from the dashboard.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>Access the "My Applications" tab to see real-time updates.</li><li>Applications transition through states: <strong>Pending -> Under Review -> Interview -> Accepted</strong>.</li><li>Once a supervisor accepts you, your status updates and you are officially assigned to that company.</li></ul>'],
                ['2.7', 'Document Uploads & Clearance', 'Upload your signed MOAs, medical clearances, and waivers directly to the secure file vault.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>Go to the Document Management Portal.</li><li>Drag and drop your clearance documents (Medical, Parent Waiver, signed MOA).</li><li>Ensure files are in PDF, JPG, or PNG format and under 10MB.</li><li>Wait for the Coordinator to verify and approve your documents.</li></ul>']
            ]
        },
        {
            title: "Phase 2: DTR & Daily Logs",
            cards: [
                ['2.4.1', 'GPS-Verified Clock Ins', 'Learn how the platform verifies your location against the company geofence when you clock in.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>Upon arriving at your site, open the DTR Hub and click "Clock In".</li><li>Grant browser location permissions if prompted.</li><li>The system cross-references your live coordinates with the HTE headquarters radius.</li><li>If you are off-site, you can still clock in, but it will require manual supervisor review.</li></ul>'],
                ['2.4.2', 'Writing Task Summaries', 'Best practices for writing your daily 150-character task summaries for supervisor approval.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>Throughout your shift, draft your activities in the logbook (it auto-saves).</li><li>Before clocking out, finalize your summary. It <strong>must be at least 150 characters</strong>.</li><li>Be specific: mention the software used, tasks completed, and any meetings attended.</li><li>Click "Submit & Clock Out" to forward it to your supervisor.</li></ul>'],
                ['2.4.3', 'Handling Flagged DTRs', 'What to do if your time record is flagged for location mismatch or short task descriptions.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>The system automatically flags entries that violate compliance (e.g., logged in 5km away, or summary is too brief).</li><li>Flagged entries are not counted toward your total hours until resolved.</li><li>Your supervisor receives an alert and can choose to either Reject or Approve the flagged log.</li></ul>'],
                ['2.4.4', 'Submitting Justifications', 'How to attach evidence (like internet outage proofs) for rejected or flagged attendances.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>If a log is flagged, click the "Write Justification" button on the entry.</li><li>Explain the anomaly clearly (e.g., "I was on a field deployment with my manager").</li><li>Attach evidence such as photos, emails, or chat screenshots.</li><li>Submit the justification for final coordinator or supervisor review.</li></ul>']
            ]
        },
        {
            title: "Phase 3: Evaluation & Governance",
            cards: [
                ['2.6', 'Understanding the Appraisal Rubric', 'See exactly how your supervisor will score your performance across 5 key competencies.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>At the end of your term, supervisors navigate to the Performance Appraisal module.</li><li>You are graded on a 5.0 scale covering Technical Skills, Attendance, Initiative, and Professionalism.</li><li>Once submitted, the final score and feedback are permanently logged to your academic record.</li></ul>'],
                ['2.5', 'Filing an Incident Report', 'A step-by-step guide to reporting workplace issues, disputes, or harassment with attached evidence.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>If you experience an issue, open the Incident Reports tab.</li><li>Draft a secure claim detailing the nature of the issue (harassment, AWOL, dispute).</li><li>Upload supporting screenshots or documents.</li><li>Submitting this claim securely alerts your university Coordinator immediately.</li></ul>'],
                ['4.4', 'Coordinator Mediation', 'How the university tracks your incidents and mediates disputes between you and the company.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>Coordinators use the Central Incident Hub to monitor all student claims.</li><li>They can update the status of the ticket from "Reviewing" to "Mediating" or "Resolved".</li><li>If necessary, the coordinator can use the platform to reassign you to a new HTE.</li></ul>'],
                ['3.3', 'Supervisor Sign-offs', 'The digital signature process supervisors use to validate your final completed hours.', '<ul style="margin-left: 20px; margin-bottom: 16px;"><li>Supervisors have a "Bulk Approve" feature in their dashboard.</li><li>They review your hours and task summaries week-by-week.</li><li>Their digital approval validates the hours, updating your progress bar in real-time until you hit your 500-hour requirement.</li></ul>']
            ]
        }
    ];

    return `<section class="guide-full-page reference-width" style="padding: 64px 5%;">
        <div style="text-align: center; margin-bottom: 64px;">
            <p class="guide-kicker">- Knowledge Base -</p>
            <h2 class="guide-heading" style="font-size: 36px;">Master the MenteeLog Flow</h2>
            <p class="guide-subtext">Everything you need to know about navigating the modules, maintaining compliance, and succeeding in your OJT.</p>
        </div>
        
        ${categories.map(cat => `
            <div style="margin-bottom: 64px;">
                <h3 style="color: var(--burgundy); font-size: 24px; margin-bottom: 24px; border-bottom: 2px solid #EFDFBB; padding-bottom: 12px; text-align: center;">${cat.title}</h3>
                <div class="guide-grid">
                    ${cat.cards.map(([mod, title, desc, fullText]) => `
                        <article class="guide-card reveal-on-scroll">
                            <div class="guide-gradient" style="height: 100px;">
                                <span style="font-size: 24px; font-weight: bold; opacity: 0.9;">Module ${mod}</span>
                            </div>
                            <div class="guide-content" style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
                                <h4 style="color: var(--burgundy); font-size: 18px; margin-bottom: 12px;">${title}</h4>
                                <p class="excerpt" style="color: #4B5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px; flex-grow: 1;">${desc}</p>
                                
                                <button class="btn secondary guide-toggle" style="width: 100%; justify-content: space-between; margin-top: auto;">Read Guide ${icon('chevron-down')}</button>
                                <div class="guide-drawer">
                                    <div class="guide-drawer-inner">
                                        <div class="guide-drawer-content" style="padding-top: 16px; font-size: 14px; color: #4B5563; text-align: left;">
                                            <p style="margin-bottom: 12px; font-weight: 600;">Instructions:</p>
                                            ${fullText}
                                            <a href="#/login" class="btn" style="width: 100%; text-align: center;">Open Portal & Apply -></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </section>`;
}

export function authScreen(mode,role,{brand,icon,field}){const activate=mode==='activate',reset=mode==='reset';return `<div class="auth-reference"><section class="auth-reference-photo">${photo('group','auth-photo')}<div class="auth-tint"></div><img class="auth-watermark" src="./assets/MenteeLoo_Logo.svg" alt=""><h1>Join the MenteeLog<br>Journey.<br>Step Forward into<br>Your Future.</h1><span class="auth-rule"></span><p>${icon('shield')} Official Student Mentorship Network</p></section><main class="auth-reference-main" id="main"><section class="auth-reference-card"><header>${brand()}<h2 class="reveal-on-scroll">${activate?'Activate Your MenteeLog Account':reset?'Reset Your MenteeLog Password':'MenteeLog – Authentication Hub'}</h2><p>${activate?'Complete the steps below to set up your account':reset?'Verify your token and set a new password':'Select your role to continue'}</p></header><div class="auth-reference-body">${activate?`<p class="auth-role-label">I AM A...</p><div class="activation-roles">${['Student','Supervisor'].map(r=>`<button type="button" class="btn ${role===r?'':'secondary'}" data-action="auth-role" data-id="${r}">${icon(r==='Student'?'users':'building')} ${r}</button>`).join('')}</div><form id="activation-form">${field(role==='Supervisor'?'CORPORATE EMAIL':'SR CODE','identifier',role==='Supervisor'?'email':'text','','required')}${role==='Supervisor' ? '' : field('REGISTERED EMAIL ADDRESS','email','email','','required')}<p class="form-error" role="alert"></p><button type="submit" class="btn full">Send Activation Link</button></form><a class="auth-return" href="#/login">← Back to Login</a>`:reset?`<form id="reset-form">${field('VERIFICATION TOKEN','token','text','','required minlength="6"')}${field('NEW PASSWORD','password','password','','required minlength="12"')}${field('CONFIRM PASSWORD','confirm','password','','required minlength="12"')}<p class="form-error" role="alert"></p><button type="submit" class="btn full">Reset Password</button></form><a class="auth-return" href="#/login">← Back to Login</a>`:`<div class="auth-tabs" role="group" aria-label="Authentication portals">${['Student','Supervisor','Coordinator'].map(r=>`<button class="${r===role?'selected':''}" data-action="auth-role" data-id="${r}" aria-pressed="${r===role}">${icon(r==='Student'?'users':r==='Supervisor'?'building':'users')} ${r}</button>`).join('')}</div><form id="login-form">${field(role==='Student'?'SR CODE':role==='Supervisor'?'CORPORATE EMAIL':'FACULTY ID','identifier',role==='Supervisor'?'email':'text','','required autocomplete="username"')}<div class="field"><label for="password">PASSWORD</label><div class="password-field"><input id="password" name="password" type="password" required autocomplete="current-password"><button type="button" data-action="toggle-password" aria-label="Show password">${icon('eye')}</button></div></div><button type="button" class="forgot-link" data-action="forgot">Forgot Password?</button><p class="form-error" role="alert"></p><button class="btn full" type="submit">Login as ${role}</button></form>${role === "Coordinator" ? "" : `<p class="activate-link">First time here? <a href="#/activate">Activate ${role} Account</a></p>`}<a class="auth-return" href="#/">← Back to Landing Page</a>`}</div></section></main></div>`;}




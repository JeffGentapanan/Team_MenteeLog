export const roles = ['Student', 'Supervisor', 'Coordinator'];
export const rubric = ['Work quality & accuracy', 'Attendance & punctuality', 'Initiative & proactivity', 'Technical skills', 'Communication skills'];
export const navigation = {
  Student: [['dashboard','Dashboard','grid'],['jobs','OJT Placement','briefcase'],['applications','My Applications','file'],['appraisals','Performance appraisal','star'],['dtr','DTR Hub','clock'],['documents','Documents','folder'],['incidents','Incident Reports','alert']],
  Supervisor: [['dashboard','Dashboard','grid'],['dtr','Attendance & DTR','clock'],['appraisals','Performance Appraisal','file'],['jobs','Slot Management','briefcase'],['incidents','Incident Reports','alert']],
  Coordinator: [['dashboard','Dashboard','grid'],['hte','HTE Accreditation','building'],['candidates','Student Placement','users'],['dtr','DTR Compliance','file'],['reports','Report Generation','chart'],['users','User Management','users'],['incidents','Incident Reports','alert']]
};
export function seedData() {
  return {
    version: 1,
    users: [
      {id:'s1',identifier:'2021-00421',name:'Maria Santos',email:'maria.santos@example.edu',role:'Student',status:'Active',course:'BS Computer Science',company:'Accenture Philippines',supervisorId:'v1',baseHours:280,requiredHours:500,badge:'Enrolled',phone:'',bio:'Aspiring software engineer with an interest in accessible web applications.'},
      {id:'s2',identifier:'2021-00518',name:'Joshua Dilera',email:'joshua.dilera@example.edu',role:'Student',status:'Active',course:'BS Information Technology',company:'Accenture Philippines',supervisorId:'v1',baseHours:412,requiredHours:500,badge:'Enrolled'},
      {id:'s3',identifier:'2021-00602',name:'Kyla Alcantara',email:'kyla.alcantara@example.edu',role:'Student',status:'Active',course:'BS Computer Engineering',company:'Accenture Philippines',supervisorId:'v1',baseHours:280,requiredHours:500,badge:'Enrolled'},
      {id:'s4',identifier:'2021-00711',name:'Aldrin Castro',email:'aldrin.castro@example.edu',role:'Student',status:'Active',course:'BS Computer Science',company:'',supervisorId:null,baseHours:0,requiredHours:500,badge:'Eligible'},
      {id:'v1',identifier:'carlos.jose@example.com',name:'Engr. Carlos Jose',email:'carlos.jose@example.com',role:'Supervisor',status:'Active',company:'Accenture Philippines'},
      {id:'c1',identifier:'FAC-2026-001',name:'Dr. Evelyn Ramos',email:'evelyn.ramos@example.edu',role:'Coordinator',status:'Active',department:'College of Information Technology'}
    ],
    jobs: [
      {id:'j1',title:'Software Engineer Intern',company:'Accenture Philippines',location:'BGC, Taguig',mode:'Hybrid',courses:['BS Computer Science','BS Information Technology'],slots:12,status:'Active',description:'Build meaningful software with a collaborative engineering team. Work on frontend features, automated testing, and technical documentation.',specs:'Accredited HTE · Active MOA · 500-hour training plan',skills:'JavaScript, HTML & CSS, Git',supervisorId:'v1'},
      {id:'j2',title:'Network Engineering Intern',company:'Globe Telecom',location:'Mandaluyong',mode:'On-site',courses:['BS Information Technology','BS Computer Engineering'],slots:8,status:'Active',description:'Support network operations, learn infrastructure monitoring, and help document network configurations.',specs:'Accredited HTE · Active MOA · 500-hour training plan',skills:'Networking, troubleshooting, documentation'},
      {id:'j3',title:'FinTech & Systems Intern',company:'BDO Unibank',location:'Makati',mode:'On-site',courses:['BS Computer Science','BS Information Technology'],slots:6,status:'Active',description:'Help improve internal systems through quality assurance, data validation, and business process documentation.',specs:'Accredited HTE · Active MOA · 500-hour training plan',skills:'SQL, analytical thinking, quality assurance'},
      {id:'j4',title:'ICT Infrastructure Intern',company:'Meralco',location:'Pasig',mode:'On-site',courses:['BS Information Technology','BS Computer Engineering'],slots:4,status:'Active',description:'Learn enterprise IT support and contribute to reliable infrastructure services.',specs:'Accredited HTE · Active MOA',skills:'Hardware, networking, customer support'},
      {id:'j5',title:'Software Development Intern',company:'PhilStar Digital',location:'Remote',mode:'Remote',courses:['BS Computer Science','BS Information Technology'],slots:5,status:'Active',description:'Collaborate on digital publishing tools and responsive web experiences.',specs:'Accredited HTE · Active MOA',skills:'JavaScript, responsive design, Git'},
      {id:'j6',title:'Business Intelligence Intern',company:'SM Technologies',location:'Pasay',mode:'Hybrid',courses:['BS Computer Science','BS Information Technology'],slots:10,status:'Active',description:'Turn operational data into useful dashboards and insights for business teams.',specs:'Accredited HTE · Active MOA',skills:'SQL, spreadsheets, data visualization'}
    ],
    applications:[{id:'a1',studentId:'s1',jobId:'j1',status:'Accepted',date:'2026-08-01',note:'Endorsed by faculty coordinator.'},{id:'a2',studentId:'s2',jobId:'j1',status:'Accepted',date:'2026-08-01',note:'Training agreement complete.'},{id:'a3',studentId:'s3',jobId:'j1',status:'Accepted',date:'2026-08-04',note:''},{id:'a4',studentId:'s4',jobId:'j1',status:'Pending',date:'2026-09-24',note:''}],
    logs: [
      ...['2026-09-21','2026-09-22','2026-09-23','2026-09-24'].map((date,i)=>({id:'l'+i,studentId:'s1',supervisorId:'v1',date,clockIn:date+'T08:00:00+08:00',clockOut:date+'T17:00:00+08:00',breakMinutes:60,hours:8,status:'Approved',task:'Implemented responsive components, reviewed feedback, and updated project documentation.',gps:null,remarks:'Reviewed and approved.',signature:'Carlos Jose'})),
      {id:'l4',studentId:'s1',supervisorId:'v1',date:'2026-09-25',clockIn:'2026-09-25T08:00:00+08:00',clockOut:'2026-09-25T17:00:00+08:00',breakMinutes:60,hours:8,status:'Flagged',task:'Tested the application and documented accessibility improvements.',gps:null,remarks:'Location unavailable. Please provide a justification.',signature:''},
      {id:'l5',studentId:'s2',supervisorId:'v1',date:'2026-09-25',clockIn:'2026-09-25T08:00:00+08:00',clockOut:'2026-09-25T17:00:00+08:00',breakMinutes:60,hours:8,status:'Pending',task:'Resolved network support tickets and updated the asset inventory.',gps:null,remarks:'',signature:''}
    ],
    incidents:[{id:'IR-048',studentId:'s1',supervisorId:'v1',category:'Student_Claim',title:'Attendance correction request',description:'My location could not be captured during an internet interruption. Please review the linked attendance record.',priority:'Medium',status:'Pending',date:'2026-09-25',logId:'l4',notes:[],meeting:null,evidence:null}],
    appraisals:[],
    notifications:[
      {id:'n1',userId:'s1',type:'DTR_Event',title:'DTR entry approved',message:'Your September 24 entry (8 hours) was reviewed by Engr. Carlos Jose.',date:'2026-09-25T09:00:00+08:00',read:false},
      {id:'n2',userId:'s1',type:'Incident_Alert',title:'Attendance entry needs a justification',message:'Add context to your flagged September 25 entry in the DTR Hub.',date:'2026-09-25T10:00:00+08:00',read:false},
      {id:'n3',userId:'s1',type:'Application_Status',title:'Your placement is confirmed',message:'You are assigned to Accenture Philippines as a Software Engineer Intern.',date:'2026-08-01T09:00:00+08:00',read:true},
      {id:'n4',userId:'v1',type:'DTR_Event',title:'A DTR is ready for review',message:'Joshua Dilera submitted a daily time record.',date:'2026-09-25T17:00:00+08:00',read:false},
      {id:'n5',userId:'c1',type:'Incident_Alert',title:'New student claim',message:'Review attendance correction request IR-048.',date:'2026-09-25T17:00:00+08:00',read:false}
    ],
    htes:[{id:'h1',name:'Accenture Philippines',industry:'Software & IT Services',location:'BGC, Taguig',status:'Accredited',expiry:'2027-08-31',contact:'carlos.jose@example.com'},{id:'h2',name:'Globe Telecom',industry:'Telecommunications',location:'Mandaluyong',status:'Accredited',expiry:'2027-06-30',contact:'training@example.com'},{id:'h3',name:'BDO Unibank',industry:'Banking & Finance',location:'Makati',status:'Accredited',expiry:'2027-03-31',contact:'internships@example.com'},{id:'h4',name:'Meralco',industry:'Energy & Utilities',location:'Pasig',status:'Accredited',expiry:'2027-02-28',contact:'careers@example.com'},{id:'h5',name:'PhilStar Digital',industry:'Digital Media',location:'Remote',status:'Accredited',expiry:'2027-07-31',contact:'careers@example.com'},{id:'h6',name:'SM Technologies',industry:'Software & IT Services',location:'Pasay',status:'Accredited',expiry:'2027-06-30',contact:'careers@example.com'}],
    documents:[],
    program:{name:'BSIT / BSCS OJT Program',requiredHours:500,deadline:'2026-12-18',milestone:'Submit your weekly accomplishment report every Friday.',template:'Date, clock in/out, break duration, task summary, justification, supervisor review'},audit:[],shift:null,draft:'',
  };
}

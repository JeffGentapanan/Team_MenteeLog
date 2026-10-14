let syncRunCounter = 0;

export async function syncRemote(supabase, db) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const currentRun = ++syncRunCounter;

  try {
    const [jobsRes, appsRes, profilesRes, badgesRes, logsRes, incidentsRes, appraisalsRes, docsRes, registryRes] = await Promise.all([
      supabase.from('listings_jobs').select('*'),
      supabase.from('applications').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('badges_status').select('*'),
      supabase.from('logs').select('*'),
      supabase.from('incidents').select('*'),
      supabase.from('appraisals').select('*'),
      supabase.from('documents').select('*'),
      supabase.from('school_registry').select('*')
    ]);

    if (currentRun !== syncRunCounter) return false;

    if (jobsRes.error) { console.error('syncRemote failed on listings_jobs:', jobsRes.error); throw jobsRes.error; }
    if (appsRes.error) { console.error('syncRemote failed on applications:', appsRes.error); throw appsRes.error; }
    if (profilesRes.error) { console.error('syncRemote failed on profiles:', profilesRes.error); throw profilesRes.error; }
    if (badgesRes.error) {
      console.error('syncRemote: badges_status failed', badgesRes.error);
      badgesRes.data = [];
    }
    if (logsRes.error) { console.error('syncRemote: logs failed', logsRes.error); logsRes.data = []; }
    if (incidentsRes.error) { console.error('syncRemote: incidents failed', incidentsRes.error); incidentsRes.data = null; }
    if (appraisalsRes.error) { console.error('syncRemote: appraisals failed', appraisalsRes.error); appraisalsRes.data = []; }
    if (docsRes.error) { console.error('syncRemote: documents failed', docsRes.error); docsRes.data = []; }

    const newJobs = jobsRes.data.map(j => ({
      id: j.id,
      supervisorId: j.supervisor_id,
      title: j.title || 'Untitled',
      company: j.company || '',
      location: j.location || '',
      mode: j.mode,
      courses: j.courses || [],
      slots: j.slots,
      status: j.status,
      description: j.description || '',
      specs: j.specs || '',
      skills: j.skills || ''
    }));

    const newApps = appsRes.data.map(a => ({
      id: a.id,
      jobId: a.job_id,
      studentId: a.student_id,
      status: a.status,
      date: (a.applied_date || '').slice(0, 10),
      note: a.notes || ''
    }));

    const badgesMap = {};
    for (const b of badgesRes.data) {
      badgesMap[b.student_id] = b.badge;
    }

    let newUsers = profilesRes.data.map(p => {
      const existing = (db.users || []).find(u => 
        u.id === p.id || 
        (u.email && p.email && u.email.toLowerCase() === p.email.toLowerCase()) ||
        (u.identifier && p.identifier && u.identifier.toLowerCase() === p.identifier.toLowerCase())
      );
      const identifier = p.identifier || existing?.identifier || '';
      const name = (p.full_name && p.full_name.trim()) || existing?.name || (p.email ? p.email.split('@')[0] : 'Unnamed user');
      const course = p.course || existing?.course || (p.role === 'Student' ? 'BSIT' : '');

      return {
        id: p.id,
        role: p.role,
        identifier: identifier,
        email: p.email || existing?.email || '',
        name: name,
        course: course,
        company: p.company || existing?.company || '',
        supervisorId: p.supervisor_id || existing?.supervisorId || null,
        baseHours: p.base_hours || existing?.baseHours || 0,
        requiredHours: p.required_hours || existing?.requiredHours || 500,
        phone: p.phone || existing?.phone || '',
        bio: p.bio || existing?.bio || '',
        status: p.status || existing?.status || 'Active',
        badge: badgesMap[p.id] || existing?.badge || (p.role === 'Student' ? 'Active' : undefined)
      };
    });

    const newLogs = (logsRes.data || []).map(l => ({
      id: l.id,
      studentId: l.student_id,
      supervisorId: l.supervisor_id,
      date: l.date,
      clockIn: l.clock_in,
      clockOut: l.clock_out,
      breakMinutes: l.break_minutes,
      hours: l.hours,
      status: l.status,
      task: l.task,
      gps: l.gps,
      remarks: l.remarks,
      signature: l.signature,
      justification: l.justification,
      coordinatorRemarks: l.coordinator_remarks
    }));

        let newIncidents = [];
    if (incidentsRes.data === null) {
      newIncidents = db.incidents; // untouched on error
    } else {
      const remoteIncidents = incidentsRes.data.map(i => {
      let evidence = null;
      if (i.evidence) {
        try {
          evidence = typeof i.evidence === 'string' ? JSON.parse(i.evidence) : i.evidence;
        } catch(e) {
          evidence = null;
        }
      }
      return {
        id: i.code,
        studentId: i.student_id,
        supervisorId: i.supervisor_id,
        category: i.category,
        title: i.title,
        description: i.description,
        priority: i.priority,
        status: i.status,
        date: i.date,
        logId: i.log_id,
        evidence: evidence,
        meeting: i.meeting,
        notes: i.notes || []
      };
    });
      const remoteIds = new Set(remoteIncidents.map(i => i.id));
      const pendingLocals = (db.incidents || []).filter(i => i._pending && !remoteIds.has(i.id));
      newIncidents = [...pendingLocals, ...remoteIncidents];
    }

    const newAppraisals = (appraisalsRes.data || []).map(a => ({
      id: a.id,
      applicationId: a.application_id,
      studentId: a.student_id,
      supervisorId: a.supervisor_id,
      ratings: a.ratings || [],
      score: a.score,
      comments: a.comments,
      signature: a.signature,
      date: a.date
    }));

    const newDocs = (docsRes.data || []).map(d => ({
      id: d.id,
      studentId: d.student_id,
      category: d.category,
      name: d.name,
      size: d.file_size,
      type: d.mime_type,
      date: d.doc_date,
      status: d.status,
      filePath: d.file_path
    }));

    // Always keep the signed-in user in db.users
    const signedInUser = db.users.find(u => u.id === session.user.id);
    if (signedInUser && !newUsers.some(u => u.id === signedInUser.id)) {
      newUsers.push(signedInUser);
    }

    // Connect core users and remove dummy placement accounts
    let stu = newUsers.find(u => u.role === 'Student' && (String(u.email||'').toLowerCase() === 'kenzosomes@gmail.com' || String(u.name||'').toLowerCase().includes('kenzo')));
    let sup = newUsers.find(u => u.role === 'Supervisor' && (String(u.email||'').toLowerCase().includes('shisulzhin') || String(u.email||'').toLowerCase().includes('shisuizhin') || String(u.name||'').toLowerCase().includes('shisui')));
    if (!stu && db.users.some(u => u.role === 'Student' && (String(u.email||'').toLowerCase() === 'kenzosomes@gmail.com' || String(u.name||'').toLowerCase().includes('kenzo')))) {
      stu = db.users.find(u => u.role === 'Student' && (String(u.email||'').toLowerCase() === 'kenzosomes@gmail.com' || String(u.name||'').toLowerCase().includes('kenzo')));
      newUsers.push(stu);
    }
    if (!sup && db.users.some(u => u.role === 'Supervisor' && (String(u.email||'').toLowerCase().includes('shisulzhin') || String(u.name||'').toLowerCase().includes('shisui')))) {
      sup = db.users.find(u => u.role === 'Supervisor' && (String(u.email||'').toLowerCase().includes('shisulzhin') || String(u.name||'').toLowerCase().includes('shisui')));
      newUsers.push(sup);
    }
    if (stu && sup) {
      if (stu.id === 's1' && newLogs.some(l => l.studentId && l.studentId.length > 20)) {
        const remoteUuid = newLogs.find(l => l.studentId && l.studentId.length > 20)?.studentId;
        if (remoteUuid) stu.id = remoteUuid;
      }
      sup.company = sup.company || 'Accenture Philippines';
      stu.supervisorId = sup.id;
      stu.company = sup.company;
      stu.status = 'Active';
      stu.badge = 'Active';
      stu.requiredHours = stu.requiredHours || 500;
      if (!stu.baseHours && stu.baseHours !== 0) stu.baseHours = 120;
      const stuLogs = newLogs.filter(l => l.studentId === stu.id);
      if (stuLogs.length === 0 && db.logs) {
        const existingStuLogs = db.logs.filter(l => l.studentId === stu.id || (stu.email === 'kenzosomes@gmail.com' && (l.studentId === '22227dcf-933f-40a9-9340-f66cb9020e5c' || l.studentId === 's1')));
        if (existingStuLogs.length > 0) newLogs.push(...existingStuLogs.map(l => ({ ...l, studentId: stu.id })));
      }
      let supJob = newJobs.find(j => j.supervisorId === sup.id);
      if (!supJob) {
        supJob = {
          id: 'job_' + sup.id,
          supervisorId: sup.id,
          title: 'Software Engineer Intern',
          company: sup.company,
          location: 'Mandurriao, Iloilo City',
          mode: 'Hybrid',
          courses: ['BSIT'],
          slots: 5,
          status: 'Active',
          description: 'Hands-on enterprise software development and daily engineering operations.',
          specs: 'Accredited HTE · Active MOA · 500-hour training plan',
          skills: 'JavaScript, Web Development, Team Collaboration'
        };
        newJobs.unshift(supJob);
      }
      let app = newApps.find(a => a.studentId === stu.id);
      if (!app) {
        newApps.push({
          id: 'app_' + stu.id,
          jobId: supJob.id,
          studentId: stu.id,
          status: 'Accepted',
          date: new Date().toISOString().slice(0, 10),
          note: 'Endorsed by faculty coordinator and accepted by company supervisor.'
        });
      } else {
        app.status = 'Accepted';
        app.jobId = supJob.id;
      }
    }
    newUsers = newUsers.filter(u => !String(u.id).startsWith('s_dummy') && !['Alice Chen','Bob Smith','Charlie Cruz','Diana Reyes','Example Intern'].includes(u.name));
    
    // 1. Include any pre-seeded candidates from school_registry
    if (registryRes?.data && registryRes.data.length > 0) {
      for (const reg of registryRes.data) {
        if (!newUsers.some(u => (u.identifier && u.identifier.toLowerCase() === (reg.identifier || '').toLowerCase()) || (u.email && u.email.toLowerCase() === (reg.email || '').toLowerCase()))) {
          newUsers.push({
            id: reg.id || crypto.randomUUID(),
            role: reg.role || 'Student',
            identifier: reg.identifier || '',
            email: reg.email || '',
            name: reg.name || reg.full_name || 'Pre-Seeded Student',
            course: reg.course || 'BSIT',
            company: '',
            supervisorId: null,
            baseHours: 0,
            requiredHours: db.program?.requiredHours || 500,
            status: 'Pending_Activation',
            badge: 'Pre_Seeded'
          });
        }
      }
    }

    // 2. Retain all pre-seeded / pending candidates already in db.users so periodic sync does not wipe them
    const preSeeded = (db.users || []).filter(u => u.badge === 'Pre_Seeded' || u.status === 'Pending_Activation');
    for (const p of preSeeded) {
      if (!newUsers.some(u => (u.identifier && u.identifier.toLowerCase() === (p.identifier || '').toLowerCase()) || (u.email && u.email.toLowerCase() === (p.email || '').toLowerCase()))) {
        newUsers.push(p);
      }
    }

    const cleanIncidents = (list) => (list || []).map(i => { const copy = {...i}; delete copy._pending; return copy; });
    const before = JSON.stringify({ jobs: db.jobs, apps: db.applications, users: db.users, logs: db.logs, incidents: cleanIncidents(db.incidents), appraisals: db.appraisals, docs: db.documents });
    const after = JSON.stringify({ jobs: newJobs, apps: newApps, users: newUsers, logs: newLogs, incidents: cleanIncidents(newIncidents), appraisals: newAppraisals, docs: newDocs });

    if (before !== after) {
      db.jobs = newJobs;
      db.applications = newApps;
      db.users = newUsers;
      db.logs = newLogs;
      db.incidents = newIncidents;
      db.appraisals = newAppraisals;
      db.documents = newDocs;
      return true;
    }
    return false;
  } catch (err) {
    console.error('syncRemote error:', err);
    return false;
  }
}

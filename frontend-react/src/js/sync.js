let syncRunCounter = 0;

export async function syncRemote(supabase, db) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const currentRun = ++syncRunCounter;

  try {
    const [jobsRes, appsRes, profilesRes, badgesRes, logsRes, incidentsRes, appraisalsRes, docsRes] = await Promise.all([
      supabase.from('listings_jobs').select('*'),
      supabase.from('applications').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('badges_status').select('*'),
      supabase.from('logs').select('*'),
      supabase.from('incidents').select('*'),
      supabase.from('appraisals').select('*'),
      supabase.from('documents').select('*')
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
    if (incidentsRes.error) { console.error('syncRemote: incidents failed', incidentsRes.error); incidentsRes.data = []; }
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

    const newUsers = profilesRes.data.map(p => ({
      id: p.id,
      role: p.role,
      identifier: p.identifier || '',
      email: p.email || '',
      name: (p.full_name && p.full_name.trim()) || (p.email ? p.email.split('@')[0] : 'Unnamed user'),
      course: p.course || '',
      company: p.company || '',
      supervisorId: p.supervisor_id || null,
      baseHours: p.base_hours || 0,
      requiredHours: p.required_hours || 600,
      phone: p.phone || '',
      bio: p.bio || '',
      status: p.status || 'Active',
      badge: badgesMap[p.id] || (p.role === 'Student' ? 'Eligible' : undefined)
    }));

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

    const newIncidents = (incidentsRes.data || []).map(i => {
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

    const before = JSON.stringify({ jobs: db.jobs, apps: db.applications, users: db.users, logs: db.logs, incidents: db.incidents, appraisals: db.appraisals, docs: db.documents });
    const after = JSON.stringify({ jobs: newJobs, apps: newApps, users: newUsers, logs: newLogs, incidents: newIncidents, appraisals: newAppraisals, docs: newDocs });

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

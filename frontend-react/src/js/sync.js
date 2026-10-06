export async function syncRemote(supabase, db) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  try {
    const [jobsRes, appsRes, profilesRes, badgesRes] = await Promise.all([
      supabase.from('listings_jobs').select('*'),
      supabase.from('applications').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('badges_status').select('*')
    ]);

    if (jobsRes.error) { console.error('syncRemote failed on listings_jobs:', jobsRes.error); throw jobsRes.error; }
    if (appsRes.error) { console.error('syncRemote failed on applications:', appsRes.error); throw appsRes.error; }
    if (profilesRes.error) { console.error('syncRemote failed on profiles:', profilesRes.error); throw profilesRes.error; }
    if (badgesRes.error) {
      console.error('syncRemote: badges_status failed', badgesRes.error);
      badgesRes.data = [];
    }

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

    // Always keep the signed-in user in db.users
    const signedInUser = db.users.find(u => u.id === session.user.id);
    if (signedInUser && !newUsers.some(u => u.id === signedInUser.id)) {
      newUsers.push(signedInUser);
    }

    const before = JSON.stringify({ jobs: db.jobs, apps: db.applications, users: db.users });
    const after = JSON.stringify({ jobs: newJobs, apps: newApps, users: newUsers });

    if (before !== after) {
      db.jobs = newJobs;
      db.applications = newApps;
      db.users = newUsers;
      return true;
    }
    return false;
  } catch (err) {
    console.error('syncRemote error:', err);
    return false;
  }
}

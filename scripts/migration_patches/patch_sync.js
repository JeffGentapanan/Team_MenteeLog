const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/sync.js', 'utf8');

c = c.replace(
  "if (incidentsRes.error) { console.error('syncRemote: incidents failed', incidentsRes.error); incidentsRes.data = []; }",
  "if (incidentsRes.error) { console.error('syncRemote: incidents failed', incidentsRes.error); incidentsRes.data = null; }"
);

const newIncidentsStart = "const newIncidents = (incidentsRes.data || []).map(i => {";
const newIncidentsTarget = `    let newIncidents = [];
    if (incidentsRes.data === null) {
      newIncidents = db.incidents; // untouched on error
    } else {
      const remoteIncidents = incidentsRes.data.map(i => {`;

c = c.replace(newIncidentsStart, newIncidentsTarget);

const newIncidentsEndTarget = `        notes: i.notes || []
      };
    });`;
const newIncidentsEndReplacement = `        notes: i.notes || []
      };
    });
      const remoteIds = new Set(remoteIncidents.map(i => i.id));
      const pendingLocals = (db.incidents || []).filter(i => i._pending && !remoteIds.has(i.id));
      newIncidents = [...pendingLocals, ...remoteIncidents];
    }`;

c = c.replace(newIncidentsEndTarget, newIncidentsEndReplacement);

const beforeTarget = "const before = JSON.stringify({ jobs: db.jobs, apps: db.applications, users: db.users, logs: db.logs, incidents: db.incidents, appraisals: db.appraisals, docs: db.documents });";
const afterTarget = "const after = JSON.stringify({ jobs: newJobs, apps: newApps, users: newUsers, logs: newLogs, incidents: newIncidents, appraisals: newAppraisals, docs: newDocs });";

const beforeReplacement = `const cleanIncidents = (list) => (list || []).map(i => { const copy = {...i}; delete copy._pending; return copy; });
    const before = JSON.stringify({ jobs: db.jobs, apps: db.applications, users: db.users, logs: db.logs, incidents: cleanIncidents(db.incidents), appraisals: db.appraisals, docs: db.documents });`;
const afterReplacement = `const after = JSON.stringify({ jobs: newJobs, apps: newApps, users: newUsers, logs: newLogs, incidents: cleanIncidents(newIncidents), appraisals: newAppraisals, docs: newDocs });`;

c = c.replace(beforeTarget, beforeReplacement);
c = c.replace(afterTarget, afterReplacement);

fs.writeFileSync('frontend-react/src/js/sync.js', c);

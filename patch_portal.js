const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/portal-views.js', 'utf8');

c = c.replace(
  "import {approvedHours,visibleStudents,visibleLogs,visibleApplications,applyToJob,validateUpload,csvText} from './domain.js';",
  "import { supabase } from '../supabaseClient.js';\nimport { syncRemote } from './sync.js';\nimport {approvedHours,visibleStudents,visibleLogs,visibleApplications,applyToJob,validateUpload,csvText} from './domain.js';"
);

const target = "const updated=reviewBatch(db(),u(),logs.map(l=>l.id),reject?'Rejected':'Approved',v.remarks,v.signature);";
const replacement = "const updated=db().logs.filter(l=>uuidIds.includes(l.id));";

c = c.replace(target, replacement);

fs.writeFileSync('frontend-react/src/js/portal-views.js', c);

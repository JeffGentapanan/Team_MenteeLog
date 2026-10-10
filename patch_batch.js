const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/portal-views.js', 'utf8');

const target = "const updated=reviewBatch(db(),u(),logs.map(l=>l.id),reject?'Rejected':'Approved',v.remarks,v.signature);";
const replacement = "const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;const uuidIds = logs.map(l=>l.id).filter(id => uuidRegex.test(id));if(!uuidIds.length)throw new Error('Demo records cannot be saved to the live database.');const { error, data } = await supabase.from('logs').update({ status: reject?'Rejected':'Approved', remarks: v.remarks, signature: v.signature }).in('id', uuidIds).select();if(error)throw new Error(error.message);if(!data || data.length !== uuidIds.length)throw new Error('Some logs were not updated. Check your permissions.');await syncRemote(supabase, db());const updated=reviewBatch(db(),u(),logs.map(l=>l.id),reject?'Rejected':'Approved',v.remarks,v.signature);";

c = c.replace(target, replacement);

fs.writeFileSync('frontend-react/src/js/portal-views.js', c);

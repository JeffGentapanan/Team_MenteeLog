const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

c = c.replace(/case 'document-remove':\{const doc=db\.documents\.find\(d=>d\.id===id&&d\.studentId===u\.id\);if\(!doc\)throw new Error\('Document unavailable\.'\);showModal\('Remove document\?',`<p>Remove <strong>\$\{e\(doc\.name\)\}<\/strong>.*?\`,async\(\)=>\{await fileOp\('delete',id\);db\.documents=db\.documents\.filter\(d=>d\.id!==id\);save\(\);toast\('Document removed\.'\);\},'Remove document'\);return;\}/,
  "case 'document-remove':{const doc=db.documents.find(d=>d.id===id&&d.studentId===u.id);if(!doc)throw new Error('Document unavailable.');showModal('Remove document?',`<p>Remove <strong>${e(doc.name)}</strong>?</p>`,async()=>{if(doc.filePath){if(!uuidRegex.test(u.id))throw new Error('Demo records cannot be saved to the live database.');const {error:sErr}=await supabase.storage.from('documents').remove([doc.filePath]);if(sErr)throw new Error(sErr.message);const {error:dbErr,data:del}=await supabase.from('documents').delete().eq('id',doc.id).select();if(dbErr||!del||!del.length)throw new Error(dbErr?dbErr.message:'Delete failed.');await syncRemote(supabase,db);}else{await fileOp('delete',id);db.documents=db.documents.filter(d=>d.id!==id);}save();toast('Document removed.');},'Remove document');return;}");

fs.writeFileSync('frontend-react/src/js/app.js', c);

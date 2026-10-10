import re

with open('frontend-react/src/js/portal-views.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = r"async function previewFile\(id\)\{const doc=db\(\)\.documents.*?,\{once:true\}\);\}"
replacement = """async function previewFile(id){const doc=db().documents.find(d=>d.id===id&&(d.studentId===u().id||visibleStudents(db(),u()).some(s=>s.id===d.studentId)||visibleApplications(db(),u()).some(a=>a.resumeId===d.id)))||c.visibleIncidents(u()).find(i=>i.evidence?.id===id)?.evidence||(u().role==='Coordinator'?db().htes.find(h=>h.document?.id===id)?.document:null);if(!doc)throw new Error('This file is outside your portal scope.');let url;let isLocal=false;if(doc.filePath){url=await c.legacy.getSignedUrl(doc.filePath);if(!url)throw new Error('Unable to preview document.');}else{const file=await c.fileOp('get',id);if(!file)throw new Error('File no longer available in this browser.');url=URL.createObjectURL(file);isLocal=true;}c.showModal('Document Preview - '+e(doc.name),(doc.type||'').startsWith('image/')?<img class="ref-file-image" src="" alt="">:<p> - PDF document</p><p>Open the stored PDF in your browser's document viewer.</p><a class="btn" href="" target="_blank" rel="noopener">Open PDF Preview</a>);if(isLocal){document.querySelector('#modal').addEventListener('close',()=>URL.revokeObjectURL(url),{once:true});}}"""

c = re.sub(target, replacement, c, flags=re.DOTALL)

with open('frontend-react/src/js/portal-views.js', 'w', encoding='utf-8') as f:
    f.write(c)

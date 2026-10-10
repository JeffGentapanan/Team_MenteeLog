const fs = require('fs');
let c = fs.readFileSync('frontend-react/src/js/app.js', 'utf8');

c = c.replace(
  "if(form.id==='search-form'){view.search=values.search||'';view.mode=values.mode||'All';view.course=values.course||'All';render();return;}",
  "if(form.id==='search-form'){if(typeof searchDebounce!=='undefined')clearTimeout(searchDebounce);view.search=values.search||'';view.mode=values.mode||'All';view.course=values.course||'All';render();return;}"
);

c = c.replace(
  "window.addEventListener('hashchange', async () => {",
  "window.addEventListener('hashchange', async () => {if(typeof searchDebounce!=='undefined')clearTimeout(searchDebounce);"
);

const oldInput = "document.addEventListener('input',event=>{if(event.target.id==='draft'){db.draft=event.target.value;save();}});";
const newInput = `let searchDebounce = null;
let isComposingSearch = false;
document.addEventListener('compositionstart', e => { if (e.target.form && e.target.form.id === 'search-form' && e.target.name === 'search') isComposingSearch = true; });
document.addEventListener('compositionend', e => { if (e.target.form && e.target.form.id === 'search-form' && e.target.name === 'search') { isComposingSearch = false; e.target.dispatchEvent(new Event('input', { bubbles: true })); } });
const SEARCH_DELAY = 300;
document.addEventListener('input', event => {
  if (event.target.id === 'draft') { db.draft = event.target.value; save(); }
  if (event.target.form && event.target.form.id === 'search-form' && event.target.name === 'search') {
    if (route().page === 'incidents') {
      if (isComposingSearch || event.isComposing) return;
      const val = event.target.value || '';
      if (val === view.search) return;
      if (val.trim() === (view.search||'').trim() && val !== '') { view.search = val; return; }
      clearTimeout(searchDebounce);
      const doSearch = () => {
        if (route().page !== 'incidents') return;
        const activeInput = document.querySelector('#search-form input[name="search"]');
        if (!activeInput) return;
        const wasFocused = document.activeElement === activeInput;
        let sel = null;
        if (wasFocused) sel = [activeInput.selectionStart, activeInput.selectionEnd];
        view.search = val;
        render();
        if (wasFocused) {
          const newInput = document.querySelector('#search-form input[name="search"]');
          if (newInput) {
            newInput.focus({ preventScroll: true });
            if (sel && sel[0] !== null && sel[1] !== null && newInput.value.length >= sel[1]) {
              newInput.setSelectionRange(sel[0], sel[1]);
            }
          }
        }
      };
      if (val === '') doSearch(); else searchDebounce = setTimeout(doSearch, SEARCH_DELAY);
    }
  }
});`;

if (!c.includes(oldInput)) {
  console.error("Target 3 not found!");
}

c = c.replace(oldInput, newInput);
fs.writeFileSync('frontend-react/src/js/app.js', c);

// disease-report.js — page-specific filtering and export
(function(){
  function parseDate(str) {
    if (!str) return null;
    const parts = str.split('/').map(s => s.trim());
    if (parts.length !== 3) return null;
    let [d,m,y] = parts;
    if (y.length === 2) y = '20' + y;
    const iso = `${y.padStart(4,'0')}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    const dt = new Date(iso);
    return isNaN(dt.getTime()) ? null : dt;
  }

  function parseRange(rangeStr){
    if (!rangeStr) return null;
    const cleaned = rangeStr.replace(/\s+/g,'');
    if (cleaned.includes('-')){
      const [a,b] = cleaned.split('-');
      const start = parseDate(a);
      const end = parseDate(b);
      return (start && end) ? {start,end} : null;
    }
    return null;
  }

  function matches(row, filters){
    const cols = row.children;
    const disease = (cols[0]?.textContent||'').toLowerCase();
    const location = (cols[1]?.textContent||'').toLowerCase();
    const dateText = (cols[4]?.textContent||'').trim();

    if (filters.search){
      const q = filters.search.toLowerCase();
      if (!disease.includes(q) && !location.includes(q)) return false;
    }
    if (filters.disease && filters.disease !== 'All Diseases'){
      if (disease !== filters.disease.toLowerCase()) return false;
    }
    if (filters.state && filters.state !== 'All States'){
      if (location !== filters.state.toLowerCase()) return false;
    }
    if (filters.range){
      const rowDate = parseDate(dateText);
      if (!rowDate) return false;
      if (rowDate < filters.range.start || rowDate > filters.range.end) return false;
    }
    return true;
  }

  function init(){
    const table = document.getElementById('diseaseTable');
    if (!table) return;
    const tbody = table.tBodies[0];
    const search = document.getElementById('filterSearch');
    const dsel = document.getElementById('diseaseSelect');
    const ssel = document.getElementById('stateSelect');
    const dater = document.getElementById('dateRange');
    const exportBtn = document.getElementById('exportBtn');

    function populateSelects(){
      const diseases = new Set();
      const states = new Set();
      Array.from(tbody.rows).forEach(r=>{
        diseases.add((r.cells[0]?.textContent||'').trim());
        states.add((r.cells[1]?.textContent||'').trim());
      });
      // populate
      if (dsel){
        const cur = dsel.value;
        dsel.innerHTML = '';
        const a = document.createElement('option'); a.textContent = 'All Diseases'; dsel.appendChild(a);
        Array.from(diseases).filter(Boolean).sort().forEach(x=>{const o=document.createElement('option'); o.textContent = x; dsel.appendChild(o)});
        if ([...dsel.options].some(o=>o.textContent===cur)) dsel.value = cur;
      }
      if (ssel){
        const cur = ssel.value;
        ssel.innerHTML = '';
        const a = document.createElement('option'); a.textContent = 'All States'; ssel.appendChild(a);
        Array.from(states).filter(Boolean).sort().forEach(x=>{const o=document.createElement('option'); o.textContent = x; ssel.appendChild(o)});
        if ([...ssel.options].some(o=>o.textContent===cur)) ssel.value = cur;
      }
    }

    function apply(){
      const filters = {
        search: search?.value || '',
        disease: dsel?.value || 'All Diseases',
        state: ssel?.value || 'All States',
        range: parseRange(dater?.value || '')
      };
      Array.from(tbody.rows).forEach(r=>{
        r.style.display = matches(r, filters) ? '' : 'none';
      });
    }

    populateSelects();
    apply();

    search?.addEventListener('input', apply);
    dsel?.addEventListener('change', apply);
    ssel?.addEventListener('change', apply);
    dater?.addEventListener('change', apply);

    exportBtn?.addEventListener('click', ()=>{
      const rows = Array.from(tbody.rows).filter(r=> r.style.display !== 'none');
      const headers = Array.from(table.querySelectorAll('thead th')).map(h=>h.textContent.trim());
      const csv = [headers.join(',')];
      rows.forEach(r=>{
        const cols = Array.from(r.children).map(c=> '"'+(c.textContent||'').trim().replace(/"/g,'""')+'"');
        csv.push(cols.join(','));
      });
      const blob = new Blob([csv.join('\n')], {type:'text/csv;charset=utf-8;'});
      const name = 'disease-report-'+new Date().toISOString().slice(0,10)+'.csv';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

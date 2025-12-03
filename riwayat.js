
function bindRiwayat(){
  populateCategoryElements();
  renderList();
  document.getElementById('search').addEventListener('input', renderList);
  document.getElementById('filterJenis').addEventListener('change', renderList);
  document.getElementById('filterKategori').addEventListener('change', renderList);
}

function renderList(){
  const data = JSON.parse(localStorage.getItem('sbm_tx_v2')||'[]');
  const cat = JSON.parse(localStorage.getItem('sbm_cat_v2')||'[]');
  const search = document.getElementById('search').value.toLowerCase();
  const jenis = document.getElementById('filterJenis').value;
  const fk = document.getElementById('filterKategori').value;
  const container = document.getElementById('listContainer'); container.innerHTML='';
  const list = data.slice().sort((a,b)=>b.id.localeCompare(a.id));
  const filtered = list.filter(t=>{
    if(jenis!=='all' && t.type!==jenis) return false;
    if(fk && t.category!==fk) return false;
    if(search){
      return (t.note && t.note.toLowerCase().includes(search)) || String(t.amount).includes(search);
    }
    return true;
  });
  if(filtered.length===0){ container.innerHTML='<div class="small">Belum ada transaksi</div>'; return;}
  filtered.forEach(t=>{
    const c = cat.find(x=>x.id===t.category)||{name:'-'};
    const div = document.createElement('div'); div.className='item';
    div.innerHTML = `<div>
      <div style="font-weight:700">${c.name}</div>
      <div class="small">${t.note||''} • ${new Date(t.date).toLocaleDateString('id-ID')}</div>
    </div>
    <div style="text-align:right">
      <div class="${t.type==='income'?'badge income':'badge expense'}">${'Rp '+Number(t.amount).toLocaleString('id-ID')}</div>
      <div style="margin-top:6px"><button onclick="deleteTx('${t.id}')" class="btn" style="background:#ff6b6b">Hapus</button></div>
    </div>`;
    container.appendChild(div);
  });
}

function deleteTx(id){
  if(!confirm('Hapus transaksi ini?')) return;
  const data = JSON.parse(localStorage.getItem('sbm_tx_v2')||'[]');
  const nf = data.filter(t=>t.id!==id);
  localStorage.setItem('sbm_tx_v2', JSON.stringify(nf));
  renderList();
}

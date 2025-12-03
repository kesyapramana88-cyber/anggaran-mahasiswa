
const STORAGE = {
  TX: 'sbm_tx_v2',
  CAT: 'sbm_cat_v2',
  BUDGET: 'sbm_budget_v2'
};

function currency(n){
  return 'Rp ' + Number(n||0).toLocaleString('id-ID');
}

function load(){
  const tx = JSON.parse(localStorage.getItem(STORAGE.TX) || '[]');
  const cat = JSON.parse(localStorage.getItem(STORAGE.CAT) || '[]');
  const bud = JSON.parse(localStorage.getItem(STORAGE.BUDGET) || '[]');
  return {tx,cat,bud};
}

function save(data){
  localStorage.setItem(STORAGE.TX, JSON.stringify(data.tx));
  localStorage.setItem(STORAGE.CAT, JSON.stringify(data.cat));
  localStorage.setItem(STORAGE.BUDGET, JSON.stringify(data.bud));
}

// default categories
function ensureCategories(){
  const data = load();
  if (data.cat.length===0){
    data.cat = [
      {id:'cat_food', name:'Makanan & Minuman', keywords:['makan','warteg','kantin','lunch','snack','kopi']},
      {id:'cat_rent', name:'Kos / Kontrakan', keywords:['kos','kontrakan','sewa']},
      {id:'cat_transport', name:'Transportasi', keywords:['ojek','grab','gojek','bus','travel','transport']},
      {id:'cat_study', name:'Keperluan Kuliah', keywords:['print','skripsi','atk','buku','tugas','lab']},
      {id:'cat_fun', name:'Hiburan', keywords:['nonton','game','hangout','hiburan']},
      {id:'cat_other', name:'Lainnya', keywords:[]}
    ];
    save(data);
  }
}
ensureCategories();

// populate categories in selects
function populateCategoryElements(){
  const data = load();
  const selects = document.querySelectorAll('#kategori, #filterKategori');
  selects.forEach(s=>{
    if(!s) return;
    s.innerHTML = '<option value="">-- Semua --</option>';
    data.cat.forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.name;
      s.appendChild(opt);
    });
  });
  // category list in sidebar
  const catList = document.getElementById('catList');
  if (catList){
    catList.innerHTML = '';
    data.cat.forEach(c=>{
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div>${c.name}</div><div class="small">${c.keywords.slice(0,3).join(', ')}</div>`;
      catList.appendChild(el);
    });
  }
}

document.addEventListener('DOMContentLoaded', function(){
  populateCategoryElements();
  const path = location.pathname.split('/').pop();
  if (path==='' || path==='index.html'){
    renderDashboard();
  } else if (path==='tambah.html'){
    bindTambah();
  } else if (path==='riwayat.html'){
    bindRiwayat();
  } else if (path==='kategori.html'){
    bindKategori();
  } else if (path==='pengaturan.html'){
    bindPengaturan();
  }
});

function renderDashboard(){
  const data = load();
  const now = new Date();
  const month = now.getMonth(); const year = now.getFullYear();
  const monthTX = data.tx.filter(t=>{
    const d = new Date(t.date); return d.getMonth()===month && d.getFullYear()===year;
  });
  const totalIn = monthTX.filter(t=>t.type==='income').reduce((s,v)=>s+Number(v.amount),0);
  const totalOut = monthTX.filter(t=>t.type==='expense').reduce((s,v)=>s+Number(v.amount),0);
  document.getElementById('total-masuk').textContent = currency(totalIn);
  document.getElementById('total-keluar').textContent = currency(totalOut);
  document.getElementById('saldo').textContent = currency(totalIn - totalOut);

  // recent list
  const recent = data.tx.slice().sort((a,b)=>b.id.localeCompare(a.id)).slice(0,6);
  const recentList = document.getElementById('recentList'); recentList.innerHTML='';
  recent.forEach(r=>{
    const cat = data.cat.find(x=>x.id===r.category) || {name:'-'};
    const node = document.createElement('div'); node.className='item';
    node.innerHTML = `<div>
      <div style="font-weight:700">${cat.name}</div>
      <div class="small">${r.note||''} • ${new Date(r.date).toLocaleDateString('id-ID')}</div>
    </div>
    <div style="text-align:right">
      <div class="${r.type==='income'?'badge income':'badge expense'}">${currency(r.amount)}</div>
    </div>`;
    recentList.appendChild(node);
  });

  // pie chart
  const expenseByCat = {};
  monthTX.filter(t=>t.type==='expense').forEach(t=>{ expenseByCat[t.category] = (expenseByCat[t.category]||0)+Number(t.amount); });
  const labels=[]; const values=[];
  Object.keys(expenseByCat).forEach(k=>{
    const c = data.cat.find(x=>x.id===k);
    labels.push(c?c.name:k); values.push(expenseByCat[k]);
  });
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (window._pie) window._pie.destroy();
  window._pie = new Chart(ctx,{
    type:'doughnut',
    data:{labels: labels.length?labels:['Tidak ada'], datasets:[{data: values.length?values:[1],backgroundColor:['#6ee7b7','#60a5fa','#fca5a5','#f89fbd','#c7b8ff','#ffd88f']}]},
    options:{plugins:{legend:{position:'bottom'}}}
  });
}

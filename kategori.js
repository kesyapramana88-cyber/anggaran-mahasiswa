
function bindKategori(){
  renderCats();
  document.getElementById('addCat').addEventListener('click', ()=>{
    const name = document.getElementById('newCat').value.trim();
    if(!name) { alert('Masukkan nama'); return; }
    const data = JSON.parse(localStorage.getItem('sbm_cat_v2')||'[]');
    const id = 'cat_'+Date.now();
    data.push({id:id,name:name,keywords:[]});
    localStorage.setItem('sbm_cat_v2', JSON.stringify(data));
    document.getElementById('newCat').value='';
    renderCats(); populateCategoryElements();
  });
}

function renderCats(){
  const data = JSON.parse(localStorage.getItem('sbm_cat_v2')||'[]');
  const list = document.getElementById('catList'); list.innerHTML='';
  data.forEach(c=>{
    const el = document.createElement('div'); el.className='item';
    el.innerHTML = `<div>
      <div style="font-weight:700">${c.name}</div>
      <div class="small">Keywords: ${c.keywords.join(', ') || '-'}</div>
    </div>
    <div style="text-align:right">
      <button class="btn" onclick="editCat('${c.id}')">Edit</button>
      <button class="btn" style="background:#ef4444;margin-top:8px" onclick="deleteCat('${c.id}')">Hapus</button>
    </div>`;
    list.appendChild(el);
  });
}

function editCat(id){
  const data = JSON.parse(localStorage.getItem('sbm_cat_v2')||'[]');
  const cat = data.find(c=>c.id===id);
  const name = prompt('Nama kategori', cat.name);
  const kw = prompt('Keywords (pisah koma)', cat.keywords.join(','));
  if(name!==null) cat.name = name;
  if(kw!==null) cat.keywords = kw.split(',').map(s=>s.trim()).filter(Boolean);
  localStorage.setItem('sbm_cat_v2', JSON.stringify(data));
  renderCats(); populateCategoryElements();
}

function deleteCat(id){
  if(!confirm('Hapus kategori?')) return;
  const data = JSON.parse(localStorage.getItem('sbm_cat_v2')||'[]');
  const nf = data.filter(c=>c.id!==id);
  localStorage.setItem('sbm_cat_v2', JSON.stringify(nf));
  renderCats(); populateCategoryElements();
}

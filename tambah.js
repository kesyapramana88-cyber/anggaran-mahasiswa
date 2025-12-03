
function bindTambah(){
  populateCategoryElements();
  const catSelect = document.getElementById('kategori');
  const noteInput = document.getElementById('catatan');
  const suggestion = document.getElementById('suggestion');

  noteInput.addEventListener('input', ()=>{
    const text = noteInput.value.toLowerCase();
    const data = JSON.parse(localStorage.getItem('sbm_cat_v2') || '[]');
    let best = null; let bestScore=0;
    data.forEach(c=>{
      let score = 0;
      c.keywords.forEach(k=>{ if(k && text.includes(k)) score++; });
      if(score>bestScore){ bestScore=score; best=c; }
    });
    suggestion.textContent = best?best.name:'-';
  });

  document.getElementById('formTransaksi').addEventListener('submit', e=>{
    e.preventDefault();
    const jenis = document.getElementById('jenis').value;
    const kategori = document.getElementById('kategori').value || null;
    const jumlah = Number(document.getElementById('jumlah').value || 0);
    const note = document.getElementById('catatan').value || '';
    if(!jumlah || jumlah<=0){ alert('Masukkan jumlah valid'); return; }
    const data = JSON.parse(localStorage.getItem('sbm_tx_v2')||'[]');
    const id = 't_'+Date.now();
    data.push({id:id,type:jenis,amount:jumlah,category:kategori,note:note,date:new Date().toISOString()});
    localStorage.setItem('sbm_tx_v2', JSON.stringify(data));
    alert('Transaksi tersimpan');
    window.location.href='index.html';
  });
}

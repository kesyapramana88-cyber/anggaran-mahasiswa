
function bindPengaturan(){
  document.getElementById('resetBtn').addEventListener('click', ()=>{
    if(confirm('Reset semua data?')){ localStorage.clear(); location.href='index.html'; }
  });
}

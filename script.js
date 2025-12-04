/* Student Budget Manager complete app (offline) */
function $(id){return document.getElementById(id)}

let currentUser = null;
let monthlyChart = null;

function loadUsers(){ return JSON.parse(localStorage.getItem('sbm_users') || '{}'); }
function saveUsers(data){ localStorage.setItem('sbm_users', JSON.stringify(data)); }

function login(name){
  if(!name) return alert('Masukkan nama pengguna!');
  let users = loadUsers();
  if(!users[name]) users[name] = [];
  saveUsers(users);
  currentUser = name;
  $('authBox').style.display='none';
  $('appBox').style.display='block';
  $('userArea').textContent = 'Halo, ' + currentUser;
  refreshAll();
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('btnLogin').addEventListener('click', ()=>login($('username').value.trim()));
  document.getElementById('logoutBtn').addEventListener('click', ()=>{ currentUser=null; $('authBox').style.display='block'; $('appBox').style.display='none'; $('userArea').textContent=''; });
  document.getElementById('exportBtn').addEventListener('click', ()=>{
    const data = getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sbm_export_' + (currentUser || 'data') + '.json';
    a.click();
    URL.revokeObjectURL(url);
  });
});

function getData(){ if(!currentUser) return []; const users = loadUsers(); return users[currentUser] || []; }
function setData(arr){ const users = loadUsers(); users[currentUser] = arr; saveUsers(users); }

function addTransaction(type, desc, amount){
  if(!currentUser){ alert('Silakan login dulu'); return; }
  amount = Number(amount) || 0;
  if(amount <= 0){ alert('Masukkan nominal > 0'); return; }
  const d = new Date();
  const date = d.toISOString().split('T')[0];
  const t = {type, desc, amount, date, time: d.toTimeString().split(' ')[0]};
  const all = getData();
  all.push(t);
  setData(all);
  refreshAll();
}

function addIncome(){ addTransaction('income',$('incomeDesc').value, $('incomeAmount').value) }
function addExpense(){ addTransaction('expense',$('expenseDesc').value, $('expenseAmount').value) }

function refreshAll(){ renderStats(); renderHistory(); renderChart(); }

function renderStats(){
  const data = getData();
  const income = data.filter(d=>d.type==='income').reduce((a,b)=>a+b.amount,0);
  const expense = data.filter(d=>d.type==='expense').reduce((a,b)=>a+b.amount,0);
  $('statIncome').textContent = 'Rp ' + numberFormat(income);
  $('statExpense').textContent = 'Rp ' + numberFormat(expense);
  $('statBalance').textContent = 'Rp ' + numberFormat(income-expense);
}

function renderHistory(){
  const data = getData().slice().reverse();
  const container = $('history');
  container.innerHTML='';
  if(data.length===0) { container.textContent='Belum ada transaksi.'; return; }
  data.forEach(t=>{
    const el = document.createElement('div');
    el.className='history-item';
    el.innerHTML = '<div><strong>'+t.desc+'</strong><div style="font-size:12px;color:#667">'+t.date+' '+t.time+'</div></div><div style="text-align:right"><div>'+ (t.type==='income'?'+ ':'- ') + 'Rp ' + numberFormat(t.amount) +'</div><div style="font-size:12px;color:#888">'+t.type+'</div></div>';
    container.appendChild(el);
  });
}

function renderChart(){
  const data = getData();
  const now = new Date();
  const labels = [];
  const incomeData = [];
  const expenseData = [];
  for(let i=5;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const label = d.toLocaleString('id-ID',{month:'short',year:'numeric'});
    labels.push(label);
    const monthStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    const inc = data.filter(x=>x.type==='income' && x.date.startsWith(monthStr)).reduce((a,b)=>a+b.amount,0);
    const exp = data.filter(x=>x.type==='expense' && x.date.startsWith(monthStr)).reduce((a,b)=>a+b.amount,0);
    incomeData.push(inc);
    expenseData.push(exp);
  }

  if(!monthlyChart){
    const ctx = $('monthlyChart').getContext('2d');
    monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Income', data: incomeData, backgroundColor: 'rgba(0,123,255,0.7)' },
          { label: 'Expense', data: expenseData, backgroundColor: 'rgba(255,99,71,0.7)' }
        ]
      },
      options: { responsive:true, maintainAspectRatio:false }
    });
  } else {
    monthlyChart.data.labels = labels;
    monthlyChart.data.datasets[0].data = incomeData;
    monthlyChart.data.datasets[1].data = expenseData;
    monthlyChart.update();
  }
}

function checkSpending(){
  const data = getData();
  const today = new Date().toISOString().split('T')[0];
  const todayExpense = data.filter(d=>d.type==='expense' && d.date===today).reduce((a,b)=>a+b.amount,0);
  const avgExpense = averageDailyExpenseLast7Days(data);
  let msg='';
  if(todayExpense===0) msg = 'Kamu belum belanja hari ini. Hemat banget!';
  else if(todayExpense < avgExpense*0.6) msg = 'Hari ini kamu hemat dibanding rata-rata: Rp '+ numberFormat(todayExpense);
  else if(todayExpense < avgExpense*1.2) msg = 'Pengeluaran hari ini normal: Rp '+ numberFormat(todayExpense);
  else msg = 'Hmm, kamu agak boros hari ini: Rp '+ numberFormat(todayExpense) + '. Rata-rata 7 hari: Rp ' + numberFormat(avgExpense);
  $('analysisText').textContent = msg;
}

function averageDailyExpenseLast7Days(data){
  if(!data || data.length===0) return 0;
  const today = new Date();
  const counts = {};
  for(let i=0;i<7;i++){
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate()-i);
    counts[d.toISOString().split('T')[0]] = 0;
  }
  data.filter(x=>x.type==='expense').forEach(x=>{
    if(counts.hasOwnProperty(x.date)) counts[x.date] += x.amount;
  });
  const vals = Object.values(counts);
  const sum = vals.reduce((a,b)=>a+b,0);
  return Math.round(sum / 7);
}

function numberFormat(n){ return n.toLocaleString('id-ID'); }
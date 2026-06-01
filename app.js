// ============================================================
// PALMERAIE DIMAKO — APPLICATION (Supabase)
// ============================================================

const MOIS = ['JANVIER','FÉVRIER','MARS','AVRIL','MAI','JUIN',
              'JUILLET','AOÛT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DÉCEMBRE'];
const ANNEE = 2026;

const USERS = {
  'admin':    { pass:'admin123',  nom:'Administrateur', role:'Gestionnaire',     pages:['dashboard','production','recolte','dimako','bertoua','employes','depenses','rapports'] },
  'odette':   { pass:'odette123', nom:'Ttne Odette',    role:'Boutique Dimako',  pages:['dashboard','dimako'] },
  'alain':    { pass:'alain123',  nom:'Fr Alain',       role:'Boutique Bertoua', pages:['dashboard','bertoua'] },
  'presseur': { pass:'press123',  nom:'Presseur',       role:'Zone production',  pages:['dashboard','recolte','production'] },
};

let supabase = null;
let dbReady  = false;

function initSupabase() {
  try {
    if (typeof SUPABASE_URL==='undefined' || SUPABASE_URL.includes('VOTRE_URL') ||
        typeof SUPABASE_ANON==='undefined' || SUPABASE_ANON.includes('VOTRE_CLE')) {
      setSyncStatus('error', 'Configurez config.js');
      const b = document.getElementById('configBanner');
      if (b) b.classList.remove('hidden');
      return false;
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    setSyncStatus('ok', 'Base de données connectée');
    dbReady = true;
    return true;
  } catch(e) {
    setSyncStatus('error', 'Erreur de connexion');
    return false;
  }
}

function setSyncStatus(state, text) {
  const dot = document.getElementById('syncDot');
  const txt = document.getElementById('syncText');
  if (!dot || !txt) return;
  txt.textContent = text;
  dot.className = 'sync-dot sync-' + state;
}

async function dbUpsert(table, data) {
  if (!dbReady) throw new Error('DB non connectée');
  const { error } = await supabase.from(table).upsert(data, { onConflict: 'annee,mois' });
  if (error) throw error;
}

async function dbInsert(table, data) {
  if (!dbReady) throw new Error('DB non connectée');
  const { error } = await supabase.from(table).insert(data);
  if (error) throw error;
}

async function dbDelete(table, id) {
  if (!dbReady) throw new Error('DB non connectée');
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

async function dbGetAll(table, filter) {
  if (!dbReady) return [];
  let q = supabase.from(table).select('*');
  if (filter) Object.entries(filter).forEach(([k,v]) => { q = q.eq(k, v); });
  const { data, error } = await q.order('id');
  if (error) { console.error(error); return []; }
  return data || [];
}

let CACHE = { production:{}, dimako:{}, bertoua:{}, employes:[], depenses:[] };

async function loadAllData() {
  setSyncStatus('loading', 'Chargement...');
  try {
    const [prod, dim, bert, emp, dep] = await Promise.all([
      dbGetAll('production',       { annee: ANNEE }),
      dbGetAll('boutique_dimako',  { annee: ANNEE }),
      dbGetAll('boutique_bertoua', { annee: ANNEE }),
      dbGetAll('employes'),
      dbGetAll('depenses',         { annee: ANNEE }),
    ]);
    CACHE.production = {}; MOIS.forEach(m => { CACHE.production[m]={}; }); prod.forEach(r => { CACHE.production[r.mois]=r; });
    CACHE.dimako = {};     MOIS.forEach(m => { CACHE.dimako[m]={}; });     dim.forEach(r  => { CACHE.dimako[r.mois]=r; });
    CACHE.bertoua = {};    MOIS.forEach(m => { CACHE.bertoua[m]={}; });    bert.forEach(r => { CACHE.bertoua[r.mois]=r; });
    CACHE.employes = emp;
    CACHE.depenses = dep;
    setSyncStatus('ok', 'Synchronisé');
  } catch(e) {
    setSyncStatus('error', 'Erreur de chargement');
    console.error(e);
  }
}

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('todayDate').textContent =
    new Date().toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short', year:'numeric' });

  document.querySelectorAll('select[id$="-mois"]').forEach(sel => {
    MOIS.forEach(m => { const o=document.createElement('option'); o.value=m; o.textContent=m; sel.appendChild(o); });
  });
  const df = document.getElementById('dep-filter');
  if (df) { MOIS.forEach(m => { const o=document.createElement('option'); o.value=m; o.textContent=m; df.appendChild(o); }); }

  initSupabase();

  const saved = sessionStorage.getItem('palmeraie_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    if (dbReady) await loadAllData();
    enterApp();
  } else {
    showLoginOnly();
  }
});

function showLoginOnly() {
  document.querySelector('.sidebar').style.display = 'none';
  document.querySelector('.topbar').style.display  = 'none';
  document.getElementById('page-login').classList.remove('hidden');
  document.getElementById('page-login').classList.add('active');
}

async function doLogin() {
  const user = document.getElementById('loginUser').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  const err  = document.getElementById('loginError');
  if (USERS[user] && USERS[user].pass === pass) {
    currentUser = { login:user, ...USERS[user] };
    sessionStorage.setItem('palmeraie_user', JSON.stringify(currentUser));
    err.classList.add('hidden');
    if (dbReady) await loadAllData();
    enterApp();
  } else {
    err.classList.remove('hidden');
  }
}

function enterApp() {
  document.getElementById('page-login').classList.add('hidden');
  document.getElementById('page-login').classList.remove('active');
  document.querySelector('.sidebar').style.display = '';
  document.querySelector('.topbar').style.display  = '';
  document.getElementById('userName').textContent   = currentUser.nom;
  document.getElementById('userRole').textContent   = currentUser.role;
  document.getElementById('userAvatar').textContent = currentUser.nom.charAt(0).toUpperCase();
  const allowed = currentUser.pages;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.style.display = allowed.includes(item.getAttribute('data-page')) ? '' : 'none';
  });
  showPage(allowed[0] || 'dashboard');
}

function logout() {
  sessionStorage.removeItem('palmeraie_user');
  currentUser = null;
  document.querySelector('.sidebar').style.display = 'none';
  document.querySelector('.topbar').style.display  = 'none';
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  document.getElementById('page-login').classList.remove('hidden');
  document.getElementById('page-login').classList.add('active');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function showPage(page) {
  if (currentUser && !currentUser.pages.includes(page)) return;
  document.querySelectorAll('.page:not(#page-login)').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  const target = document.getElementById('page-'+page);
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.getAttribute('data-page')===page));
  const titles = { dashboard:'Tableau de bord', production:'Zone de production', recolte:'Saisir une récolte', dimako:'Boutique Dimako', bertoua:'Boutique Bertoua', employes:'Employés', depenses:'Dépenses', rapports:'Rapports' };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  const renders = { dashboard:renderDashboard, production:renderProduction, dimako:()=>renderBoutique('dimako'), bertoua:()=>renderBoutique('bertoua'), employes:renderEmployes, depenses:renderDepenses, rapports:renderRapports };
  if (renders[page]) renders[page]();
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

function fmtN(n) { return (!n||n==0)?'—':Number(n).toLocaleString('fr-FR'); }

function renderDashboard() {
  let tReg=0,tH=0,tRD=0,tRB=0,tDepP=0,tDepD=0,tDepB=0;
  MOIS.forEach(m => {
    const p=CACHE.production[m]||{},d=CACHE.dimako[m]||{},b=CACHE.bertoua[m]||{};
    tReg+=+p.regimes||0; tH+=+p.huile_l||0;
    tRD+=+d.recettes||0; tRB+=+b.recettes||0;
    tDepP+=(+p.dons||0)+(+p.salaires||0)+(+p.autres||0);
    tDepD+=+d.depenses||0; tDepB+=+b.depenses||0;
  });
  const tRec=tRD+tRB,tDep=tDepP+tDepD+tDepB,ben=tRec-tDep;
  document.getElementById('kpi-regimes').textContent  = tReg.toLocaleString('fr-FR');
  document.getElementById('kpi-huile').textContent    = tH.toLocaleString('fr-FR')+' L';
  document.getElementById('kpi-recettes').textContent = tRec.toLocaleString('fr-FR');
  document.getElementById('kpi-benefice').textContent = ben.toLocaleString('fr-FR');
  const tbody = document.getElementById('dashboardTable');
  tbody.innerHTML = '';
  let lastMois='—';
  MOIS.forEach(m => {
    const p=CACHE.production[m]||{},d=CACHE.dimako[m]||{},b=CACHE.bertoua[m]||{};
    const rec=(+d.recettes||0)+(+b.recettes||0);
    const dep=(+p.dons||0)+(+p.salaires||0)+(+p.autres||0)+(+d.depenses||0)+(+b.depenses||0);
    const sol=rec-dep;
    if(p.regimes||p.huile_l||d.recettes||b.recettes) lastMois=m;
    const cls=sol>0?'positive':sol<0?'negative':'';
    tbody.innerHTML+=`<tr><td>${m}</td><td class="num">${fmtN(p.regimes)}</td><td class="num">${(+p.huile_l||0).toLocaleString('fr-FR')} L</td><td class="num">${fmtN(d.recettes)}</td><td class="num">${fmtN(b.recettes)}</td><td class="num ${cls}">${sol?sol.toLocaleString('fr-FR')+' FCFA':'—'}</td></tr>`;
  });
  document.getElementById('dernierMois').textContent = lastMois;
  renderCharts();
}

let chartProd=null,chartFin=null;
function renderCharts() {
  const labels=MOIS.map(m=>m.substring(0,3));
  const huile=MOIS.map(m=>+(CACHE.production[m]?.huile_l||0));
  const regimes=MOIS.map(m=>+(CACHE.production[m]?.regimes||0));
  const recettes=MOIS.map(m=>(+(CACHE.dimako[m]?.recettes||0))+(+(CACHE.bertoua[m]?.recettes||0)));
  const depenses=MOIS.map(m=>{const p=CACHE.production[m]||{};return(+p.dons||0)+(+p.salaires||0)+(+p.autres||0)+(+(CACHE.dimako[m]?.depenses||0))+(+(CACHE.bertoua[m]?.depenses||0));});
  const ctx1=document.getElementById('chartProduction').getContext('2d');
  if(chartProd)chartProd.destroy();
  chartProd=new Chart(ctx1,{type:'bar',data:{labels,datasets:[{label:'Huile (L)',data:huile,backgroundColor:'rgba(26,107,74,0.75)',borderRadius:4},{label:'Régimes',data:regimes,backgroundColor:'rgba(200,134,10,0.6)',borderRadius:4,yAxisID:'y2'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{family:'DM Sans',size:11}}}},scales:{y:{grid:{color:'#eee'},ticks:{font:{family:'DM Mono',size:10}}},y2:{position:'right',grid:{display:false},ticks:{font:{family:'DM Mono',size:10}}}}}});
  const ctx2=document.getElementById('chartFinances').getContext('2d');
  if(chartFin)chartFin.destroy();
  chartFin=new Chart(ctx2,{type:'line',data:{labels,datasets:[{label:'Recettes',data:recettes,borderColor:'#1A6B4A',backgroundColor:'rgba(26,107,74,0.1)',fill:true,tension:0.3},{label:'Dépenses',data:depenses,borderColor:'#C0392B',backgroundColor:'rgba(192,57,43,0.07)',fill:true,tension:0.3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{family:'DM Sans',size:11}}}},scales:{y:{grid:{color:'#eee'},ticks:{font:{family:'DM Mono',size:10},callback:v=>v.toLocaleString('fr-FR')}}}}});
}

function renderProduction() {
  const tbody=document.getElementById('productionTable');
  tbody.innerHTML='';
  let tR=0,tF=0,tH=0,tD=0,tS=0,tA=0,tDep=0;
  MOIS.forEach(m=>{
    const p=CACHE.production[m]||{};
    const reg=+p.regimes||0,fut=+p.futs||0,h=+p.huile_l||0,don=+p.dons||0,sal=+p.salaires||0,aut=+p.autres||0,dep=don+sal+aut;
    const rend=reg>0?(h/reg).toFixed(2):'—';
    tR+=reg;tF+=fut;tH+=h;tD+=don;tS+=sal;tA+=aut;tDep+=dep;
    tbody.innerHTML+=`<tr><td>${m}</td><td class="num">${fmtN(reg)}</td><td class="num">${fmtN(fut)}</td><td class="num">${fmtN(h)}</td><td class="num">${fmtN(don)}</td><td class="num">${fmtN(sal)}</td><td class="num">${fmtN(aut)}</td><td class="num">${fmtN(dep)}</td><td class="num">${rend}</td></tr>`;
  });
  document.getElementById('productionTotals').innerHTML=`<td><strong>TOTAUX</strong></td><td class="num"><strong>${tR.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tF.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tH.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tD.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tS.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tA.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tDep.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tR>0?(tH/tR).toFixed(2):'—'}</strong></td>`;
}

function renderBoutique(which) {
  const data=CACHE[which];
  const tbody=document.getElementById(which+'Table');
  tbody.innerHTML='';
  let tRec=0,tSor=0,tVen=0,tRecouv=0,tSto=0,tRet=0,tR=0,tD=0;
  MOIS.forEach(m=>{
    const r=data[m]||{};
    const rec=+r.recup||0,sor=+r.sortie||0,ven=+r.vendu||0,recouv=+r.recouvrir||0,sto=+r.stocks||0,ret=+r.retour||0,rece=+r.recettes||0,dep=+r.depenses||0,sol=rece-dep;
    const cls=sol>0?'positive':sol<0?'negative':'';
    tRec+=rec;tSor+=sor;tVen+=ven;tRecouv+=recouv;tSto+=sto;tRet+=ret;tR+=rece;tD+=dep;
    tbody.innerHTML+=`<tr><td>${m}</td><td class="num">${fmtN(rec)}</td><td class="num">${fmtN(sor)}</td><td class="num">${fmtN(ven)}</td><td class="num">${fmtN(recouv)}</td><td class="num">${fmtN(sto)}</td><td class="num">${fmtN(ret)}</td><td class="num">${fmtN(rece)}</td><td class="num">${fmtN(dep)}</td><td class="num ${cls}">${sol?sol.toLocaleString('fr-FR')+' FCFA':'—'}</td></tr>`;
  });
  const tSol=tR-tD,tCls=tSol>=0?'positive':'negative';
  document.getElementById(which+'Totals').innerHTML=`<td><strong>TOTAUX</strong></td><td class="num"><strong>${tRec.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tSor.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tVen.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tRecouv.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tSto.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tRet.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tR.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${tD.toLocaleString('fr-FR')}</strong></td><td class="num ${tCls}"><strong>${tSol.toLocaleString('fr-FR')} FCFA</strong></td>`;
}

function switchTab(which,tab) {
  document.getElementById(which+'-view').classList.toggle('hidden',tab!=='view');
  document.getElementById(which+'-entry').classList.toggle('hidden',tab!=='entry');
  document.querySelectorAll('#page-'+which+' .tab-btn').forEach((btn,i)=>btn.classList.toggle('active',(i===0&&tab==='view')||(i===1&&tab==='entry')));
  if(tab==='view') renderBoutique(which);
}

async function saveRecolte() {
  const mois=document.getElementById('rec-mois').value;
  if(!mois){showToast('Sélectionnez un mois ❗');return;}
  const row={annee:ANNEE,mois,regimes:+document.getElementById('rec-regimes').value||0,futs:+document.getElementById('rec-futs').value||0,huile_l:+document.getElementById('rec-huile').value||0,dons:+document.getElementById('rec-dons').value||0,salaires:+document.getElementById('rec-salaires').value||0,autres:+document.getElementById('rec-autres').value||0,obs:document.getElementById('rec-obs').value||''};
  setSyncStatus('loading','Enregistrement...');
  try{await dbUpsert('production',row);CACHE.production[mois]=row;setSyncStatus('ok','Synchronisé');showMsg('recolte-msg',`✓ Récolte de ${mois} enregistrée`);showToast(`🌴 ${mois} enregistré`);}
  catch(e){setSyncStatus('error','Erreur');showToast('❌ '+e.message);}
}

async function saveBoutique(which) {
  const prefix=which==='dimako'?'dim':'bert';
  const mois=document.getElementById(prefix+'-mois').value;
  if(!mois){showToast('Sélectionnez un mois ❗');return;}
  const table=which==='dimako'?'boutique_dimako':'boutique_bertoua';
  const row={annee:ANNEE,mois,recup:+document.getElementById(prefix+'-recup').value||0,sortie:+document.getElementById(prefix+'-sortie').value||0,vendu:+document.getElementById(prefix+'-vendu').value||0,recouvrir:+document.getElementById(prefix+'-recouvrir').value||0,stocks:+document.getElementById(prefix+'-stocks').value||0,retour:+document.getElementById(prefix+'-retour').value||0,recettes:+document.getElementById(prefix+'-recettes').value||0,depenses:+document.getElementById(prefix+'-depenses').value||0};
  setSyncStatus('loading','Enregistrement...');
  try{
    await dbUpsert(table,row);CACHE[which][mois]=row;setSyncStatus('ok','Synchronisé');
    const label=which==='dimako'?'Boutique Dimako':'Boutique Bertoua';
    showMsg(which+'-msg',`✓ ${label} — ${mois} enregistré`);showToast(`✓ ${label} — ${mois}`);renderBoutique(which);
  }catch(e){setSyncStatus('error','Erreur');showToast('❌ '+e.message);}
}

function resetForm(prefix) {
  document.querySelectorAll('[id^="'+prefix+'-"]').forEach(el=>{el.value='';});
}

function renderEmployes() {
  const grid=document.getElementById('employeesGrid');
  grid.innerHTML='';
  if(!CACHE.employes.length){grid.innerHTML='<p style="color:#999;padding:20px">Aucun employé enregistré</p>';return;}
  CACHE.employes.forEach(emp=>{
    grid.innerHTML+=`<div class="emp-card"><div class="emp-card-header"><div class="emp-avatar">${emp.nom.charAt(0)}</div><div><div class="emp-name">${emp.nom}</div><div class="emp-poste">${emp.poste}</div></div></div><div class="emp-info"><div class="emp-info-row"><span class="emp-info-label">Téléphone</span><span class="emp-info-val">${emp.tel||'—'}</span></div><div class="emp-info-row"><span class="emp-info-label">Salaire</span><span class="emp-info-val">${emp.salaire?Number(emp.salaire).toLocaleString('fr-FR')+' FCFA':'—'}</span></div><div class="emp-info-row"><span class="emp-info-label">Depuis</span><span class="emp-info-val">${emp.date_embauche||'—'}</span></div><div class="emp-info-row"><span class="emp-info-label">Login</span><span class="emp-info-val">${emp.login||'—'}</span></div></div><div class="emp-del"><button class="btn-del" onclick="deleteEmployee(${emp.id})">✕ Supprimer</button></div></div>`;
  });
}

async function saveEmployee() {
  const nom=document.getElementById('emp-nom').value.trim();
  const poste=document.getElementById('emp-poste').value;
  if(!nom||!poste){showToast('Nom et poste obligatoires ❗');return;}
  const row={nom,poste,tel:document.getElementById('emp-tel').value,salaire:+document.getElementById('emp-salaire').value||0,date_embauche:document.getElementById('emp-date').value||null,login:document.getElementById('emp-login').value};
  setSyncStatus('loading','Enregistrement...');
  try{
    await dbInsert('employes',row);await loadAllData();closeModal('addEmployee');renderEmployes();setSyncStatus('ok','Synchronisé');showToast(`✓ ${nom} ajouté(e)`);
    ['emp-nom','emp-poste','emp-tel','emp-salaire','emp-date','emp-login'].forEach(id=>{document.getElementById(id).value='';});
  }catch(e){setSyncStatus('error','Erreur');showToast('❌ '+e.message);}
}

async function deleteEmployee(id) {
  if(!confirm('Supprimer cet employé ?'))return;
  try{await dbDelete('employes',id);CACHE.employes=CACHE.employes.filter(e=>e.id!==id);renderEmployes();showToast('Employé supprimé');}
  catch(e){showToast('❌ '+e.message);}
}

async function saveDepense() {
  const mois=document.getElementById('dep-mois').value;
  const cat=document.getElementById('dep-cat').value;
  const montant=document.getElementById('dep-montant').value;
  if(!mois||!cat||!montant){showToast('Mois, catégorie et montant obligatoires ❗');return;}
  const row={annee:ANNEE,mois,categorie:cat,description:document.getElementById('dep-desc').value,montant:+montant,paye_par:document.getElementById('dep-par').value};
  setSyncStatus('loading','Enregistrement...');
  try{
    await dbInsert('depenses',row);await loadAllData();
    ['dep-mois','dep-cat','dep-montant','dep-desc','dep-par'].forEach(id=>{document.getElementById(id).value='';});
    setSyncStatus('ok','Synchronisé');showMsg('depense-msg','✓ Dépense enregistrée');showToast('✓ Dépense ajoutée');renderDepensesTable();
  }catch(e){setSyncStatus('error','Erreur');showToast('❌ '+e.message);}
}

function renderDepenses(){renderDepensesTable();}

function renderDepensesTable() {
  const tbody=document.getElementById('depensesTable');
  const filter=document.getElementById('dep-filter').value;
  tbody.innerHTML='';
  const list=CACHE.depenses.filter(d=>!filter||d.mois===filter);
  if(!list.length){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:#999;padding:20px">Aucune dépense enregistrée</td></tr>';return;}
  list.forEach(d=>{
    const date=d.created_at?new Date(d.created_at).toLocaleDateString('fr-FR'):'—';
    tbody.innerHTML+=`<tr><td>${d.mois}</td><td>${d.categorie}</td><td>${d.description||'—'}</td><td class="num">${Number(d.montant).toLocaleString('fr-FR')} FCFA</td><td>${d.paye_par||'—'}</td><td>${date}</td><td><button class="btn-del" onclick="deleteDepense(${d.id})">✕</button></td></tr>`;
  });
}

async function deleteDepense(id){
  try{await dbDelete('depenses',id);CACHE.depenses=CACHE.depenses.filter(d=>d.id!==id);renderDepensesTable();showToast('Dépense supprimée');}
  catch(e){showToast('❌ '+e.message);}
}

function renderRapports() {
  let tReg=0,tH=0,tRD=0,tRB=0,tDepP=0,tDepD=0,tDepB=0;
  MOIS.forEach(m=>{
    const p=CACHE.production[m]||{},d=CACHE.dimako[m]||{},b=CACHE.bertoua[m]||{};
    tReg+=+p.regimes||0;tH+=+p.huile_l||0;tRD+=+d.recettes||0;tRB+=+b.recettes||0;
    tDepP+=(+p.dons||0)+(+p.salaires||0)+(+p.autres||0);tDepD+=+d.depenses||0;tDepB+=+b.depenses||0;
  });
  const tRec=tRD+tRB,tDep=tDepP+tDepD+tDepB,ben=tRec-tDep;
  const rend=tReg>0?(tH/tReg).toFixed(2):'—';
  document.getElementById('rapport-annuel').innerHTML=[
    ['Total régimes coupés',tReg.toLocaleString('fr-FR')+' régimes'],
    ['Total huile produite',tH.toLocaleString('fr-FR')+' litres'],
    ['Rendement moyen',rend+' L/régime'],
    ['Total recettes',tRec.toLocaleString('fr-FR')+' FCFA'],
    ['Total dépenses',tDep.toLocaleString('fr-FR')+' FCFA'],
    ['Bénéfice net',`<span style="color:${ben>=0?'#1A6B4A':'#C0392B'};font-size:1.1rem;font-weight:800">${ben.toLocaleString('fr-FR')} FCFA</span>`],
  ].map(([l,v])=>`<div class="rapport-stat"><span class="rapport-stat-label">${l}</span><span class="rapport-stat-val">${v}</span></div>`).join('');
  document.getElementById('rapport-boutiques').innerHTML=[
    ['Recettes Boutique Dimako',tRD.toLocaleString('fr-FR')+' FCFA'],
    ['Dépenses Boutique Dimako',tDepD.toLocaleString('fr-FR')+' FCFA'],
    ['Solde Dimako',`<span style="color:${(tRD-tDepD)>=0?'#1A6B4A':'#C0392B'}">${(tRD-tDepD).toLocaleString('fr-FR')} FCFA</span>`],
    ['Recettes Boutique Bertoua',tRB.toLocaleString('fr-FR')+' FCFA'],
    ['Dépenses Boutique Bertoua',tDepB.toLocaleString('fr-FR')+' FCFA'],
    ['Solde Bertoua',`<span style="color:${(tRB-tDepB)>=0?'#1A6B4A':'#C0392B'}">${(tRB-tDepB).toLocaleString('fr-FR')} FCFA</span>`],
    ['Dépenses Production',tDepP.toLocaleString('fr-FR')+' FCFA'],
  ].map(([l,v])=>`<div class="rapport-stat"><span class="rapport-stat-label">${l}</span><span class="rapport-stat-val">${v}</span></div>`).join('');
  const tbody=document.getElementById('rapportTable');
  tbody.innerHTML='';
  let gR=0,gH=0,gRD=0,gRB=0,gRec=0,gDep=0;
  MOIS.forEach(m=>{
    const p=CACHE.production[m]||{},d=CACHE.dimako[m]||{},b=CACHE.bertoua[m]||{};
    const reg=+p.regimes||0,h=+p.huile_l||0,rd=+d.recettes||0,rb=+b.recettes||0;
    const rec=rd+rb,dep=(+p.dons||0)+(+p.salaires||0)+(+p.autres||0)+(+d.depenses||0)+(+b.depenses||0),sol=rec-dep;
    const cls=sol>0?'positive':sol<0?'negative':'';
    gR+=reg;gH+=h;gRD+=rd;gRB+=rb;gRec+=rec;gDep+=dep;
    tbody.innerHTML+=`<tr><td>${m}</td><td class="num">${reg?reg.toLocaleString('fr-FR'):'—'}</td><td class="num">${h?h.toLocaleString('fr-FR'):'—'}</td><td class="num">${rd?rd.toLocaleString('fr-FR'):'—'}</td><td class="num">${rb?rb.toLocaleString('fr-FR'):'—'}</td><td class="num">${rec?rec.toLocaleString('fr-FR'):'—'}</td><td class="num">${dep?dep.toLocaleString('fr-FR'):'—'}</td><td class="num ${cls}">${sol?sol.toLocaleString('fr-FR')+' FCFA':'—'}</td></tr>`;
  });
  const gSol=gRec-gDep;
  document.getElementById('rapportTotals').innerHTML=`<td><strong>TOTAUX 2026</strong></td><td class="num"><strong>${gR.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${gH.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${gRD.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${gRB.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${gRec.toLocaleString('fr-FR')}</strong></td><td class="num"><strong>${gDep.toLocaleString('fr-FR')}</strong></td><td class="num ${gSol>=0?'positive':'negative'}"><strong>${gSol.toLocaleString('fr-FR')} FCFA</strong></td>`;
}

function openModal(id){document.getElementById('modal-'+id).classList.remove('hidden');}
function closeModal(id){document.getElementById('modal-'+id).classList.add('hidden');}

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.remove('hidden');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.add('hidden'),3500);
}
function showMsg(id,msg){
  const el=document.getElementById(id);if(!el)return;
  el.textContent=msg;el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'),4000);
}

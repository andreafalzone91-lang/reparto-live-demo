const $ = s => document.querySelector(s);
const names = ['KD','KP','KF','KR','KT','KA','KW','KK','KO','KB'];
const freshLine = name => ({name,stage:'idle',customer:'',bottle:'',prePieces:10000,bag1:1,bag2:1,extraRequested:false,extraLoaded:false,assignedTo:'',remainingPieces:null,ctDecision:'',cleanConfirmed:false,nextBottle:'',activity:[]});
const initial = () => ({customers:[],bottles:[],lines:Object.fromEntries(names.map(n=>[n,freshLine(n)]))});
const API_URL='https://ghaxikrkosdeelqhfice.supabase.co/rest/v1/shared_state?id=eq.1';
const API_KEY='sb_publishable_N_vKWdSfxtnZVGsStl2YGQ_uxdoU3Wb';
let appState=initial(), saving=false, ready=false;
let selected = 'KD';
const actorEl=$('#actor'), roleEl=$('#role');
actorEl.value=localStorage.getItem('reparto-actor')||'Demo'; roleEl.value=localStorage.getItem('reparto-role')||'Operatore';
actorEl.onchange=()=>localStorage.setItem('reparto-actor',actorEl.value);
roleEl.onchange=()=>{localStorage.setItem('reparto-role',roleEl.value);render()};
const labels={idle:'Nessuna richiesta',pre:'Pre-raclage',progress:'In corso','waiting-raclage':'In attesa raclage',raclage:'Raclage','waiting-ct':'In attesa CT','raclage-ok':'Raclage OK',unload:'Scarico linea',finished:'Finito'};
const cls=s=>s==='pre'?'pre':s==='progress'?'progress':s==='unload'?'unload':s==='finished'?'finished':['waiting-raclage','raclage','waiting-ct','raclage-ok'].includes(s)?'raclage':'';
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const now=()=>new Date().toISOString();
const showTime=iso=>new Date(iso).toLocaleString('it-IT',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
async function save(){
 saving=true;
 try{
  const r=await fetch(API_URL,{method:'PATCH',headers:{apikey:API_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({payload:appState,updated_at:new Date().toISOString()})});
  if(!r.ok)throw Error('Salvataggio condiviso non riuscito');
  localStorage.setItem('reparto-shared-cache',JSON.stringify(appState));
 }finally{saving=false}
}
async function loadRemote(){
 if(saving)return;
 try{
  const r=await fetch(API_URL+'&select=payload',{headers:{apikey:API_KEY},cache:'no-store'});
  if(!r.ok)throw Error('Connessione al database non disponibile');
  const rows=await r.json();
  if(rows[0]?.payload&&Object.keys(rows[0].payload.lines||{}).length){appState=rows[0].payload}
  else{appState=initial();await save()}
  ready=true;render();
 }catch(e){
  const cached=localStorage.getItem('reparto-shared-cache');
  if(cached&&!ready){try{appState=JSON.parse(cached);render()}catch{}}
  toast(e.message,true);
 }
}
function event(line,text,actor){line.activity.unshift({text,actor,at:now()});line.activity=line.activity.slice(0,100)}
function toast(text,error=false){const e=$('#toast');e.textContent=text;e.style.background=error?'#991b1b':'#172033';e.style.display='block';setTimeout(()=>e.style.display='none',2300)}
async function act(type,x={}){
 const a=actorEl.value.trim()||'Demo',l=appState.lines[selected];
 try{
  if(type==='save-pre'){l.customer=x.customer.trim();l.bottle=x.bottle.trim();l.prePieces=Math.max(0,Number(x.prePieces||0));l.extraRequested=x.extraRequested;l.extraLoaded=false;l.assignedTo='';l.stage='pre';if(l.customer&&!appState.customers.includes(l.customer))appState.customers.push(l.customer);if(l.bottle&&!appState.bottles.includes(l.bottle))appState.bottles.push(l.bottle);event(l,`Pre-raclage: ${l.prePieces.toLocaleString('it-IT')} flaconi mancanti`,a)}
  else if(type==='take-pre'){l.assignedTo=a;l.stage='progress';event(l,'Pre-raclage preso in carico',a)}
  else if(type==='extra-loaded'){l.extraLoaded=true;event(l,'Big bag aggiuntivo caricato',a)}
  else if(type==='submit-pre'){l.bag1=Number(x.bag1);l.bag2=Number(x.bag2);if(l.extraRequested&&!l.extraLoaded)throw Error('Conferma prima il big bag aggiuntivo');l.stage='waiting-raclage';event(l,`Disponibilità: ${l.bag1+l.bag2} big bag`,a)}
  else if(type==='call-raclage'){l.stage='raclage';l.assignedTo='';event(l,'Raclage chiamato',a)}
  else if(type==='take-raclage'){l.stage='progress';l.assignedTo=a;l.remainingPieces=-1;event(l,'Verifica raclage presa in carico',a)}
  else if(type==='submit-raclage'){l.remainingPieces=Math.max(0,Number(x.remainingPieces||0));l.stage='waiting-ct';event(l,`${l.remainingPieces.toLocaleString('it-IT')} pezzi avanzati`,a)}
  else if(type==='ct-decision'){l.ctDecision=x.decision;l.stage=x.decision==='ok'?'raclage-ok':'raclage';event(l,`Risposta CT: ${x.decision==='ok'?'OK':'Non OK'}`,a)}
  else if(type==='start-unload'){l.stage='unload';l.assignedTo=a;event(l,'Scarico linea in corso',a)}
  else if(type==='confirm-clean'){l.cleanConfirmed=true;l.stage='finished';event(l,'Linea completamente pulita',a)}
  else if(type==='next-load'){l.nextBottle=x.nextBottle.trim();if(!l.nextBottle)throw Error('Inserisci il codice successivo');if(!appState.bottles.includes(l.nextBottle))appState.bottles.push(l.nextBottle);l.bottle=l.nextBottle;l.stage='progress';l.cleanConfirmed=false;l.remainingPieces=null;event(l,`Inizio carico codice ${l.nextBottle}`,a)}
  else if(type==='reset'){const activity=l.activity;appState.lines[selected]=freshLine(selected);appState.lines[selected].activity=activity;event(appState.lines[selected],'Linea riportata a riposo',a)}
  await save();render();
 }catch(e){toast(e.message,true)}
}
function lists(){return `<datalist id="customers">${appState.customers.map(x=>`<option value="${esc(x)}">`).join('')}</datalist><datalist id="bottles">${appState.bottles.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`}
function panel(l){
 const h=`<h2>Linea ${l.name}</h2><span class="status">${esc(labels[l.stage])}</span>`;
 if(l.stage==='idle')return h+`<div class="grid" style="margin-top:16px"><label class="field">Cliente<input id="customer" list="customers"></label><label class="field">Codice flacone<input id="bottle" list="bottles"></label><label class="field">Pre-raclage · flaconi mancanti<input id="prePieces" type="number" min="0" value="10000"></label><label class="field">Big bag aggiuntivo<select id="extra"><option value="no">No</option><option value="yes">Sì</option></select></label></div>${lists()}<div class="actions"><button class="primary" id="savePre">Crea pre-raclage</button></div>`;
 const info=`<div class="notice"><strong>${esc(l.customer||'Cliente demo')}</strong> · ${esc(l.bottle||'Codice demo')}<br>${Number(l.prePieces).toLocaleString('it-IT')} flaconi mancanti${l.extraRequested?' · 1 big bag aggiuntivo':''}</div>`;
 if(l.stage==='pre')return h+info+`<div class="actions"><button class="primary" id="takePre">Prendo in carico</button></div>`;
 if(l.stage==='progress'&&l.remainingPieces===null)return h+info+`<p>In carico a <strong>${esc(l.assignedTo)}</strong></p>${l.extraRequested&&!l.extraLoaded?'<button id="extraLoaded">Big bag aggiuntivo caricato</button>':''}<div class="grid" style="margin-top:14px"><label class="field">Big bag 1<select id="bag1"><option value="1">Pieno</option><option value="0">Vuoto</option></select></label><label class="field">Big bag 2<select id="bag2"><option value="1">Pieno</option><option value="0">Vuoto</option></select></label></div><div class="actions"><button class="primary" id="submitPre">Invia risposta</button></div>`;
 if(l.stage==='waiting-raclage')return h+info+`<div class="actions"><button class="primary" id="callRaclage">Chiama raclage</button></div>`;
 if(l.stage==='raclage')return h+info+`<p>Serve la verifica dei pezzi avanzati.</p><div class="actions"><button class="primary" id="takeRaclage">Prendo in carico la verifica</button></div>`;
 if(l.stage==='progress'&&l.remainingPieces===-1)return h+info+`<p>Verifica in carico a <strong>${esc(l.assignedTo)}</strong></p><label class="field">Pezzi avanzati<input id="remaining" type="number" min="0"></label><div class="actions"><button class="primary" id="submitRaclage">Invia al CT</button></div>`;
 if(l.stage==='waiting-ct')return h+info+`<div class="notice"><strong>${Number(l.remainingPieces).toLocaleString('it-IT')} pezzi avanzati</strong><br>In attesa del CT.</div><div class="actions"><button class="primary" id="ctOk">CT: OK</button><button id="ctNo">CT: Non OK</button></div>`;
 if(l.stage==='raclage-ok')return h+info+`<p>Raclage approvato.</p><div class="actions"><button class="primary" id="startUnload">Avvia scarico linea</button></div>`;
 if(l.stage==='unload')return h+info+`<p><strong>Scarico linea in corso.</strong></p><label><input id="cleanCheck" type="checkbox"> Linea completamente pulita</label><div class="actions"><button class="primary" id="confirmClean">Conferma linea pulita</button></div>`;
 if(l.stage==='finished')return h+info+`<p><strong>Linea pulita confermata.</strong></p><label class="field">Codice successivo<input id="nextBottle" list="bottles"></label>${lists()}<div class="actions"><button class="primary" id="nextLoad">Conferma inizio carico</button><button class="danger" id="reset">Chiudi ciclo</button></div>`;
 return h+info+`<p>Carico del codice <strong>${esc(l.bottle)}</strong> in corso.</p><div class="actions"><button class="danger" id="reset">Nuovo ciclo</button></div>`;
}
function render(){
 $('#lines').innerHTML=Object.values(appState.lines).map(l=>`<button class="line ${cls(l.stage)} ${l.name===selected?'selected':''}" data-line="${l.name}"><strong>${l.name}</strong><small>${esc(labels[l.stage])}</small></button>`).join('');
 document.querySelectorAll('.line').forEach(b=>b.onclick=()=>{selected=b.dataset.line;render()});
 const l=appState.lines[selected];$('#panel').innerHTML=panel(l);bind();
 $('#activity').innerHTML=l.activity.length?l.activity.map(e=>`<div class="event"><strong>${esc(e.text)}</strong><small>${esc(e.actor)} · ${showTime(e.at)}</small></div>`).join(''):'<p class="muted">Nessuna attività.</p>';
}
function bind(){const on=(id,fn)=>{const e=$('#'+id);if(e)e.onclick=fn};on('savePre',()=>act('save-pre',{customer:$('#customer').value,bottle:$('#bottle').value,prePieces:$('#prePieces').value,extraRequested:$('#extra').value==='yes'}));on('takePre',()=>act('take-pre'));on('extraLoaded',()=>act('extra-loaded'));on('submitPre',()=>act('submit-pre',{bag1:$('#bag1').value,bag2:$('#bag2').value}));on('callRaclage',()=>act('call-raclage'));on('takeRaclage',()=>act('take-raclage'));on('submitRaclage',()=>act('submit-raclage',{remainingPieces:$('#remaining').value}));on('ctOk',()=>act('ct-decision',{decision:'ok'}));on('ctNo',()=>act('ct-decision',{decision:'no'}));on('startUnload',()=>act('start-unload'));on('confirmClean',()=>{if(!$('#cleanCheck').checked)return toast('Conferma la verifica della linea',true);act('confirm-clean')});on('nextLoad',()=>act('next-load',{nextBottle:$('#nextBottle').value}));on('reset',()=>act('reset'))}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
render();loadRemote();setInterval(loadRemote,2000);

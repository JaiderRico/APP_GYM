  /* ===================== v8.6.15 · Rutina fija, pestaña Cuerpo, caminatas y chat escondido ===================== */
  // Va al final, justo antes de `initV7();` (después de v8611). En la libre: la rutina va apagada (HYP_ON) y el chat también.
  // (1) La semana que eligió Jaider queda como rutina fija (sin botón «Aplicar»): Lun Push · Mar Pull · Mié Pierna A ·
  //     Jue descanso · Vie Torso · Sáb Hombros+Brazos · Dom Pierna B. Se aplica sola una vez (data.settings.hypPlan.v=2),
  //     guarda las rutinas viejas en hypPlan.prev y conserva el orden guardado de cada día (routineOrder).
  //     «Volver a mis rutinas anteriores» queda en Ajustes → Mi semana (marca hypOff para no volver a aplicarla).
  // (2) Pestaña «Cuerpo» (#cuerpo) con tres partes: Peso y medidas (gráfica, peso, medidas), Fotos y Caminatas.
  //     Logros se queda con récords, constancia, series por músculo, estancamientos y Estadísticas (#achStats).
  // (3) Caminatas: data.walks = [{id,date,min,kmh,incl,km,place:'cinta'|'afuera',note}]. Solo caminar: avisa sobre 6,5 km/h.
  // (4) El botón 💬 del chat se esconde junto con «Progreso de Ella» (body.mp-noher), salvo que haya mensajes sin leer.

  /* ---------- (1) Rutina fija ---------- */
  if(HYP_ON){
    const P=HYP_P,I=HYP_ISO;
    Object.assign(HYP_PLAN,{
      1:{title:'Lunes · Push',items:['Press inclinado','Aperturas / Pec Deck','Elevaciones laterales','Tríceps trasnuca / extensión sobre cabeza','Tríceps unilateral en polea'],prescription:{
        'Press inclinado':P(3,'6–10','1–2',180),'Aperturas / Pec Deck':P(3,'10–15',I,180),'Elevaciones laterales':P(3,'10–20',I,180),'Tríceps trasnuca / extensión sobre cabeza':P(3,'8–12',I,180),'Tríceps unilateral en polea':P(2,'10–15',I,180)}},
      2:{title:'Martes · Pull',items:['Jalón al pecho','Remo apoyado / máquina','Peck deck inverso','Curl de bíceps inclinado','Curl predicador'],prescription:{
        'Jalón al pecho':P(3,'6–10','1–2',180),'Remo apoyado / máquina':P(3,'8–12','1–2',180),'Peck deck inverso':P(3,'12–20',I,180),'Curl de bíceps inclinado':P(3,'8–12',I,180),'Curl predicador':P(2,'8–12',I,180)}},
      3:{title:'Miércoles · Pierna A · Cuádriceps',items:['Prensa','Extensión de cuádriceps','Femoral sentado','Aductores','Pantorrilla','Rueda abdominal'],prescription:{
        'Prensa':P(4,'6–10','1–2',240),'Extensión de cuádriceps':P(3,'10–15',I,180),'Femoral sentado':P(3,'8–12',I,180),'Aductores':P(2,'10–15','1',180),'Pantorrilla':P(4,'8–15',I,120),'Rueda abdominal':P(3,'8–12','1',180)}},
      4:{title:'Jueves · Descanso',items:[],prescription:{}},
      5:{title:'Viernes · Torso',items:['Remo','Press inclinado','Jalón al pecho','Aperturas','Peck deck inverso unilateral','Crunch con disco'],prescription:{
        'Remo':P(3,'8–12','1–2',180),'Press inclinado':P(3,'6–10','1–2',180),'Jalón al pecho':P(3,'8–12','1–2',180),'Aperturas':P(3,'10–15',I,180),'Peck deck inverso unilateral':P(3,'12–20',I,180),'Crunch con disco':P(3,'8–12','1',180)}},
      6:{title:'Sábado · Hombros + Brazos',items:['Elevaciones laterales en polea','Tríceps trasnuca / extensión sobre cabeza','Tríceps en polea','Curl predicador','Curl en polea'],prescription:{
        'Elevaciones laterales en polea':P(4,'10–20',I,180),'Tríceps trasnuca / extensión sobre cabeza':P(3,'8–12',I,180),'Tríceps en polea':P(3,'10–15',I,180),'Curl predicador':P(3,'8–12',I,180),'Curl en polea':P(2,'10–15',I,180)}},
      7:{title:'Domingo · Pierna B · Posterior',items:['Peso muerto rumano','Femoral sentado','Prensa','Extensión de cuádriceps','Pantorrilla'],prescription:{
        'Peso muerto rumano':P(3,'6–10','2',240),'Femoral sentado':P(3,'8–12',I,180),'Prensa':P(3,'8–12','1–2',240),'Extensión de cuádriceps':P(2,'12–15',I,180),'Pantorrilla':P(4,'8–15',I,120)}},
    });
    if(!CATALOG_BY_NAME.has('Rueda abdominal')){const e={id:'ex_rueda',name:'Rueda abdominal',group:'Abdomen',equipment:'Peso corporal',unit:'kg',execution:'bilateral',loadMode:'total',rest:180,increment:0,warmup:false,inverseLoad:false};EXERCISE_CATALOG.push(e);CATALOG_BY_NAME.set(e.name,e)}
    if(!HYP_EV['Rueda abdominal'])HYP_EV['Rueda abdominal']=['Trabaja el abdomen sin dejar que la espalda se arquee (anti-extensión). No hay comparativas fuertes entre ejercicios de abdomen: progresa en recorrido y repeticiones.',[]];
    if(!HYP_EV['Crunch con disco'])HYP_EV['Crunch con disco']=['El abdomen se dobla con carga, como en el crunch en polea. No hay comparativas fuertes entre ejercicios de abdomen: progresa la carga como en cualquier otro.',[]];
  }
  function v8615Apply(silent){
    const st=data.settings;if(!HYP_ON)return;
    if(st.hypPlan){if(st.hypPlan.v!==2){st.hypPlan.v=2;persist(true)}return}
    if(silent&&st.hypOff)return;
    try{saveBackupVersion('Antes de la semana nueva')}catch{}
    const prev={customRoutines:{},routineOrder:{},hideBuiltinRoutines:!!st.hideBuiltinRoutines};
    for(const [id,r] of Object.entries(data.customRoutines||{})){const d=Number(r?.day);if(d>=1&&d<=7){prev.customRoutines[id]=r;delete data.customRoutines[id]}}
    st.hideBuiltinRoutines=false;delete st.hypOff;st.hypPlan={v:2,applied:today(),prev};
    rebuildRoutines();persist(true);
  }
  hypApply=function(){if(!confirm('¿Usar tu semana (Lun Push · Mar Pull · Mié Pierna A · Vie Torso · Sáb Hombros + Brazos · Dom Pierna B)?'))return;delete data.settings.hypOff;v8615Apply(false);persist();toast('Semana aplicada.');try{hypRenderModal()}catch{}try{renderSettings()}catch{}};
  const _hypUndo8615=hypUndo;
  hypUndo=function(){_hypUndo8615.apply(this,arguments);if(!data.settings.hypPlan){data.settings.hypOff=true;persist(true);try{renderSettings()}catch{}}};
  hypCardHtml=function(){return ''};
  const _hypRM8615=hypRenderModal;
  hypRenderModal=function(){const r=_hypRM8615.apply(this,arguments);try{$('#hypModalBody .hyp-status')?.remove();const h=$('#hypModal .modal-head h2');if(h)h.textContent='📈 Mi semana';const s=$('#hypModal .modal-head .small');if(s)s.textContent='Cada ejercicio con su estudio y tu descanso.'}catch{}return r};
  const _rs8615=renderSettings;
  renderSettings=function(){const r=_rs8615.apply(this,arguments);try{const g=$('#hypSetPlan');if(g){const on=hypOn();g.querySelector('summary').textContent='📈 Mi semana y estudios';g.querySelector('.settings-section').innerHTML=`<p class="small" style="margin:0 0 8px">${on?'Lun Push · Mar Pull · Mié Pierna A · Jue descanso · Vie Torso · Sáb Hombros + Brazos · Dom Pierna B. Ahí también cambias el descanso de cada ejercicio.':'Estás usando tus rutinas anteriores.'}</p><div class="row" style="gap:8px;flex-wrap:wrap"><button class="secondary" data-hyp-open>Ver mi semana y estudios</button>${on?'<button class="secondary" data-hyp-undo>↩ Volver a mis rutinas anteriores</button>':'<button class="secondary" data-hyp-apply>Usar la semana nueva</button>'}</div>`}}catch(e){console.error(e)}return r};
  try{v8615Apply(true)}catch(e){console.error(e)}

  /* ---------- (2) Pestaña Cuerpo ---------- */
  let v8615Cur='peso';
  function v8615Pane(p){v8615Cur=p;$$('#cpTabs [data-cp]').forEach(b=>b.classList.toggle('on',b.dataset.cp===p));$$('#cuerpo [data-cp-pane]').forEach(x=>x.hidden=x.dataset.cpPane!==p);if(p==='caminar')v8615RenderWalks();if(p==='fotos'){try{renderPhotos()}catch{}}}
  function v8615RenderBody(){try{renderHome()}catch(e){console.error(e)}try{renderAchExtras()}catch(e){console.error(e)}v8615RenderWalks();v8615Pane(v8615Cur)}
  (function v8615Layout(){
    if($('#cuerpo'))return;
    const sec=document.createElement('section');sec.className='screen';sec.id='cuerpo';
    sec.innerHTML=`<div class="sectionhead"><div><h2>Cuerpo</h2><p>Peso, medidas, fotos y caminatas, cada cosa en su lugar.</p></div></div>
<div class="cp-tabs" id="cpTabs"><button type="button" data-cp="peso" class="on"><span>⚖️</span>Peso y medidas</button><button type="button" data-cp="fotos"><span>📷</span>Fotos</button><button type="button" data-cp="caminar"><span>🚶</span>Caminatas</button></div>
<div data-cp-pane="peso"></div><div data-cp-pane="fotos" hidden></div><div data-cp-pane="caminar" hidden><div id="cpWalkForm"></div><div id="cpWalks"></div></div>`;
    $('#history').after(sec);
    // Estadísticas de entreno se quedan en Logros
    const body=$('#achBody'),an=$('#analyticsGrid')?.closest('.card');
    if(body){
      const stats=document.createElement('div');stats.id='achStats';body.before(stats);
      if(an){const h=an.previousElementSibling;if(h&&h.classList.contains('sectionhead'))stats.append(h);stats.append(an)}
      const h0=body.querySelector('.sectionhead');if(h0)h0.innerHTML='<div><h2>Evolución</h2><p>Cómo cambian tu peso y tus medidas.</p></div>';
      sec.querySelector('[data-cp-pane="peso"]').append(body);
    }
    let ph=$('#achPhotos');if(!ph){ph=document.createElement('div');ph.id='achPhotos'}
    sec.querySelector('[data-cp-pane="fotos"]').append(ph);
    // Navegación: una pestaña más
    const nb=document.createElement('button');nb.className='navbtn';nb.dataset.screen='cuerpo';nb.innerHTML='<b>⚖</b>Cuerpo';
    const navin=$('.navin');if(navin){navin.querySelector('[data-screen="achievements"]')?.after(nb);navin.classList.remove('nav5');navin.classList.add('nav6')}
    const tb=document.createElement('button');tb.className='tab';tb.dataset.screen='cuerpo';tb.textContent='Cuerpo';
    const tabs=$('nav.tabs');if(tabs){tabs.querySelector('[data-screen="achievements"]')?.after(tb);tabs.classList.remove('tabs5');tabs.classList.add('tabs6')}
    [nb,tb].forEach(b=>b.addEventListener('click',()=>go('cuerpo')));
    sec.addEventListener('click',e=>{
      const t=e.target.closest('[data-cp]');if(t){v8615Pane(t.dataset.cp);return}
      const b=e.target.closest('[data-body]');if(b){bodyMetric=b.dataset.body;const c=$('#bodyChart');if(c)c.innerHTML=bodyChartHtml()}
    });
  })();
  const _go8615=go;
  go=function(screen){const r=_go8615.apply(this,arguments);if(screen==='cuerpo')v8615RenderBody();return r};
  const _rsc8615=renderScreen;
  renderScreen=function(s){const r=_rsc8615.apply(this,arguments);if(s==='cuerpo')v8615RenderBody();return r};

  /* ---------- (3) Caminatas ---------- */
  const walkList=()=>(data.walks=Array.isArray(data.walks)?data.walks:[]);
  let v8615WalkEdit=null,v8615Place=null;
  const V8615_TROTE=6.5;
  function v8615Km(w){const km=Number(w.km);if(km>0)return km;const v=Number(w.kmh),m=Number(w.min);return v>0&&m>0?v*m/60:0}
  function v8615Kcal(w){ // ACSM, ecuación de caminar (válida ~3–6 km/h). Aproximado.
    const kg=Number(lastWeight())||0,m=Number(w.min)||0,v=Number(w.kmh)||(v8615Km(w)>0&&m>0?v8615Km(w)/(m/60):0);if(!(kg>0&&m>0&&v>0))return 0;
    const S=v*1000/60,G=(Number(w.incl)||0)/100,vo2=.1*S+1.8*S*G+3.5;return Math.round(vo2*kg/1000*5*m);
  }
  function v8615Week(off=0){const d=new Date();d.setHours(0,0,0,0);const dow=(d.getDay()+6)%7;d.setDate(d.getDate()-dow-7*off);const a=d.toLocaleDateString('en-CA');d.setDate(d.getDate()+6);return [a,d.toLocaleDateString('en-CA')]}
  function v8615Sum(list){return list.reduce((s,w)=>({n:s.n+1,min:s.min+(Number(w.min)||0),km:s.km+v8615Km(w),kcal:s.kcal+v8615Kcal(w)}),{n:0,min:0,km:0,kcal:0})}
  const v8615N=(x,d=1)=>Number(x).toLocaleString('es-CO',{maximumFractionDigits:d});
  function v8615RenderWalkForm(){
    const host=$('#cpWalkForm');if(!host)return;const w=v8615WalkEdit?walkList().find(x=>x.id===v8615WalkEdit):null;
    const last=[...walkList()].sort((a,b)=>b.date.localeCompare(a.date)||(b.at||0)-(a.at||0))[0];
    const place=v8615Place||w?.place||last?.place||'cinta';
    host.innerHTML=`<div class="card"><div class="row between" style="gap:8px"><strong>${w?'✏️ Editar caminata':'🚶 Registrar caminata'}</strong>${w?'<button type="button" class="secondary mini" data-walk-cancel>Cancelar</button>':''}</div>
<div class="cp-seg" style="margin-top:10px"><button type="button" data-walk-place="cinta" class="${place==='cinta'?'on':''}">Caminadora</button><button type="button" data-walk-place="afuera" class="${place==='afuera'?'on':''}">Afuera</button></div>
<div class="cp-grid"><div class="field"><label for="wkDate">Fecha</label><input type="date" id="wkDate" value="${esc(w?.date||today())}"></div>
<div class="field"><label for="wkMin">Minutos</label><input type="number" id="wkMin" min="1" step="1" inputmode="numeric" placeholder="30" value="${w?esc(w.min):''}"></div>
<div class="field"><label for="wkKmh">Velocidad (km/h)</label><input type="number" id="wkKmh" min="0" step="0.1" inputmode="decimal" placeholder="${last?.kmh?esc(last.kmh):'5.0'}" value="${w?.kmh?esc(w.kmh):''}"></div>
<div class="field ${place==='cinta'?'':'cp-dim'}"><label for="wkIncl">Inclinación (%)</label><input type="number" id="wkIncl" min="0" max="20" step="0.5" inputmode="decimal" placeholder="${last?.incl?esc(last.incl):'0'}" value="${w?.incl?esc(w.incl):''}"></div>
<div class="field"><label for="wkKm">Distancia (km)</label><input type="number" id="wkKm" min="0" step="0.01" inputmode="decimal" placeholder="opcional" value="${w?.km?esc(w.km):''}"></div>
<div class="field"><label for="wkNote">Nota</label><input id="wkNote" maxlength="80" placeholder="opcional" value="${esc(w?.note||'')}"></div></div>
<p class="small" style="margin:8px 0 0">Si no pones distancia, la calculo con la velocidad y los minutos. Solo caminar: más de ${v8615N(V8615_TROTE)} km/h ya es casi trote.</p>
<button type="button" class="primary" data-walk-save style="width:100%;margin-top:10px">${w?'Guardar cambios':'Guardar caminata'}</button></div>`;
  }
  function v8615RenderWalks(){
    if(!$('#cpWalkForm'))return;if(!$('#wkMin'))v8615RenderWalkForm();
    const host=$('#cpWalks');if(!host)return;const all=[...walkList()].sort((a,b)=>b.date.localeCompare(a.date)||(b.at||0)-(a.at||0));
    const [a0,b0]=v8615Week(0),[a1,b1]=v8615Week(1),wk=v8615Sum(all.filter(w=>w.date>=a0&&w.date<=b0)),pw=v8615Sum(all.filter(w=>w.date>=a1&&w.date<=b1)),tot=v8615Sum(all);
    const diff=wk.min-pw.min;
    const stat=(v,l)=>`<div class="cp-stat"><strong>${v}</strong><span>${l}</span></div>`;
    const days=['L','M','M','J','V','S','D'].map((l,i)=>{const d=new Date(a0+'T12:00');d.setDate(d.getDate()+i);const k=d.toLocaleDateString('en-CA'),m=all.filter(w=>w.date===k).reduce((s,w)=>s+(Number(w.min)||0),0);return `<div class="cp-day ${m?'on':''} ${k===today()?'hoy':''}"><b>${l}</b><span>${m?m+"'":'·'}</span></div>`}).join('');
    host.innerHTML=`<div class="sectionhead"><div><h2>Esta semana</h2><p>${pw.n?`${diff>=0?'+':''}${diff} min frente a la semana pasada (${pw.min} min).`:'Lunes a domingo.'}</p></div></div>
<div class="card"><div class="cp-week">${days}</div><div class="cp-stats">${stat(wk.n,'caminatas')}${stat(wk.min,'minutos')}${stat(v8615N(wk.km),'km')}${stat(wk.kcal?'≈'+wk.kcal:'—','kcal')}</div>${wk.kcal||!lastWeight()?'':''}<p class="small" style="margin:8px 0 0">${lastWeight()?'Las kcal son una estimación con tu último peso, la velocidad y la inclinación.':'Registra tu peso en «Peso y medidas» para estimar las kcal.'}</p></div>
<div class="sectionhead"><div><h2>Tus caminatas</h2><p>${tot.n?`${tot.n} en total · ${v8615N(tot.min/60)} h · ${v8615N(tot.km)} km`:'Aún no registras caminatas.'}</p></div></div>
${all.length?`<div class="card cp-list">${all.slice(0,30).map(w=>`<div class="cp-row"><div><strong>${esc(dateLabel(w.date))}</strong> <span class="small">· ${w.place==='afuera'?'Afuera':'Caminadora'}</span><div class="small">${esc(w.min)} min${w.kmh?` · ${v8615N(w.kmh)} km/h`:''}${Number(w.incl)?` · ${v8615N(w.incl)} %`:''}${v8615Km(w)?` · ${v8615N(v8615Km(w),2)} km`:''}${v8615Kcal(w)?` · ≈${v8615Kcal(w)} kcal`:''}${w.note?` · ${esc(w.note)}`:''}</div></div><div class="row" style="gap:6px"><button type="button" class="secondary mini" data-walk-edit="${esc(w.id)}" aria-label="Editar">✏️</button><button type="button" class="secondary mini danger" data-walk-del="${esc(w.id)}" aria-label="Eliminar">🗑</button></div></div>`).join('')}</div>`:''}`;
  }
  function v8615SaveWalk(){
    const num=id=>{const v=parseFloat(String($(id)?.value||'').replace(',','.'));return isFinite(v)?v:0};
    const date=$('#wkDate')?.value||today(),min=Math.round(num('#wkMin')),kmh=num('#wkKmh'),incl=num('#wkIncl'),km=num('#wkKm');
    const place=$('#cpWalkForm [data-walk-place].on')?.dataset.walkPlace||'cinta';
    if(!(min>0)){toast('Escribe los minutos que caminaste.');$('#wkMin')?.focus();return}
    if(min>600){toast('Revisa los minutos.');return}
    const speed=kmh||(km>0?km/(min/60):0);
    if(speed>V8615_TROTE&&!confirm(`${v8615N(speed)} km/h ya es casi trote. ¿Guardarla así?`))return;
    const w={date,min,place};if(kmh>0)w.kmh=kmh;if(place==='cinta'&&incl>0)w.incl=incl;if(km>0)w.km=km;const note=($('#wkNote')?.value||'').trim();if(note)w.note=note;
    const list=walkList();
    if(v8615WalkEdit){const o=list.find(x=>x.id===v8615WalkEdit);if(o){for(const k of ['kmh','incl','km','note'])delete o[k];Object.assign(o,w)}}
    else list.push({id:uid(),at:Date.now(),...w});
    const was=!!v8615WalkEdit;v8615WalkEdit=null;v8615Place=null;persist(true);v8615RenderWalkForm();v8615RenderWalks();toast(was?'Caminata actualizada.':'🚶 Caminata guardada.');
  }
  document.addEventListener('click',e=>{
    const t=e.target;if(!t.closest?.('#cuerpo'))return;
    const pl=t.closest('[data-walk-place]');if(pl){v8615Place=pl.dataset.walkPlace;$$('#cpWalkForm [data-walk-place]').forEach(b=>b.classList.toggle('on',b===pl));$('#wkIncl')?.closest('.field')?.classList.toggle('cp-dim',v8615Place!=='cinta');return}
    if(t.closest('[data-walk-save]')){v8615SaveWalk();return}
    if(t.closest('[data-walk-cancel]')){v8615WalkEdit=null;v8615Place=null;v8615RenderWalkForm();return}
    const ed=t.closest('[data-walk-edit]');if(ed){v8615WalkEdit=ed.dataset.walkEdit;v8615Place=null;v8615RenderWalkForm();$('#cpWalkForm')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    const dl=t.closest('[data-walk-del]');if(dl){if(!confirm('¿Eliminar esta caminata?'))return;data.walks=walkList().filter(w=>w.id!==dl.dataset.walkDel);if(v8615WalkEdit===dl.dataset.walkDel)v8615WalkEdit=null;persist(true);v8615RenderWalkForm();v8615RenderWalks();toast('Caminata eliminada.');return}
  });

  /* ---------- (4) Chat escondido con «Progreso de Ella» ---------- */
  if(typeof V8611_HER!=='undefined'&&V8611_HER){
    const _herHtml8615=v8611HerHtml;
    v8611HerHtml=function(){return String(_herHtml8615.apply(this,arguments)).replace('Escondido en Inicio e Historial.','Escondidos en Inicio, Historial y el botón 💬 del chat (aparece solo si te llega un mensaje).').replace('Mostrar «Progreso de Ella»','Mostrar «Progreso de Ella» y el chat')};
  }

  document.head.insertAdjacentHTML('beforeend',`<style id="v8615Css">
    .tabs6{grid-template-columns:repeat(6,1fr)}.tabs6 .tab{font-size:10.5px;padding:9px 1px}
    .navin.nav6{grid-template-columns:repeat(6,1fr)}.navin.nav6 .navbtn{font-size:10.5px;padding-left:0;padding-right:0;min-width:0}
    body.mp-noher #v85ChatBtn:not(:has(.v85-badge)){display:none}
    @supports not selector(:has(a)){body.mp-noher #v85ChatBtn{display:none}}
    .cp-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 14px}
    .cp-tabs button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 4px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--muted);font-size:12.5px;font-weight:800}
    .cp-tabs button span{font-size:19px;line-height:1}
    .cp-tabs button.on{background:color-mix(in srgb,var(--green) 16%,var(--panel2));border-color:color-mix(in srgb,var(--green) 55%,var(--line));color:var(--text)}
    .cp-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .cp-seg button{padding:9px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--muted);font-weight:800}
    .cp-seg button.on{background:var(--green);border-color:var(--green);color:var(--ink,#0b120d)}
    .cp-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px}
    .cp-dim{opacity:.45}
    .cp-week{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:12px}
    .cp-day{display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 0;border-radius:12px;border:1px solid var(--line);background:var(--panel2);font-size:12px;color:var(--muted)}
    .cp-day b{font-size:12px}.cp-day.on{background:color-mix(in srgb,var(--green) 18%,var(--panel2));border-color:color-mix(in srgb,var(--green) 50%,var(--line));color:var(--text)}
    .cp-day.hoy{outline:2px solid color-mix(in srgb,var(--green) 55%,transparent);outline-offset:1px}
    .cp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
    .cp-stat{display:flex;flex-direction:column;padding:9px 8px;border-radius:12px;background:var(--panel2);border:1px solid var(--line)}
    .cp-stat strong{font-size:19px;line-height:1.1}.cp-stat span{font-size:11px;color:var(--muted)}
    .cp-list{padding-top:6px;padding-bottom:6px}
    .cp-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}
    .cp-row:last-child{border-bottom:0}
  </style>`);

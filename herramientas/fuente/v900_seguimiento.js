  /* ===================== v8.5.20 (solo app de Jaider): pantalla de seguimiento de Ella ===================== */
  // Todo lo de ella en un lugar: resumen y accesos (chat, snacks, pedidos, mensajes), historial completo de entrenos
  // filtrable por fechas y por ejercicio, sus comidas por día y su peso. Lee su copia en la nube (get_her_data).
  // La tarjeta de Inicio "Progreso de Ella" abre esta pantalla. La libre lo trae apagado (MP_PUBLICA). Va antes de initV7().
  const V90_ON=!(typeof MP_PUBLICA!=='undefined'&&MP_PUBLICA)&&!MP_APK_IS_ELLA;
  const v90={tab:'res',raw:null,at:0,loading:false,err:'',from:'',to:'',ex:'',mt:'',limit:15};
  const v90Name=()=>{try{return hmHerName()}catch{return 'Ella'}};
  const v90Kg=s=>{const n=Number(s.load)||0;return s.unit==='lb'?n*0.4536:n};
  const v90N=v=>{const r=Math.round((Number(v)||0)*10)/10;return String(r).replace('.',',')};
  const v90Reps=s=>(Number(s.solo??s.reps)||0)+(Number(s.assisted)||0);
  const v90Warm=s=>s.type==='warmup';
  const v90Day=d=>{try{return cap(dayLabelLong(d))}catch{return d}};
  const v90Norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
  const v90DayAdd=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toLocaleDateString('en-CA')};
  const v90Today=()=>new Date().toLocaleDateString('en-CA');

  document.head.insertAdjacentHTML('beforeend',`<style id="v90css">
    .v90{position:fixed;inset:0;z-index:36;background:var(--bg);display:flex;flex-direction:column}
    body.v90-on .toast{z-index:9700!important}
    .v90-h{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 8px;background:var(--panel);border-bottom:1px solid var(--line)}
    .v90-h .bk{margin:0;min-width:0;width:40px;height:40px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--text);font-size:24px}
    .v90-h .t{flex:1;min-width:0}.v90-h b{display:block;font-size:17px}.v90-h span{display:block;font-size:12px;color:var(--muted)}
    .v90-h .rf{margin:0;min-width:0;width:40px;height:40px;padding:0;border-radius:50%}
    .v90-tabs{display:flex;gap:4px;padding:8px 10px;background:var(--panel);border-bottom:1px solid var(--line);overflow-x:auto}
    .v90-tabs button{flex:1;margin:0;padding:8px 6px;font-size:13px;border-radius:12px;white-space:nowrap;background:transparent;border:1px solid transparent;color:var(--muted);font-weight:800}
    .v90-tabs button.on{background:var(--green);color:#0b120d}
    .v90-b{flex:1;overflow-y:auto;padding:12px 12px calc(env(safe-area-inset-bottom,0px) + 24px)}
    .v90-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
    .v90-tiles div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 6px;text-align:center}
    .v90-tiles b{display:block;font-size:20px}.v90-tiles small{font-size:11px;color:var(--muted)}
    .v90-go{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}.v90-go button{margin:0;padding:12px 8px;text-align:left;font-size:14px}
    .v90-go button small{display:block;font-size:11.5px;color:var(--muted);font-weight:500;margin-top:2px}
    .v90-f{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px;margin-bottom:12px}
    .v90-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}.v90-chips button{margin:0;padding:6px 11px;font-size:12.5px;border-radius:99px}.v90-chips button.on{background:var(--green);color:#0b120d}
    .v90-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v90-f label{font-size:11.5px;color:var(--muted)}
    .v90-f input,.v90-f select{width:100%;margin-top:2px;padding:9px;border-radius:10px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:14px}
    .v90-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:12px;margin-bottom:10px}
    .v90-card h3{margin:0;font-size:15.5px}.v90-card .sub{font-size:12.5px;color:var(--muted);margin-top:2px}
    .v90-ex{margin-top:10px}.v90-ex b{font-size:14px}
    .v90-sets{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}
    .v90-sets i{font-style:normal;font-size:12.5px;font-weight:700;padding:4px 8px;border-radius:9px;background:var(--panel2);border:1px solid var(--line)}
    .v90-sets i.w{opacity:.55;font-weight:500}.v90-sets i small{font-weight:500;opacity:.75;margin-left:3px}
    .v90-say{margin:10px 0 0;padding:7px 12px;font-size:13px}
    .v90-sum{border-left:4px solid var(--green)}
    .v90-meal{display:flex;gap:8px;padding:7px 0;border-top:1px solid var(--line)}.v90-meal:first-of-type{border-top:0}
    .v90-meal .tg{flex:none;font-size:11px;font-weight:800;padding:3px 7px;border-radius:8px;background:var(--panel2);height:fit-content;min-width:64px;text-align:center}
    .v90-meal p{margin:0;font-size:14px}.v90-meal small{display:block;color:var(--muted);font-size:12px}
    .v90-empty{color:var(--muted);font-size:13px;font-style:italic}
    .v90-row{display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid var(--line);font-size:14px}.v90-row:first-child{border-top:0}
  </style>`);

  // ---------- Datos ----------
  async function v90Load(force){
    if(!force){try{if(hmState&&hmState.raw){v90.raw=hmState.raw;v90.at=hmState.at||0}}catch{}}
    if(v90.raw&&!force)return;
    if(v90.loading)return;v90.loading=true;v90.err='';v90Paint();
    try{const j=await gas('get_her_data');v90.raw=typeof j.payload==='string'?JSON.parse(j.payload):j.payload;v90.at=Date.parse(j.updatedAt)||Date.now();try{hmState.raw=v90.raw}catch{}}
    catch(e){v90.err=e.message||'No se pudo leer su progreso.'}
    finally{v90.loading=false;v90Paint()}
  }
  const v90W=()=>((v90.raw&&v90.raw.workouts)||[]).filter(w=>w&&w.date).slice().sort((a,b)=>b.date.localeCompare(a.date)||(b.createdAt||0)-(a.createdAt||0));
  const v90M=()=>((v90.raw&&v90.raw.meals)||[]).filter(m=>m&&m.date);
  const v90In=d=>(!v90.from||d>=v90.from)&&(!v90.to||d<=v90.to);
  function v90Exercises(){const c=new Map();v90W().forEach(w=>(w.exercises||[]).forEach(e=>{if(e&&e.name)c.set(e.name,(c.get(e.name)||0)+1)}));return [...c.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'))}
  const v90Eff=w=>(w.exercises||[]).reduce((n,e)=>n+(e.sets||[]).filter(s=>!v90Warm(s)&&v90Reps(s)>0).length,0);
  const v90Top=e=>{let best=null;(e.sets||[]).forEach(s=>{if(v90Warm(s)||!v90Reps(s))return;const r=v90Kg(s)*(1+v90Reps(s)/30);if(!best||r>best.e)best={e:r,s}});return best};

  // ---------- Vista ----------
  function v90Open(tab){
    if(!V90_ON)return;
    try{if(!hmCode()){openHerModal();return}}catch{}
    if(tab)v90.tab=tab;
    $('#v90')?.remove();document.body.classList.add('v90-on');
    document.body.insertAdjacentHTML('beforeend',`<div class="v90" id="v90" role="dialog" aria-modal="true"><div class="v90-h"><button class="bk" data-v90-close aria-label="Volver">‹</button><div class="t"><b>👩 ${esc(v90Name())}</b><span id="v90Sub"></span></div><button class="secondary rf" data-v90-refresh aria-label="Actualizar">↻</button></div>
      <div class="v90-tabs">${[['res','Resumen'],['w','🏋️ Entrenos'],['m','🍽 Comidas'],['p','⚖️ Peso']].map(([k,l])=>`<button data-v90-tab="${k}" class="${v90.tab===k?'on':''}">${l}</button>`).join('')}</div><div class="v90-b" id="v90B"></div></div>`);
    v90Paint();v90Load(false);
  }
  function v90Close(){$('#v90')?.remove();document.body.classList.remove('v90-on')}
  function v90Paint(){
    const b=$('#v90B');if(!b)return;
    $$('[data-v90-tab]').forEach(x=>x.classList.toggle('on',x.dataset.v90Tab===v90.tab));
    const s=$('#v90Sub');if(s)s.textContent=v90.loading?'Actualizando…':v90.at?`Copia de su app · ${ago(v90.at)}`:'';
    if(!v90.raw){b.innerHTML=v90.err?`<div class="v90-card">⚠ ${esc(v90.err)}</div>`:'<p class="small">Cargando su progreso…</p>';return}
    const sc=b.scrollTop;
    b.innerHTML=v90.err?`<div class="v90-card small">⚠ ${esc(v90.err)}</div>`:'';
    b.insertAdjacentHTML('beforeend',v90.tab==='w'?v90WHtml():v90.tab==='m'?v90MHtml():v90.tab==='p'?v90PHtml():v90ResHtml());
    b.scrollTop=sc;
  }
  function v90ResHtml(){
    const W=v90W(),M=v90M(),t=v90Today(),d7=v90DayAdd(t,-6),d30=v90DayAdd(t,-29);
    const w7=W.filter(w=>w.date>=d7).length,w30=W.filter(w=>w.date>=d30).length;
    const md=new Set(M.filter(m=>m.date>=d7).map(m=>m.date)).size,sn=M.filter(m=>m.date>=d7&&m.type==='snack').length;
    const last=W[0];
    return `<div class="v90-tiles"><div><b>${w7}</b><small>entrenos en 7 días</small></div><div><b>${w30}</b><small>en 30 días</small></div><div><b>${last?esc(ago(Date.parse(last.date+'T12:00:00'))):'—'}</b><small>último entreno</small></div>
      <div><b>${md}/7</b><small>días con comidas</small></div><div><b>${v90N(sn/7)}</b><small>snacks por día</small></div><div><b>${M.filter(m=>m.date===t).length}</b><small>comidas hoy</small></div></div>
      <div class="v90-go"><button class="secondary" data-v90-chat>💬 Chat<small>Escríbele</small></button><button class="secondary" data-v89-open="ella">🥤 Snacks<small>Ver y sugerir</small></button>
      <button class="secondary" data-v90-req>💡 Pedidos<small>Lo que pidió para su app</small></button><button class="secondary" data-v90-hm>📩 Mensajes y rutinas<small>Progreso, sorpresas, rutinas</small></button></div>
      <div class="row" style="justify-content:space-between;align-items:baseline"><b>Últimos entrenos</b><a href="#" data-v90-tab="w" class="small">Ver todos ›</a></div>
      ${W.slice(0,3).map(v90WCard).join('')||'<p class="v90-empty">Aún no hay entrenos.</p>'}
      <div class="row" style="justify-content:space-between;align-items:baseline;margin-top:6px"><b>Comidas de hoy</b><a href="#" data-v90-tab="m" class="small">Ver todas ›</a></div>
      ${v90DayMeals(t,true)}`;
  }
  function v90Filters(kind){
    const t=v90Today(),c=(a,b)=>v90.from===a&&v90.to===b?'on':'';
    const exs=kind==='w'?v90Exercises():[];
    return `<div class="v90-f"><div class="v90-chips"><button class="secondary ${c(t,t)}" data-v90-rng="0">Hoy</button><button class="secondary ${c(v90DayAdd(t,-6),t)}" data-v90-rng="7">7 días</button><button class="secondary ${c(v90DayAdd(t,-29),t)}" data-v90-rng="30">30 días</button><button class="secondary ${c(v90DayAdd(t,-89),t)}" data-v90-rng="90">3 meses</button><button class="secondary ${!v90.from&&!v90.to?'on':''}" data-v90-rng="all">Todo</button></div>
      <div class="v90-two"><div><label>Desde</label><input type="date" data-v90-f="from" value="${esc(v90.from)}"></div><div><label>Hasta</label><input type="date" data-v90-f="to" value="${esc(v90.to)}"></div></div>
      ${kind==='w'?`<div style="margin-top:8px"><label>Ejercicio</label><select data-v90-f="ex"><option value="">Todos los ejercicios</option>${exs.map(([n,k])=>`<option value="${esc(n)}" ${v90.ex===n?'selected':''}>${esc(n)} (${k})</option>`).join('')}</select></div>`:
      `<div style="margin-top:8px"><label>Comida</label><select data-v90-f="mt"><option value="">Todas</option>${Object.entries(MEAL_TYPES).map(([k,v])=>`<option value="${k}" ${v90.mt===k?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`}
      <div class="small" style="margin-top:6px">Para ver un solo día pon la misma fecha en Desde y Hasta.</div></div>`;
  }
  function v90SetChips(w,ex){
    return (w&&w.length?w:[]).map(s=>`<i class="${v90Warm(s)?'w':''}">${v90Warm(s)?'C ':''}${s.load!==''&&s.load!=null&&Number(s.load)?v90N(s.load)+(s.unit==='lb'?' lb':'')+' × ':''}${v90Reps(s)}${Number(s.assisted)?`<small>(${s.assisted} ayud.)</small>`:''}${s.rir!=null&&s.rir!==''?`<small>RIR ${esc(String(s.rir))}</small>`:''}</i>`).join('');
  }
  function v90WCard(w,onlyEx){
    const ex=(w.exercises||[]).filter(e=>!onlyEx||v90Norm(e.name)===v90Norm(onlyEx));
    const mins=Number(w.durationActiveMinutes||w.durationMinutes)||0,eff=v90Eff(w);
    const note=[w.note,w.notes,w.comment,w.incompleteReason&&('Incompleto: '+w.incompleteReason)].filter(x=>typeof x==='string'&&x.trim()).join(' · ');
    const say=`Sobre tu entreno del ${v90Day(w.date)}${w.title?` (${w.title})`:''}: `;
    return `<div class="v90-card"><h3>${esc(v90Day(w.date))}</h3><div class="sub">${esc(w.title||'Entrenamiento')}${mins?` · ${mins} min`:''} · ${eff} series efectivas${w.freeMode?' · modo libre':''}${w.feeling?` · ${esc(String(w.feeling))}`:''}</div>
      ${w.aiSummary?`<p class="small" style="margin:6px 0 0">✨ ${esc(w.aiSummary)}</p>`:''}${note?`<p class="small" style="margin:6px 0 0">📝 ${esc(note)}</p>`:''}
      ${ex.map(e=>`<div class="v90-ex"><b>${esc(e.name)}</b><div class="v90-sets">${v90SetChips(e.sets||[])||'<span class="v90-empty">sin series</span>'}</div></div>`).join('')}
      <button class="secondary v90-say" data-v90-say="${esc(say)}">💬 Comentarle</button></div>`;
  }
  function v90WHtml(){
    let W=v90W().filter(w=>v90In(w.date));
    if(v90.ex)W=W.filter(w=>(w.exercises||[]).some(e=>v90Norm(e.name)===v90Norm(v90.ex)));
    let sum='';
    if(v90.ex&&W.length){
      const pts=W.map(w=>{const e=(w.exercises||[]).find(x=>v90Norm(x.name)===v90Norm(v90.ex));return {d:w.date,t:e&&v90Top(e)}}).filter(x=>x.t).reverse();
      if(pts.length){
        const best=pts.reduce((a,b)=>b.t.e>a.t.e?b:a),first=pts[0],last=pts[pts.length-1],ch=first.t.e?Math.round((last.t.e/first.t.e-1)*100):0;
        const tx=p=>`${v90N(p.t.s.load)}${p.t.s.unit==='lb'?' lb':' kg'} × ${v90Reps(p.t.s)}`;
        sum=`<div class="v90-card v90-sum"><h3>📈 ${esc(v90.ex)}</h3><div class="sub">${pts.length} sesión(es) en el filtro</div>
          <div class="v90-row"><span>Mejor serie</span><b>${tx(best)} <span class="small">(${esc(v90Day(best.d))})</span></b></div>
          <div class="v90-row"><span>Última</span><b>${tx(last)}</b></div>
          ${pts.length>1?`<div class="v90-row"><span>Fuerza estimada vs. la primera</span><b>${ch>0?'+':''}${ch}%</b></div>`:''}
          <div class="v90-sets" style="margin-top:6px">${pts.slice(-12).map(p=>`<i>${esc(p.d.slice(5).split('-').reverse().join('/'))}: ${tx(p)}</i>`).join('')}</div></div>`;
      }
    }
    const shown=W.slice(0,v90.limit);
    return v90Filters('w')+sum+`<div class="small" style="margin:0 2px 8px">${W.length} entreno(s)</div>`+(shown.map(w=>v90WCard(w,v90.ex)).join('')||'<p class="v90-empty">No hay entrenos con ese filtro.</p>')+
      (W.length>shown.length?`<button class="secondary" data-v90-more style="width:100%">Ver ${Math.min(15,W.length-shown.length)} más</button>`:'');
  }
  function v90DayMeals(d,compact){
    const L=v90M().filter(m=>m.date===d&&(!v90.mt||compact||m.type===v90.mt)).sort((a,b)=>(MEAL_ORDER[a.type]??9)-(MEAL_ORDER[b.type]??9)||(a.createdAt||0)-(b.createdAt||0));
    const kc=L.reduce((n,m)=>n+(Number(m.kcal)||0),0),pr=L.reduce((n,m)=>n+(Number(m.protein)||0),0),sn=L.filter(m=>m.type==='snack').length;
    const say=`Sobre lo que comiste el ${v90Day(d)}: `;
    return `<div class="v90-card"><h3>${esc(v90Day(d))}</h3><div class="sub">${L.length?`${L.length} registro(s)${kc?` · ~${kc} kcal`:''}${pr?` · ~${pr} g proteína`:''} · ${sn} snack(s)`:'Sin registros este día'}</div>
      ${L.length?`<div style="margin-top:6px">${L.map(m=>`<div class="v90-meal"><span class="tg">${esc(MEAL_TYPES[m.type]||m.type||'')}</span><div><p>${esc(m.text||'')}</p>${m.kcal||m.protein?`<small>${m.kcal?`~${esc(m.kcal)} kcal`:''}${m.kcal&&m.protein?' · ':''}${m.protein?`~${esc(m.protein)} g proteína`:''}${m.createdAt?` · anotado ${esc(new Date(m.createdAt).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'}))}`:''}</small>`:m.createdAt?`<small>anotado ${esc(new Date(m.createdAt).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'}))}</small>`:''}</div></div>`).join('')}</div>`:''}
      ${compact?'':`<button class="secondary v90-say" data-v90-say="${esc(say)}">💬 Comentarle</button>`}</div>`;
  }
  function v90MHtml(){
    const t=v90Today(),M=v90M();
    let days;
    if(v90.from&&v90.to&&v90.from<=v90.to){days=[];for(let d=v90.to;d>=v90.from&&days.length<120;d=v90DayAdd(d,-1))days.push(d)}
    else days=[...new Set(M.filter(m=>v90In(m.date)).map(m=>m.date))].sort().reverse();
    if(v90.mt)days=days.filter(d=>M.some(m=>m.date===d&&m.type===v90.mt));
    const withData=days.filter(d=>M.some(m=>m.date===d)).length,shown=days.slice(0,v90.limit);
    return v90Filters('m')+`<div class="small" style="margin:0 2px 8px">${days.length} día(s)${v90.from&&v90.to?` · registró comidas en ${withData}`:''}</div>`+(shown.map(d=>v90DayMeals(d,false)).join('')||'<p class="v90-empty">No hay comidas con ese filtro.</p>')+
      (days.length>shown.length?`<button class="secondary" data-v90-more style="width:100%">Ver ${Math.min(15,days.length-shown.length)} días más</button>`:'');
  }
  function v90PHtml(){
    const P=((v90.raw&&v90.raw.bodyWeights)||[]).filter(x=>x&&x.date&&Number(x.kg)).sort((a,b)=>b.date.localeCompare(a.date));
    const Ms=((v90.raw&&v90.raw.bodyMeasurements)||[]).filter(x=>x&&x.date).sort((a,b)=>b.date.localeCompare(a.date));
    let h='';
    if(P.length){const f=P[P.length-1],l=P[0],d=Math.round((l.kg-f.kg)*10)/10;
      h+=`<div class="v90-card v90-sum"><h3>⚖️ Peso</h3><div class="sub">${v90N(l.kg)} kg el ${esc(v90Day(l.date))} · ${d>0?'+':''}${v90N(d)} kg desde el ${esc(v90Day(f.date))}</div>
        ${P.slice(0,40).map((x,i)=>{const p=P[i+1],dd=p?Math.round((x.kg-p.kg)*10)/10:null;return `<div class="v90-row"><span>${esc(v90Day(x.date))}</span><b>${v90N(x.kg)} kg${dd!=null?` <span class="small">(${dd>0?'+':''}${v90N(dd)})</span>`:''}</b></div>`}).join('')}</div>`}
    else h+='<p class="v90-empty">Aún no ha registrado su peso.</p>';
    if(Ms.length){const skip=new Set(['id','date','createdAt','updatedAt','note','notes','feedback','aiFeedback','photos']),l=Ms[0],f=Ms[Ms.length-1];
      const ks=Object.keys(l).filter(k=>!skip.has(k)&&Number(l[k])>0);
      h+=`<div class="v90-card"><h3>📏 Medidas</h3><div class="sub">Últimas: ${esc(v90Day(l.date))}${Ms.length>1?` · comparadas con ${esc(v90Day(f.date))}`:''}</div>${ks.map(k=>{const d=Ms.length>1&&Number(f[k])?Math.round((l[k]-f[k])*10)/10:null;return `<div class="v90-row"><span>${esc(cap(k))}</span><b>${v90N(l[k])}${d!=null?` <span class="small">(${d>0?'+':''}${v90N(d)})</span>`:''}</b></div>`}).join('')}</div>`}
    return h;
  }

  // ---------- Eventos ----------
  if(V90_ON){
    document.addEventListener('click',e=>{
      const t=e.target;if(!t.closest)return;
      // La tarjeta de Inicio "Progreso de Ella" abre esta pantalla
      if(t.closest('#hmEntry')&&!t.closest('#v90')){try{if(hmCode()){e.preventDefault();e.stopPropagation();v90Open('res');return}}catch{}}
      if(!t.closest('#v90'))return;
      if(t.closest('[data-v90-close]')){v90Close();return}
      if(t.closest('[data-v90-refresh]')){v90Load(true);return}
      const tb=t.closest('[data-v90-tab]');if(tb){e.preventDefault();v90.tab=tb.dataset.v90Tab;v90.limit=15;v90Paint();$('#v90B').scrollTop=0;return}
      const rg=t.closest('[data-v90-rng]');if(rg){const n=rg.dataset.v90Rng,td=v90Today();if(n==='all'){v90.from='';v90.to=''}else{v90.to=td;v90.from=v90DayAdd(td,-(Math.max(1,Number(n))-1))}v90.limit=15;v90Paint();return}
      if(t.closest('[data-v90-more]')){v90.limit+=15;v90Paint();return}
      if(t.closest('[data-v90-chat]')){v85OpenChat('');return}
      if(t.closest('[data-v90-req]')){try{openRequests()}catch{}return}
      if(t.closest('[data-v90-hm]')){try{openHerModal()}catch{}return}
      const sy=t.closest('[data-v90-say]');if(sy){v85OpenChat('');setTimeout(()=>{const i=$('#v85ChInput');if(i){i.value=sy.dataset.v90Say;i.focus();try{i.setSelectionRange(i.value.length,i.value.length)}catch{}}},60);return}
    },true);
    document.addEventListener('change',e=>{const f=e.target.dataset&&e.target.dataset.v90F;if(!f||!e.target.closest('#v90'))return;v90[f]=e.target.value||'';v90.limit=15;v90Paint()});
  }

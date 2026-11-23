  /* ===================== v8.6.27 · Lugares de entreno (crear, editar, borrar) ===================== */
  // Solo app de Jaider. Va al final, justo antes de `initV7();` (después de v8626).
  // Antes había dos lugares fijos: '' (Principal) y 'U' (Universidad), con nombres en settings.placeNames.
  // Ahora: data.settings.places = [{id, name, icon, days:[1..7] (1=lunes … 7=domingo, como dayOf), off?}]
  // - Los ids '' y 'U' se conservan para que el historial (st.station / ex.station) siga igual.
  // - Lugares nuevos: id 'p' + uid. Las marcas y los pesos sugeridos van por lugar (como antes).
  // - Borrar: si no tiene registros se quita; si tiene, se puede pasar todo a otro lugar o solo esconderlo (off:true)
  //   para que el historial siga mostrando su nombre.
  // - days: el lugar que se elige solo ese día de la semana (antes: martes → U).
  // Ventana #v8627 (.modal, la cierra el botón volver con v88). Ajustes → «📍 Lugares de entreno» la abre también.
  const V8627_DIAS=[[1,'L'],[2,'M'],[3,'X'],[4,'J'],[5,'V'],[6,'S'],[7,'D']];
  const V8627_ICONOS=['🏠','🎓','🏋️','🏢','🌳','🏖️','🏨','💪','📍'];
  function v8627Split(s){const m=String(s||'').trim().match(/^(\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*)\s*(.*)$/u);return m?{icon:m[1],name:m[2].trim()}:{icon:'',name:String(s||'').trim()}}
  function v8627List(){
    const S=data.settings=data.settings||{};
    if(!Array.isArray(S.places)||!S.places.length){
      const n=S.placeNames||{},a=v8627Split(n['']||'🏠 Principal'),b=v8627Split(n.U||'🎓 Universidad');
      S.places=[{id:'',icon:a.icon||'🏠',name:a.name||'Principal',days:[]},{id:'U',icon:b.icon||'🎓',name:b.name||'Universidad',days:[2]}];
      try{persist(true)}catch{}
    }
    return S.places;
  }
  const v8627Vis=()=>v8627List().filter(p=>!p.off);
  const v8627Get=id=>v8627List().find(p=>p.id===(id||''));
  function v8627Name(id){const p=v8627Get(id);if(p)return p.name;return id?'Otro lugar':'Principal'}
  // Reemplaza las funciones de antes (los demás bloques las usan: Estancamientos, exportar, toast…)
  placeLabel=function(v){const p=v8627Get(v);if(p)return ((p.icon?p.icon+' ':'')+p.name).trim();return v?'📍 Otro lugar':'🏠 Principal'};
  function v8627Default(){
    const vis=v8627Vis(),d=dayOf(today());
    return (vis.find(p=>(p.days||[]).includes(d))||vis[0]||{id:''}).id;
  }
  function v8627Check(){if(!v8627Vis().some(p=>p.id===gymPlace)){gymPlace=v8627Default()}}
  function v8627Choose(id,silent){
    gymPlace=id;try{localStorage.setItem('miProgresoGimnasio.place.v1',JSON.stringify({date:today(),place:id}))}catch{}
    renderPlaceSeg();try{applyPlace()}catch{}
    if(!silent)_toast76('📍 Hoy entrenas en: '+v8627Name(id));
  }
  // Al abrir: lo elegido hoy si todavía existe; si no, el lugar de este día de la semana (o el primero).
  (()=>{let s=null;try{s=JSON.parse(localStorage.getItem('miProgresoGimnasio.place.v1')||'null')}catch{}
    gymPlace=(s&&s.date===today()&&v8627Vis().some(p=>p.id===s.place))?s.place:v8627Default()})();
  renderPlaceSeg=function(){
    const host=$('#placeSeg');if(!host)return;v8627Check();
    const vis=v8627Vis();host.classList.toggle('v8627-many',vis.length>3);
    host.innerHTML=vis.map(p=>`<button type="button" class="${gymPlace===p.id?'on':''}" data-place="${esc(p.id)}">${esc(placeLabel(p.id))}</button>`).join('')
      +`<button type="button" class="place-edit" data-place-edit aria-label="Lugares de entreno">✎</button>`;
  };
  // Un solo manejador (captura) para elegir y para ✎; los de antes no se ejecutan.
  // En document (captura) para correr ANTES que los manejadores viejos de #placeSeg (el ✎ de v7.6 abría prompt()).
  document.addEventListener('click',e=>{
    if(!e.target.closest?.('#placeSeg'))return;
    const ed=e.target.closest('[data-place-edit]'),b=e.target.closest('[data-place]');
    if(!ed&&!b)return;e.stopPropagation();e.preventDefault();
    if(ed){v8627Open();return}
    v8627Choose(b.dataset.place);
  },true);

  // ¿Cuántos entrenos tienen series en este lugar?
  function v8627Count(id){let n=0;for(const w of data.workouts||[]){if((w.exercises||[]).some(ex=>(ex.sets||[]).some(st=>(st.station||ex.station||'')===id)))n++}return n}
  function v8627Move(from,to){
    let n=0;
    const fix=ex=>{if(!ex)return;const es=ex.station||'';for(const st of ex.sets||[]){if((st.station||es)===from){st.station=to;n++}}if(es===from)ex.station=to};
    for(const w of data.workouts||[])for(const ex of w.exercises||[])fix(ex);
    try{for(const ex of draft||[])fix(ex)}catch{}
    try{for(const p of Object.values(data.settings.profiles||{}))if(p&&(p.station||'')===from&&p.station!==undefined)p.station=to}catch{}
    return n;
  }

  let v8627Ed=null; // null = lista; {id|null (nuevo), name, icon, days}
  function v8627Close(){$('#v8627')?.remove();v8627Ed=null}
  function v8627Open(){v8627Close();const el=document.createElement('div');el.id='v8627';el.className='modal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);v8627Render()}
  function v8627Days(days){return `<div class="v8627-days">${V8627_DIAS.map(([d,l])=>`<button type="button" class="${(days||[]).includes(d)?'on':''}" data-v8627-day="${d}">${l}</button>`).join('')}</div>`}
  function v8627Render(){
    const el=$('#v8627');if(!el)return;
    if(v8627Ed){
      const E=v8627Ed,nuevo=E.id===null;
      el.innerHTML=`<div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0">${nuevo?'➕ Nuevo lugar':'✎ Editar lugar'}</h2></div><button class="secondary" data-v8627-back>‹ Volver</button></div>
        <div class="field"><label for="v8627Name">Nombre</label><input id="v8627Name" maxlength="30" value="${esc(E.name)}" placeholder="Ej: Casa, Gimnasio de la U, Smart Fit…"></div>
        <div class="field" style="margin-top:10px"><label>Ícono</label><div class="v8627-icons">${V8627_ICONOS.map(i=>`<button type="button" class="${E.icon===i?'on':''}" data-v8627-icon="${i}">${i}</button>`).join('')}<button type="button" class="${E.icon===''?'on':''}" data-v8627-icon="">Sin</button></div></div>
        <div class="field" style="margin-top:10px"><label>Elegirlo solo estos días</label>${v8627Days(E.days)}<div class="small" style="margin-top:4px">Al abrir Entrenar ese día queda marcado este lugar (lo puedes cambiar igual).</div></div>
        <button class="primary" style="width:100%;margin-top:14px" data-v8627-save>Guardar</button>
        ${nuevo?'':`<button class="secondary v8627-del" style="width:100%;margin-top:8px" data-v8627-del="${esc(E.id)}">🗑 Borrar este lugar</button>`}</div>`;
      return;
    }
    const L=v8627List(),vis=L.filter(p=>!p.off),hid=L.filter(p=>p.off);
    const row=(p,i)=>{const n=v8627Count(p.id),d=(p.days||[]).length?V8627_DIAS.filter(([x])=>p.days.includes(x)).map(([,l])=>l).join(' '):'';
      return `<div class="v8627-row${p.id===gymPlace?' cur':''}"><button type="button" class="v8627-main" data-v8627-edit="${esc(p.id)}"><strong>${esc(placeLabel(p.id))}</strong><span class="small">${n} entreno${n===1?'':'s'}${d?' · días: '+d:''}${p.id===gymPlace?' · hoy':''}</span></button>
        <button type="button" class="secondary" data-v8627-up="${i}" ${i===0?'disabled':''} aria-label="Subir">↑</button><button type="button" class="secondary" data-v8627-dn="${i}" ${i===vis.length-1?'disabled':''} aria-label="Bajar">↓</button></div>`};
    el.innerHTML=`<div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0">📍 Lugares de entreno</h2><div class="small">Tus marcas y los pesos que te sugiere la app van por lugar.</div></div><button class="secondary" data-v8627-close>✕</button></div>
      <div class="v8627-list">${vis.map(row).join('')}</div>
      <button class="primary" style="width:100%;margin-top:12px" data-v8627-new>➕ Nuevo lugar</button>
      ${hid.length?`<div style="margin-top:16px"><strong>Escondidos</strong><div class="small">Ya no salen para elegir, pero su historial sigue.</div>${hid.map(p=>`<div class="v8627-row"><div class="v8627-main"><strong>${esc(placeLabel(p.id))}</strong><span class="small">${((n)=>n+' entreno'+(n===1?'':'s'))(v8627Count(p.id))}</span></div><button type="button" class="secondary" data-v8627-show="${esc(p.id)}">Volver a usar</button></div>`).join('')}</div>`:''}
    </div>`;
  }
  function v8627Save(){
    const E=v8627Ed,name=($('#v8627Name')?.value||'').trim().replace(/\s+/g,' ');
    if(!name){_toast76('Ponle un nombre al lugar.');$('#v8627Name')?.focus();return}
    const L=v8627List();
    if(L.some(p=>!p.off&&p.id!==E.id&&p.name.toLowerCase()===name.toLowerCase())){_toast76('Ya tienes un lugar con ese nombre.');return}
    const days=[...E.days].sort((a,b)=>a-b);
    // Un día solo puede tener un lugar: se lo quita a los demás.
    for(const p of L)if(p.id!==E.id&&p.days)p.days=p.days.filter(d=>!days.includes(d));
    if(E.id===null){const id='p'+uid();L.push({id,name,icon:E.icon,days});_toast76('📍 Lugar creado: '+name)}
    else{const p=v8627Get(E.id);Object.assign(p,{name,icon:E.icon,days});_toast76('Guardado.')}
    persist(true);v8627Ed=null;renderPlaceSeg();v8627Render();try{renderAchievements?.()}catch{}
  }
  function v8627Delete(id){
    const p=v8627Get(id);if(!p)return;const vis=v8627Vis();
    if(!p.off&&vis.length<=1){_toast76('Necesitas al menos un lugar.');return}
    const n=v8627Count(id),otros=vis.filter(x=>x.id!==id);
    const el=$('#v8627');if(!el)return;
    el.innerHTML=`<div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0">🗑 Borrar «${esc(p.name)}»</h2></div><button class="secondary" data-v8627-back>‹ Volver</button></div>
      ${n?`<p class="small" style="margin:0 0 10px">Tiene <b>${n} entreno${n===1?'':'s'}</b> registrado${n===1?'':'s'}. ¿Qué hago con ellos?</p>
        <div class="field"><label for="v8627To">Pasar sus registros a</label><select id="v8627To">${otros.map(x=>`<option value="${esc(x.id)}">${esc(placeLabel(x.id))}</option>`).join('')}</select></div>
        <div class="small" style="margin-top:4px">Sus marcas se juntan con las de ese lugar (sirve si eran el mismo gimnasio).</div>
        <button class="primary" style="width:100%;margin-top:10px" data-v8627-merge="${esc(id)}">Pasar registros y borrar</button>
        <button class="secondary" style="width:100%;margin-top:8px" data-v8627-hide="${esc(id)}">Solo esconderlo (el historial queda con su nombre)</button>`
      :`<p class="small" style="margin:0 0 10px">No tiene entrenos registrados.</p><button class="primary v8627-del" style="width:100%" data-v8627-rm="${esc(id)}">Sí, borrarlo</button>`}
    </div>`;
  }
  function v8627After(msg){persist(true);v8627Ed=null;v8627Check();renderPlaceSeg();try{applyPlace()}catch{}v8627Render();_toast76(msg);try{renderAchievements?.()}catch{}try{renderHistory?.()}catch{}}
  document.addEventListener('click',e=>{
    const t=e.target.closest?.('#v8627 button');if(!t)return;const D=t.dataset,L=v8627List();
    if('v8627Close' in D)return v8627Close();
    if('v8627Back' in D){v8627Ed=null;return v8627Render()}
    if('v8627New' in D){v8627Ed={id:null,name:'',icon:'📍',days:[]};v8627Render();setTimeout(()=>$('#v8627Name')?.focus(),50);return}
    if(D.v8627Edit!==undefined){const p=v8627Get(D.v8627Edit);v8627Ed={id:p.id,name:p.name,icon:p.icon||'',days:[...(p.days||[])]};return v8627Render()}
    if(D.v8627Icon!==undefined&&v8627Ed){v8627Ed.name=$('#v8627Name')?.value||v8627Ed.name;v8627Ed.icon=D.v8627Icon;return v8627Render()}
    if(D.v8627Day!==undefined&&v8627Ed){v8627Ed.name=$('#v8627Name')?.value||v8627Ed.name;const d=Number(D.v8627Day),a=v8627Ed.days;v8627Ed.days=a.includes(d)?a.filter(x=>x!==d):[...a,d];return v8627Render()}
    if('v8627Save' in D)return v8627Save();
    if(D.v8627Del!==undefined)return v8627Delete(D.v8627Del);
    if(D.v8627Up!==undefined||D.v8627Dn!==undefined){
      const vis=v8627Vis(),i=Number(D.v8627Up??D.v8627Dn),j=D.v8627Up!==undefined?i-1:i+1;if(j<0||j>=vis.length)return;
      const a=L.indexOf(vis[i]),b=L.indexOf(vis[j]);[L[a],L[b]]=[L[b],L[a]];persist(true);renderPlaceSeg();return v8627Render();
    }
    if(D.v8627Merge!==undefined){const from=D.v8627Merge,to=$('#v8627To')?.value??'';const n=v8627Move(from,to);
      const i=L.findIndex(p=>p.id===from);if(i>=0)L.splice(i,1);if(gymPlace===from)gymPlace=to;
      return v8627After(`Borrado. ${n} serie${n===1?'':'s'} pasaron a ${v8627Name(to)}.`)}
    if(D.v8627Hide!==undefined){const p=v8627Get(D.v8627Hide);p.off=true;p.days=[];return v8627After('Escondido: '+p.name)}
    if(D.v8627Rm!==undefined){const i=L.findIndex(p=>p.id===D.v8627Rm),nm=L[i]?.name;if(i>=0)L.splice(i,1);return v8627After('Borrado: '+nm)}
    if(D.v8627Show!==undefined){const p=v8627Get(D.v8627Show);delete p.off;persist(true);renderPlaceSeg();v8627Render();return _toast76('De vuelta: '+p.name)}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='v8627Name'){e.preventDefault();v8627Save()}});

  // Ajustes → Entreno: «📍 Lugares de entreno»
  {
    const _rs8627=renderSettings;
    renderSettings=function(){const r=_rs8627.apply(this,arguments);try{const host=$('#settingsContent');if(host&&!$('#v8627Set')){
      host.insertAdjacentHTML('beforeend',`<details class="settings-group" id="v8627Set" data-stg-tab="entreno"><summary>📍 Lugares de entreno</summary><div class="settings-section">
        <p class="small" style="margin:0 0 10px">Casa, la U, otro gimnasio… Crea, cambia el nombre, el ícono, el orden y los días de cada uno, o bórralos.</p>
        <button class="secondary" style="width:100%" data-v8627-open>📍 Administrar lugares</button></div></details>`);
      try{v8611Organize()}catch{}}}catch(e){console.error(e)}return r};
    document.addEventListener('click',e=>{if(e.target.closest?.('[data-v8627-open]'))v8627Open()});
  }
  document.head.insertAdjacentHTML('beforeend',`<style id="v8627css">
    #placeSeg.v8627-many{overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
    #placeSeg.v8627-many::-webkit-scrollbar{display:none}
    #placeSeg.v8627-many button:not(.place-edit){flex:0 0 auto;white-space:nowrap;padding:10px 12px}
    #v8627{z-index:9400}
    #v8627 .v8627-list{display:flex;flex-direction:column;gap:8px;margin-top:6px}
    #v8627 .v8627-row{display:flex;gap:6px;align-items:stretch;margin-top:6px}
    #v8627 .v8627-row.cur .v8627-main{border-color:var(--green)}
    #v8627 .v8627-main{flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:inherit;min-width:0}
    #v8627 .v8627-row>button.secondary{flex:0 0 42px;padding:0}
    #v8627 .v8627-row>button[data-v8627-show]{flex:0 0 auto;padding:0 10px}
    #v8627 .v8627-days,#v8627 .v8627-icons{display:flex;flex-wrap:wrap;gap:6px}
    #v8627 .v8627-days button{width:40px;height:40px;border-radius:50%;padding:0;border:1px solid var(--line);background:var(--panel2);font-weight:700;color:inherit}
    #v8627 .v8627-icons button{min-width:44px;height:44px;border-radius:12px;padding:0 8px;border:1px solid var(--line);background:var(--panel2);font-size:20px;color:inherit}
    #v8627 .v8627-icons button:last-child{font-size:13px}
    #v8627 .v8627-days button.on,#v8627 .v8627-icons button.on{background:var(--green);color:#15171a;border-color:transparent}
    #v8627 .v8627-del{color:#ff8a8a}
  </style>`);
  renderPlaceSeg();

  /* ===================== v8.6.11: descansos propios, sin «Progreso de Ella», Ajustes por pestañas y simulador ===================== */
  // Va al final, justo antes de initV7(), después del bloque v8.6 (hipertrofia). Las tres partes de abajo:
  // (1) Descansos: data.settings.restCustom[nombre]=segundos. Manda sobre el mínimo de restRule (lo que elijas se respeta).
  // (2) «Progreso de Ella» escondido en la app de Jaider (Inicio e Historial); se vuelve a mostrar en Ajustes → Personas.
  // (3) Ajustes en pestañas (Entreno, Apariencia, Avisos, Datos, Personas, Info). Cada bloque se clasifica por su título.
  // (4) Simulador: entreno de prueba; nada se guarda (localStorage en memoria, sin guardado nativo, sin nube) y al salir recarga.
  const V8611_PUB=(typeof MP_PUBLICA!=='undefined'&&!!MP_PUBLICA);

  /* ---------- (1) Descansos que tú eliges ---------- */
  const v8611RestBase=restRule;
  restRule=function(name,requested=0){const o=Number(data?.settings?.restCustom?.[name]);if(o>=15)return o;return v8611RestBase(name,requested)};
  function hypRestSel(name,planRest){
    const base=v8611RestBase(name,planRest),o=Number(data.settings?.restCustom?.[name])||0,cur=o>=15?o:base;
    const opts=[];for(let s=60;s<=420;s+=15)opts.push(s);if(!opts.includes(cur))opts.push(cur);if(!opts.includes(base))opts.push(base);opts.sort((a,b)=>a-b);
    return `<select class="hyp-rest-sel" data-hyp-rest="${esc(name)}" data-hyp-rest-base="${base}">${opts.map(s=>`<option value="${s}" ${s===cur?'selected':''}>${timeLabel(s)}${s===base?' (de la app)':''}</option>`).join('')}</select>${o>=15&&o!==base?' <span class="hyp-rest-own">tuyo</span>':''}`;
  }
  document.addEventListener('change',e=>{
    const sel=e.target.closest?.('[data-hyp-rest]');if(!sel)return;
    const name=sel.dataset.hypRest,v=Number(sel.value),base=Number(sel.dataset.hypRestBase);
    data.settings.restCustom=data.settings.restCustom||{};
    if(v===base)delete data.settings.restCustom[name];else data.settings.restCustom[name]=v;
    try{for(const ex of draft||[])if(ex.name===name)ex.plannedRest=v}catch{}
    persist(true);try{rebuildRoutines()}catch{}
    toast(`⏱ ${name}: descanso de ${timeLabel(v)}`);
    try{hypRenderModal()}catch{}
  });

  /* ---------- (2) «Progreso de Ella» fuera de la app de Jaider ---------- */
  const V8611_HER=!MP_APK_IS_ELLA&&!V8611_PUB;
  function v8611HerHidden(){return V8611_HER&&data.settings?.showHer!==true}
  function v8611ApplyHer(){
    if(!V8611_HER)return;const h=v8611HerHidden();document.body.classList.toggle('mp-noher',h);
    if(h){try{if(pvTab!=='me')setPvTab('me')}catch{}try{$('#hmModal')?.remove()}catch{}}
  }
  function v8611HerHtml(){
    if(!V8611_HER)return '';
    return `<details class="settings-group" id="v8611HerSet"><summary>👩 Progreso de Ella</summary><div class="settings-section"><p class="small" style="margin:0 0 10px">Escondido en Inicio e Historial. Nada se borra: si algún día lo vuelve a usar, actívalo aquí.</p><label class="toggle-row"><input type="checkbox" data-v8611-her ${v8611HerHidden()?'':'checked'}> Mostrar «Progreso de Ella»</label></div></details>`;
  }
  document.addEventListener('change',e=>{const c=e.target.closest?.('[data-v8611-her]');if(!c)return;data.settings.showHer=!!c.checked;persist(true);v8611ApplyHer();if(c.checked){try{hmEnsureEntry()}catch{}}toast(c.checked?'«Progreso de Ella» visible otra vez':'«Progreso de Ella» escondido')});
  if(V8611_HER){
    const _ensPv=typeof ensurePvTabs==='function'?ensurePvTabs:null;
    if(_ensPv)ensurePvTabs=function(){const r=_ensPv.apply(this,arguments);try{v8611ApplyHer()}catch{}return r};
  }

  /* ---------- (3) Ajustes por pestañas ---------- */
  const V8611_TABS=[
    ['entreno','🏋️','Entreno',/plan de hipertrofia|mi plan|cuestionario|simulador|ajustes fijos|perfiles|inventario|discos|revisión de datos|ejercicio/i],
    ['apariencia','🎨','Apariencia',/colores|sonido|pantalla|widget|música|ventana flotante/i],
    ['avisos','🔔','Avisos',/recordatorio|aviso|notific|creatina/i],
    ['datos','☁️','Datos',/copias|respaldo|nube|claves de ia|\bia\b|exportar|importar/i],
    ['personas','👥','Personas',/personas|chat|códigos|compartir|ella|pro\b/i],
    ['info','ℹ️','Info',/novedades|actualizaci|versión|mi progreso v/i],
  ];
  const V8611_TAB_KEY='mp_ajustes_tab';
  function v8611TabOf(node){
    if(node.classList?.contains('version-chip'))return 'info';
    if(node.id==='hypThemeSet')return 'apariencia';if(node.id==='hypSetPlan'||node.id==='v8611SimSet')return 'entreno';if(node.id==='v8611HerSet')return 'personas';
    const s=(node.querySelector?.(':scope > summary')?.textContent||node.textContent||'').trim().slice(0,90);
    for(const [k,,,rx] of V8611_TABS)if(rx.test(s))return k;
    return 'otros';
  }
  let v8611Tab=(()=>{try{return localStorage.getItem(V8611_TAB_KEY)||'entreno'}catch{return 'entreno'}})();
  function v8611Organize(){
    const host=$('#settingsContent');if(!host)return;
    for(const n of host.children){if(!n.dataset.stgTab)n.dataset.stgTab=v8611TabOf(n)}
    const used=new Set([...host.children].map(n=>n.dataset.stgTab));
    const tabs=V8611_TABS.filter(([k])=>used.has(k)).map(([k,i,n])=>[k,i,n]);if(used.has('otros'))tabs.push(['otros','⋯','Otros']);
    if(!tabs.some(([k])=>k===v8611Tab))v8611Tab=tabs[0]?.[0]||'entreno';
    let nav=$('#stgTabs');if(!nav){host.insertAdjacentHTML('beforebegin','<div class="stg-tabs" id="stgTabs" role="tablist"></div>');nav=$('#stgTabs')}
    nav.innerHTML=tabs.map(([k,i,n])=>`<button type="button" role="tab" data-stg-tab="${k}" class="${k===v8611Tab?'on':''}"><span>${i}</span>${n}</button>`).join('');
    for(const n of host.children)n.classList.toggle('stg-off',n.dataset.stgTab!==v8611Tab);
    const vis=[...host.children].filter(n=>!n.classList.contains('stg-off')&&n.tagName==='DETAILS');
    if(vis.length===1&&!vis[0].open)vis[0].open=true; // una sola sección: abierta de una
  }
  function v8611SetTab(k){v8611Tab=k;try{localStorage.setItem(V8611_TAB_KEY,k)}catch{}v8611Organize();try{$('#settingsModal .modal-panel')?.scrollTo?.({top:0})}catch{}}
  document.addEventListener('click',e=>{const b=e.target.closest?.('#stgTabs button[data-stg-tab]');if(b){e.preventDefault();v8611SetTab(b.dataset.stgTab)}});
  const _rs8611=renderSettings;
  renderSettings=function(){
    const r=_rs8611.apply(this,arguments);
    try{const host=$('#settingsContent');
      if(host){
        if(!$('#v8611SimSet'))host.insertAdjacentHTML('beforeend',v8611SimSetHtml());
        if(V8611_HER&&!$('#v8611HerSet'))host.insertAdjacentHTML('beforeend',v8611HerHtml());
        for(const n of host.children)delete n.dataset.stgTab;
        v8611Organize();
      }}catch(e){console.error(e)}
    return r;
  };
  try{
    const host=$('#settingsContent');
    if(host){
      new MutationObserver(ms=>{if(ms.some(m=>m.type==='childList'&&m.target===host&&[...m.addedNodes].some(n=>n.nodeType===1&&!n.dataset?.stgTab))){clearTimeout(v8611Organize._t);v8611Organize._t=setTimeout(v8611Organize,0)}
        // si algo abre una sección que está en otra pestaña (por ejemplo «Recordatorios» desde Inicio), cambia a esa pestaña
        for(const m of ms)if(m.type==='attributes'&&m.attributeName==='open'&&m.target.open){const top=[...host.children].find(n=>n===m.target||n.contains(m.target));if(top&&top.classList.contains('stg-off'))v8611SetTab(top.dataset.stgTab)}
      }).observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
    }
  }catch(e){console.error(e)}

  /* ---------- (4) Simulador de entrenamiento ---------- */
  let V8611_SIM=false,v8611SimFast=false;
  const v8611Mem=new Map(),V8611_DEL=Symbol('borrado');
  function v8611SimSetHtml(){
    return `<details class="settings-group" id="v8611SimSet"><summary>🧪 Simulador de entrenamiento</summary><div class="settings-section"><p class="small" style="margin:0 0 10px">Haz un entreno de prueba con todo lo de verdad (series, RIR, descansos, avisos, resumen y logros) sin que se guarde nada. Sirve para probar el plan o las funciones nuevas. Al salir, la app vuelve a como estaba.</p><button class="primary" data-v8611-sim>🧪 Abrir simulador</button></div></details>`;
  }
  function v8611SimInstall(){
    const SP=Storage.prototype,_get=SP.getItem,_set=SP.setItem,_rem=SP.removeItem;
    SP.getItem=function(k){if(V8611_SIM&&this===window.localStorage&&v8611Mem.has(String(k))){const v=v8611Mem.get(String(k));return v===V8611_DEL?null:v}return _get.call(this,k)};
    SP.setItem=function(k,v){if(V8611_SIM&&this===window.localStorage){v8611Mem.set(String(k),String(v));return}return _set.call(this,k,v)};
    SP.removeItem=function(k){if(V8611_SIM&&this===window.localStorage){v8611Mem.set(String(k),V8611_DEL);return}return _rem.call(this,k)};
    nativeSave=function(){};                       // no tocar el archivo del teléfono
    saveBackupVersion=function(){return true};    // ni las copias de seguridad
    try{if(typeof gas==='function'){gas=async function(){throw new Error('Simulador: sin nube')}}}catch{}
    try{if(typeof hmScheduleMine==='function')hmScheduleMine=function(){}}catch{}
    const _nx=nxHttp;nxHttp=function(m,url){if(/script\.google\.com/.test(String(url||'')))return Promise.resolve({status:-1,text:''});return _nx.apply(this,arguments)};
    const _f=window.fetch;if(_f)window.fetch=function(u){try{const s=typeof u==='string'?u:u?.url;if(/script\.google\.com/.test(String(s||'')))return Promise.reject(new Error('Simulador: sin nube'))}catch{}return _f.apply(this,arguments)};
    const _br=beginRest;beginRest=function(seconds){return _br.call(this,v8611SimFast?Math.min(Number(seconds)||10,10):seconds)};
  }
  function v8611SimBar(){
    $('#v8611SimBar')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div id="v8611SimBar" role="status"><b>🧪 Simulador</b><span class="small">no se guarda</span><button type="button" class="${v8611SimFast?'on':''}" data-v8611-fast>⚡ 10 s</button><button type="button" data-v8611-exit>Salir</button></div>`);
  }
  function v8611SimEnter(){
    if(V8611_SIM){v8611SimBar();return}
    let active=null;try{active=readActive()}catch{}
    if(active){alert('Tienes un entreno sin terminar. Termínalo o descártalo antes de abrir el simulador, para no mezclarlo con la prueba.');return}
    if(!confirm('🧪 Simulador de entrenamiento\n\nVas a entrenar de prueba: todo funciona igual, pero nada se guarda (ni en el teléfono ni en la nube). Al salir la app se recarga y queda como estaba.\n\n¿Abrir?'))return;
    try{flushNativeSave()}catch{}
    V8611_SIM=true;v8611SimInstall();
    document.body.classList.add('sim-on');v8611SimBar();
    try{$('#settingsModal')?.classList.add('hidden')}catch{}
    try{go('train')}catch{}
    toast('🧪 Simulador listo: elige la rutina y empieza.');
  }
  function v8611SimExit(){
    if(!confirm('¿Salir del simulador? Se descarta todo lo que hiciste en la prueba.'))return;
    try{window.NativeStore?.workoutStatus?.(false,false,0,'')}catch{}try{cancelNativeRest()}catch{}
    location.reload();
  }
  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-v8611-sim]')){e.preventDefault();v8611SimEnter();return}
    if(e.target.closest?.('[data-v8611-exit]')){e.preventDefault();v8611SimExit();return}
    if(e.target.closest?.('[data-v8611-fast]')){e.preventDefault();v8611SimFast=!v8611SimFast;v8611SimBar();toast(v8611SimFast?'⚡ Descansos de 10 s (solo en el simulador)':'Descansos normales');return}
  });
  const _rte8611=renderTrainExtras;
  renderTrainExtras=function(){const r=_rte8611.apply(this,arguments);try{const h=$('#trainExtras');if(h&&flowPhase==='setup'&&!V8611_SIM&&!$('#v8611SimCard'))h.insertAdjacentHTML('beforeend',`<div class="card v8611-simcard" id="v8611SimCard"><div class="row between" style="gap:10px"><div><strong>🧪 Simulador</strong><div class="small">Entreno de prueba: no se guarda nada.</div></div><button class="secondary" data-v8611-sim>Probar</button></div></div>`)}catch(e){console.error(e)}return r};

  document.head.insertAdjacentHTML('beforeend',`<style id="v8611Css">
    body.mp-noher #hmEntry,body.mp-noher .pv-tabs{display:none!important}
    .stg-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 12px;padding:6px 0;position:sticky;top:-1px;z-index:3;background:var(--panel)}
    .stg-tabs button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 6px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--muted);font-size:12px;font-weight:800}
    .stg-tabs button span{font-size:18px;line-height:1}
    .stg-tabs button.on{background:color-mix(in srgb,var(--green) 16%,var(--panel2));border-color:color-mix(in srgb,var(--green) 55%,var(--line));color:var(--text)}
    #settingsContent > .stg-off{display:none!important}
    .hyp-rest{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}
    .hyp-rest-sel{width:auto;padding:4px 8px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font-size:13px}
    .hyp-rest-own{font-size:11px;font-weight:800;color:var(--green2);background:color-mix(in srgb,var(--green) 14%,transparent);padding:1px 7px;border-radius:99px}
    .hyp-cert{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;vertical-align:middle}
    .hyp-cert.alta{background:#3fbf6f}.hyp-cert.media{background:#e3b341}.hyp-cert.baja{background:#e5735f}
    #v8611SimBar{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 6px);z-index:9998;display:flex;align-items:center;gap:7px;padding:6px 6px 6px 12px;border-radius:99px;background:#7a4bd6;color:#fff;box-shadow:0 8px 24px #0006;max-width:calc(100% - 16px);font-size:13px;white-space:nowrap}
    #v8611SimBar .small{color:#e8dcff;white-space:nowrap}
    #v8611SimBar button{border:0;border-radius:99px;padding:6px 10px;background:#ffffff26;color:#fff;font-weight:800;font-size:12px;white-space:nowrap}
    #v8611SimBar button.on{background:#fff;color:#4b2a95}
    body.sim-on{box-shadow:inset 0 0 0 3px #7a4bd6}
    .v8611-simcard{border-style:dashed}
  </style>`);
  try{v8611ApplyHer()}catch(e){console.error(e)}

  /* ===================== v8.5.24: comidas de ayer obligatorias + creatina insistente (solo app de Jaider) ===================== */
  // 1) Si ayer faltó desayuno, almuerzo o cena, la app se bloquea hasta registrarlas (o marcar "No la hice").
  //    Solo revisa días desde que se instaló esta versión (data.settings.v94.since). No bloquea con un entreno en curso.
  // 2) Si a las 7 pm la creatina no está marcada, avisos cada 30 min (19:00–23:30) hasta marcarla o decir por qué no.
  //    Se guarda en data.creatineSkip = {fecha: motivo}. La libre y la de Ella no lo usan.
  const V94_ON=!MP_APK_IS_ELLA&&!(typeof MP_PUBLICA!=='undefined'&&MP_PUBLICA);
  const V94_MEALS=['desayuno','almuerzo','cena'];
  const V94_SLOTS=['19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'];
  function v94Cfg(){data.settings=data.settings||{};const c=data.settings.v94=data.settings.v94||{};if(!c.since)c.since=today();return c}
  function v94Skips(){if(!data.mealSkips||typeof data.mealSkips!=='object')data.mealSkips={};return data.mealSkips}
  function v94CrSkips(){if(!data.creatineSkip||typeof data.creatineSkip!=='object')data.creatineSkip={};return data.creatineSkip}
  function v94Missing(d){
    const ms=mealsOn(d),sk=v94Skips()[d]||[];
    return V94_MEALS.filter(k=>!ms.some(m=>m.type===k)&&!sk.includes(k));
  }
  function v94LockDay(){
    if(!V94_ON)return null;
    const y=addDays(today(),-1);
    if(y<v94Cfg().since)return null;
    return v94Missing(y).length?y:null;
  }
  function v94Training(){try{return flowPhase!=='setup'||!!readActive()}catch{return false}}
  function v94CrDone(d){return creatineDays().includes(d)||!!v94CrSkips()[d]}

  if(V94_ON){
    document.head.insertAdjacentHTML('beforeend',`<style id="v94css">
      #v94Lock{position:fixed;inset:0;z-index:9000;background:#05080fef;display:flex;align-items:center;justify-content:center;padding:18px}
      #v94Lock .v94p{background:var(--card,#141a26);border:1px solid #ffffff1f;border-radius:18px;padding:20px;max-width:420px;width:100%;box-shadow:0 20px 60px #000a}
      #v94Lock h2{margin:0 0 6px;font-size:20px}
      .v94row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 0;border-top:1px solid #ffffff14}
      .v94row b{font-size:15px}.v94row .v94b{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
      .v94row button{padding:8px 12px;font-size:13px}
      #v94Bar{position:fixed;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:8000;background:#3a2410;border:1px solid #f0a04b88;color:#ffd9a8;border-radius:12px;padding:9px 12px;font-size:13px;display:flex;gap:8px;align-items:center;justify-content:space-between;box-shadow:0 8px 24px #0008}
      #v94Bar button{padding:6px 10px;font-size:12px}
      #v94Cr{z-index:9500}
      #v94Cr textarea{width:100%;min-height:64px;margin-top:6px}
      #v94Cr .v94reasons{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
      #v94Cr .v94reasons button{padding:6px 10px;font-size:12px}
    </style>`);
  }

  // ---------- 1) Bloqueo por comidas de ayer ----------
  function v94Label(d){try{const [y,m,dd]=d.split('-').map(Number);return new Date(y,m-1,dd).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})}catch{return d}}
  function v94HideLock(){$('#v94Lock')?.remove()}
  function v94ShowLock(){
    const d=v94LockDay();if(!d){v94HideLock();v94Bar();return}
    const miss=v94Missing(d);
    const html=`<div class="v94p"><h2>🔒 Primero, las comidas de ayer</h2>
      <div class="small">Te faltó registrar lo del ${esc(v94Label(d))}. Anótalo para seguir usando la app.</div>
      <div style="margin-top:10px">${miss.map(k=>`<div class="v94row"><b>${esc(MEAL_TYPES[k]||k)}</b><div class="v94b">
        <button class="primary" data-v94reg="${k}">Registrar</button>
        <button class="secondary" data-v94skip="${k}">No la hice</button></div></div>`).join('')}</div>
      <div class="small" style="margin-top:10px;opacity:.75">"No la hice" es solo si de verdad no comiste esa comida.</div></div>`;
    let el=$('#v94Lock');
    if(!el){el=document.createElement('div');el.id='v94Lock';document.body.appendChild(el)}
    el.innerHTML=html;
    v94Bar();
  }
  function v94Bar(){
    const d=v94LockDay(),onFood=!!$('#food')?.classList.contains('active');
    let b=$('#v94Bar');
    if(!d||!onFood||$('#v94Lock')){b?.remove();return}
    const miss=v94Missing(d).map(k=>MEAL_TYPES[k]||k).join(', ');
    if(!b){b=document.createElement('div');b.id='v94Bar';document.body.appendChild(b)}
    b.innerHTML=`<span>🔒 Falta de ayer: <b>${esc(miss)}</b></span><button class="secondary" data-v94list>Ver</button>`;
  }
  function v94OpenFood(d,k){
    try{foodDate=d;foodPreType=k||null}catch{}
    try{if(typeof fSel!=='undefined')fSel=null}catch{}
    v94HideLock();
    _go94('food');
    try{foodDate=d;renderFood()}catch(e){console.error(e)}
    setTimeout(()=>{v94Bar();$('.pend-card')?.scrollIntoView({behavior:'smooth',block:'start'})},250);
  }
  function v94Check(){
    if(!V94_ON)return;
    const d=v94LockDay();
    if(!d){if($('#v94Lock')||$('#v94Bar')){v94HideLock();$('#v94Bar')?.remove();if(window.__v94WasLocked){window.__v94WasLocked=false;toast('🔓 Listo, comidas de ayer completas.')}}return}
    window.__v94WasLocked=true;
    if(v94Training())return;
    if(!$('#food')?.classList.contains('active'))v94ShowLock();else v94Bar();
  }
  const _go94=go;
  if(V94_ON){
    go=function(screen){
      if(screen!=='food'&&v94LockDay()&&!v94Training()){_go94('food');v94ShowLock();return}
      _go94(screen);setTimeout(v94Bar,50);
    };
    document.addEventListener('click',e=>{
      const r=e.target.closest('[data-v94reg]');if(r){v94OpenFood(v94LockDay()||addDays(today(),-1),r.dataset.v94reg);return}
      const s=e.target.closest('[data-v94skip]');
      if(s){
        const d=v94LockDay();if(!d)return;const k=s.dataset.v94skip;
        if(!confirm(`¿Seguro que ayer no comiste ${String(MEAL_TYPES[k]||k).toLowerCase()}?`))return;
        const sk=v94Skips();sk[d]=[...new Set([...(sk[d]||[]),k])];persist(true);v94Check();if($('#v94Lock'))v94ShowLock();return;
      }
      if(e.target.closest('[data-v94list]')){$('#v94Bar')?.remove();v94ShowLock();return}
    },true);
  }

  // ---------- 2) Creatina insistente en la noche ----------
  function v94CloseCr(){$('#v94Cr')?.remove()}
  function v94OpenCr(){
    if(!V94_ON)return;
    const t=today();
    if(v94CrDone(t)){v94CloseCr();toast(creatineDays().includes(t)?'💊 La creatina de hoy ya está marcada.':'Ya anotaste por qué no la tomas hoy.');return}
    v94CloseCr();
    const el=document.createElement('div');el.id='v94Cr';el.className='modal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
    el.innerHTML=`<div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0">💊 ¿Y la creatina?</h2><div class="small">Hoy todavía no la has marcado.</div></div><button class="secondary" data-v94crlater>✕</button></div>
      <button class="primary" style="width:100%;margin-top:10px" data-v94crok>✅ Ya me la tomé</button>
      <div style="margin-top:14px"><strong>¿No te la vas a tomar hoy?</strong><div class="small">Dime por qué y dejo de recordarte.</div>
        <div class="v94reasons">${['Se me acabó','No la tengo a la mano','Hoy descanso de creatina','Me cayó mal'].map(x=>`<button class="secondary" data-v94crr="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <textarea id="v94CrTxt" placeholder="Otro motivo…"></textarea>
        <button class="secondary" style="width:100%;margin-top:6px" data-v94crno>Guardar motivo</button></div>
      <button class="secondary" style="width:100%;margin-top:12px;opacity:.8" data-v94crlater>Recordar luego</button></div>`;
    document.body.appendChild(el);
  }
  function v94CrSet(reason){
    const t=today();
    if(reason===true){const c=creatineDays();if(!c.includes(t))c.push(t);delete v94CrSkips()[t];persist(true);toast('💊 Creatina anotada.')}
    else{v94CrSkips()[t]=String(reason).slice(0,200);persist(true);toast('Anotado. Hoy no te recuerdo más la creatina.')}
    v94CloseCr();try{renderFood()}catch{}try{renderToday()}catch{}try{syncWidgetState()}catch{}
  }
  if(V94_ON){
    document.addEventListener('click',e=>{
      if(!e.target.closest('#v94Cr'))return;
      if(e.target.closest('[data-v94crok]')){v94CrSet(true);return}
      const r=e.target.closest('[data-v94crr]');if(r){v94CrSet(r.dataset.v94crr);return}
      if(e.target.closest('[data-v94crno]')){const v=($('#v94CrTxt')?.value||'').trim();if(!v){toast('Escribe el motivo o elige uno.');return}v94CrSet(v);return}
      if(e.target.closest('[data-v94crlater]')||e.target.id==='v94Cr'){v94CloseCr();return}
    });
    // Recordatorios con la app cerrada: 10 avisos de 7:00 a 11:30 pm. Si ya está resuelta hoy, quedan para mañana.
    const _br94=buildReminders;
    buildReminders=function(){
      const out=_br94(),now=Date.now(),t=today(),tm=addDays(t,1),done=v94CrDone(t);
      V94_SLOTS.forEach((hm,i)=>{
        let at=tsAt(t,hm);if(done||at<=now)at=tsAt(tm,hm);
        out.push({id:'v94_crea_'+hm.replace(':',''),at,repeat:DAY_MS,maxLate:25*60000,
          title:i===0?'💊 ¿Ya te tomaste la creatina?':'💊 Hey, tómate la creatina',
          text:'Márcala como tomada o dime por qué no te la vas a tomar hoy, y dejo de insistir.',
          action:'go:creatina',button:'Responder'});
      });
      return out;
    };
    const _rna94=runNativeAction;
    runNativeAction=function(a){
      if(a==='go:creatina'){go('home');setTimeout(v94OpenCr,300);return}
      if(a==='creatine'){const r=_rna94(a);try{delete v94CrSkips()[today()];persist(true)}catch{}v94CloseCr();return r}
      return _rna94(a);
    };
    // Al abrir de noche sin resolverla, también pregunta dentro de la app (una vez por apertura).
    function v94OnOpen(){
      v94Check();
      try{const cr=$('#v94Cr');if(cr&&cr.classList.contains('hidden'))cr.remove();if(!v94CrDone(today())&&new Date().getHours()>=19&&!$('#v94Cr')&&!v94Training())setTimeout(v94OpenCr,900)}catch{}
    }
    const _persist94=persist;
    persist=function(noRender=false){_persist94(noRender);try{v94Check()}catch(e){console.error(e)}};
    const _onRes94=window.onNativeResume;
    window.onNativeResume=function(){try{_onRes94&&_onRes94()}catch(e){console.error(e)}v94OnOpen()};
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')v94Check()});
    setInterval(()=>{if(document.visibilityState==='visible')v94Check()},60000);
    setTimeout(()=>{v94Cfg();v94OnOpen();pushReminders()},1500);
  }

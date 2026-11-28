  /* ===================== v8.6.30 · Editar la rutina cargada: agregar, crear, quitar y cambiar ejercicios ===================== */
  // Solo app de Jaider. Va al final, justo antes de `initV7();` (después de v8627).
  // - Lista «☰ Ejercicios» (#orderModal, la de Orden): en cada ejercicio botones «⇄ Cambiar» y «🗑 Quitar», y abajo
  //   «＋ Agregar ejercicio». Sirve antes de empezar (setup) y en pleno entreno (serie, descanso o terminado).
  // - Tarjetas de la rutina antes de empezar (#draftExercises): botón «⇄ Cambiar» junto a Quitar.
  // - Catálogo (#catalogModal): si lo que buscas no existe, «＋ Crear "…"» (createCustomExercise → data.customExercises)
  //   y se agrega o se usa para cambiar. En modo cambiar (catalogAddMode==='replace') muestra primero las sugerencias
  //   (SUBSTITUTIONS o mismo grupo).
  // - Quitar en pleno entreno: sin series hechas se quita entero; con algunas hechas se quedan las hechas y se quitan las
  //   pendientes; si ya estaba terminado pregunta si borrarlo con sus series. Cambiar: sin series hechas lo reemplaza en
  //   el mismo lugar (mismo id); con series hechas esas se quedan y el nuevo entra justo después con las series que faltaban.
  //   La serie en curso / el «Sigue» del descanso solo cambian si apuntaban al ejercicio tocado.
  let v8630RepId=null;
  const v8630Top=id=>{const m=$('#'+id);if(m&&m!==document.body.lastElementChild)document.body.append(m);return m};
  function v8630Refresh(){
    try{if(flowPhase==='setup')renderDraft();else renderFocus()}catch(e){console.error(e)}
    try{if(!$('#orderModal').classList.contains('hidden'))renderOrderModal()}catch(e){console.error(e)}
    if(flowPhase!=='setup')saveActive();
  }
  // Después de tocar la lista: si lo activo desapareció o ya no tiene series pendientes, pasa al primer pendiente.
  function v8630FixActive(){
    if(flowPhase==='setup')return;
    if(!draft.length){if(timerInterval)clearInterval(timerInterval);timerInterval=null;timerEnd=0;pendingNext=null;flowPhase='done';return}
    const pend=ex=>ex&&!ex.skipped&&(Number(ex.completedSets)||0)<(ex.sets||[]).length;
    if(flowPhase==='rest'){
      const nx=draft.find(x=>x.id===pendingNext?.exerciseId);
      if(!pend(nx))pendingNext=nextPendingRef();
      else if(!nx.sets.some(st=>st.id===pendingNext.setId))pendingNext.setId=firstPendingSetId(nx);
      return;
    }
    const cur=draft.find(x=>x.id===activeExerciseId);
    if(flowPhase==='set'&&pend(cur)){if(!cur.sets.some(st=>st.id===activeSetId))setActiveById(cur.id,firstPendingSetId(cur));return}
    const ref=nextPendingRef();
    if(ref){setActiveById(ref.exerciseId,ref.setId);flowPhase='set';const st=draft[activeExercise]?.sets?.[activeSet];if(st&&!st.presentedAt)st.presentedAt=Date.now()}
    else flowPhase='done';
  }
  const v8630Eff=(ex,n)=>(ex.sets||[]).slice(0,n).filter(isEffectiveSet).length;

  function v8630Remove(id){
    const idx=draft.findIndex(x=>x.id===id),ex=draft[idx];if(!ex)return;
    if(flowPhase==='setup'){removeExerciseFromSetup(id);try{if(!$('#orderModal').classList.contains('hidden'))renderOrderModal()}catch{}return}
    const done=Math.min(Number(ex.completedSets)||0,ex.sets.length),total=ex.sets.length,eff=v8630Eff(ex,done);
    const msg=!done?`¿Quitar ${ex.name} de este entrenamiento?`:done<total?`¿Quitar ${ex.name}? ${eff?`Las ${eff} serie${eff===1?'':'s'} que ya hiciste se guardan; `:''}solo se quitan las pendientes.`:`${ex.name} ya está terminado. ¿Borrarlo con sus ${eff||done} serie${(eff||done)===1?'':'s'} registrada${(eff||done)===1?'':'s'}?`;
    if(!confirm(msg))return;
    if(done&&done<total){ex.sets=ex.sets.slice(0,done);ex.plannedSets=eff}
    else draft.splice(idx,1);
    v8630FixActive();v8630Refresh();toast(`${ex.name} quitado.`);
  }

  function v8630Replace(id,name){
    const idx=draft.findIndex(x=>x.id===id),ex=draft[idx];if(!ex||!name||!CATALOG_BY_NAME.has(name))return;
    if(name===ex.name){toast('Es el mismo ejercicio.');return}
    const p=catalogProfile(name),done=flowPhase==='setup'?0:Math.min(Number(ex.completedSets)||0,ex.sets.length);
    const left=Math.max(1,ex.sets.slice(done).filter(isEffectiveSet).length);
    const fresh=seedExercise(name,{sets:left,reps:ex.plannedReps||'',rir:ex.plannedRir||'',rest:restRule(name,p.rest)});
    if(ex.superset)fresh.superset=ex.superset;
    if(flowPhase==='setup'){fresh.id=ex.id;draft[idx]=fresh;renderDraft();try{if(!$('#orderModal').classList.contains('hidden'))renderOrderModal()}catch{}toast(`${ex.name} → ${name}`);return}
    const wasActive=flowPhase==='set'&&ex.id===activeExerciseId,wasNext=flowPhase==='rest'&&pendingNext?.exerciseId===ex.id;
    if(!done){fresh.id=ex.id;draft[idx]=fresh}
    else{ex.sets=ex.sets.slice(0,done);ex.plannedSets=v8630Eff(ex,done);draft.splice(idx+1,0,fresh)}
    try{syncDynamicWarmups(false)}catch(e){console.error(e)}
    if(wasActive){setActiveById(fresh.id,firstPendingSetId(fresh));const st=draft[activeExercise]?.sets?.[activeSet];if(st&&!st.presentedAt)st.presentedAt=Date.now()}
    if(wasNext)pendingNext={exerciseId:fresh.id,setId:firstPendingSetId(fresh)};
    v8630FixActive();v8630Refresh();toast(`${ex.name} → ${name}`);
  }

  function v8630OpenReplace(id){
    const ex=draft.find(x=>x.id===id);if(!ex)return;
    v8630RepId=id;openCatalogModal('replace');
  }
  function v8630Suggest(name){
    const g=catalogEntry(name)?.group;
    return (SUBSTITUTIONS[name]||EXERCISE_CATALOG.filter(x=>x.group===g&&x.name!==name).slice(0,6).map(x=>x.name)).filter(n=>n!==name&&CATALOG_BY_NAME.has(n));
  }

  // Catálogo: título según el modo, sugerencias al cambiar y crear ejercicio nuevo.
  const _v8630OpenCat=openCatalogModal;
  openCatalogModal=function(mode='workout'){
    if(mode!=='replace')v8630RepId=null;
    const r=_v8630OpenCat.apply(this,arguments);
    try{
      v8630Top('catalogModal');
      const ex=draft.find(x=>x.id===v8630RepId),h=$('#catalogModal .modal-head h2'),s=$('#catalogModal .modal-head .small');
      if(h)h.textContent=mode==='replace'&&ex?`Cambiar ${ex.name}`:'Agregar ejercicio';
      if(s)s.textContent=mode==='replace'?'Elige por cuál lo cambias. Si no está, escríbelo y créalo.':'Busca en el catálogo. Si no está, escríbelo y créalo.';
    }catch(e){console.error(e)}
    return r;
  };
  const _v8630RenderCat=renderCatalogList;
  renderCatalogList=function(q=''){
    _v8630RenderCat.apply(this,arguments);
    try{
      const host=$('#catalogContent'),txt=String(q||'').trim(),rep=catalogAddMode==='replace'?draft.find(x=>x.id===v8630RepId):null;
      if(rep){
        host.querySelectorAll('[data-catalog-add]').forEach(b=>{if(b.dataset.catalogAdd===rep.name)b.remove()});
        if(!txt){const sug=v8630Suggest(rep.name);if(sug.length)host.insertAdjacentHTML('afterbegin',`<div class="v8630-cap">Sugeridos para cambiar</div>${sug.map(n=>{const x=catalogEntry(n);return `<button class="secondary catalog-item v8630-sug" data-catalog-add="${esc(n)}"><span><strong>${esc(n)}</strong><div class="catalog-meta">${esc(x.group)} · ${esc(x.equipment||'')} · descanso ${timeLabel(restRule(n,x.rest))}</div></span><span>⇄</span></button>`}).join('')}<div class="v8630-cap">Todo el catálogo</div>`)}
      }
      if(txt&&!EXERCISE_CATALOG.some(x=>normName(x.name)===normName(txt))){
        const groups=[...new Set(EXERCISE_CATALOG.map(x=>x.group).filter(Boolean))];
        const guess=EXERCISE_CATALOG.find(x=>normName(x.name).includes(normName(txt)))?.group||(rep?catalogEntry(rep.name).group:'')||'Otro';
        if(!groups.includes('Otro'))groups.push('Otro');
        host.insertAdjacentHTML('afterbegin',`<div class="v8630-new"><div><strong>＋ Crear «${esc(txt)}»</strong><div class="small">Ejercicio nuevo; queda guardado en tu catálogo.</div></div><div class="v8630-new-row"><select id="v8630Group" aria-label="Grupo muscular">${groups.map(g=>`<option ${g===guess?'selected':''}>${esc(g)}</option>`).join('')}</select><button class="primary" data-v8630-create>${rep?'Crear y cambiar':'Crear y agregar'}</button></div></div>`);
      }
    }catch(e){console.error(e)}
  };
  $('#catalogContent').addEventListener('click',e=>{
    const mk=e.target.closest('[data-v8630-create]');
    if(mk){
      e.stopImmediatePropagation();
      const nm=createCustomExercise($('#catalogSearch').value,$('#v8630Group')?.value||'Otro','');
      if(!nm){toast('Escribe el nombre del ejercicio.');return}
      persist(true);
      if(catalogAddMode==='replace'){$('#catalogModal').classList.add('hidden');v8630Replace(v8630RepId,nm);v8630RepId=null}
      else addCatalogExercise(nm);
      toast(`«${nm}» creado y ${catalogAddMode==='replace'?'cambiado':'agregado'}.`);
      return;
    }
    if(catalogAddMode!=='replace')return;
    const name=e.target.closest('[data-catalog-add]')?.dataset.catalogAdd;if(!name)return;
    e.stopImmediatePropagation();
    $('#catalogModal').classList.add('hidden');const id=v8630RepId;v8630RepId=null;v8630Replace(id,name);
  },true);
  // Agregar en pleno entreno: si ya habías terminado, el nuevo queda como serie en curso; refresca la lista abierta.
  const _v8630AddCat=addCatalogExercise;
  addCatalogExercise=function(name){
    const before=draft.length,r=_v8630AddCat.apply(this,arguments);
    try{if(draft.length>before&&catalogAddMode==='workout'){if(flowPhase==='done')v8630FixActive();try{syncDynamicWarmups(false)}catch{}v8630Refresh()}else if(draft.length>before&&!$('#orderModal').classList.contains('hidden'))renderOrderModal()}catch(e){console.error(e)}
    return r;
  };

  // Lista de ejercicios (Orden): botones Cambiar / Quitar en cada uno y Agregar al final.
  const _v8630RenderOrder=renderOrderModal;
  renderOrderModal=function(){
    _v8630RenderOrder.apply(this,arguments);
    try{
      const items=[...$('#orderContent').querySelectorAll(':scope > .order-item')];
      items.forEach((it,i)=>{const ex=draft[i];if(!ex)return;const full=flowPhase!=='setup'&&(Number(ex.completedSets)||0)>=ex.sets.length;it.insertAdjacentHTML('beforeend',`<div class="v8630-acts">${full?'':`<button class="secondary" data-v8630-rep="${ex.id}">⇄ Cambiar</button>`}<button class="secondary danger" data-v8630-del="${ex.id}">🗑 Quitar</button></div>`)});
      $('#orderContent').insertAdjacentHTML('beforeend',`<button class="primary v8630-add" data-v8630-add>＋ Agregar ejercicio</button>`);
      const h=$('#orderModal .modal-head h2'),s=$('#orderModal .modal-head .small');
      if(h)h.textContent='Ejercicios del entrenamiento';
      if(s)s.textContent='Ordena, agrega, cambia o quita ejercicios sin perder las series que ya hiciste.';
    }catch(e){console.error(e)}
  };
  $('#orderModal').addEventListener('click',e=>{
    const rep=e.target.closest('[data-v8630-rep]')?.dataset.v8630Rep;if(rep){e.stopImmediatePropagation();v8630OpenReplace(rep);return}
    const del=e.target.closest('[data-v8630-del]')?.dataset.v8630Del;if(del){e.stopImmediatePropagation();v8630Remove(del);return}
    if(e.target.closest('[data-v8630-add]')){e.stopImmediatePropagation();openCatalogModal(flowPhase==='setup'?'setup':'workout')}
  },true);

  // Tarjetas de la rutina antes de empezar: «⇄ Cambiar».
  const _v8630RenderDraft=renderDraft;
  renderDraft=function(){
    const r=_v8630RenderDraft.apply(this,arguments);
    try{draft.forEach(ex=>{const card=$(`#draftExercises [data-ex-id="${ex.id}"]`),del=card?.querySelector('[data-remove-exercise]');if(!del||card.querySelector('[data-v8630-rep]'))return;del.insertAdjacentHTML('beforebegin',`<button class="secondary" data-v8630-rep="${ex.id}" aria-label="Cambiar ${esc(ex.name)}">⇄ Cambiar</button>`)})}catch(e){console.error(e)}
    return r;
  };
  $('#draftExercises').addEventListener('click',e=>{const rep=e.target.closest('[data-v8630-rep]')?.dataset.v8630Rep;if(rep){e.stopImmediatePropagation();v8630OpenReplace(rep)}},true);

  // Botones que abren la lista: nombre más claro.
  const _v8630RenderFocus=renderFocus;
  renderFocus=function(){
    const r=_v8630RenderFocus.apply(this,arguments);
    try{$$('#focusContent [data-focus-order]').forEach(b=>{b.textContent=flowPhase==='rest'?'☰ Ejercicios':'☰ Ejercicios · orden, agregar, cambiar'})}catch{}
    return r;
  };
  try{const ob=$('#openOrderModal');if(ob)ob.textContent='☰ Ejercicios · orden, agregar, cambiar o quitar'}catch{}
  // Desde Opciones del entreno, «Agregar ejercicio» también pasa por aquí (el catálogo queda encima de todo).

  document.head.insertAdjacentHTML('beforeend',`<style>
    #orderContent .v8630-acts{grid-column:1/-1;display:flex;gap:8px;margin-top:2px}
    #orderContent .v8630-acts button{flex:1;padding:7px 9px;font-size:13px;min-height:38px}
    .v8630-add{width:100%;margin-top:4px;min-height:46px}
    .v8630-new{border:1px dashed var(--green);border-radius:14px;padding:11px;display:grid;gap:9px;margin-bottom:8px}
    .v8630-new-row{display:flex;gap:8px}.v8630-new-row select{flex:1;min-width:0}.v8630-new-row button{flex:0 0 auto}
    .v8630-cap{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:6px 2px 2px}
  </style>`);

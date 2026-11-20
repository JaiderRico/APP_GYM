  /* ===================== v8.6.19 · Al terminar el descanso, decir en voz alta la siguiente serie ===================== */
  // Va al final, justo antes de `initV7();` (después de v8618). Necesita Speak.java (classes7) y los ganchos en RestAlarm
  // (classes3). Con una APK vieja `'ok'` responde false y no se muestra nada.
  // Durante el descanso la página guarda la frase con NativeStore.savePhoto('__speak__','set:<frase>'); cuando suena la
  // alarma (app cerrada, pantalla apagada o abierta) el teléfono la lee y la música baja mientras habla.
  // Frase: «Press inclinado. Serie 2 de 3. 30 kilos por lado. Objetivo: 7 repeticiones, RIR 1.»
  // Objetivo de reps: todayTarget (doble progresión) → reps de la vez pasada → reps planeadas («8 a 12»).
  // Ajustes → «🔊 Voz al terminar el descanso»: data.settings.restVoice {on, load, rir} (+ botón Probar).
  const V8619={ok:false,sent:null,onSent:null};
  try{V8619.ok=!!window.NativeStore?.savePhoto?.('__speak__','ok')}catch{}
  function v8619Prefs(){data.settings=data.settings||{};return data.settings.restVoice=Object.assign({on:true,load:true,rir:true},data.settings.restVoice||{})}
  const v8619Num=n=>{const r=Math.round(Number(n)*100)/100;return Number.isInteger(r)?String(r):String(r).replace('.',',')};
  function v8619Unit(u,n){const one=Number(n)===1;return u==='lb'?(one?'libra':'libras'):u==='plates'?(one?'placa':'placas'):(one?'kilo':'kilos')}
  function v8619Phrase(ex,i){
    const st=ex?.sets?.[i];if(!st)return '';
    const P=v8619Prefs(),warm=setType(st)==='warmup',sets=ex.sets||[];
    const pos=warm?sets.slice(0,i+1).filter(x=>setType(x)==='warmup').length:sets.slice(0,i+1).filter(isEffectiveSet).length;
    const tot=warm?sets.filter(x=>setType(x)==='warmup').length:sets.filter(isEffectiveSet).length;
    const parts=[ex.name+'.',(warm?'Calentamiento ':'Serie ')+pos+' de '+tot+'.'];
    let t=null;try{t=warm?null:todayTarget(ex,i)}catch{}
    if(P.load){
      let eq='';try{eq=setEquipment(st,ex.equipment||'')}catch{}
      let mode='total';try{mode=loadMode(st,eq)}catch{}
      const load=t&&Number(t.load)>0?t.load:st.load,unit=t?.unit||st.unit||'kg';
      if(Number(load)>0){
        let s=(t?.up?'Sube a ':'')+v8619Num(load)+' '+v8619Unit(unit,load);
        if(mode==='per_side')s+=' por lado';else if(mode==='assistance')s+=' de asistencia';
        parts.push(s+'.');
      }else if(eq==='Peso corporal')parts.push('Peso corporal.');
    }
    let reps='';
    if(warm)reps=Number(st.solo)>0?String(st.solo):'';
    else{
      if(t&&t.reps)reps=String(t.reps);
      if(!reps){try{const p=Number(targetForSet(ex,i)?.solo);if(p>0)reps=String(p)}catch{}}
      if(!reps&&ex.plannedReps)reps=String(ex.plannedReps).replace(/\s*[–\-]\s*/,' a ');
    }
    if(reps){
      let s=(warm?'':'Objetivo: ')+reps+(reps==='1'?' repetición':' repeticiones');
      const rir=ex.plannedRir!=null&&ex.plannedRir!==''?String(ex.plannedRir).replace(/\s*[–\-]\s*/,' a '):'';
      if(warm)s+=', suave';else if(P.rir&&rir&&setType(st)!=='failure')s+=', RIR '+rir;
      if(setType(st)==='failure')s+=', al fallo';
      parts.push(s+'.');
    }
    return parts.join(' ');
  }
  function v8619Current(){
    if(typeof flowPhase==='undefined'||flowPhase!=='rest'||!pendingNext)return '';
    try{const ex=draft.find(x=>x.id===pendingNext.exerciseId);if(!ex)return '';let i=ex.sets.findIndex(x=>x.id===pendingNext.setId);if(i<0)i=Number(ex.completedSets)||0;return v8619Phrase(ex,i)}catch{return ''}
  }
  function v8619Sync(){
    if(!V8619.ok)return;
    const P=v8619Prefs();
    if(V8619.onSent!==P.on){V8619.onSent=P.on;try{window.NativeStore.savePhoto('__speak__','on:'+(P.on?1:0))}catch{}}
    const s=P.on?v8619Current():'';
    if(s===V8619.sent||(!s&&flowPhase==='rest'))return; // en descanso no se borra por un instante sin datos
    V8619.sent=s;
    try{window.NativeStore.savePhoto('__speak__','set:'+s)}catch{}
  }
  setInterval(()=>{try{v8619Sync()}catch{}},700);
  // Al programar la alarma (empieza el descanso, se cambia el orden, se pausa…) se actualiza la frase de una vez.
  const _sync8619=syncNativeRest;
  syncNativeRest=function(){try{v8619Sync()}catch{}return _sync8619.apply(this,arguments)};

  function v8619SetHtml(){
    const P=v8619Prefs();
    return `<details class="settings-group" id="v8619Set"><summary>🔊 Voz al terminar el descanso</summary><div class="settings-section">
      <p class="small" style="margin:0 0 10px">Cuando suena el final del descanso, el teléfono dice la siguiente serie: ejercicio, peso y cuántas repeticiones buscas. Funciona con la pantalla apagada o en otra app; la música baja mientras habla.</p>
      <label class="toggle-row"><input type="checkbox" data-v8619="on" ${P.on?'checked':''}> Decir la siguiente serie</label>
      <label class="toggle-row"><input type="checkbox" data-v8619="load" ${P.load?'checked':''}> Incluir el peso</label>
      <label class="toggle-row"><input type="checkbox" data-v8619="rir" ${P.rir?'checked':''}> Incluir el RIR</label>
      <button class="secondary" data-v8619-test style="width:100%;margin-top:8px">▶ Probar la voz</button>
      <p class="small" style="margin:8px 0 0">Si no la escuchas: sube el volumen multimedia y revisa que el teléfono tenga instalada la voz en español (Ajustes del teléfono → Texto a voz).</p>
    </div></details>`;
  }
  if(V8619.ok){
    const _rs8619=renderSettings;
    renderSettings=function(){const r=_rs8619.apply(this,arguments);try{const host=$('#settingsContent');if(host&&!$('#v8619Set'))host.insertAdjacentHTML('beforeend',v8619SetHtml())}catch(e){console.error(e)}return r};
  }
  document.addEventListener('change',e=>{
    const c=e.target.closest?.('[data-v8619]');if(!c)return;
    v8619Prefs()[c.dataset.v8619]=!!c.checked;persist();V8619.sent=null;v8619Sync();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest?.('[data-v8619-test]'))return;
    let s='';try{s=v8619Current()}catch{}
    if(!s){
      try{
        const ex=draft.find(x=>(x.sets||[]).some(st=>!st.completedAt))||null;
        if(ex)s=v8619Phrase(ex,Math.max(0,ex.sets.findIndex(st=>!st.completedAt)));
      }catch{}
    }
    if(!s)s='Press de banca. Serie 2 de 3. 60 kilos. Objetivo: 9 repeticiones, RIR 1.';
    try{window.NativeStore.savePhoto('__speak__','test:'+s);toast('🔊 '+s)}catch{toast('No se pudo usar la voz.')}
  });

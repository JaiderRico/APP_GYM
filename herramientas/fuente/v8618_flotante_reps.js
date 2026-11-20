  /* ===================== v8.6.18 · Ventana flotante: marcar reps y RIR, y tamaño del contenido ===================== */
  // Va al final, justo antes de `initV7();` (después de v8616). Necesita Pip.java 8.6.18 (classes7.dex) para los botones;
  // con una APK vieja `'acts'` responde false y todo sigue como antes.
  // (1) Android no deja tocar el contenido de la ventana flotante, solo botones del sistema (RemoteAction, máx. ~3), que
  //     salen al tocar la ventana. En cada serie: [vez pasada −1] [igual] [+1] reps → luego RIR [0] [1] [2] → la serie se
  //     termina sola (finishCurrentSet) y arranca el descanso. Calentamiento y «al fallo»: solo reps. Drop/rest-pause: en la app.
  //     La página manda los botones con NativeStore.savePhoto('__pip__','act:id~grande~pequeño|…') y Pip.java llama
  //     v8618PipTap(id) al tocarlos. Paso en curso: V8618.step = {setId, reps}.
  // (2) Dentro de la app, debajo de Repeticiones: los mismos tres botones (vez pasada −1, igual, +1).
  // (3) Ajustes → ventana flotante: «Tamaño del contenido» 60–170 % (data.settings.pip.scale), además de Letra.
  const V8618={ok:false,step:null,sent:null};
  try{V8618.ok=!!(v85Pip.ok&&window.NativeStore?.savePhoto?.('__pip__','acts'))}catch{}
  function v8618Ctx(){
    if(!v85Training()||flowPhase!=='set')return null;
    let paused=false;try{paused=!!sessionPausedAt}catch{}
    if(paused)return null;
    try{syncActiveIndices()}catch{}
    const ex=draft[activeExercise],st=ex?.sets?.[activeSet];if(!ex||!st)return null;
    const type=setType(st),warm=type==='warmup';
    return {ex,st,i:activeSet,type,warm,special:type==='drop'||type==='restpause',needRir:!warm&&type!=='failure'};
  }
  // Reps de referencia: las de la vez pasada en esta misma serie (calentamiento: las planeadas).
  function v8618Base(c){
    let b=0;
    if(c.warm)b=Number(c.st.solo)||0;
    else{try{b=Number(targetForSet(c.ex,c.i)?.solo)||0}catch{}}
    if(b>0)return {opts:[b-1,b,b+1].filter(n=>n>=1),base:b,prev:!c.warm};
    let rr=null;try{rr=repRange(c.ex)}catch{}
    if(rr){const [lo,hi]=rr,mid=Math.round((lo+hi)/2);return {opts:[...new Set([lo,mid,hi])],base:0,prev:false}}
    const p=parseInt(c.ex.plannedReps,10);
    return p>0?{opts:[p-1,p,p+1].filter(n=>n>=1),base:p,prev:false}:null;
  }
  function v8618NeedsLoad(c){
    try{const eq=setEquipment(c.st,c.ex.equipment||'');return eq!=='Peso corporal'&&loadMode(c.st,eq)!=='assistance'&&!(Number(c.st.load)>0)}catch{return false}
  }
  // Qué botones tocan ahora: {kind:'reps'|'rir', items:[[id,grande,pequeño]], ...}
  function v8618State(){
    const c=v8618Ctx();if(!c||c.special)return null;
    if(v8618NeedsLoad(c))return {kind:'load',items:[]};
    if(V8618.step&&V8618.step.setId!==c.st.id)V8618.step=null;
    if(V8618.step&&c.needRir)return {kind:'rir',reps:V8618.step.reps,items:[0,1,2].map(n=>['i'+n,String(n),'RIR'])};
    const b=v8618Base(c);if(!b)return null;
    return {kind:'reps',base:b.base,prev:b.prev,items:b.opts.map(n=>['r'+n,String(n),'reps'])};
  }
  function v8618Sync(force){
    if(!V8618.ok)return;
    let s=null;try{s=v8618State()}catch{}
    const str=(s?.items||[]).map(a=>a.join('~')).join('|');
    if(!force&&str===V8618.sent)return;
    V8618.sent=str;
    try{window.NativeStore.savePhoto('__pip__','act:'+str)}catch{}
  }
  function v8618Refresh(){try{v85MiniKey='';v85MiniFill()}catch{}v8618Sync()}
  window.v8618PipTap=function(id){
    try{
      const c=v8618Ctx();if(!c||c.special)return;
      touchActivity();
      const m=String(id).match(/^([ri])(\d{1,3})$/);if(!m)return;
      const n=Number(m[2]);
      if(m[1]==='r'){
        c.st.solo=String(n);
        if(c.needRir){V8618.step={setId:c.st.id,reps:n};saveActive();try{renderFocus()}catch{}v8618Refresh();return}
        V8618.step=null;finishCurrentSet();v8618Refresh();return;
      }
      if(!V8618.step||V8618.step.setId!==c.st.id)return;
      c.st.solo=String(V8618.step.reps);c.st.rir=n;V8618.step=null;
      finishCurrentSet();v8618Refresh();
    }catch(e){console.error(e)}
  };
  setInterval(()=>{try{v8618Sync()}catch{}},800);

  // Texto de ayuda en la ventana flotante.
  const _v8618Mini=v85MiniHtml;
  v85MiniHtml=function(){
    const r=_v8618Mini.apply(this,arguments);
    try{
      if(!V8618.ok||!String(r.key).startsWith('set|'))return r;
      const s=v8618State();let h='';
      if(s?.kind==='load')h='<div class="mpm v8618h">Anota el peso en la app para marcar desde aquí.</div>';
      else if(s?.kind==='reps')h=`<div class="mpm v8618h">Toca la ventana · reps <b>${s.items.map(a=>a[1]).join(' · ')}</b>${s.prev?` <span>(la vez pasada ${s.base})</span>`:''}</div>`;
      else if(s?.kind==='rir')h=`<div class="mpm v8618h ok"><b>${s.reps} reps ✓</b> · toca la ventana · RIR <b>0 · 1 · 2</b></div>`;
      else if(v8618Ctx()?.special)h='<div class="mpm v8618h">Este tipo de serie se marca en la app.</div>';
      if(h){r.html+=h;r.key+='|'+h}
    }catch{}
    return r;
  };

  // Tamaño del contenido de la ventana (además de la letra).
  const V8618_TXT={sm:.86,md:1,lg:1.18};
  function v8618Scale(){const v=Number(v85PipPrefs().scale);return v>=60&&v<=170?v:100}
  const _v8618Fill=v85MiniFill;
  v85MiniFill=function(){
    const r=_v8618Fill.apply(this,arguments);
    try{const box=document.getElementById('v85Mini');if(box)box.style.setProperty('--s',String((V8618_TXT[v85PipPrefs().text]||1)*v8618Scale()/100))}catch{}
    return r;
  };
  const _v8618SetHtml=v85PipSetHtml;
  v85PipSetHtml=function(){
    const sc=v8618Scale();
    return _v8618SetHtml.apply(this,arguments)+`<div class="small" style="margin-top:10px"><b>Tamaño del contenido</b> · <span id="v8618ScaleTxt">${sc}%</span></div>
      <input type="range" min="60" max="170" step="5" value="${sc}" data-v8618-scale style="width:100%">
      <p class="small" style="margin:4px 0 0">Agranda o achica lo que se ve dentro de la ventana. La ventana misma la controla Android: pellízcala con dos dedos, arrastra una esquina o tócala dos veces para agrandarla.</p>
      ${V8618.ok?'<p class="small" style="margin:8px 0 0">En cada serie, toca la ventana y salen botones: reps de la vez pasada −1, iguales o +1; después RIR 0, 1 o 2, y la serie queda marcada.</p>':''}`;
  };
  document.addEventListener('input',e=>{
    const r=e.target.closest?.('[data-v8618-scale]');if(!r)return;
    const p=v85PipPrefs();p.scale=Number(r.value)||100;
    const t=document.getElementById('v8618ScaleTxt');if(t)t.textContent=p.scale+'%';
    try{v85MiniKey='';v85MiniFill()}catch{}
  });
  document.addEventListener('change',e=>{if(e.target.closest?.('[data-v8618-scale]'))try{persist()}catch{}});

  // (2) En la app: botones de reps debajo de Repeticiones.
  const _rf8618=renderFocus;
  renderFocus=function(){
    const r=_rf8618.apply(this,arguments);
    try{
      const c=v8618Ctx();if(!c||c.special)return r;
      const inp=$('#focusContent [data-current="solo"]'),lab=inp?.closest('label');if(!lab||lab.querySelector('.v8618-reps'))return r;
      const b=v8618Base(c);if(!b)return r;
      lab.insertAdjacentHTML('beforeend',`<div class="v8618-reps">${b.opts.map(n=>`<button type="button" data-v8618-rep="${n}" class="${String(c.st.solo)===String(n)?'active':''}">${n}</button>`).join('')}</div>${b.prev?`<span class="v8618-prev">vez pasada: ${b.base}</span>`:''}`);
    }catch(e){console.error(e)}
    return r;
  };
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-v8618-rep]');if(!b)return;
    e.preventDefault();
    const c=v8618Ctx();if(!c)return;
    c.st.solo=String(b.dataset.v8618Rep);touchActivity();saveActive();renderFocus();v8618Refresh();
  });
  document.head.insertAdjacentHTML('beforeend',`<style>
    .v8618-reps{display:flex;gap:6px;margin-top:6px}
    .v8618-reps button{flex:1;min-width:0;padding:8px 0;border-radius:10px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font-weight:800;font-size:16px}
    .v8618-reps button.active{background:var(--green);border-color:var(--green);color:var(--ink,#06110b)}
    .v8618-prev{display:block;font-size:11px;color:var(--muted);margin-top:3px;font-weight:600}
    #v85Mini .v8618h b{color:var(--text)}#v85Mini .v8618h span{opacity:.8}
    #v85Mini .v8618h.ok{color:var(--green2,var(--green))}
  </style>`);

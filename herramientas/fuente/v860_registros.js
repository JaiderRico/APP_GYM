  /* ===================== v8.6.0: pesos raros (errores de digitación) ===================== */
  // (Mismo bloque en las tres apps: va justo después del bloque v8.5.0, antes de `initV7();`.)
  // Un peso que no cuadra con tu historial del mismo ejercicio (p. ej. 20 donde siempre pones 30 por lado,
  // 300 en vez de 30, kg/lb o "por lado"/"total" confundidos) se pregunta al terminar la serie. Si no lo
  // confirmas, no cuenta para récords, logros ni gráficas. Confirmado queda `st.loadOk=true`.
  const V86_LB=0.45359237;
  let v86Ver=0,v86StatsC=null,v86CleanC=null;
  const v86Norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
  // Lleva cada serie a un mismo número comparable: kg totales (lb → kg, "por lado" × 2). Las placas van aparte.
  function v86Val(ex,st){
    const l=Number(st?.load);if(!(l>0))return null;
    let eq='';try{eq=setEquipment(st,ex?.equipment||'')}catch{eq=st.equipment||ex?.equipment||''}
    let mode='total';try{mode=loadMode(st,eq)}catch{}
    if(mode==='assistance')return null;
    let v=l;if(mode==='per_side'&&(st.execution||'bilateral')!=='unilateral')v*=2;
    const u=st.unit||'kg';
    if(u==='plates')return {cls:'plates',v,f:mode==='per_side'&&(st.execution||'bilateral')!=='unilateral'?2:1};
    return {cls:'w',v:u==='lb'?v*V86_LB:v,f:(u==='lb'?V86_LB:1)*(mode==='per_side'&&(st.execution||'bilateral')!=='unilateral'?2:1)};
  }
  function v86Sig(){return (data?.workouts||[]).length+'|'+(data?.savedAt||0)+'|'+v86Ver}
  // Por ejercicio y clase: la serie más pesada de cada sesión, ordenadas por fecha.
  function v86Stats(){
    const sig=v86Sig();if(v86StatsC&&v86StatsC.sig===sig)return v86StatsC.map;
    const map=new Map();
    for(const w of data?.workouts||[])for(const ex of w.exercises||[]){
      let inv=false;try{inv=isInverseSet(ex.name)}catch{}if(inv)continue;
      for(const st of ex.sets||[]){
        if(!isEffectiveSet(st)||!(Number(st.solo)>0))continue;
        const x=v86Val(ex,st);if(!x)continue;
        const k=v86Norm(ex.name)+'|'+x.cls;let o=map.get(k);if(!o)map.set(k,o=new Map());
        const sk=w.id||w.date;const p=o.get(sk);if(!p||x.v>p.v)o.set(sk,{date:w.date||'',id:sk,v:x.v});
      }
    }
    for(const [k,o] of map)map.set(k,[...o.values()].sort((a,b)=>a.date.localeCompare(b.date)));
    v86StatsC={sig,map};return map;
  }
  const v86Med=a=>{const b=[...a].sort((p,q)=>p-q),n=b.length;return n?(n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2):0};
  // ¿Esta serie es rara? Compara con tus últimas 6 sesiones ANTERIORES del mismo ejercicio (mínimo 2).
  // live=true: además avisa si cambiaste de placas a kg/lb (o al revés) respecto a lo de siempre.
  function v86Check(ex,st,date,live=false,wid=null){
    if(!ex||!st||!isEffectiveSet(st)||st.loadOk)return null;
    let inv=false;try{inv=isInverseSet(ex.name)}catch{}if(inv)return null;
    const x=v86Val(ex,st);if(!x)return null;
    const S=v86Stats(),d=date||'9999';
    const prior=cls=>(S.get(v86Norm(ex.name)+'|'+cls)||[]).filter(p=>p.date<d&&p.id!==wid).slice(-6);
    const P=prior(x.cls);
    if(P.length>=2){
      const med=v86Med(P.map(p=>p.v)),top=Math.max(...P.map(p=>p.v));
      const high=x.v>med*1.45&&x.v>top*1.2,low=st.type!=='drop'&&x.v<med*0.5;
      if(high||low)return {dir:high?'high':'low',typ:Math.round(med/x.f*100)/100,ratio:x.v/med};
      return null;
    }
    if(live&&P.length===0){
      const other=prior(x.cls==='plates'?'w':'plates');
      if(other.length>=2)return {dir:'unit',ratio:1};
    }
    return null;
  }
  function v86Bad(ex,st,date,wid){try{return !!v86Check(ex,st,date,false,wid)}catch{return false}}
  function v86CleanW(w){
    if(!w)return w;let changed=false;
    const exs=(w.exercises||[]).map(e=>{const sets=(e.sets||[]).filter(s=>!v86Bad(e,s,w.date,w.id));if(sets.length!==(e.sets||[]).length){changed=true;return {...e,sets}}return e});
    return changed?{...w,exercises:exs}:w;
  }
  function v86CleanAll(){const sig=v86Sig();if(v86CleanC&&v86CleanC.sig===sig&&v86CleanC.src===data.workouts)return v86CleanC.list;const list=(data.workouts||[]).map(v86CleanW);v86CleanC={sig,src:data.workouts,list};return list}
  function v86With(fn){const o=data.workouts;try{data.workouts=v86CleanAll()}catch{return fn()}try{return fn()}finally{data.workouts=o}}
  const v86U=st=>st?.unit==='plates'?'placas':st?.unit==='lb'?'lb':'kg';
  const v86N=v=>{const r=Math.round(Number(v)*100)/100;return Number.isInteger(r)?String(r):String(r).replace('.',',')};
  function v86Side(ex,st){let eq='';try{eq=setEquipment(st,ex.equipment||'')}catch{}try{return loadMode(st,eq)==='per_side'?' por lado':''}catch{return ''}}
  function v86Hint(c){
    const r=c.ratio,near=t=>Math.abs(r/t-1)<0.12;
    if(near(10)||near(.1))return '¿Le sobra o le falta un cero?';
    if(near(2)||near(.5))return '¿Pusiste el total en vez de “por lado” (o al revés)?';
    if(near(2.2046)||near(1/2.2046))return '¿Confundiste kg con lb?';
    return '';
  }
  function v86Msg(ex,st,c){
    const now=`${v86N(st.load)} ${v86U(st)}${v86Side(ex,st)}`;
    if(c.dir==='unit')return `${ex.name}: pusiste ${now}, pero siempre lo registras en ${st.unit==='plates'?'kg o lb':'placas'}.\n\n¿Es correcto?\nAceptar = sí, guardar.  Cancelar = corregir la unidad.`;
    const h=v86Hint(c);
    return `${ex.name}: ${now} es ${c.dir==='high'?'mucho más':'mucho menos'} de lo que sueles usar (≈ ${v86N(c.typ)} ${v86U(st)}${v86Side(ex,st)}).${h?'\n'+h:''}\n\nSi es un error, no contará como récord.\n¿Es correcto?\nAceptar = sí, guardar.  Cancelar = corregir.`;
  }

  // Récords, logros y gráficas sin los pesos raros sin confirmar.
  const _v86PRs=getPRsAgainst;
  getPRsAgainst=function(workout,priorWorkouts){
    const prior=priorWorkouts===undefined?v86CleanAll():(priorWorkouts||[]).map(v86CleanW);
    return _v86PRs(v86CleanW(workout),prior);
  };
  const _v86Events=recordEvents;recordEvents=function(){return v86With(()=>_v86Events.apply(this,arguments))};
  const _v86Groups=exGroups;exGroups=function(){return v86With(()=>_v86Groups.apply(this,arguments))};
  const _v86Best=bestBeforeVariant;bestBeforeVariant=function(){return v86With(()=>_v86Best.apply(this,arguments))};
  const _v86Points=recordPoints;recordPoints=function(v){return _v86Points({...v,sets:(v?.sets||[]).filter(x=>!v86Bad(x.ex,x.st,x.w?.date,x.w?.id))})};
  const _v86Live=evaluateSetPR;
  evaluateSetPR=function(ex,st){
    let d='';try{d=$('#workoutDate')?.value||today()}catch{}
    if(v86Bad(ex,st,d))return null;
    return v86With(()=>_v86Live(ex,st));
  };

  // draftWorkout() copia solo campos conocidos de cada serie: se le agrega la marca "era correcto".
  const _v86Draft=draftWorkout;
  draftWorkout=function(){const w=_v86Draft.apply(this,arguments);try{const ok=new Set();for(const e of draft||[])for(const s of e.sets||[])if(s.loadOk)ok.add(s.id);if(ok.size)for(const e of w.exercises||[])for(const s of e.sets||[])if(ok.has(s.id))s.loadOk=true}catch{}return w};

  // Al terminar una serie: si el peso es raro, preguntar antes de guardarla.
  const _v86Finish=finishCurrentSet;
  finishCurrentSet=function(){
    try{
      syncActiveIndices();const e=draft[activeExercise],st=e?.sets?.[activeSet];
      if(e&&st&&!st.completedAt&&!editingExisting&&!sessionPausedAt&&isEffectiveSet(st)&&!st.loadOk&&Number(st.solo)>0){
        const c=v86Check(e,st,$('#workoutDate')?.value||today(),true);
        if(c){
          if(!confirm(v86Msg(e,st,c))){toast('Corrige el peso o la unidad y vuelve a terminar la serie.');try{$('#focusContent input[data-field="load"], #focusContent input[name="load"], #focusContent .focus-form input')?.focus()}catch{}return}
          st.loadOk=true;v86Ver++;
        }
      }
    }catch(err){console.warn(err)}
    return _v86Finish.apply(this,arguments);
  };

  // Logros: lista de pesos raros que no cuentan, con opción de decir "era correcto".
  function v86Suspects(){
    const out=[];
    for(const w of data?.workouts||[])(w.exercises||[]).forEach((ex,ei)=>(ex.sets||[]).forEach((st,si)=>{
      if(!(Number(st.solo)>0))return;
      let c=null;try{c=v86Check(ex,st,w.date,false,w.id)}catch{}
      if(c)out.push({w,ex,st,c,ref:`${w.id}|${ei}|${si}`});
    }));
    return out.sort((a,b)=>(b.w.date||'').localeCompare(a.w.date||''));
  }
  function v86SuspectsHtml(){
    const L=v86Suspects();if(!L.length)return '';
    return `<details class="card v86-odd" id="v86Odd"><summary><b>🧐 ${L.length} ${L.length===1?'peso raro no cuenta':'pesos raros no cuentan'} como récord</b><div class="small">Parecen errores al escribir (un cero de más, kg/lb o “por lado” confundidos). Si alguno era real, márcalo.</div></summary>${L.slice(0,40).map(x=>`<div class="v86-row"><div><b>${esc(x.ex.name)}</b> · ${esc(v86N(x.st.load))} ${esc(v86U(x.st))}${esc(v86Side(x.ex,x.st))} × ${Number(x.st.solo)||0}<div class="small">${(()=>{try{return esc(dateLabel(x.w.date))}catch{return esc(x.w.date)}})()} · sueles usar ≈ ${esc(v86N(x.c.typ))} ${esc(v86U(x.st))}${x.c.ratio?(' · '+esc(v86Hint(x.c)||'')):''}</div></div><button class="secondary" data-v86-ok="${esc(x.ref)}">Era correcto</button></div>`).join('')}<p class="small" style="margin:8px 0 0">Para corregir el número, edita ese entreno en Historial.</p></details>`;
  }
  const _v86Ach=renderAchievements;
  renderAchievements=function(){
    const r=_v86Ach.apply(this,arguments);
    try{const sec=$('#achMain');if(sec&&!sec.querySelector('#v86Odd')){const h=v86SuspectsHtml();if(h)sec.insertAdjacentHTML('beforeend',h)}}catch(err){console.warn(err)}
    return r;
  };
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-v86-ok]');if(!b)return;
    const [wid,ei,si]=b.dataset.v86Ok.split('|'),w=(data.workouts||[]).find(x=>String(x.id)===wid),st=w?.exercises?.[Number(ei)]?.sets?.[Number(si)];
    if(!st)return;st.loadOk=true;v86Ver++;
    try{rebuildPRs()}catch{}persist(true);
    try{renderAchievements()}catch{}toast('Listo: ese peso cuenta normal.');
  });
  if(!document.getElementById('v86Css'))document.head.insertAdjacentHTML('beforeend',`<style id="v86Css">
    .v86-odd summary{cursor:pointer;list-style:none}.v86-odd summary::-webkit-details-marker{display:none}
    .v86-odd{border-left:4px solid #d9a441;margin-top:14px}
    .v86-row{display:flex;gap:10px;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding:9px 0}
    .v86-row button{margin:0;white-space:nowrap;padding:8px 10px;font-size:12px}
  </style>`);
  // Recalcula los récords guardados en cada entreno sin los pesos raros (una vez, después de cargar los datos).
  setTimeout(()=>{try{const before=JSON.stringify((data.workouts||[]).map(w=>w.prs||[]));rebuildPRs();if(JSON.stringify((data.workouts||[]).map(w=>w.prs||[]))!==before)persist(true)}catch(err){console.warn(err)}},4000);

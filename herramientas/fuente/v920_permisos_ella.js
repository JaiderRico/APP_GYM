  /* ===================== v8.5.22 (solo app de Ella): lo que Jaider le activó a esta persona ===================== */
  // verify_code (backend v24) devuelve perms { ver, chat, msgs, ia } de quien usa la app con su código (Ella: todo).
  // Se guardan en kv 'app_perms'; sin chat se esconde el chat, sin "ver" no se ofrece ver los entrenos de Jaider y sin
  // "ia" no se pregunta por la copia en la nube. Los mensajes y rutinas apagados simplemente no llegan (el servidor).
  // Va antes de initV7(), después de v890, en el index.html de Ella.
  const V92_KEY='app_perms';
  function v92Perms(){try{const p=JSON.parse(kvGet(V92_KEY)||'null');return p&&typeof p==='object'?p:null}catch{return null}}
  const v92Can=k=>{const p=v92Perms();return !p||p[k]!==false};
  document.head.insertAdjacentHTML('beforeend','<style id="v92css">body.v92-nochat #v85ChatBtn{display:none!important}</style>');
  function v92Apply(){
    document.body.classList.toggle('v92-nochat',!v92Can('chat'));
    try{if(!v92Can('ver')){const p=herPrefs();if(p.viewJaider){p.viewJaider=false;herSavePrefs();applyPrefs()}}}catch{}
    try{if(!v92Can('ia')){const c=loadCloudCfg();if(c.auto!==false)saveCloudCfg({auto:false})}}catch{}
  }
  async function v92Check(){
    if(!herUnlocked())return;
    try{
      const j=await Promise.race([herGas('verify_code'),new Promise((_,no)=>setTimeout(()=>no(new Error('lento')),5000))]);
      const old=kvGet(V92_KEY),s=j.perms?JSON.stringify(j.perms):'';kvSet(V92_KEY,s);
      if(old&&s&&old!==s)toast('🔄 Jaider actualizó lo que tienes en tu app');
    }catch{}
    v92Apply();
  }
  // El cuestionario no pregunta lo que no tiene activado
  const _onb920=onbSteps;
  onbSteps=function(){return _onb920.apply(this,arguments).filter(s=>!(s==='jaider'&&!v92Can('ver'))&&!(s==='cloud'&&!v92Can('ia')))};
  // Al activar la app: primero saber qué tiene (máx. 5 s) y después seguir como siempre
  const _au920=afterUnlock;
  afterUnlock=async function(){await v92Check();return _au920.apply(this,arguments)};
  const _rs920=renderSettings;
  renderSettings=function(){
    const r=_rs920.apply(this,arguments);
    try{if(!v92Can('chat'))$$('#settingsContent details.settings-group').forEach(d=>{if(/chat con/i.test(d.querySelector('summary')?.textContent||''))d.remove()})}catch{}
    return r;
  };
  v92Apply();
  setTimeout(v92Check,2500);
  setInterval(v92Check,6*3600000);

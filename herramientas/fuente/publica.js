  /* ===================== Mi Progreso Libre: versión pública, sin conexión con nuestras apps ===================== */
  // Se genera con "python3 herramientas/mp.py libre X.Y.Z" a partir de la app de Jaider:
  // todo se guarda solo en el teléfono, sin IA, sin nube, sin chat. Solo con un código Pro vigente (que crea Jaider
  // desde su app) se habla con el Apps Script: pro_verify / pro_sync / pro_get, nunca con los datos de Jaider o de Ella.
  // 8.5.22: con un código de persona (PE-XXXX-XXXX, Jaider lo crea en 👥 Personas con "App libre") la app se conecta
  // con Jaider como la de Ella (code + app:'ella'), con lo que él le haya activado: IA y copia en la nube, chat,
  // mensajes y rutinas, ver sus entrenos. Los códigos Pro viejos (MP-) siguen igual.
  const PUB_PRO_TXT='Las funciones Pro (entrenador con IA y copia en la nube) son de pago. Si las quieres, pídele un código a quien te compartió la app.';
  const PUB_PRO_URL='https://script.google.com/macros/s/AKfycbwrlaJgyxtAS2uAUG4snTyA6EvFBYG17XtA5brvHYJWEvRL7clCg5lrhV2oILhdMcn7/exec';
  const PUB_PRO_KEY='mp_pro_v1';
  document.head.insertAdjacentHTML('beforeend',`<style id="pubcss">
    #hmEntry,.pv-tabs,#backupDriveCard,#cloudCard,[data-hm-open],[data-partner-open]{display:none!important}
    .pub-gate{position:fixed;inset:0;z-index:9500;background:var(--bg);overflow-y:auto;display:flex;align-items:flex-start;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 28px) 18px 28px}
    .pub-card{width:min(440px,100%);background:var(--panel);border:1px solid var(--line);border-radius:24px;padding:24px 20px;margin:auto 0}
    .pub-card h1{margin:4px 0 6px;font-size:23px;line-height:1.2}.pub-card p{margin:0 0 14px;color:var(--muted);font-size:15px}
    .pub-q{font-size:40px}
    .pub-dots{display:flex;gap:5px;margin-bottom:14px}.pub-dots i{flex:1;height:4px;border-radius:9px;background:var(--line)}.pub-dots i.on{background:var(--green)}
    .pub-opts{display:grid;gap:8px;margin-bottom:12px}
    .pub-opts button{display:flex;gap:10px;align-items:center;text-align:left;margin:0;padding:13px 14px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit}
    .pub-opts button b{display:block}.pub-opts button span{font-size:12px;color:var(--muted)}
    .pub-opts button.on{border-color:var(--green);box-shadow:0 0 0 2px var(--green) inset}
    .pub-opts.row5{grid-template-columns:repeat(5,1fr)}.pub-opts.row5 button{justify-content:center;font-weight:800;font-size:18px;padding:14px 0}
    .pub-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.pub-chips button{margin:0;padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:14px}.pub-chips button.on{background:var(--green);color:#0b120d;border-color:transparent}
    .pub-card input{width:100%;padding:13px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:17px;margin-bottom:12px}
    .pub-btn{width:100%;margin:4px 0 0;padding:15px;border:0;border-radius:14px;background:var(--green);color:#0b120d;font-weight:900;font-size:16px}
    .pub-ghost{width:100%;margin:8px 0 0;background:transparent;border:0;color:var(--muted);font:inherit;padding:8px}
    .pub-plan{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:8px;background:var(--panel2)}.pub-plan b{display:block;margin-bottom:2px}.pub-plan span{font-size:12px;color:var(--muted)}
    .pub-tip{border-left:4px solid var(--green)}
    .pub-pro{border:1px dashed var(--line)}
    .pub-msg{border-left:4px solid var(--green)}.pub-msg .rx{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.pub-msg .rx button{margin:0;padding:6px 12px;border-radius:99px}
    .pub-jw{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:8px;background:var(--panel2)}.pub-jw b{display:block}.pub-jw span{font-size:12.5px;color:var(--muted)}
  </style>`);

  /* ---------- Sin backend: nada se conecta con nuestras apps ---------- */
  try{localStorage.removeItem('mp_admin_code')}catch{}
  $('#adminGate')?.remove();
  showAdminGate=function(){};
  hmScheduleMine=function(){};
  hmEnsureEntry=function(){$('#hmEntry')?.remove()};
  gas=async function(){throw new Error('Función Pro')};
  try{const s=s81();s.partner.driveUrl='';s.partner.code='';s.partner.upload=false;s.partner.notify=false;s.reminders.meals=false}catch{}
  try{if(typeof saveCloudCfg==='function')saveCloudCfg({url:'',auto:false})}catch{}

  /* ---------- 8.5.22: conexión con Jaider (código de persona) ---------- */
  // Funciones declaradas y sin usar las const de este bloque: v850 las llama al cargar (V85_ELLA, chat).
  function pubConSt(){try{return JSON.parse(localStorage.getItem('mp_pro_v1')||'{}')||{}}catch{return {}}}
  function pubConectada(){const s=pubConSt();return !!(s.persona&&s.code&&!(Number(s.expiresAt)&&Number(s.expiresAt)<=Date.now()))}
  function pubPuede(k){const s=pubConSt();return pubConectada()&&!!(s.perms&&s.perms[k])}
  function herCode(){return pubPuede('chat')?pubConSt().code:''}
  function herUrl(){return 'https://script.google.com/macros/s/AKfycbwrlaJgyxtAS2uAUG4snTyA6EvFBYG17XtA5brvHYJWEvRL7clCg5lrhV2oILhdMcn7/exec'}
  function kvGet(k){try{return localStorage.getItem(k)||''}catch{return ''}}
  async function herGas(action,extra={},code){
    const r=await nxHttp('POST',herUrl(),{'Content-Type':'text/plain;charset=utf-8'},JSON.stringify({action,code:code||pubConSt().code,app:'ella',...extra}));
    if(r.status<0)throw new Error('Sin conexión. Revisa tu internet.');
    let j;try{j=JSON.parse(r.text)}catch{throw new Error('No se pudo conectar con el servidor.')}
    if(!j.ok){const e=new Error(j.error||'Error del servidor');e.auth=/c[oó]digo|venci|desactivad/i.test(j.error||'');throw e}
    return j;
  }
  // Aviso con la app cerrada (lo agrega la lista de recordatorios de la app)
  function pubPollBody(){const s=pubConSt();return pubConectada()?{url:herUrl(),body:JSON.stringify({action:'pending_notifications',code:s.code,app:'ella'})}:null}
  const pubEsPersona=c=>/^PE[-\s]?[A-Z0-9]{4}/i.test(String(c||'').trim());
  const PUB_PERMS=[['ia','✨','Entrenador con IA y copia en la nube'],['chat','💬','Chat con Jaider'],['msgs','📩','Mensajes y rutinas de Jaider'],['ver','👀','Ver los entrenos de Jaider']];
  const pubVence=st=>Number(st.expiresAt)?`Vence el ${pubFecha(st.expiresAt)}`:'Sin vencimiento';

  /* ---------- Pro: código temporal que valida el Apps Script ---------- */
  function pubProSt(){try{return JSON.parse(localStorage.getItem(PUB_PRO_KEY)||'{}')||{}}catch{return {}}}
  function pubProSave(st){try{localStorage.setItem(PUB_PRO_KEY,JSON.stringify(st))}catch{}try{window.NativeStore?.savePhoto?.('kv_'+PUB_PRO_KEY,JSON.stringify(st))}catch{}}
  // Si borran el almacenamiento web, el código se recupera del almacenamiento nativo
  try{if(!localStorage.getItem(PUB_PRO_KEY)){const n=window.NativeStore?.loadPhoto?.('kv_'+PUB_PRO_KEY);if(n)localStorage.setItem(PUB_PRO_KEY,n)}}catch{}
  // Identificador de este teléfono (aleatorio, sin datos personales): el código Pro queda amarrado a él.
  function pubDevice(){
    let d='';try{d=localStorage.getItem('mp_device_id')||''}catch{}
    if(!d){try{d=window.NativeStore?.loadPhoto?.('kv_mp_device_id')||''}catch{}}
    if(!/^[a-zA-Z0-9_-]{8,64}$/.test(d)){d='d'+Date.now().toString(36)+Array.from({length:3},()=>Math.random().toString(36).slice(2,10)).join('')}
    try{localStorage.setItem('mp_device_id',d)}catch{}try{window.NativeStore?.savePhoto?.('kv_mp_device_id',d)}catch{}
    return d;
  }
  function pubProOn(){const st=pubProSt();if(st.persona)return pubPuede('ia');return !!(st.code&&Number(st.expiresAt)>Date.now())}
  const pubFecha=ts=>new Date(Number(ts)||0).toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'});
  async function pubProCall(action,extra={},code=pubProSt().code){
    if(pubEsPersona(code)){   // 8.5.22: código de persona -> mismas acciones que la app de Ella
      const map={pro_verify:'verify_code',pro_sync:'sync_her_data',pro_get:'get_her_data'};
      return herGas(map[action]||action,{...extra,...(action==='pro_sync'?{keepDaily:true}:{})},code);
    }
    const r=await nxHttp('POST',PUB_PRO_URL,{'Content-Type':'text/plain;charset=utf-8'},JSON.stringify({action,pro:code,device:pubDevice(),...extra}));
    if(r.status<0)throw new Error('Sin conexión. Revisa tu internet.');
    let j;try{j=JSON.parse(r.text)}catch{throw new Error('No se pudo conectar con el servidor.')}
    if(!j.ok){const e=new Error(j.error||'Error del servidor');e.auth=/c[oó]digo pro|venci|desactivado|inv[aá]lido|otro tel/i.test(j.error||'');throw e}
    return j;
  }
  // 8.5.17: con Pro la IA va por el servidor (las claves no llegan al teléfono). j = respuesta de pro_verify, o null al salir de Pro.
  window.__mpAiVia=()=>pubProOn()?(pubProSt().persona?{url:herUrl(),code:pubProSt().code,app:'ella'}:{url:PUB_PRO_URL,pro:pubProSt().code,device:pubDevice()}):null;
  function pubProKeys(j){
    const keys=((j&&j.groqKeys)||[]).filter(k=>/^gsk_/.test(k));
    try{localStorage.setItem('mp_ai_keys_srv_v1',JSON.stringify(keys))}catch{}
    const c=aiCfg();aiSaveCfg({...c,provider:'groq',model:c.provider==='groq'?(c.model||''):'',key:j?(keys[0]||'gsk_servidor'):''});
  }
  function pubProOff(msg){
    const had=!!pubProSt().code,wasCon=!!pubProSt().persona;pubProSave({});pubProKeys(null);
    if(wasCon&&V85_ELLA){if(had&&msg)toast(msg);setTimeout(()=>location.reload(),1500);return}
    if(had&&msg)toast(msg);pubHome();try{if(!$('#settingsModal')?.classList.contains('hidden'))renderSettings()}catch{}
  }
  async function pubProActivate(code,{quiet=false}={}){
    code=String(code||'').trim().toUpperCase();if(!code)throw new Error('Escribe tu código.');
    const j=await pubProCall('pro_verify',{},code);
    const prev=pubProSt();
    if(pubEsPersona(code)){
      if(j.user==='prueba'||j.user==='ella')throw new Error('Ese código es de la app de Ella.');
      pubProSave({...(prev.code===code?prev:{}),code,persona:true,name:j.name||'',user:j.user,app:j.app,perms:j.perms||{},expiresAt:Number(j.expiresAt)||0,verifiedAt:Date.now()});
      pubProKeys(j.perms&&j.perms.ia?j:null);
      if(!quiet){toast('🔗 ¡Conectado con Jaider!');pubHome();pubConPoll(true);if(j.perms&&j.perms.ia)await pubProOfferRestore();if(!V85_ELLA&&pubPrefs().done)setTimeout(()=>location.reload(),900)}
      return j;
    }
    pubProSave({...(prev.code===code?prev:{}),code,name:j.name,expiresAt:j.expiresAt,verifiedAt:Date.now()});pubProKeys(j);
    if(!quiet){toast('✦ ¡Pro activado!');pubHome();await pubProOfferRestore()}
    return j;
  }
  async function pubProVerify(){
    const st=pubProSt();if(!st.code)return;
    if(Number(st.expiresAt)&&Number(st.expiresAt)<=Date.now()){pubProOff((st.persona?'Tu código con Jaider venció':'Tu acceso Pro venció')+'. Sigues con la versión gratis y tus datos están intactos.');return}
    if(!st.persona&&!Number(st.expiresAt))return;
    if(Date.now()-(Number(st.verifiedAt)||0)<6*3600000)return;
    try{await pubProActivate(st.code,{quiet:true});const left=(Number(pubProSt().expiresAt)-Date.now())/86400000;if(left<3)toast(`✦ Tu Pro vence en ${Math.max(1,Math.ceil(left))} día(s).`)}
    catch(e){if(e.auth&&!/sin conexi/i.test(e.message))pubProOff((/otro tel/i.test(e.message)?'Tu código Pro ahora está en otro teléfono':e.message)+' Sigues con la versión gratis y tus datos están intactos.')}
  }
  // Copia en la nube: sube lo que cambió (como mucho cada 3 min) y al salir de la app.
  let pubSyncBusy=false;
  async function pubProSync(force){
    if(!pubProOn()||pubSyncBusy)return false;const st=pubProSt(),saved=Number(data.savedAt)||0;
    if(!force&&(saved<=(Number(st.lastSync)||0)||Date.now()-(Number(st.lastTry)||0)<3*60000))return false;
    pubSyncBusy=true;pubProSave({...st,lastTry:Date.now()});
    try{await pubProCall('pro_sync',{payload:data});pubProSave({...pubProSt(),lastSync:Math.max(saved,1),lastSyncAt:Date.now()});return true}
    catch(e){if(e.auth)pubProOff(e.message+'. Sigues con la versión gratis.');if(force)throw e;return false}
    finally{pubSyncBusy=false}
  }
  async function pubProOfferRestore(){
    try{
      const j=await pubProCall('pro_get');const obj=typeof j.payload==='string'?JSON.parse(j.payload):j.payload;
      const n=(obj&&Array.isArray(obj.workouts))?obj.workouts.length:0;
      if(n>(data.workouts||[]).length&&confirm(`Tienes una copia en la nube del ${pubFecha(Date.parse(j.updatedAt))} con ${n} entrenamiento(s). ¿Recuperarla en este teléfono?`))pubProApply(obj);
    }catch{}
  }
  async function pubProRestore(){
    try{const j=await pubProCall('pro_get');const obj=typeof j.payload==='string'?JSON.parse(j.payload):j.payload;
      if(!obj||!Array.isArray(obj.workouts))throw new Error('La copia no es válida.');
      if(confirm(`¿Reemplazar lo de este teléfono por la copia del ${pubFecha(Date.parse(j.updatedAt))} (${obj.workouts.length} entrenamiento(s))?`))pubProApply(obj);
    }catch(e){toast(e.message||'No se pudo recuperar.')}
  }
  function pubProApply(obj){
    try{saveBackupVersion('Antes de recuperar la copia Pro')}catch{}
    data=migrateData(obj);persist(true);flushNativeSave();pubProSave({...pubProSt(),lastSync:Number(data.savedAt)||Date.now()});
    toast('✓ Copia recuperada');setTimeout(()=>location.reload(),600);
  }
  setInterval(()=>pubProSync(false),60000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){const st=pubProSt();if(pubProOn()&&(Number(data.savedAt)||0)>(Number(st.lastSync)||0))pubProSave({...st,lastTry:0});pubProSync(false)}});

  /* ---------- IA: solo con Pro ---------- */
  const _pubAiAsk=aiAsk,_pubAiVision=aiVision;
  function pubPro(){
    $('#pubPro')?.remove();
    const on=pubProOn(),st=pubProSt();
    if(st.persona&&pubConectada()){
      const P=st.perms||{};
      const b=`<div class="pub-plan" style="margin-bottom:12px"><b>🔗 Conectado con Jaider${st.name?' · '+esc(st.name):''}</b><span>${esc(pubVence(st))}${st.lastSyncAt?` · última copia en la nube: ${esc(new Date(st.lastSyncAt).toLocaleString('es-CO',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}))}`:''}</span></div>
        <ul class="small" style="padding-left:4px;list-style:none;margin:0 0 12px">${PUB_PERMS.map(([k,i,l])=>`<li style="margin:4px 0;${P[k]?'':'opacity:.5'}">${P[k]?'✅':'➖'} ${i} ${esc(l)}</li>`).join('')}</ul>
        ${P.ia?'<div class="modal-actions" style="flex-wrap:wrap"><button class="secondary" style="flex:1" data-pub-pro-sync>☁️ Subir copia ahora</button><button class="secondary" style="flex:1" data-pub-pro-restore>⬇ Recuperar copia</button></div>':''}
        ${P.ver?'<div class="modal-actions"><button class="secondary" style="flex:1" data-pub-jw>🧔 Ver entrenos de Jaider</button></div>':''}
        <div class="modal-actions"><button class="secondary danger" style="flex:1" data-pub-pro-quit>Desconectar este teléfono</button></div>`;
      document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="pubPro" role="dialog" aria-modal="true"><div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0">🔗 Conexión con Jaider</h2><div class="small">Lo que tienes activado</div></div><button class="secondary" data-pub-pro-close>Cerrar</button></div>${b}</div></div>`);
      return;
    }
    const body=on?`<div class="pub-plan" style="margin-bottom:12px"><b>✦ Pro activo${st.name?' · '+esc(st.name):''}</b><span>Vence el ${esc(pubFecha(st.expiresAt))}${st.lastSyncAt?` · última copia en la nube: ${esc(new Date(st.lastSyncAt).toLocaleString('es-CO',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}))}`:''}</span></div>
        <p class="small">Tienes el entrenador con IA y tu copia se guarda sola en la nube.</p>
        <div class="modal-actions" style="flex-wrap:wrap"><button class="secondary" style="flex:1" data-pub-pro-sync>☁️ Subir copia ahora</button><button class="secondary" style="flex:1" data-pub-pro-restore>⬇ Recuperar copia</button></div>
        <div class="modal-actions"><button class="secondary danger" style="flex:1" data-pub-pro-quit>Quitar el código de este teléfono</button></div>`
      :`<p>${esc(PUB_PRO_TXT)}</p><ul class="small" style="padding-left:18px;margin:0 0 12px"><li>Entrenador con IA: arma y ajusta tus rutinas y analiza tus entrenos.</li><li>Copia automática en la nube para no perder nada si cambias de teléfono.</li></ul>
        <label class="small"><b>¿Ya tienes un código?</b></label><input id="pubProCode" autocomplete="off" autocapitalize="characters" placeholder="Tu código" style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:700 17px monospace;letter-spacing:.08em;margin:6px 0 4px"><p class="small" id="pubProErr" style="color:#ffb4a2;min-height:18px;margin:0"></p>
        <div class="modal-actions"><button class="primary" style="flex:1" data-pub-pro-go>Activar Pro</button></div>
        <p class="small">Todo lo demás es gratis y sin límites: rutinas, series, descansos, récords, comidas, peso y fotos. Tus datos se quedan en tu teléfono.</p>`;
    document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="pubPro" role="dialog" aria-modal="true"><div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0">✦ Mi Progreso Pro</h2><div class="small">${on?'Activo':'Funciones de pago'}</div></div><button class="secondary" data-pub-pro-close>Cerrar</button></div>${body}</div></div>`);
  }
  openAiModal=function(){pubPro()};
  aiAsk=async function(){if(pubProOn())return _pubAiAsk.apply(this,arguments);pubPro();throw new Error('Función Pro')};
  aiVision=async function(){if(pubProOn())return _pubAiVision.apply(this,arguments);pubPro();throw new Error('Función Pro')};
  async function pubProGo(inputSel,errSel,btn){
    const code=($(inputSel)?.value||'').trim(),err=$(errSel);if(!code){$(inputSel)?.focus();return false}
    if(btn){btn.disabled=true;btn.dataset.t=btn.textContent;btn.textContent='Verificando…'}if(err)err.textContent='';
    try{await pubProActivate(code);return true}
    catch(e){if(err)err.textContent=/otro tel/i.test(e.message||'')?'Este código ya se está usando en otro teléfono. Si cambiaste de teléfono, pídele a quien te lo dio que lo libere.':e.auth?(e.message||'Código inválido'):(e.message||'No se pudo verificar.');return false}
    finally{if(btn){btn.disabled=false;btn.textContent=btn.dataset.t||'Activar'}}
  }
  document.addEventListener('click',async e=>{
    const t=e.target;
    if(t.closest('[data-pub-pro-close]')){$('#pubPro')?.remove();return}
    if(t.closest('[data-pub-pro-go]')){if(await pubProGo('#pubProCode','#pubProErr',t.closest('button'))){$('#pubPro')?.remove()}return}
    if(t.closest('[data-pub-pro-sync]')){const b=t.closest('button');b.disabled=true;try{await pubProSync(true);toast('☁️ Copia guardada en la nube')}catch(er){toast(er.message||'No se pudo subir.')}pubPro();return}
    if(t.closest('[data-pub-pro-restore]')){pubProRestore();return}
    if(t.closest('[data-pub-pro-quit]')){if(confirm(pubProSt().persona?'¿Desconectar este teléfono de Jaider? Tus datos se quedan.':'¿Quitar el código Pro de este teléfono? Tus datos se quedan.')){pubProOff('Código quitado.');$('#pubPro')?.remove()}return}
    if(t.closest('[data-pub-jw]')){e.stopPropagation();$('#pubPro')?.remove();pubJaiderOpen();return}
    if(t.closest('#aiBtn')){e.preventDefault();e.stopImmediatePropagation();pubPro();return}
    if(!pubProOn()&&t.closest('#aiTrainingBtn,[data-ai],[data-ai-plan],[data-ai-routine]')){e.preventDefault();e.stopImmediatePropagation();pubPro()}
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='pubProCode'){e.preventDefault();$('[data-pub-pro-go]')?.click()}});

  /* ---------- Cuestionario inicial y plan genérico ---------- */
  function pubPrefs(){data.settings=data.settings||{};return data.settings.publica=Object.assign({done:false,name:'',goal:'',level:'',days:0,place:'',prio:[],creatina:false},data.settings.publica||{})}
  const PUB_GOALS={musculo:['💪','Ganar músculo','Hipertrofia: más tamaño y forma'],fuerza:['🏋️','Ganar fuerza','Levantar más en los básicos'],grasa:['🔥','Bajar grasa','Mantener el músculo mientras bajas'],salud:['❤️','Salud y energía','Moverte mejor y sentirte bien']};
  const PUB_LEVELS={nuevo:['🌱','Estoy empezando','Menos de 6 meses entrenando'],medio:['📈','Ya entreno','Entre 6 meses y 2 años'],avanzado:['🔥','Avanzado','Más de 2 años constante']};
  const PUB_PLACES={gym:['🏢','Gimnasio','Máquinas, poleas y pesas'],casa:['🏠','Casa con mancuernas','Un par de mancuernas o ajustables'],libre:['🤸','Sin equipo','Solo con tu peso corporal']};
  const PUB_PRIO=['Pecho','Espalda','Hombros','Brazos','Glúteos','Piernas','Abdomen'];
  // Ejercicio de cada "hueco" según el lugar. [nombre, grupo, compuesto?]
  const PUB_EX={
    gym:{pecho:['Press inclinado con mancuernas','Pecho',1],pecho2:['Aperturas / Pec Deck','Pecho',0],hombro:['Press de hombro en máquina','Hombro',1],lateral:['Elevaciones laterales con mancuernas','Hombro',0],jalon:['Jalón al pecho','Espalda',1],remo:['Remo sentado en polea','Espalda',1],post:['Face pull','Hombro posterior',0],biceps:['Curl con mancuernas','Bíceps',0],triceps:['Tríceps en polea','Tríceps',0],cuad:['Prensa','Cuádriceps/Glúteo',1],cuad2:['Extensión de cuádriceps','Cuádriceps',0],bisagra:['Peso muerto rumano con mancuernas','Femoral/Glúteo',1],femoral:['Femoral sentado','Femoral',0],gluteo:['Hip thrust en máquina','Glúteo',1],aductor:['Aductores','Aductores',0],pantorrilla:['Pantorrilla','Pantorrilla',0],abdomen:['Crunch en polea','Abdomen',0]},
    casa:{pecho:['Press inclinado con mancuernas','Pecho',1],pecho2:['Aperturas con mancuernas','Pecho',0],hombro:['Press militar con mancuernas','Hombro',1],lateral:['Elevaciones laterales con mancuernas','Hombro',0],jalon:['Pullover con mancuerna','Espalda',0],remo:['Remo con mancuerna a una mano','Espalda',1],post:['Apertura inversa con mancuernas','Hombro posterior',0],biceps:['Curl con mancuernas','Bíceps',0],triceps:['Extensión con mancuerna sobre cabeza','Tríceps',0],cuad:['Sentadilla goblet','Cuádriceps/Glúteo',1],cuad2:['Zancadas con mancuernas','Cuádriceps',1],bisagra:['Peso muerto rumano con mancuernas','Femoral/Glúteo',1],femoral:['Puente de glúteo a una pierna','Femoral/Glúteo',0],gluteo:['Hip thrust con mancuerna','Glúteo',1],aductor:['Sentadilla sumo','Aductores/Glúteo',1],pantorrilla:['Pantorrilla de pie con mancuerna','Pantorrilla',0],abdomen:['Elevación de piernas','Abdomen',0]},
    libre:{pecho:['Flexiones','Pecho',1],pecho2:['Flexiones inclinadas','Pecho',0],hombro:['Flexiones pica','Hombro',1],lateral:['Fondos entre sillas','Tríceps',1],jalon:['Remo invertido bajo una mesa','Espalda',1],remo:['Remo con toalla en la puerta','Espalda',1],post:['Superman','Espalda',0],biceps:['Curl con toalla','Bíceps',0],triceps:['Flexiones diamante','Tríceps',0],cuad:['Sentadilla con peso corporal','Cuádriceps/Glúteo',1],cuad2:['Zancadas','Cuádriceps',1],bisagra:['Peso muerto a una pierna','Femoral/Glúteo',1],femoral:['Puente de glúteo a una pierna','Femoral/Glúteo',0],gluteo:['Glute bridge','Glúteo',1],aductor:['Sentadilla sumo','Aductores/Glúteo',1],pantorrilla:['Pantorrilla de pie','Pantorrilla',0],abdomen:['Plancha','Abdomen',0]}
  };
  const PUB_SPLITS={
    2:[['Cuerpo completo A',['cuad','pecho','remo','bisagra','lateral','abdomen']],['Cuerpo completo B',['gluteo','hombro','jalon','cuad2','biceps','triceps']]],
    3:[['Cuerpo completo A',['cuad','pecho','remo','femoral','lateral','abdomen']],['Cuerpo completo B',['bisagra','hombro','jalon','cuad2','biceps','triceps']],['Cuerpo completo C',['gluteo','pecho','remo','aductor','post','pantorrilla']]],
    4:[['Torso A',['pecho','remo','hombro','jalon','biceps','triceps']],['Pierna A',['cuad','bisagra','cuad2','femoral','pantorrilla','abdomen']],['Torso B',['jalon','pecho','remo','lateral','post','biceps']],['Pierna B',['gluteo','cuad','femoral','aductor','pantorrilla','abdomen']]],
    5:[['Torso',['pecho','remo','hombro','jalon','biceps','triceps']],['Pierna',['cuad','bisagra','cuad2','femoral','pantorrilla']],['Empuje',['pecho','hombro','pecho2','lateral','triceps','abdomen']],['Tirón',['jalon','remo','post','biceps','biceps']],['Pierna y glúteo',['gluteo','cuad','femoral','aductor','pantorrilla','abdomen']]],
    6:[['Empuje A',['pecho','hombro','pecho2','lateral','triceps']],['Tirón A',['jalon','remo','post','biceps']],['Pierna A',['cuad','bisagra','cuad2','pantorrilla','abdomen']],['Empuje B',['hombro','pecho','lateral','pecho2','triceps']],['Tirón B',['remo','jalon','post','biceps']],['Pierna B',['gluteo','cuad','femoral','aductor','abdomen']]]
  };
  const PUB_DAYS={2:[1,4],3:[1,3,5],4:[1,2,4,5],5:[1,2,3,5,6],6:[1,2,3,4,5,6]};
  const PUB_PRIO_SLOTS={Pecho:['pecho','pecho2'],Espalda:['jalon','remo'],Hombros:['hombro','lateral','post'],Brazos:['biceps','triceps'],Glúteos:['gluteo','bisagra'],Piernas:['cuad','cuad2','femoral'],Abdomen:['abdomen']};
  function pubDose(goal,level,comp){
    const nuevo=level==='nuevo';
    let d=goal==='fuerza'?(comp?{sets:4,reps:'4–6',rir:'2',rest:210}:{sets:3,reps:'8–10',rir:'1–2',rest:120})
      :goal==='grasa'?(comp?{sets:3,reps:'8–12',rir:'2',rest:120}:{sets:3,reps:'12–15',rir:'1–2',rest:75})
      :goal==='salud'?(comp?{sets:3,reps:'10–12',rir:'2–3',rest:120}:{sets:2,reps:'12–15',rir:'2',rest:75})
      :(comp?{sets:3,reps:'8–12',rir:'1–2',rest:150}:{sets:3,reps:'10–15',rir:'1',rest:90});
    d={...d};if(nuevo){d.sets=Math.min(d.sets,3);d.rir=comp?'2–3':'2'}
    if(level==='avanzado'&&comp&&goal!=='salud')d.sets=Math.min(5,d.sets+1);
    return d;
  }
  function pubBuildPlan(p){
    const lib=PUB_EX[p.place]||PUB_EX.gym,split=PUB_SPLITS[p.days]||PUB_SPLITS[3],days=PUB_DAYS[p.days]||PUB_DAYS[3];
    const prioSlots=new Set((p.prio||[]).flatMap(x=>PUB_PRIO_SLOTS[x]||[]));
    return days.map((day,i)=>{
      const [title,slots]=split[i%split.length],items=[],presc={};
      slots.forEach(sl=>{const ex=lib[sl];if(!ex)return;let name=ex[0];if(items.includes(name)){const alt={biceps:'Curl martillo',pecho:'Press de pecho en máquina'}[sl];if(!alt||p.place!=='gym'||items.includes(alt))return;name=alt}
        items.push(name);const d=pubDose(p.goal,p.level,!!ex[2]);if(prioSlots.has(sl))d.sets=Math.min(5,d.sets+1);presc[name]=d});
      return {day,title:`${DAY_NAMES[day]} · ${title}`,items,prescription:presc};
    });
  }
  function pubEnsureExercises(place){
    const lib=PUB_EX[place]||PUB_EX.gym;
    Object.values(lib).forEach(([name,group])=>{if(!CATALOG_BY_NAME.has(name))createCustomExercise(name,group,place==='libre'?'Peso corporal':place==='casa'?'Mancuernas':'')});
  }
  function pubApplyPlan(p){
    pubEnsureExercises(p.place);
    const plan=pubBuildPlan(p);
    for(const [id,r] of Object.entries(data.customRoutines||{}))if(r&&r.pub)delete data.customRoutines[id];
    data.customRoutines=data.customRoutines||{};
    for(let d=1;d<=7;d++){
      const r=plan.find(x=>x.day===d);
      data.customRoutines['pub'+d]=r?{title:r.title,day:String(d),items:r.items,prescription:r.prescription,pub:true}:{title:`${DAY_NAMES[d]} · Descanso`,day:String(d),items:[],prescription:{},pub:true};
    }
    data.settings.hideBuiltinRoutines=true;
    rebuildRoutines();persist();
  }
  const PUB_TIPS={
    general:['Anota cada serie: peso, repeticiones y qué tan cerca quedaste del fallo (RIR). Así sabes cuándo subir.','Sube el peso cuando completes el tope de repeticiones en todas las series con buena técnica.','Calienta con 1 o 2 series ligeras del primer ejercicio antes de las series de verdad.','Dormir 7 a 9 horas pesa tanto como el entreno para progresar.','La constancia gana: mejor 3 días cada semana que 6 días una semana y ninguno la siguiente.','Si una máquina está ocupada, cambia el orden o usa “Sustituir” en vez de saltarte el ejercicio.','Toma agua durante el entreno y come proteína en cada comida del día.','Si algo duele (no es cansancio, es dolor), para ese ejercicio y cámbialo por una variante.'],
    musculo:['Para ganar músculo, deja 1 o 2 repeticiones en reserva y trata de superar tu marca poco a poco.','Come un poco por encima de lo que gastas y reparte la proteína en el día.'],
    fuerza:['En los básicos descansa más (3 minutos o más): rinde mejor la siguiente serie.','Cuida la técnica antes que el peso: la fuerza se construye con repeticiones limpias.'],
    grasa:['Para bajar grasa, sigue entrenando pesado: es lo que conserva tu músculo mientras comes menos.','Camina más en el día: suma mucho sin quitarle energía al entreno.'],
    salud:['Lo importante es moverte seguido: aunque sea una sesión corta, cuenta.','Suma estiramientos suaves al final si te sientes rígido.']
  };
  function pubTipsFor(p,n=3){
    const g=PUB_TIPS[p.goal]||[],G=PUB_TIPS.general.filter(t=>p.place!=='libre'||!/sube el peso/i.test(t)),k=Math.floor(Date.now()/86400000);
    if(n===1)return [(k%2&&g.length)?g[k%g.length]:G[k%G.length]];
    return [...g.slice(0,1),...Array.from({length:n},(_,i)=>G[(k+i)%G.length])].slice(0,n);
  }

  let pubOn={i:0,a:null};
  const PUB_STEPS=['hi','code','name','goal','level','days','place','prio','creatina','done'];
  function pubGateEl(){let g=$('#pubGate');if(!g){document.body.insertAdjacentHTML('beforeend','<div class="pub-gate" id="pubGate" role="dialog" aria-modal="true"></div>');g=$('#pubGate')}return g}
  function pubShowOnboarding(){const p=pubPrefs();pubOn={i:0,a:{name:p.name||'',goal:p.goal||'',level:p.level||'',days:p.days||0,place:p.place||'',prio:(p.prio||[]).slice(),creatina:!!p.creatina}};pubRender()}
  function pubOpts(key,map){return `<div class="pub-opts">${Object.entries(map).map(([k,[ic,t,s]])=>`<button data-pub-pick="${key}" data-v="${k}" class="${pubOn.a[key]===k?'on':''}"><span style="font-size:24px">${ic}</span><span><b>${esc(t)}</b><span>${esc(s)}</span></span></button>`).join('')}</div>`}
  function pubRender(){
    const k=PUB_STEPS[pubOn.i],a=pubOn.a,dots=`<div class="pub-dots">${PUB_STEPS.map((_,i)=>`<i class="${i<=pubOn.i?'on':''}"></i>`).join('')}</div>`;
    let h='';
    if(k==='hi')h=`<div class="pub-q">💪</div><h1>Bienvenido a Mi Progreso</h1><p>Te hago 6 preguntas rápidas y te armo una rutina para empezar. Todo se guarda solo en tu teléfono.</p><button class="pub-btn" data-pub-next>Empezar</button>`;
    if(k==='code'&&pubConectada())h=`<div class="pub-q">🔗</div><h1>¡Conectado con Jaider!</h1><p>${PUB_PERMS.filter(([x])=>pubPuede(x)).map(([,i,l])=>i+' '+esc(l)).join('<br>')||'Tu código está activo.'}</p><button class="pub-btn" data-pub-next>Continuar</button>`;
    else if(k==='code')h=pubProOn()?`<div class="pub-q">✦</div><h1>¡Pro activo!</h1><p>Tienes el entrenador con IA y la copia en la nube${pubProSt().name?', '+esc(pubProSt().name):''}. Vence el ${esc(pubFecha(pubProSt().expiresAt))}.</p><button class="pub-btn" data-pub-next>Continuar</button>`
      :`<div class="pub-q">🔑</div><h1>¿Tienes un código de acceso?</h1><p>Si te dieron un código, escríbelo para activar lo que te hayan dado (entrenador con IA, copia en la nube, chat…). Si no, sigue gratis.</p><input id="pubOnbCode" autocomplete="off" autocapitalize="characters" placeholder="Tu código" style="font-family:monospace;font-weight:700;letter-spacing:.08em"><p class="small" id="pubOnbErr" style="color:#ffb4a2;min-height:18px;margin:-6px 0 6px"></p><button class="pub-btn" data-pub-code-go>Activar</button><button class="pub-ghost" data-pub-next style="margin-top:4px">No tengo código, seguir gratis</button>`;
    if(k==='name')h=`<div class="pub-q">👋</div><h1>¿Cómo te llamas?</h1><p>Opcional, para saludarte.</p><input id="pubName" maxlength="30" autocomplete="off" value="${esc(a.name)}" placeholder="Tu nombre"><button class="pub-btn" data-pub-next>Continuar</button>`;
    if(k==='goal')h=`<div class="pub-q">🎯</div><h1>¿Cuál es tu objetivo principal?</h1>${pubOpts('goal',PUB_GOALS)}`;
    if(k==='level')h=`<div class="pub-q">📊</div><h1>¿Cuánta experiencia tienes?</h1>${pubOpts('level',PUB_LEVELS)}`;
    if(k==='days')h=`<div class="pub-q">📅</div><h1>¿Cuántos días por semana puedes entrenar?</h1><p>Elige lo que de verdad puedas sostener.</p><div class="pub-opts row5">${[2,3,4,5,6].map(d=>`<button data-pub-pick="days" data-v="${d}" class="${a.days===d?'on':''}">${d}</button>`).join('')}</div>`;
    if(k==='place')h=`<div class="pub-q">📍</div><h1>¿Dónde vas a entrenar?</h1>${pubOpts('place',PUB_PLACES)}`;
    if(k==='prio')h=`<div class="pub-q">⭐</div><h1>¿Qué quieres mejorar más?</h1><p>Opcional. Le doy una serie extra a esos músculos.</p><div class="pub-chips">${PUB_PRIO.map(x=>`<button data-pub-prio="${esc(x)}" class="${a.prio.includes(x)?'on':''}">${esc(x)}</button>`).join('')}</div><button class="pub-btn" data-pub-next>${a.prio.length?'Continuar':'Ninguno en especial'}</button>`;
    if(k==='creatina')h=`<div class="pub-q">💊</div><h1>¿Tomas creatina u otro suplemento diario?</h1><p>Si dices que sí, en Inicio tendrás un botón para marcarla cada día.</p><div class="pub-opts"><button data-pub-pick="creatina" data-v="no" class="${a.creatina===false&&pubOn.i>0&&a._c?'on':''}"><span style="font-size:24px">➖</span><span><b>No, gracias</b></span></button><button data-pub-pick="creatina" data-v="si" class="${a.creatina?'on':''}"><span style="font-size:24px">✅</span><span><b>Sí, quiero marcarla</b></span></button></div>`;
    if(k==='done'){const plan=pubBuildPlan(a);h=`<div class="pub-q">✨</div><h1>${a.name?esc(a.name)+', tu':'Tu'} plan está listo</h1><p>${esc(PUB_GOALS[a.goal]?.[1]||'')} · ${a.days} días · ${esc(PUB_PLACES[a.place]?.[1]||'')}</p>${plan.map(r=>`<div class="pub-plan"><b>${esc(r.title)}</b><span>${r.items.map(esc).join(' · ')}</span></div>`).join('')}<p class="small" style="margin-top:10px"><b>Consejos para empezar:</b><br>${pubTipsFor(a,3).map(t=>'• '+esc(t)).join('<br>')}</p><p class="small">Puedes cambiar ejercicios y series en Entrenar → “Crear o editar mis rutinas”, o repetir este cuestionario en Ajustes ⚙.</p><button class="pub-btn" data-pub-finish>¡A entrenar! 💪</button>`}
    pubGateEl().innerHTML=`<div class="pub-card">${dots}${h}${pubOn.i>0?'<button class="pub-ghost" data-pub-back>Atrás</button>':(pubPrefs().done?'<button class="pub-ghost" data-pub-cancel>Cancelar</button>':'')}</div>`;
  }
  function pubNext(){const k=PUB_STEPS[pubOn.i];if(k==='name')pubOn.a.name=($('#pubName')?.value||'').trim().slice(0,30);pubOn.i=Math.min(PUB_STEPS.length-1,pubOn.i+1);pubRender();$('#pubGate')?.scrollTo(0,0)}
  function pubFinish(){
    const p=pubPrefs(),a=pubOn.a;delete a._c;Object.assign(p,{...a,done:true});try{renderToday()}catch{}
    pubApplyPlan(p);$('#pubGate')?.remove();pubHome();toast('✓ Rutina lista. Ve a Entrenar para empezar.');
    if(pubConectada()&&!V85_ELLA)setTimeout(()=>location.reload(),1200);   // para encender el chat
  }
  document.addEventListener('click',e=>{
    const t=e.target;
    if(t.closest('[data-pub-next]')){pubNext();return}
    if(t.closest('[data-pub-back]')){pubOn.i=Math.max(0,pubOn.i-1);pubRender();return}
    if(t.closest('[data-pub-cancel]')){$('#pubGate')?.remove();return}
    const pk=t.closest('[data-pub-pick]');if(pk){const key=pk.dataset.pubPick;pubOn.a[key]=key==='days'?Number(pk.dataset.v):key==='creatina'?pk.dataset.v==='si':pk.dataset.v;if(key==='creatina')pubOn.a._c=1;pubRender();setTimeout(pubNext,180);return}
    const pr=t.closest('[data-pub-prio]');if(pr){const v=pr.dataset.pubPrio,L=pubOn.a.prio;const i=L.indexOf(v);if(i>=0)L.splice(i,1);else L.push(v);pubRender();return}
    if(t.closest('[data-pub-finish]')){pubFinish();return}
    if(t.closest('[data-pub-code-go]')){pubProGo('#pubOnbCode','#pubOnbErr',t.closest('button')).then(ok=>{if(ok&&$('#pubGate')){if(pubPrefs().done)$('#pubGate')?.remove();else pubNext()}});return}
    if(t.closest('[data-pub-redo]')){try{closeM('settingsModal')}catch{}pubShowOnboarding();return}
    if(t.closest('[data-pub-pro]')){pubPro();return}
    if(t.closest('[data-pub-hide-pro]')){pubPrefs().hidePro=true;persist(true);$('#pubProCard')?.remove();return}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='pubName'){e.preventDefault();pubNext()}if(e.key==='Enter'&&e.target.id==='pubOnbCode'){e.preventDefault();$('[data-pub-code-go]')?.click()}});

  /* ---------- Inicio: consejo del día y Pro ---------- */
  function pubHome(){
    const home=$('#home');if(!home)return;const p=pubPrefs();
    $('#pubTipCard')?.remove();$('#pubProCard')?.remove();$('#pubMsgCard')?.remove();$('#pubRtCard')?.remove();
    if(!p.done)return;
    const anchor=home.querySelector('.hero');
    const tip=`<div class="card pub-tip" id="pubTipCard"><strong>💡 Consejo del día${p.name?' para '+esc(p.name):''}</strong><p class="small" style="margin:6px 0 0">${esc(pubTipsFor(p,1)[0])}</p></div>`;
    const con=pubConectada()?`<div class="card pub-pro" id="pubProCard" data-pub-pro role="button" style="cursor:pointer"><strong>🔗 Conectado con Jaider</strong><span class="small"> · ${esc(pubVence(pubProSt()))}</span>${pubPuede('ver')?'<div style="margin-top:8px"><button class="secondary" data-pub-jw style="margin:0">🧔 Entrenos de Jaider</button></div>':''}</div>`:'';
    const pro=con?con+pubMsgHtml():pubProOn()?`<div class="card pub-pro" id="pubProCard" data-pub-pro role="button" style="cursor:pointer"><strong>✦ Pro activo</strong><span class="small"> · vence el ${esc(pubFecha(pubProSt().expiresAt))}</span></div>`:p.hidePro?'':`<div class="card pub-pro" id="pubProCard"><div class="row between"><strong>✦ ¿Quieres un entrenador con IA?</strong><button class="linkbtn" data-pub-hide-pro aria-label="Ocultar">✕</button></div><p class="small" style="margin:6px 0 10px">Rutinas que se ajustan solas, análisis de tus entrenos y copia en la nube. Es de pago.</p><button class="secondary" data-pub-pro>Ver qué incluye</button></div>`;
    if(anchor)anchor.insertAdjacentHTML('afterend',tip+pro);else home.insertAdjacentHTML('afterbegin',tip+pro);
  }

  /* ---------- Ajustes: quitar lo que es de nuestras apps y agregar "Mi plan" ---------- */
  const _rsPub=renderSettings;
  renderSettings=function(){
    const r=_rsPub.apply(this,arguments);
    try{
      const box=$('#settingsContent');if(!box)return r;
      box.querySelectorAll('details.settings-group').forEach(d=>{const s=(d.querySelector('summary')?.textContent||'');if(/drive|nube|ella|jaider|pareja|compartid|motivaci|claves de ia|chat/i.test(s)&&!(herCode()&&/chat/i.test(s)))d.remove()});
      box.querySelectorAll('[data-hm-share],[data-hm-open]').forEach(x=>x.closest('label,div')?.remove());
      const p=pubPrefs();
      box.insertAdjacentHTML('afterbegin',`<details class="settings-group" open><summary>🎯 Mi plan</summary><div class="settings-section"><p class="small" style="margin-top:0">${p.done?`${esc(PUB_GOALS[p.goal]?.[1]||'')} · ${p.days} días · ${esc(PUB_PLACES[p.place]?.[1]||'')}`:'Aún no has hecho el cuestionario.'}</p><button class="secondary" data-pub-redo>Rehacer el cuestionario</button><p class="small">Al rehacerlo se reemplazan las rutinas que armó la app (las tuyas no se tocan). Tu historial no cambia.</p></div></details>
        <div class="v85-share" style="border-style:dashed"><span style="font-size:28px">✦</span><div class="t"><b>${pubConectada()?'🔗 Conectado con Jaider':'Mi Progreso Pro'}</b><span class="small">${pubConectada()?esc(pubVence(pubProSt())):pubProOn()?`Activo · vence el ${esc(pubFecha(pubProSt().expiresAt))}`:'IA y copia en la nube (de pago). Aquí escribes tu código.'}</span></div><button class="secondary" data-pub-pro>${pubProOn()||pubConectada()?'Ver':'Código'}</button></div>`);
    }catch(e){console.error(e)}
    return r;
  };
  // Creatina: solo si la persona dijo que la toma
  const _rtPub=renderToday;
  renderToday=function(){
    const r=_rtPub.apply(this,arguments);
    try{if(!pubPrefs().creatina){const host=$('#todayBox');host?.querySelector('[data-creatine-day]')?.remove();const sp=host?.querySelector('.today-card .row .small');if(sp)sp.textContent=`${host.querySelectorAll('.today-item.ok').length}/3 listos`}}catch{}
    return r;
  };
  const _rnaPub=runNativeAction;
  runNativeAction=function(a){if(a==='go:chat'&&herCode()){v85OpenChat('');return}if(a==='partner'||a==='go:requests'||a==='go:food'||a.startsWith('go:chat'))return go('home');return _rnaPub(a)};

  /* ---------- 8.5.22: mensajes, rutinas y entrenos de Jaider (según lo que tenga activado) ---------- */
  let pubMsgs=[],pubConAt=0;
  function pubMsgHtml(){
    const m=pubMsgs[0];if(!m)return '';
    return `<div class="card pub-msg" id="pubMsgCard"><strong>📩 Mensaje de Jaider${pubMsgs.length>1?` (${pubMsgs.length})`:''}</strong><p style="margin:6px 0 0;white-space:pre-wrap">${esc(m.text||'')}</p>
      <div class="rx">${['💪','🔥','👍','🙌'].map(x=>`<button class="secondary" data-pub-rx="${esc(m.id)}" data-e="${x}">${x}</button>`).join('')}<button class="secondary" data-pub-read="${esc(m.id)}">Leído</button></div></div>`;
  }
  async function pubConPoll(force){
    if(!pubConectada()||(!force&&Date.now()-pubConAt<60000))return;pubConAt=Date.now();
    if(pubPuede('msgs')){
      try{const j=await herGas('get_messages');pubMsgs=(j.messages||[]).filter(m=>m&&!m.read);pubHome()}catch{}
      try{
        const j=await herGas('get_routines');const got=[];let fresh=0;data.settings=data.settings||{};data.customRoutines=data.customRoutines||{};
        for(const r of j.routines||[]){
          if(!r||!Array.isArray(r.items)||!r.items.length)continue;
          const imp=data.settings.jrImported=data.settings.jrImported||[];got.push(String(r.id));if(imp.includes(String(r.id)))continue;imp.push(String(r.id));fresh++;
          const id='jr_'+String(r.id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40),prescription={};
          for(const n of r.items){const q=r.prescription?.[n]||{};let rest=120;try{rest=Number(catalogEntry(n).rest)||120}catch{}prescription[n]={sets:Number(q.sets)||3,reps:String(q.reps||'8–12'),rir:String(q.rir||'1–2'),rest}}
          data.customRoutines[id]={title:String(r.title||'Rutina de Jaider').slice(0,60),day:'',items:r.items.slice(0,20),prescription,fromJaider:true,note:String(r.note||''),createdAt:Date.now()};
        }
        if(got.length){try{rebuildRoutines()}catch{}persist(true);if(fresh)toast(fresh>1?`🧔 Jaider te mandó ${fresh} rutinas: están en Entrenar`:'🧔 Jaider te armó una rutina: está en Entrenar');try{await herGas('ack_routine',{ids:got})}catch{}}
      }catch{}
    }
  }
  async function pubMsgDone(id,emoji){
    pubMsgs=pubMsgs.filter(m=>String(m.id)!==String(id));pubHome();
    try{if(emoji){await herGas('send_reply',{id:String(id),emoji,text:''});toast(`Le enviaste ${emoji}`)}else await herGas('mark_read',{ids:[String(id)]})}catch{toast('Sin conexión: no se pudo enviar.')}
  }
  async function pubJaiderOpen(){
    $('#pubJw')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="pubJw" role="dialog" aria-modal="true"><div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0">🧔 Entrenos de Jaider</h2><div class="small">Solo para ver</div></div><button class="secondary" data-pub-jw-close>Cerrar</button></div><div id="pubJwB" style="overflow:auto;max-height:70vh"><p class="small">Cargando…</p></div></div></div>`);
    try{
      const j=await herGas('get_my_data');
      const W=((j.payload&&j.payload.workouts)||[]).filter(w=>w&&w.date).sort((a,b)=>b.date.localeCompare(a.date)||(b.createdAt||0)-(a.createdAt||0)).slice(0,20);
      const set=s=>`${s.load!==''&&s.load!=null&&Number(s.load)?String(s.load).replace('.',',')+(s.unit==='lb'?' lb':' kg')+' × ':''}${(Number(s.solo??s.reps)||0)+(Number(s.assisted)||0)}`;
      const b=$('#pubJwB');if(b)b.innerHTML=W.length?W.map(w=>`<div class="pub-jw"><b>${esc(w.title||'Entrenamiento')}</b><span>${esc(new Date(w.date+'T12:00:00').toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'short'}))}</span>${(w.exercises||[]).map(e=>`<div class="small" style="margin-top:4px"><b style="display:inline">${esc(e.name||'')}</b>: ${(e.sets||[]).filter(s=>s&&s.type!=='warmup').map(set).join(' · ')||'—'}</div>`).join('')}</div>`).join(''):'<p class="small">Aún no hay entrenos.</p>';
    }catch(e){const b=$('#pubJwB');if(b)b.innerHTML=`<p class="small">⚠ ${esc(e.message||'No se pudo cargar.')}</p>`}
  }
  document.addEventListener('click',e=>{
    const t=e.target;if(!t.closest)return;
    const rx=t.closest('[data-pub-rx]');if(rx){e.stopPropagation();pubMsgDone(rx.dataset.pubRx,rx.dataset.e);return}
    const rd=t.closest('[data-pub-read]');if(rd){e.stopPropagation();pubMsgDone(rd.dataset.pubRead,'');return}
    if(t.closest('[data-pub-jw-close]')){$('#pubJw')?.remove();return}
  },true);
  setInterval(()=>pubConPoll(false),60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)pubConPoll(false)});
  setTimeout(()=>pubConPoll(true),3000);

  setTimeout(()=>{$('#adminGate')?.remove();try{renderToday()}catch{}if(!pubPrefs().done)pubShowOnboarding();else pubHome();pubProVerify()},60);
  setInterval(pubProVerify,30*60000);
  const _pubGo=go;go=function(s){const r=_pubGo.apply(this,arguments);if(s==='home')setTimeout(pubHome,30);return r};

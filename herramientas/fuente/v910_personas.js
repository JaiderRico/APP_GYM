  /* ===================== v8.5.21 (+8.5.22 app y permisos) (solo app de Jaider): varias personas ===================== */
  // 8.5.22: al crear una persona se elige su app ('ella' = la rosa, 'libre' = la pública, que con el código se conecta),
  // sus permisos (ver tus entrenos, chat, mensajes y rutinas, IA + copia en la nube) y si vence. Backend v24.
  // Jaider crea personas (Ajustes → 👥 Personas): cada una recibe su código PE-XXXX-XXXX y usa la app de Ella con sus
  // datos aparte (backend v23). "Persona actual" (mp_persona_v1: '' = Ella) decide con quién trabajan el seguimiento,
  // el chat, los snacks, los pedidos y "Mensajes y rutinas": gas() le agrega user:<id>. La libre lo trae apagado.
  // Va antes de initV7(), después de v900, en el index.html de Jaider.
  const V91_ON=!(typeof MP_PUBLICA!=='undefined'&&MP_PUBLICA)&&!MP_APK_IS_ELLA;
  const V91_KEY='mp_persona_v1',V91_LIST='mp_personas_v1';
  // Funciones declaradas (no const) para poder usarlas desde los bloques anteriores sin importar el orden.
  function mpPersonas(){try{const l=JSON.parse(localStorage.getItem(V91_LIST)||'[]');return Array.isArray(l)?l:[]}catch{return []}}
  function mpPersona(){if(!V91_ON)return '';let id='';try{id=localStorage.getItem(V91_KEY)||''}catch{}return id&&mpPersonas().some(p=>p.id===id&&!p.revoked)?id:''}  // (vencidas: se pueden seguir viendo)
  function mpPersonaName(){const id=mpPersona();if(!id)return '';const p=mpPersonas().find(x=>x.id===id);return p?p.name:''}
  function mpPersonaArg(){const id=mpPersona();return id?{user:id}:{}}
  function mpPersonaSfx(){const id=mpPersona();return id?'_'+id:''}
  // 8.5.22: datos de la persona actual (null = Ella) y si tiene un permiso (Ella: todo)
  function mpPersonaRec(){const id=mpPersona();return id?(mpPersonas().find(x=>x.id===id)||null):null}
  function mpPersonaPuede(k){const p=mpPersonaRec();if(!p)return true;const pr=p.perms||{};return k==='ver'?(pr.ver!==undefined?pr.ver!==false:p.share!==false):pr[k]!==false}
  function mpPersonaLibre(){const p=mpPersonaRec();return !!(p&&p.app==='libre')}
  const v91={busy:false,err:'',loaded:false,edit:'',app:'ella',perms:{ver:true,chat:true,msgs:true,ia:true},days:0};
  const V91_PERMS=[['ver','👀','Ver mis entrenos'],['chat','💬','Chat conmigo'],['msgs','📩','Mensajes y rutinas'],['ia','✨','IA y copia en la nube']];
  const V91_DAYS=[[0,'No vence'],[30,'30 días'],[90,'3 meses'],[180,'6 meses'],[365,'1 año']];
  const v91Perms=p=>{const pr=Object.assign({ver:p.share!==false,chat:true,msgs:true,ia:true},p.perms||{});return pr};
  const v91Ico=p=>p&&p.app==='libre'?'🧔':'👩';
  const v91HerName=()=>{try{return s81().partner.name||'Ella'}catch{return 'Ella'}};
  const v91Fecha=ts=>ts?new Date(Number(ts)).toLocaleDateString('es-CO',{day:'numeric',month:'short'}):'';
  const v91ApkUrl=p=>{if(p&&p.app==='libre')return V85_PUBLIC_URL;const v=(()=>{try{return APP_VERSION}catch{return ''}})();return v?`https://github.com/JaiderRico/APP_GYM/releases/download/v${v}/MiProgreso_Ella_v${v}.apk`:'https://github.com/JaiderRico/APP_GYM/releases/latest'};
  function v91ShareText(p){
    const pr=v91Perms(p),extra=[pr.chat&&'podemos escribirnos por el chat de la app',pr.ia&&'tienes el entrenador con IA y tu copia se guarda en la nube',pr.msgs&&'te puedo mandar mensajes y rutinas',pr.ver&&'puedes ver mis entrenos'].filter(Boolean);
    const paso=p.app==='libre'?'2) Ábrela: en la pregunta del código (o en Ajustes ⚙ → Mi Progreso Pro) escribe este código.':'2) Ábrela y escribe el código (solo la primera vez).';
    return `🔑 Tu código para Mi Progreso: ${p.code}\n\n1) Instala la app (Android):\n${v91ApkUrl(p)}\n${paso}\n\nTus registros son solo tuyos${pr.ia?'; yo veo tu progreso para darte consejos':''}.${extra.length?' Con el código '+extra.join(', ')+'.':''}${Number(p.expiresAt)?`\nVence el ${new Date(Number(p.expiresAt)).toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'})}.`:''}`}
  function v91Save(list){try{localStorage.setItem(V91_LIST,JSON.stringify(list||[]))}catch{}}

  // Cambiar de persona: se limpia todo lo que estaba cargado de la anterior.
  function mpSetPersona(id){
    id=id&&mpPersonas().some(p=>p.id===id&&!p.revoked)?id:'';
    let prev='';try{prev=localStorage.getItem(V91_KEY)||''}catch{}
    if(id===prev)return;
    try{id?localStorage.setItem(V91_KEY,id):localStorage.removeItem(V91_KEY)}catch{}
    try{Object.assign(hmState,{data:null,raw:null,at:0,file:'',msgs:null,routines:null,requests:null,error:'',loading:false})}catch{}
    try{Object.assign(v90,{raw:null,at:0,err:'',loading:false,ex:'',limit:15})}catch{}
    try{v89.list=null;v89.user='ella'}catch{}
    try{v85Chat.thread='';v85Chat.unread=0;v85Chat.reqNew=[];v85LoadCache();v85Badge();$('#v85ReqCard')?.remove()}catch{}
    try{$('#v85ChatBtn')?.setAttribute('title','Chat con '+v85Other())}catch{}
    try{hmEnsureEntry()}catch{}
    try{if($('#v90')){v90Open(v90.tab||'res')}}catch{}
    try{if($('#hmModal'))openHerModal()}catch{}
    try{v85BgPoll()}catch{}
    toast(`👤 Ahora ves a ${mpPersonaName()||v91HerName()}`);
  }

  // Chips para cambiar de persona (en la pantalla de seguimiento)
  function v91ChipsHtml(){
    if(!V91_ON)return '';const L=mpPersonas().filter(p=>!p.revoked);if(!L.length)return '';const cur=mpPersona();
    return `<div class="v91-chips">${[{id:'',name:v91HerName()},...L].map(p=>`<button class="secondary ${p.id===cur?'on':''}" data-v91-pick="${esc(p.id)}">${p.id?v91Ico(p)+' ':''}${esc(p.name)}</button>`).join('')}<button class="secondary" data-v91-manage title="Personas">＋</button></div>`;
  }

  async function v91Load(){
    if(!V91_ON)return;
    try{if(!hmCode())return}catch{return}
    try{const j=await gas('usr_list');v91Save(j.users||[]);v91.loaded=true;v91.err='';
      // Si la persona elegida se borró o se desactivó, volver a Ella
      try{const id=localStorage.getItem(V91_KEY)||'';if(id&&!(j.users||[]).some(p=>p.id===id&&!p.revoked))mpSetPersona('')}catch{}
    }catch(e){v91.err=/Acci[oó]n desconocida/.test(e.message||'')?'El Apps Script aún no tiene la versión v23.':(e.message||'No se pudieron cargar las personas.')}
    v91Paint();
    try{const c=$('.v91-chips');if(c)c.outerHTML=v91ChipsHtml()}catch{}
  }

  document.head.insertAdjacentHTML('beforeend',`<style id="v91css">
    .v91-chips{display:flex;gap:6px;overflow-x:auto;padding:8px 10px;background:var(--panel);border-bottom:1px solid var(--line);scrollbar-width:none}
    .v91-chips button{flex:none;margin:0;padding:6px 12px;font-size:13px;border-radius:99px;white-space:nowrap}
    .v91-chips button.on{background:var(--green);color:#0b120d;font-weight:800}
    .v91-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}.v91-seg button{margin:0;padding:10px 6px;font-size:13px;border-radius:12px}.v91-seg button.on{background:var(--green);color:#0b120d;font-weight:800}
    .v91-pp{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.v91-pp button{margin:0;padding:6px 10px;font-size:12.5px;border-radius:99px;opacity:.55;text-decoration:line-through}.v91-pp button.on{opacity:1;text-decoration:none;background:var(--panel2);border-color:var(--green)}
    .v91-in{width:100%;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit}
  </style>`);

  // ---------- Ajustes → 👥 Personas ----------
  function v91Html(){
    const L=mpPersonas(),cur=mpPersona(),f=v91;
    let h=`<p class="small" style="margin-top:0">Cada persona tiene su propio código y sus datos van aparte, en su carpeta de tu Drive (“Mi Progreso - Personas”). Eliges qué app le das y qué puede usar; lo cambias cuando quieras.</p>
      <input class="v91-in" id="v91Name" maxlength="40" placeholder="Nombre de la persona" autocomplete="off">
      <div class="v91-seg"><button class="secondary ${f.app==='ella'?'on':''}" data-v91-app="ella">👩 App rosa<br><small>(la de ${esc(v91HerName())})</small></button><button class="secondary ${f.app==='libre'?'on':''}" data-v91-app="libre">🧔 App libre<br><small>(la pública)</small></button></div>
      <div class="small">Toca para quitar o poner:</div>
      <div class="v91-pp">${V91_PERMS.map(([k,i,l])=>`<button class="secondary ${f.perms[k]?'on':''}" data-v91-fp="${k}">${i} ${esc(l)}</button>`).join('')}</div>
      <label class="small">Vence</label><select class="v91-in" id="v91Days">${V91_DAYS.map(([d,l])=>`<option value="${d}" ${f.days===d?'selected':''}>${esc(l)}</option>`).join('')}</select>
      <p class="small" style="margin:6px 0 0">Sin “IA y copia en la nube” no se guarda su copia, así que no verás su progreso.</p>
      <button class="primary" data-v91-new style="margin-top:8px;width:100%">Crear persona</button>`;
    if(f.err)h+=`<p class="small" style="color:#ffb4a2">${esc(f.err)}</p>`;
    h+=`<div class="rq" style="margin-top:10px"><div class="row between"><b>👩 ${esc(v91HerName())}</b><span class="small">${cur?'':'👀 Viendo'}</span></div><small>Su código de siempre · todo activado.</small><div class="rq-btns">${cur?`<button class="secondary" data-v91-pick="">Ver a ${esc(v91HerName())}</button>`:''}</div></div>`;
    if(!L.length)return h+(f.loaded?'<p class="small">Aún no has creado personas.</p>':'<p class="small">Cargando…</p>');
    return h+L.map(p=>{const pr=v91Perms(p),venc=Number(p.expiresAt)||0,exp=p.expired||(venc&&venc<=Date.now());
      return `<div class="rq" style="margin-top:8px"><div class="row between"><b>${v91Ico(p)} ${esc(p.name)}</b><span class="small">${p.revoked?'⛔ Desactivada':exp?'⌛ Vencida':p.id===cur?'👀 Viendo':'✅ Activa'}</span></div>
      <div style="font:700 18px/1.3 monospace;letter-spacing:.06em;margin:4px 0">${esc(p.code)}</div>
      <small>${p.app==='libre'?'App libre':'App rosa'} · ${venc?`${exp?'venció':'vence'} el ${esc(v91Fecha(venc))}`:'no vence'} · ${p.lastSync?`última copia ${esc(v91Fecha(p.lastSync))}`:p.lastUse?`activó la app el ${esc(v91Fecha(p.lastUse))}`:'aún no ha activado la app'}</small>
      <div class="v91-pp">${V91_PERMS.map(([k,i,l])=>`<button class="secondary ${pr[k]?'on':''}" data-v91-pp="${esc(p.id)}" data-k="${k}" title="${pr[k]?'Quitar':'Activar'}">${i} ${esc(l)}</button>`).join('')}</div>
      ${f.edit===p.id?`<div style="margin-top:8px"><input class="v91-in" id="v91Ren" maxlength="40" value="${esc(p.name)}"><div class="rq-btns"><button class="primary" data-v91-ren-ok="${esc(p.id)}">Guardar nombre</button><button class="secondary" data-v91-ren-no>Cancelar</button></div></div>`:''}
      <div class="rq-btns">${p.revoked||exp?'':`<button class="secondary" data-v91-pick="${esc(p.id)}" data-v91-go>Ver progreso</button><button class="secondary" data-v91-share="${esc(p.id)}">Compartir código</button>`}
        <button class="secondary" data-v91-ren="${esc(p.id)}">Renombrar</button>
        <button class="secondary" data-v91-swapp="${esc(p.id)}">Cambiar a app ${p.app==='libre'?'rosa':'libre'}</button>
        ${venc?`<button class="secondary" data-v91-days="${esc(p.id)}">+30 días</button><button class="secondary" data-v91-noexp="${esc(p.id)}">Que no venza</button>`:`<button class="secondary" data-v91-days="${esc(p.id)}">Poner vencimiento (30 días)</button>`}
        <button class="secondary" data-v91-code="${esc(p.id)}">Código nuevo</button>
        ${p.revoked?`<button class="secondary" data-v91-on="${esc(p.id)}">Reactivar</button>`:`<button class="secondary" data-v91-off="${esc(p.id)}">Desactivar</button>`}
        <button class="secondary" data-v91-del="${esc(p.id)}">Borrar</button></div></div>`}).join('');
  }
  function v91Paint(){const b=$('#v91Body');if(b)b.innerHTML=v91Html()}
  async function v91Act(fn,ok){if(v91.busy)return;v91.busy=true;try{await fn();if(ok)toast(ok)}catch(e){toast(e.message||'No se pudo guardar.')}finally{v91.busy=false;v91Paint();try{const c=$('.v91-chips');if(c)c.outerHTML=v91ChipsHtml()}catch{}}}
  const v91Set=u=>{v91Save(mpPersonas().map(x=>x.id===u.id?u:x))};
  const v91Upd=(id,extra,ok)=>v91Act(async()=>{const j=await gas('usr_update',{id,...extra});v91Set(j.user);if(j.user.revoked&&mpPersona()===id)mpSetPersona('')},ok);

  if(V91_ON){
    const _rs910=renderSettings;
    renderSettings=function(){
      const r=_rs910.apply(this,arguments);
      try{const box=$('#settingsContent');if(box&&!$('#v91Set')&&hmCode()){
        const pro=$('#v85ProSet'),html=`<details class="settings-group" id="v91Set"><summary>👥 Personas (app de ${esc(v91HerName())})</summary><div class="settings-section" id="v91Body">${v91Html()}</div></details>`;
        if(pro)pro.insertAdjacentHTML('beforebegin',html);else box.insertAdjacentHTML('beforeend',html);
        $('#v91Set').addEventListener('toggle',e=>{if(e.target.open)v91Load()});
      }}catch(e){console.error(e)}
      return r;
    };
    document.addEventListener('change',e=>{if(e.target.id==='v91Days')v91.days=Number(e.target.value)||0});
    document.addEventListener('click',e=>{
      const t=e.target;if(!t.closest)return;
      const pk=t.closest('[data-v91-pick]');if(pk){e.preventDefault();mpSetPersona(pk.dataset.v91Pick);v91Paint();if(pk.hasAttribute('data-v91-go')){try{closeM('settingsModal')}catch{}try{v90Open('res')}catch{}}else{const c=$('.v91-chips');if(c)c.outerHTML=v91ChipsHtml()}return}
      if(t.closest('[data-v91-manage]')){try{v90Close()}catch{}try{renderSettings();$('#settingsModal').classList.remove('hidden')}catch{}setTimeout(()=>{const d=$('#v91Set');if(d){d.open=true;d.scrollIntoView({block:'start'});v91Load()}},200);return}
      const fa=t.closest('[data-v91-app]');if(fa){v91.app=fa.dataset.v91App;v91.keepName=$('#v91Name')?.value||'';v91Paint();const i=$('#v91Name');if(i)i.value=v91.keepName;return}
      const fp=t.closest('[data-v91-fp]');if(fp){const k=fp.dataset.v91Fp;v91.perms[k]=!v91.perms[k];v91.keepName=$('#v91Name')?.value||'';v91Paint();const i=$('#v91Name');if(i)i.value=v91.keepName;return}
      const pp=t.closest('[data-v91-pp]');if(pp){const p=mpPersonas().find(x=>x.id===pp.dataset.v91Pp);if(!p)return;const k=pp.dataset.k,on=!v91Perms(p)[k],lbl=(V91_PERMS.find(x=>x[0]===k)||[])[2]||k;
        v91Upd(p.id,{perms:{[k]:on}},`${on?'✓ Activado':'Quitado'}: ${lbl}`).then(()=>{try{if(mpPersona()===p.id&&$('#v90'))v90Open(v90.tab||'res')}catch{}});return}
      const sw=t.closest('[data-v91-swapp]');if(sw){const p=mpPersonas().find(x=>x.id===sw.dataset.v91Swapp);if(!p)return;const to=p.app==='libre'?'ella':'libre';
        if(!confirm(`¿Pasar a ${p.name} a la app ${to==='libre'?'libre':'rosa'}? Sus datos se conservan; compártele el código otra vez con el nuevo enlace.`))return;v91Upd(p.id,{app:to},'✓ App cambiada: compártele el enlace nuevo');return}
      const dy=t.closest('[data-v91-days]');if(dy){v91Upd(dy.dataset.v91Days,{days:30},'✓ 30 días más');return}
      const ne=t.closest('[data-v91-noexp]');if(ne){v91Upd(ne.dataset.v91Noexp,{noExpire:true},'✓ Ya no vence');return}
      if(t.closest('[data-v91-new]')){const n=($('#v91Name')?.value||'').trim();if(!n){$('#v91Name')?.focus();return}const days=Number($('#v91Days')?.value)||0;
        v91Act(async()=>{const j=await gas('usr_create',{name:n,app:v91.app,perms:{...v91.perms},share:v91.perms.ver,days});v91.days=0;v91.perms={ver:true,chat:true,msgs:true,ia:true};v91Save([...mpPersonas(),j.user]);v91.loaded=true;
          setTimeout(()=>{if(confirm(`Listo: el código de ${j.user.name} es ${j.user.code}.\n\n¿Compartirlo ahora con el enlace para instalar la app?`)){try{if(NX?.shareText){NX.shareText(v91ShareText(j.user));return}}catch{}prompt('Copia el mensaje:',v91ShareText(j.user))}},50)},'✓ Persona creada');return}
      const sh=t.closest('[data-v91-share]');if(sh){const p=mpPersonas().find(x=>x.id===sh.dataset.v91Share);if(p){try{if(NX?.shareText){NX.shareText(v91ShareText(p));return}}catch{}prompt('Copia el mensaje:',v91ShareText(p))}return}
      const rn=t.closest('[data-v91-ren]');if(rn){v91.edit=rn.dataset.v91Ren;v91Paint();setTimeout(()=>$('#v91Ren')?.focus(),50);return}
      if(t.closest('[data-v91-ren-no]')){v91.edit='';v91Paint();return}
      const ro=t.closest('[data-v91-ren-ok]');if(ro){const n=($('#v91Ren')?.value||'').trim();if(!n)return;v91.edit='';v91Upd(ro.dataset.v91RenOk,{name:n},'✓ Nombre cambiado').then(()=>{try{hmEnsureEntry()}catch{}});return}
      const cd=t.closest('[data-v91-code]');if(cd){if(!confirm('¿Crear un código nuevo? El anterior deja de servir: si ya tiene la app, tendrá que escribir el nuevo. Sus datos no se pierden.'))return;v91Upd(cd.dataset.v91Code,{newCode:true},'✓ Código nuevo creado: compártelo');return}
      const of=t.closest('[data-v91-off]');if(of){if(!confirm('¿Desactivar? Su app deja de conectarse (no se borra nada). La puedes reactivar cuando quieras.'))return;v91Upd(of.dataset.v91Off,{revoke:true},'Persona desactivada');return}
      const on=t.closest('[data-v91-on]');if(on){v91Upd(on.dataset.v91On,{revoke:false},'✓ Persona reactivada');return}
      const dl=t.closest('[data-v91-del]');if(dl){const p=mpPersonas().find(x=>x.id===dl.dataset.v91Del);if(!p||!confirm(`¿Borrar a ${p.name}? Su app deja de funcionar. Su carpeta en Drive NO se borra.`))return;
        v91Act(async()=>{await gas('usr_delete',{id:p.id});if(mpPersona()===p.id)mpSetPersona('');v91Save(mpPersonas().filter(x=>x.id!==p.id))},'Persona borrada');return}
    });
    // Avisos de la app cerrada: abrir la persona correcta
    const _rna910=runNativeAction;
    runNativeAction=function(a){
      const m=/^go:(persona|chat):(u[0-9a-f]{9})$/.exec(String(a||''));
      if(m){if(mpPersonas().some(p=>p.id===m[2]))mpSetPersona(m[2]);if(m[1]==='chat'){v85OpenChat('');return}try{v90Open('res')}catch{}return}
      if(a==='go:chat'||a==='go:requests'){if(mpPersona())mpSetPersona('')}  // avisos de Ella
      return _rna910(a);
    };
    setTimeout(v91Load,3500);
  }

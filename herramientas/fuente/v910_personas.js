  /* ===================== v8.5.21 (solo app de Jaider): varias personas en la app de Ella ===================== */
  // Jaider crea personas (Ajustes → 👥 Personas): cada una recibe su código PE-XXXX-XXXX y usa la app de Ella con sus
  // datos aparte (backend v23). "Persona actual" (mp_persona_v1: '' = Ella) decide con quién trabajan el seguimiento,
  // el chat, los snacks, los pedidos y "Mensajes y rutinas": gas() le agrega user:<id>. La libre lo trae apagado.
  // Va antes de initV7(), después de v900, en el index.html de Jaider.
  const V91_ON=!(typeof MP_PUBLICA!=='undefined'&&MP_PUBLICA)&&!MP_APK_IS_ELLA;
  const V91_KEY='mp_persona_v1',V91_LIST='mp_personas_v1';
  // Funciones declaradas (no const) para poder usarlas desde los bloques anteriores sin importar el orden.
  function mpPersonas(){try{const l=JSON.parse(localStorage.getItem(V91_LIST)||'[]');return Array.isArray(l)?l:[]}catch{return []}}
  function mpPersona(){if(!V91_ON)return '';let id='';try{id=localStorage.getItem(V91_KEY)||''}catch{}return id&&mpPersonas().some(p=>p.id===id&&!p.revoked)?id:''}
  function mpPersonaName(){const id=mpPersona();if(!id)return '';const p=mpPersonas().find(x=>x.id===id);return p?p.name:''}
  function mpPersonaArg(){const id=mpPersona();return id?{user:id}:{}}
  function mpPersonaSfx(){const id=mpPersona();return id?'_'+id:''}
  const v91={busy:false,err:'',loaded:false,edit:''};
  const v91HerName=()=>{try{return s81().partner.name||'Ella'}catch{return 'Ella'}};
  const v91Fecha=ts=>ts?new Date(Number(ts)).toLocaleDateString('es-CO',{day:'numeric',month:'short'}):'';
  const v91ApkUrl=()=>{const v=(()=>{try{return APP_VERSION}catch{return ''}})();return v?`https://github.com/JaiderRico/APP_GYM/releases/download/v${v}/MiProgreso_Ella_v${v}.apk`:'https://github.com/JaiderRico/APP_GYM/releases/latest'};
  function v91ShareText(p){return `🔑 Tu código para Mi Progreso: ${p.code}\n\n1) Instala la app (Android):\n${v91ApkUrl()}\n2) Ábrela y escribe el código (solo la primera vez).\n\nTus registros son solo tuyos; yo veo tu progreso para darte consejos y podemos escribirnos por el chat de la app.`}
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
    return `<div class="v91-chips">${[{id:'',name:v91HerName()},...L].map(p=>`<button class="secondary ${p.id===cur?'on':''}" data-v91-pick="${esc(p.id)}">${esc(p.name)}</button>`).join('')}<button class="secondary" data-v91-manage title="Personas">＋</button></div>`;
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
    .v91-in{width:100%;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit}
  </style>`);

  // ---------- Ajustes → 👥 Personas ----------
  function v91Html(){
    const L=mpPersonas(),cur=mpPersona();
    let h=`<p class="small" style="margin-top:0">Dale la app de ${esc(v91HerName())} a más personas. Cada una tiene su propio código y sus datos van aparte, en su carpeta de tu Drive (“Mi Progreso - Personas”), fuera de la carpeta compartida. Con ellas haces lo mismo que con ${esc(v91HerName())}: ver su progreso, chat, mensajes, rutinas, snacks y pedidos.</p>
      <input class="v91-in" id="v91Name" maxlength="40" placeholder="Nombre de la persona" autocomplete="off">
      <label class="small" style="display:flex;gap:8px;align-items:center;margin:8px 0 0"><input type="checkbox" id="v91Share" checked> Puede ver mis entrenos (solo lectura)</label>
      <button class="primary" data-v91-new style="margin-top:8px;width:100%">Crear persona</button>`;
    if(v91.err)h+=`<p class="small" style="color:#ffb4a2">${esc(v91.err)}</p>`;
    h+=`<div class="rq" style="margin-top:10px"><div class="row between"><b>${esc(v91HerName())}</b><span class="small">${cur?'':'👀 Viendo'}</span></div><small>Su código de siempre (Propiedades del script).</small><div class="rq-btns">${cur?`<button class="secondary" data-v91-pick="">Ver a ${esc(v91HerName())}</button>`:''}</div></div>`;
    if(!L.length)return h+(v91.loaded?'<p class="small">Aún no has creado personas.</p>':'<p class="small">Cargando…</p>');
    return h+L.map(p=>`<div class="rq" style="margin-top:8px"><div class="row between"><b>${esc(p.name)}</b><span class="small">${p.revoked?'⛔ Desactivada':p.id===cur?'👀 Viendo':'✅ Activa'}</span></div>
      <div style="font:700 18px/1.3 monospace;letter-spacing:.06em;margin:4px 0">${esc(p.code)}</div>
      <small>${p.lastSync?`Última copia ${esc(v91Fecha(p.lastSync))}`:p.lastUse?`Activó la app el ${esc(v91Fecha(p.lastUse))}`:'Aún no ha activado la app'} · ${p.share?'ve tus entrenos':'no ve tus entrenos'}</small>
      ${v91.edit===p.id?`<div style="margin-top:8px"><input class="v91-in" id="v91Ren" maxlength="40" value="${esc(p.name)}"><div class="rq-btns"><button class="primary" data-v91-ren-ok="${esc(p.id)}">Guardar nombre</button><button class="secondary" data-v91-ren-no>Cancelar</button></div></div>`:''}
      <div class="rq-btns">${p.revoked?'':`<button class="secondary" data-v91-pick="${esc(p.id)}" data-v91-go>Ver progreso</button><button class="secondary" data-v91-share="${esc(p.id)}">Compartir código</button>`}
        <button class="secondary" data-v91-ren="${esc(p.id)}">Renombrar</button>
        <button class="secondary" data-v91-sh="${esc(p.id)}">${p.share?'No mostrarle mis entrenos':'Mostrarle mis entrenos'}</button>
        <button class="secondary" data-v91-code="${esc(p.id)}">Código nuevo</button>
        ${p.revoked?`<button class="secondary" data-v91-on="${esc(p.id)}">Reactivar</button>`:`<button class="secondary" data-v91-off="${esc(p.id)}">Desactivar</button>`}
        <button class="secondary" data-v91-del="${esc(p.id)}">Borrar</button></div></div>`).join('');
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
    document.addEventListener('click',e=>{
      const t=e.target;if(!t.closest)return;
      const pk=t.closest('[data-v91-pick]');if(pk){e.preventDefault();mpSetPersona(pk.dataset.v91Pick);v91Paint();if(pk.hasAttribute('data-v91-go')){try{closeM('settingsModal')}catch{}try{v90Open('res')}catch{}}else{const c=$('.v91-chips');if(c)c.outerHTML=v91ChipsHtml()}return}
      if(t.closest('[data-v91-manage]')){try{v90Close()}catch{}try{renderSettings();$('#settingsModal').classList.remove('hidden')}catch{}setTimeout(()=>{const d=$('#v91Set');if(d){d.open=true;d.scrollIntoView({block:'start'});v91Load()}},200);return}
      if(t.closest('[data-v91-new]')){const n=($('#v91Name')?.value||'').trim();if(!n){$('#v91Name')?.focus();return}const share=!!$('#v91Share')?.checked;
        v91Act(async()=>{const j=await gas('usr_create',{name:n,share});v91Save([...mpPersonas(),j.user]);v91.loaded=true;
          setTimeout(()=>{if(confirm(`Listo: el código de ${j.user.name} es ${j.user.code}.\n\n¿Compartirlo ahora con el enlace para instalar la app?`)){try{if(NX?.shareText){NX.shareText(v91ShareText(j.user));return}}catch{}prompt('Copia el mensaje:',v91ShareText(j.user))}},50)},'✓ Persona creada');return}
      const sh=t.closest('[data-v91-share]');if(sh){const p=mpPersonas().find(x=>x.id===sh.dataset.v91Share);if(p){try{if(NX?.shareText){NX.shareText(v91ShareText(p));return}}catch{}prompt('Copia el mensaje:',v91ShareText(p))}return}
      const rn=t.closest('[data-v91-ren]');if(rn){v91.edit=rn.dataset.v91Ren;v91Paint();setTimeout(()=>$('#v91Ren')?.focus(),50);return}
      if(t.closest('[data-v91-ren-no]')){v91.edit='';v91Paint();return}
      const ro=t.closest('[data-v91-ren-ok]');if(ro){const n=($('#v91Ren')?.value||'').trim();if(!n)return;v91.edit='';v91Upd(ro.dataset.v91RenOk,{name:n},'✓ Nombre cambiado').then(()=>{try{hmEnsureEntry()}catch{}});return}
      const s2=t.closest('[data-v91-sh]');if(s2){const p=mpPersonas().find(x=>x.id===s2.dataset.v91Sh);if(p)v91Upd(p.id,{share:!p.share},p.share?'Ya no verá tus entrenos':'Ahora puede ver tus entrenos');return}
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

  /* ===================== v8.5.19 (Jaider y Ella): lista de snacks de Ella, editable por los dos ===================== */
  // La lista vive en el servidor (snacks_ella.json, acciones snacks_get / snacks_edit). Ella agrega o quita los que usa;
  // Jaider le sugiere snacks desde "Progreso de Ella" y a ella le llegan marcados "💡 Sugerido por Jaider".
  // La app libre no lo usa (MP_PUBLICA). Va antes de initV7(), después de v880.
  const V89_ON=!(typeof MP_PUBLICA!=='undefined'&&MP_PUBLICA);
  const V89_CACHE='mp_snacks_v1';
  const v89={user:'ella',list:null,at:0,busy:false,edit:null,err:''};
  function v89Call(action,extra={}){return V85_ELLA?herGas(action,extra):gas(action,{...extra,...(v89.user==='prueba'?{user:'prueba'}:{})})}
  const v89CacheKey=()=>V89_CACHE+(V85_ELLA?'':'_'+(v89.user==='prueba'?'prueba':((typeof mpPersona==='function'&&mpPersona())||'ella')));  // 8.5.21: una lista por persona
  // Lista guardada en el teléfono (null si nunca se ha traído)
  function v89Cached(){try{const c=JSON.parse(localStorage.getItem(v89CacheKey())||'null');return c&&Array.isArray(c.list)?c:null}catch{return null}}
  function v89Store(j){v89.list=j.list||[];v89.at=Number(j.updatedAt)||0;try{localStorage.setItem(v89CacheKey(),JSON.stringify({list:v89.list,updatedAt:v89.at,syncedAt:Date.now()}))}catch{}}
  async function v89Sync(force){
    if(!V89_ON||!v85Code())return false;
    const c=v89Cached();if(!force&&c&&Date.now()-(Number(c.syncedAt)||0)<5*60000){v89.list=c.list;return false}
    try{const j=await v89Call('snacks_get');const changed=!c||JSON.stringify(c.list)!==JSON.stringify(j.list);v89Store(j);return changed}catch(e){v89.err=e.message||'';return false}
  }
  const v89Who=x=>x.by==='jaider'?(V85_ELLA?'💡 Sugerido por Jaider':'💡 Tu sugerencia'):x.by==='ella'?(V85_ELLA?'✍️ Lo agregaste tú':'✍️ Lo agregó '+v85Other()):'';

  document.head.insertAdjacentHTML('beforeend',`<style id="v89css">
    .v89{position:fixed;inset:0;z-index:9100;background:var(--bg);display:flex;flex-direction:column}
    .v89-h{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;border-bottom:1px solid var(--line);background:var(--panel)}
    .v89-h h2{flex:1;margin:0;font-size:18px}.v89-h button{margin:0}
    .v89-b{flex:1;overflow-y:auto;padding:12px 12px calc(env(safe-area-inset-bottom,0px) + 20px)}
    .v89-it{display:flex;gap:8px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)}
    .v89-it .t{flex:1;min-width:0}.v89-it b{display:block;font-size:14.5px;line-height:1.3}.v89-it span{display:block;font-size:12px;color:var(--muted);margin-top:2px}
    .v89-it .tag{display:inline-block;margin-top:4px;font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;background:var(--panel2);border:1px solid var(--line);color:var(--text)}
    .v89-it button{margin:0;padding:7px 10px;min-width:0}
    .v89-f{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:12px;margin-bottom:12px}
    .v89-f input,.v89-f textarea{width:100%;margin:4px 0 8px;padding:10px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit}
    .v89-f textarea{min-height:56px;resize:vertical}.v89-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .v89-seg{display:flex;gap:6px;margin-bottom:10px}.v89-seg button{flex:1;margin:0;padding:7px;font-size:13px}.v89-seg button.on{background:var(--green);color:#0b120d}
  </style>`);

  function v89FormHtml(){
    const e=v89.edit||{};
    return `<div class="v89-f"><b>${e.id?'✏️ Editar snack':(V85_ELLA?'➕ Agregar un snack':'➕ Sugerirle un snack')}</b>
      <label class="small" style="display:block;margin-top:8px">Snack</label><textarea id="v89T" maxlength="120" placeholder="Ej. Batido de mango con leche entera y avena">${esc(e.t||'')}</textarea>
      <div class="v89-two"><div><label class="small">Calorías aprox.</label><input id="v89K" type="number" inputmode="numeric" min="0" max="3000" value="${e.k||''}" placeholder="300"></div>
      <div><label class="small">Proteína (g)</label><input id="v89P" type="number" inputmode="numeric" min="0" max="300" value="${e.p||''}" placeholder="10"></div></div>
      <label class="small">¿Por qué no llena? (opcional)</label><input id="v89W" maxlength="100" value="${esc(e.w||'')}" placeholder="Ej. Es líquido, entra fácil">
      <div class="row" style="gap:8px"><button class="primary" style="flex:1;margin:0" data-v89-save>${e.id?'Guardar cambios':(V85_ELLA?'Agregar a mi lista':'Sugerírselo')}</button>${e.id?'<button class="secondary" style="margin:0" data-v89-cancel>Cancelar</button>':''}</div></div>`;
  }
  function v89Paint(){
    const b=$('#v89Body');if(!b)return;
    const L=v89.list,seg=V85_ELLA?'':`<div class="v89-seg"><button class="secondary ${v89.user==='ella'?'on':''}" data-v89-user="ella">Lista de ${esc(v85Other())}</button><button class="secondary ${v89.user==='prueba'?'on':''}" data-v89-user="prueba">🧪 Prueba</button></div>`;
    const intro=V85_ELLA?'<p class="small" style="margin-top:0">Estos son los snacks que te recomienda la app varias veces al día. Quita los que no te gusten o no uses y agrega los tuyos. Jaider también te puede sugerir.</p>'
      :`<p class="small" style="margin-top:0">Esta es la lista que la app de ${esc(v85Other())} le recomienda varias veces al día. Lo que agregues le llega como sugerencia (con notificación); lo puede quitar si no lo usa.</p>`;
    b.innerHTML=seg+intro+v89FormHtml()+(v89.err?`<div class="small" style="color:#ff6b6b;margin-bottom:8px">⚠ ${esc(v89.err)}</div>`:'')+
      (L==null?'<p class="small">Cargando…</p>':!L.length?'<p class="small">La lista está vacía. Agrega al menos uno.</p>':
      `<b>${L.length} snack${L.length===1?'':'s'}</b>`+L.map(x=>`<div class="v89-it"><div class="t"><b>${esc(x.t)}</b><span>${x.k?`~${x.k} kcal`:''}${x.k&&x.p?' · ':''}${x.p?`${x.p} g proteína`:''}${x.w?` · ${esc(x.w)}`:''}</span>${v89Who(x)?`<span class="tag">${v89Who(x)}</span>`:''}</div><button class="secondary" data-v89-edit="${esc(x.id)}" aria-label="Editar">✏️</button><button class="secondary" data-v89-del="${esc(x.id)}" aria-label="Quitar">🗑</button></div>`).join('')+
      `<button class="secondary" data-v89-reset style="width:100%;margin-top:14px">↺ Volver a la lista original</button>`);
  }
  async function v89Open(user){
    if(!V89_ON)return;
    if(!v85Code()){toast(V85_ELLA?'Activa tu app primero.':'Primero escribe tu código de administrador.');return}
    if(!V85_ELLA&&user)v89.user=user==='prueba'?'prueba':'ella';
    v89.edit=null;v89.err='';v89.list=(v89Cached()||{}).list||null;
    $('#v89Ed')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="v89" id="v89Ed" role="dialog" aria-modal="true"><div class="v89-h"><h2>🥤 ${V85_ELLA?'Mis snacks':'Snacks de '+esc(v85Other())}</h2><button class="secondary" data-v89-close>Cerrar</button></div><div class="v89-b" id="v89Body"></div></div>`);
    v89Paint();await v89Sync(true);v89Paint();
  }
  function v89Close(){$('#v89Ed')?.remove();v89.edit=null;try{if(V85_ELLA)renderFood()}catch{}}
  async function v89Do(extra,okMsg){
    if(v89.busy)return;v89.busy=true;v89.err='';
    try{const j=await v89Call('snacks_edit',extra);v89Store(j);v89.edit=null;if(okMsg)toast(okMsg)}
    catch(e){v89.err=e.message||'No se pudo guardar.';toast(v89.err)}
    finally{v89.busy=false;v89Paint()}
  }
  document.addEventListener('click',e=>{
    const t=e.target;if(!t.closest)return;
    if(t.closest('[data-v89-open]')){v89Open(t.closest('[data-v89-open]').dataset.v89Open||'');return}
    if(!t.closest('#v89Ed'))return;
    if(t.closest('[data-v89-close]')){v89Close();return}
    const us=t.closest('[data-v89-user]');if(us){v89Open(us.dataset.v89User);return}
    if(t.closest('[data-v89-cancel]')){v89.edit=null;v89Paint();return}
    const ed=t.closest('[data-v89-edit]');if(ed){v89.edit={...((v89.list||[]).find(x=>x.id===ed.dataset.v89Edit)||{})};v89Paint();$('#v89Body')?.scrollTo({top:0,behavior:'smooth'});return}
    const dl=t.closest('[data-v89-del]');if(dl){const x=(v89.list||[]).find(y=>y.id===dl.dataset.v89Del);if(x&&confirm(`¿Quitar “${x.t}” de la lista?`))v89Do({op:'del',id:x.id},'Quitado de la lista');return}
    if(t.closest('[data-v89-reset]')){if(confirm('¿Volver a la lista original de la app? Se pierden los que se agregaron.'))v89Do({op:'reset'},'Lista original restaurada');return}
    if(t.closest('[data-v89-save]')){
      const item={t:($('#v89T')?.value||'').trim(),k:Number($('#v89K')?.value)||0,p:Number($('#v89P')?.value)||0,w:($('#v89W')?.value||'').trim()};
      if(!item.t){toast('Escribe el snack.');$('#v89T')?.focus();return}
      if(v89.edit&&v89.edit.id)v89Do({op:'upd',item:{...item,id:v89.edit.id}},'✓ Cambios guardados');
      else v89Do({op:'add',item},V85_ELLA?'✓ Agregado a tu lista':`✓ Sugerencia enviada a ${v85Other()}`);
      return}
  });

  // App de Jaider: botón dentro de "Progreso de Ella"
  if(V89_ON&&!V85_ELLA&&typeof hmRender==='function'){
    const _hm89=hmRender;
    hmRender=function(){
      const r=_hm89.apply(this,arguments);
      try{const b=$('#hmBody');if(b&&hmCode()&&!$('#v89HmSec'))b.insertAdjacentHTML('beforeend',`<div id="v89HmSec" style="margin-top:18px;padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--panel2)"><b>🥤 Snacks de ${esc(v85Other())}</b><p class="small" style="margin:4px 0 10px">Lo que su app le recomienda comer entre comidas. Sugiérele snacks nuevos o corrige los que hay.</p><button class="primary" style="width:100%;margin:0" data-v89-open="ella">Ver y editar su lista</button></div>`)}catch(e){console.error(e)}
      return r;
    };
  }
  if(V89_ON&&V85_ELLA){setTimeout(()=>v89Sync(false).then(ch=>{if(ch)try{renderFood()}catch{}}),5000);setInterval(()=>v89Sync(false).then(ch=>{if(ch)try{renderFood()}catch{}}),10*60000)}

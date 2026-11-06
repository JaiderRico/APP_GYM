  /* ===================== v8.5.0: chat, varias claves de IA, compartir la app libre y ventana flotante ===================== */
  // (Mismo bloque en las dos apps; MP_APK_IS_ELLA decide los textos y qué helper usa para hablar con el servidor.)
  const V85_ELLA=!!MP_APK_IS_ELLA;
  const V85_PUBLIC_URL='https://github.com/JaiderRico/APP_GYM/releases/download/publica/MiProgreso_Libre.apk';
  const V85_PUBLIC_PAGE='https://github.com/JaiderRico/APP_GYM/releases/tag/publica';
  function v85Code(){try{return V85_ELLA?herCode():hmCode()}catch{return ''}}
  function v85Gas(action,extra={}){return V85_ELLA?herGas(action,extra):gas(action,extra)}
  function v85Other(){if(V85_ELLA)return 'Jaider';try{return hmHerName()}catch{return 'Ella'}}
  const v85Ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};

  document.head.insertAdjacentHTML('beforeend',`<style id="v850css">
    .v85-badge{position:absolute;top:-3px;right:-3px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#ff5d5d;color:#fff;font-size:10px;font-weight:800;line-height:17px;text-align:center;pointer-events:none}
    #v85ChatBtn{position:relative}
    .v85-chat{position:fixed;inset:0;z-index:9000;background:var(--bg);display:flex;flex-direction:column}
    .v85-chat.hidden{display:none}
    .v85-ch-head{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 10px;border-bottom:1px solid var(--line);background:var(--panel)}
    .v85-ch-head h2{margin:0;font-size:18px;flex:1}.v85-ch-head .small{display:block;font-weight:400}
    .v85-ch-list{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:6px}
    .v85-msg{max-width:80%;padding:8px 12px;border-radius:16px;font-size:15px;line-height:1.35;white-space:pre-wrap;word-wrap:break-word;background:var(--panel2);border:1px solid var(--line);align-self:flex-start}
    .v85-msg.me{align-self:flex-end;background:var(--green);color:#0b120d;border-color:transparent}
    .v85-msg small{display:block;font-size:10px;opacity:.65;margin-top:3px;text-align:right}
    .v85-msg.pend{opacity:.6}
    .v85-day{align-self:center;font-size:11px;color:var(--muted);margin:8px 0 2px}
    .v85-seen{align-self:flex-end;font-size:11px;color:var(--muted);margin-top:-2px}
    .v85-ch-empty{margin:auto;text-align:center;color:var(--muted);max-width:280px}
    .v85-ch-foot{display:flex;gap:8px;padding:10px 12px calc(env(safe-area-inset-bottom,0px) + 10px);border-top:1px solid var(--line);background:var(--panel)}
    .v85-ch-foot textarea{flex:1;resize:none;min-height:44px;max-height:120px;padding:11px 12px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit}
    .v85-ch-foot button{margin:0;min-width:56px;border-radius:14px}
    .v85-th{display:flex;gap:6px;padding:8px 12px 0}.v85-th button{flex:1;margin:0;padding:6px;font-size:12px}.v85-th button.on{background:var(--green);color:#0b120d}
    .v85-share{display:flex;gap:8px;align-items:center;padding:12px;border:1px solid var(--line);border-radius:16px;background:var(--panel2);margin:4px 0 12px}
    .v85-share .t{flex:1}.v85-share b{display:block}.v85-share button{margin:0;white-space:nowrap}
    .v85-keys code{font-size:12px}
    .v85-keys textarea{width:100%;min-height:84px;padding:10px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:12px/1.4 monospace}
    #v85PipBtn{margin:0 0 8px 8px}
    #v85Mini{display:none}
    body.v85-mini > *:not(#v85Mini):not(script):not(style){display:none!important}
    body.v85-mini #v85Mini{display:flex;position:fixed;inset:0;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px;text-align:center;background:var(--bg);color:var(--text)}
    #v85Mini .k{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
    #v85Mini .big{font-size:44px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
    #v85Mini .t{font-size:15px;font-weight:700;max-width:100%;overflow:hidden;text-overflow:ellipsis}
    #v85Mini .s{font-size:12px;color:var(--muted);max-width:100%}
    .v85-req{border-left:4px solid var(--green)}
  </style>`);

  /* ---------- 1) Varias claves de IA: si una se agota, se usa la siguiente ---------- */
  const V85_SRV='mp_ai_keys_srv_v1',V85_MAN='mp_ai_keys_v1',V85_COOL='mp_ai_cool_v1';
  const v85KeyProv=k=>/^gsk_/.test(k)?'groq':/^sk-ant-/.test(k)?'anthropic':/^sk-/.test(k)?'openai':'';
  const v85UrlProv=u=>/api\.groq\.com/.test(u)?'groq':/api\.openai\.com/.test(u)?'openai':/api\.anthropic\.com/.test(u)?'anthropic':'';
  function v85List(k){const a=v85Ls.get(k,[]);return Array.isArray(a)?a.map(x=>String(x||'').trim()).filter(Boolean):[]}
  function v85AllKeys(){const out=[];[...v85List(V85_SRV),...v85List(V85_MAN)].forEach(k=>{if(!out.includes(k))out.push(k)});return out}
  function v85Pool(prov,cur){
    const cool=v85Ls.get(V85_COOL,{}),now=Date.now(),seen=[],ok=[],wait=[];
    [cur,...v85AllKeys()].forEach(k=>{if(!k||seen.includes(k)||v85KeyProv(k)!==prov)return;seen.push(k);((cool[k]||0)>now?wait:ok).push(k)});
    return ok.concat(wait.sort((a,b)=>(cool[a]||0)-(cool[b]||0)));
  }
  function v85MarkCool(k,ms){const c=v85Ls.get(V85_COOL,{}),now=Date.now();for(const x in c)if(c[x]<now)delete c[x];c[k]=now+ms;v85Ls.set(V85_COOL,c)}
  const v85Fetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const prov=v85UrlProv(url);
    if(!prov||!init||!init.headers||init.headers instanceof Headers)return v85Fetch(input,init);
    const h=init.headers,cur=prov==='anthropic'?String(h['x-api-key']||''):String(h.authorization||h.Authorization||'').replace(/^Bearer\s+/i,'');
    const pool=v85Pool(prov,cur);
    if(pool.length<2)return v85Fetch(input,init);
    let res=null;
    for(let i=0;i<pool.length;i++){
      const k=pool[i],hh={...h};
      if(prov==='anthropic')hh['x-api-key']=k;else{delete hh.Authorization;hh.authorization='Bearer '+k}
      res=await v85Fetch(input,{...init,headers:hh});
      if(res.status!==429&&res.status!==401&&res.status!==403){
        if(k!==cur){try{const c=aiCfg();if(c.key===cur||!c.key){if(cur&&!v85AllKeys().includes(cur))v85Ls.set(V85_MAN,[...v85List(V85_MAN),cur]);aiSaveCfg({...c,key:k})}}catch{}
          try{toast('🔑 Una clave de IA se agotó: ya estoy usando la siguiente.')}catch{}}
        return res;
      }
      const ra=Number(res.headers?.get?.('retry-after'))||0;
      v85MarkCool(k,res.status===429?Math.max(ra*1000,5*60000):6*3600000);
    }
    return res;
  };
  async function v85SyncKeys(force){
    if(!v85Code())return false;
    const last=v85Ls.get('mp_ai_keys_sync',0);if(!force&&Date.now()-last<12*3600000)return false;
    try{
      const j=await v85Gas('verify_code');v85Ls.set('mp_ai_keys_sync',Date.now());
      if(Array.isArray(j.groqKeys)){
        const ks=j.groqKeys.filter(k=>/^gsk_/.test(k));v85Ls.set(V85_SRV,ks);
        const c=aiCfg();if(ks.length&&(c.provider||'groq')==='groq'&&!(c.key&&v85AllKeys().includes(c.key)))aiSaveCfg({...c,provider:'groq',key:ks[0]});
      }
      return true;
    }catch(e){return false}
  }
  const v85Mask=k=>k.length>12?k.slice(0,6)+'…'+k.slice(-4):'••••';
  function v85KeysHtml(){
    const srv=v85List(V85_SRV),man=v85List(V85_MAN),cur=(()=>{try{return aiCfg().key||''}catch{return ''}})(),cool=v85Ls.get(V85_COOL,{}),now=Date.now();
    const row=k=>`<li><code>${esc(v85Mask(k))}</code>${k===cur?' · <b>en uso</b>':''}${(cool[k]||0)>now?' · ⏳ descansando':''}</li>`;
    return `<p class="small" style="margin-top:0">Cuando una clave llega a su límite, la app pasa sola a la siguiente y vuelve a la primera cuando se recupera.</p>
      <p class="small" style="margin:6px 0 2px"><b>Del servidor (${srv.length}):</b></p>${srv.length?`<ul class="small" style="margin:0 0 8px;padding-left:18px">${srv.map(row).join('')}</ul>`:'<p class="small" style="margin:0 0 8px">Ninguna todavía.</p>'}
      ${V85_ELLA?'':'<p class="small" style="margin:0 0 8px">Se configuran en el Apps Script → Propiedades del script: <code>GROQ_API_KEY</code>, <code>GROQ_API_KEY_2</code>, <code>GROQ_API_KEY_3</code>…</p>'}
      <label class="small"><b>Claves extra solo en este teléfono</b> (una por línea, opcional):</label>
      <textarea id="v85KeysMan" placeholder="gsk_…" autocomplete="off" spellcheck="false">${esc(man.join('\n'))}</textarea>
      <div class="row" style="gap:8px;margin-top:8px"><button class="primary" style="flex:1;margin:0" data-v85-keys-save>Guardar</button><button class="secondary" style="flex:1;margin:0" data-v85-keys-sync>↻ Traer del servidor</button></div>`;
  }

  /* ---------- 2) Chat entre las dos apps ---------- */
  const v85Chat={open:false,thread:'',msgs:[],readByOther:0,unread:0,timer:0,bgTimer:0,busy:false};
  const v85ThreadKey=()=>V85_ELLA?'':(v85Chat.thread==='prueba'?'prueba':'');
  const v85CacheKey=()=>'mp_chat_v1_'+(v85ThreadKey()||'main');
  const v85OutKey='mp_chat_out_v1';
  function v85LoadCache(){const c=v85Ls.get(v85CacheKey(),{msgs:[],readByOther:0});v85Chat.msgs=Array.isArray(c.msgs)?c.msgs:[];v85Chat.readByOther=Number(c.readByOther)||0}
  function v85SaveCache(){v85Ls.set(v85CacheKey(),{msgs:v85Chat.msgs.slice(-300),readByOther:v85Chat.readByOther})}
  function v85Out(){const o=v85Ls.get(v85OutKey,[]);return Array.isArray(o)?o:[]}
  const v85Me=()=>V85_ELLA?'ella':'jaider';
  function v85Merge(list){
    const byId=new Map(v85Chat.msgs.map(m=>[m.id,m]));let added=0;
    (list||[]).forEach(m=>{if(!m||!m.id)return;if(!byId.has(m.id)||byId.get(m.id).pending)added+=byId.has(m.id)?0:1;byId.set(m.id,{id:m.id,from:m.from,text:m.text,ts:Number(m.ts)||0})});
    v85Chat.msgs=[...byId.values()].sort((a,b)=>(a.ts||0)-(b.ts||0));return added;
  }
  function v85EnsureBtn(){
    if($('#v85ChatBtn')||!v85Code())return;
    const s=$('#settingsBtn');if(!s)return;
    s.insertAdjacentHTML('beforebegin',`<button class="iconbtn" id="v85ChatBtn" aria-label="Chat" title="Chat con ${esc(v85Other())}">💬</button>`);
    v85Badge();
  }
  function v85Badge(){const b=$('#v85ChatBtn');if(!b)return;b.querySelector('.v85-badge')?.remove();if(v85Chat.unread>0)b.insertAdjacentHTML('beforeend',`<span class="v85-badge">${v85Chat.unread>9?'9+':v85Chat.unread}</span>`)}
  function v85Time(ts){const d=new Date(ts);return d.toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'})}
  function v85DayLabel(ts){const d=new Date(ts),t=new Date();const k=x=>x.toDateString();if(k(d)===k(t))return 'Hoy';const y=new Date();y.setDate(y.getDate()-1);if(k(d)===k(y))return 'Ayer';return d.toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'})}
  function v85Render(){
    const box=$('#v85ChList');if(!box)return;
    const me=v85Me(),pend=v85Out().filter(o=>(o.thread||'')===v85ThreadKey());
    const all=[...v85Chat.msgs,...pend.filter(p=>!v85Chat.msgs.some(m=>m.id===p.id)).map(p=>({...p,from:me,pending:true}))];
    if(!all.length){box.innerHTML=`<div class="v85-ch-empty"><div style="font-size:40px">💬</div><p>Aún no hay mensajes. Escríbele a ${esc(v85Other())} lo que quieras: dudas de la rutina, cambios para la app o cómo te fue.</p></div>`;return}
    let h='',lastDay='';const lastMine=[...all].reverse().find(m=>m.from===me&&!m.pending);
    all.forEach(m=>{const day=v85DayLabel(m.ts||Date.now());if(day!==lastDay){h+=`<div class="v85-day">${esc(day)}</div>`;lastDay=day}
      h+=`<div class="v85-msg${m.from===me?' me':''}${m.pending?' pend':''}">${esc(m.text)}<small>${m.pending?'⏳ enviando':esc(v85Time(m.ts))}</small></div>`;
      if(lastMine&&m.id===lastMine.id&&v85Chat.readByOther>=lastMine.ts)h+='<div class="v85-seen">✓✓ Visto</div>'});
    const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<80;
    box.innerHTML=h;if(atBottom||v85Chat.forceScroll){box.scrollTop=box.scrollHeight;v85Chat.forceScroll=false}
  }
  function v85OpenChat(thread){
    if(!v85Code()){toast(V85_ELLA?'Activa tu app primero.':'Primero escribe tu código de administrador.');return}
    v85Chat.thread=V85_ELLA?'':(thread==='prueba'?'prueba':'');v85LoadCache();
    $('#v85Chat')?.remove();
    const th=V85_ELLA?'':`<div class="v85-th"><button class="secondary ${v85Chat.thread?'':'on'}" data-v85-th="">Con ${esc(v85Other())}</button><button class="secondary ${v85Chat.thread?'on':''}" data-v85-th="prueba">🧪 Prueba</button></div>`;
    document.body.insertAdjacentHTML('beforeend',`<div class="v85-chat" id="v85Chat" role="dialog" aria-modal="true"><div class="v85-ch-head"><h2>💬 ${esc(v85Other())}<span class="small" id="v85ChSub">${V85_ELLA&&(()=>{try{return kvGet('app_user')==='prueba'}catch{return false}})()?'🧪 Modo prueba: chat aparte':'Los mensajes llegan aunque la app esté cerrada'}</span></h2><button class="secondary" data-v85-close>Cerrar</button></div>${th}<div class="v85-ch-list" id="v85ChList"></div><div class="v85-ch-foot"><textarea id="v85ChInput" rows="1" maxlength="1000" placeholder="Escribe un mensaje…"></textarea><button class="primary" data-v85-send aria-label="Enviar">➤</button></div></div>`);
    v85Chat.open=true;v85Chat.forceScroll=true;v85Render();v85Refresh(true);
    clearInterval(v85Chat.timer);v85Chat.timer=setInterval(()=>{if(!document.hidden)v85Refresh(false)},5000);
  }
  function v85CloseChat(){v85Chat.open=false;clearInterval(v85Chat.timer);$('#v85Chat')?.remove();v85Chat.thread='';v85LoadCache()}
  async function v85FlushOut(){
    const out=v85Out();if(!out.length)return;
    const keep=[];
    for(const o of out){try{const j=await v85Gas('chat_send',{id:o.id,text:o.text,...(o.thread?{thread:o.thread}:{})});if((o.thread||'')===v85ThreadKey())v85Merge([j.message])}catch(e){if(e.auth)continue;keep.push(o)}}
    v85Ls.set(v85OutKey,keep);
  }
  async function v85Refresh(markRead){
    if(v85Chat.busy||!v85Code())return;v85Chat.busy=true;
    try{
      await v85FlushOut();
      const since=v85Chat.msgs.length?v85Chat.msgs[v85Chat.msgs.length-1].ts:0;
      const tk=v85ThreadKey(),j=await v85Gas('chat_list',{since,...(tk?{thread:tk}:{})});
      const added=v85Merge(j.messages);v85Chat.readByOther=Number(j.readByOther)||0;
      if(v85Chat.open){if((j.unread>0||markRead)&&j.unread>0){try{await v85Gas('chat_read',tk?{thread:tk}:{})}catch{}}v85Chat.unread=tk?v85Chat.unread:0}
      else{const prev=v85Chat.unread;v85Chat.unread=Number(j.unread)||0;if(v85Chat.unread>prev){const last=[...v85Chat.msgs].reverse().find(m=>m.from!==v85Me());if(last)toast(`💬 ${v85Other()}: ${last.text.slice(0,70)}`)}}
      v85SaveCache();if(v85Chat.open)v85Render();v85Badge();
      if(added&&v85Chat.open&&!document.hidden)try{navigator.vibrate?.(30)}catch{}
    }catch(e){if(v85Chat.open&&e.auth)toast(e.message)}
    finally{v85Chat.busy=false}
  }
  function v85Send(){
    const inp=$('#v85ChInput');const text=(inp?.value||'').trim();if(!text)return;
    const o={id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),text:text.slice(0,1000),ts:Date.now(),thread:v85ThreadKey()};
    v85Ls.set(v85OutKey,[...v85Out(),o]);inp.value='';inp.style.height='';v85Chat.forceScroll=true;v85Render();
    v85Chat.busy=false;v85Refresh(true).then(()=>{if(v85Out().some(x=>x.id===o.id))toast('Sin conexión: lo envío apenas vuelva el internet.')});
  }
  function v85BgPoll(){if(!document.hidden&&!v85Chat.open&&v85Code())v85Refresh(false)}

  /* ---------- 3) Compartir la app libre (sin conexión con nosotros) ---------- */
  const V85_SHARE_TEXT=`💪 Mi Progreso Libre: app para registrar tu entrenamiento en el gimnasio (rutinas, series, descansos, récords, comidas y peso). Gratis y todo se guarda en tu teléfono.\n\nDescárgala aquí (Android):\n${V85_PUBLIC_URL}`;
  function v85Share(){try{if(NX?.shareText){NX.shareText(V85_SHARE_TEXT);return}}catch{}v85Copy()}
  function v85Copy(){try{navigator.clipboard.writeText(V85_PUBLIC_URL).then(()=>toast('✓ Enlace copiado')).catch(()=>prompt('Copia el enlace:',V85_PUBLIC_URL))}catch{prompt('Copia el enlace:',V85_PUBLIC_URL)}}
  const v85ShareHtml=()=>`<div class="v85-share"><span style="font-size:28px">📲</span><div class="t"><b>Compartir la app</b><span class="small">Versión libre para quien quiera: registra igual, todo queda en su teléfono.</span></div><button class="secondary" data-v85-share>Compartir</button></div>`;

  /* ---------- 4) Ventana flotante (picture-in-picture) ---------- */
  const v85Pip={ok:false,auto:null};
  try{v85Pip.ok=!!window.NativeStore?.savePhoto?.('__pip__','supported')}catch{}
  function v85PipPrefs(){data.settings=data.settings||{};return data.settings.pip=Object.assign({auto:true},data.settings.pip||{})}
  function v85EnterPip(){
    if(!v85Pip.ok){toast('Tu teléfono no permite ventana flotante para esta app.');return}
    v85Mini(true);
    try{if(!window.NativeStore.savePhoto('__pip__','enter:9:16')){v85Mini(false);toast('No se pudo abrir la ventana flotante.')}}catch{v85Mini(false)}
  }
  function v85Training(){try{return typeof flowPhase!=='undefined'&&flowPhase!=='setup'&&!$('#focusWorkout')?.classList.contains('hidden')}catch{return false}}
  function v85PipWatch(){
    if(!v85Pip.ok)return;
    const want=!!(v85PipPrefs().auto&&v85Training());
    if(want!==v85Pip.auto){v85Pip.auto=want;try{window.NativeStore.savePhoto('__pip__',want?'auto:1':'auto:0')}catch{}}
    const b=$('#pauseWorkout');if(b&&!$('#v85PipBtn'))b.insertAdjacentHTML('afterend','<button class="secondary" id="v85PipBtn" data-v85-pip title="Seguir viendo el descanso mientras usas otra app">⧉ Ventana flotante</button>');
  }
  if(!document.getElementById('v85Mini'))document.body.insertAdjacentHTML('beforeend','<div id="v85Mini" aria-hidden="true"><div class="k" id="v85MiK"></div><div class="big" id="v85MiBig"></div><div class="t" id="v85MiT"></div><div class="s" id="v85MiS"></div></div>');
  let v85MiniTimer=0;
  function v85Mini(on){document.body.classList.toggle('v85-mini',!!on);clearInterval(v85MiniTimer);if(on){v85MiniFill();v85MiniTimer=setInterval(v85MiniFill,500)}}
  function v85MiniFill(){
    const tx=s=>($(s)?.textContent||'').trim(),set=(id,v)=>{const e=document.getElementById(id);if(e&&e.textContent!==v)e.textContent=v};
    const timer=$('#flowTimer');
    if(timer){set('v85MiK','Descanso');set('v85MiBig',tx('#flowTimer'));set('v85MiT','');set('v85MiS',tx('#focusContent .focus-subtitle'));return}
    if(v85Training()){set('v85MiK',tx('#focusContent .focus-kicker')||'Entrenando');set('v85MiBig','');set('v85MiT',tx('#focusContent .focus-title'));set('v85MiS',tx('#focusContent .focus-target')||tx('#focusProgress'));return}
    set('v85MiK','Mi Progreso');set('v85MiBig',new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',hour12:false}));set('v85MiT','');set('v85MiS',v85Chat.unread?`💬 ${v85Chat.unread} mensaje(s) nuevo(s)`:'');
  }
  // La ventana flotante es angosta: así se detecta al entrar y al salir (también si entró sola).
  function v85CheckMini(){const small=window.innerWidth<330&&window.innerWidth>0;if(small!==document.body.classList.contains('v85-mini'))v85Mini(small)}
  window.addEventListener('resize',()=>setTimeout(v85CheckMini,60));

  /* ---------- 5) (Jaider) Aviso dentro de la app cuando Ella pide cambios ---------- */
  async function v85CheckRequests(){
    if(V85_ELLA||!v85Code())return;
    try{
      const j=await gas('get_requests');const seen=v85Ls.get('mp_req_seen_v1',null);
      const pend=(j.requests||[]).filter(r=>r.status==='pendiente'&&(r.user||'ella')==='ella');
      if(seen===null){v85Ls.set('mp_req_seen_v1',pend.map(r=>r.id));return}
      const nuevos=pend.filter(r=>!seen.includes(r.id));
      v85Ls.set('mp_req_seen_v1',[...new Set([...seen,...pend.map(r=>r.id)])].slice(-300));
      v85Chat.reqNew=(v85Chat.reqNew||[]).concat(nuevos).slice(-5);
      if(nuevos.length){toast(`💡 ${v85Other()} pidió un cambio para su app`);v85ReqCard()}
    }catch{}
  }
  function v85ReqCard(){
    $('#v85ReqCard')?.remove();const L=v85Chat.reqNew||[];if(!L.length)return;
    $('#home')?.insertAdjacentHTML('afterbegin',`<div class="card v85-req" id="v85ReqCard"><div class="row between"><strong>💡 ${esc(v85Other())} pidió ${L.length>1?L.length+' cambios':'un cambio'} para su app</strong></div>${L.map(r=>`<p class="small" style="margin:6px 0 0;white-space:pre-wrap">“${esc(String(r.text).slice(0,180))}”</p>`).join('')}<div class="row" style="gap:8px;margin-top:10px"><button class="primary" style="flex:1;margin:0" data-v85-req-open>Ver pedidos</button><button class="secondary" style="flex:1;margin:0" data-v85-req-ok>Listo</button></div></div>`);
  }

  /* ---------- 6) (Jaider) Códigos Pro para la app libre ---------- */
  const v85Pro={list:null,busy:false,err:''};
  const V85_PRO_ST={activo:'✅ Activo',vencido:'⌛ Vencido',revocado:'⛔ Desactivado'};
  const v85Fecha=ts=>new Date(Number(ts)||0).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'});
  function v85ProHtml(){
    const L=v85Pro.list;
    const form=`<p class="small" style="margin-top:0">Con un código vigente, la app libre usa la IA (con tus claves) y guarda su copia en su propia carpeta de tu Drive: “Mi Progreso - Usuarios Pro”, fuera de la carpeta compartida. Al vencer vuelve a la versión gratis sin perder sus datos. Los códigos solo los ves tú. Cada código sirve en un solo teléfono.</p>
      <div class="row" style="gap:8px;flex-wrap:nowrap"><input id="v85ProName" maxlength="40" placeholder="Nombre de la persona" autocomplete="off" style="flex:2;min-width:0;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit"><select id="v85ProDays" style="flex:1;min-width:0;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit"><option value="7">7 días</option><option value="30" selected>30 días</option><option value="90">90 días</option><option value="365">1 año</option></select></div>
      <button class="primary" data-v85-pro-new style="margin-top:8px;width:100%">Crear código</button>`;
    if(v85Pro.err)return form+`<p class="small" style="color:#ffb4a2">${esc(v85Pro.err)}</p>`;
    if(!L)return form+'<p class="small">Cargando códigos…</p>';
    if(!L.length)return form+'<p class="small">Aún no has creado códigos.</p>';
    return form+L.map(c=>`<div class="rq" style="margin-top:8px"><div class="row between"><b>${esc(c.name)}</b><span class="small">${V85_PRO_ST[c.status]||esc(c.status)}</span></div>
      <div style="font:700 18px/1.3 monospace;letter-spacing:.06em;margin:4px 0">${esc(c.code)}</div>
      <small>${c.status==='vencido'?'Venció':'Vence'} el ${esc(v85Fecha(c.expiresAt))}${c.lastBackup?` · última copia ${esc(v85Fecha(c.lastBackup))}`:c.lastUse?` · lo usó el ${esc(v85Fecha(c.lastUse))}`:' · aún sin usar'}</small>
      <small style="display:block">${c.device?`📱 En un teléfono desde el ${esc(v85Fecha(c.deviceAt))}`:'📱 Sin teléfono: el primero que lo active se queda con él'}${c.blockedAt&&c.device?` · ⚠️ otro teléfono intentó usarlo el ${esc(v85Fecha(c.blockedAt))}`:''}</small>
      <div class="rq-btns"><button class="secondary" data-v85-pro-share="${esc(c.id)}">Compartir</button><button class="secondary" data-v85-pro-days="${esc(c.id)}">+30 días</button>${c.device?`<button class="secondary" data-v85-pro-free="${esc(c.id)}">Liberar teléfono</button>`:''}${c.revoked?`<button class="secondary" data-v85-pro-on="${esc(c.id)}">Reactivar</button>`:`<button class="secondary" data-v85-pro-off="${esc(c.id)}">Desactivar</button>`}<button class="secondary danger" data-v85-pro-del="${esc(c.id)}">Borrar</button></div></div>`).join('');
  }
  function v85ProPaint(){const b=$('#v85ProBody');if(b)b.innerHTML=v85ProHtml()}
  async function v85ProLoad(){if(V85_ELLA||!v85Code())return;v85Pro.err='';try{const j=await gas('pro_list');v85Pro.list=j.codes||[]}catch(e){v85Pro.err=e.message||'No se pudo cargar.'}v85ProPaint()}
  function v85ProShareText(c){return `🔑 Tu código Pro de Mi Progreso: ${c.code}\nVence el ${v85Fecha(c.expiresAt)}.\n\nEscríbelo en la app Mi Progreso Libre: al abrirla te lo pregunta, o en Ajustes ⚙ → Mi Progreso Pro.\n\nSi aún no tienes la app (Android):\n${V85_PUBLIC_URL}`}
  async function v85ProAct(fn,okMsg){if(v85Pro.busy)return;v85Pro.busy=true;try{await fn();if(okMsg)toast(okMsg)}catch(e){toast(e.message||'No se pudo guardar.')}finally{v85Pro.busy=false;v85ProPaint()}}
  const v85ProSet=r=>{v85Pro.list=(v85Pro.list||[]).map(x=>x.id===r.id?r:x)};

  /* ---------- Ajustes ---------- */
  const _rs850=renderSettings;
  renderSettings=function(){
    const r=_rs850.apply(this,arguments);
    try{
      const box=$('#settingsContent');if(!box)return r;
      box.insertAdjacentHTML('afterbegin',v85ShareHtml());
      const pip=v85Pip.ok?`<details class="settings-group" id="v85PipSet"><summary>⧉ Ventana flotante</summary><div class="settings-section"><p class="small" style="margin-top:0">Deja el descanso y el ejercicio en una ventanita encima de otras apps (música, WhatsApp…).</p><button class="secondary" data-v85-pip>Abrir en ventana flotante ahora</button><label class="toggle-row"><input type="checkbox" data-v85-pip-auto ${v85PipPrefs().auto?'checked':''}> Durante un entreno, al salir de la app pasar sola a ventana flotante (Android 12 o más)</label></div></details>`:'';
      const keys=`<details class="settings-group v85-keys" id="v85KeysSet"><summary>🔑 Claves de IA (${v85Pool('groq',(()=>{try{return aiCfg().key||''}catch{return ''}})()).length||0})</summary><div class="settings-section" id="v85KeysBody">${v85KeysHtml()}</div></details>`;
      const chat=v85Code()?`<details class="settings-group"><summary>💬 Chat con ${esc(v85Other())}</summary><div class="settings-section"><p class="small" style="margin-top:0">Escríbanse desde la app. Te aviso con una notificación aunque esté cerrada (puede tardar unos minutos).</p><button class="secondary" data-v85-chat>Abrir chat</button></div></details>`:'';
      const pro=(!V85_ELLA&&v85Code())?`<details class="settings-group" id="v85ProSet"><summary>✦ Códigos Pro (app libre)</summary><div class="settings-section" id="v85ProBody">${v85ProHtml()}</div></details>`:'';
      box.insertAdjacentHTML('beforeend',chat+pro+pip+keys);
      $('#v85ProSet')?.addEventListener('toggle',e=>{if(e.target.open)v85ProLoad()});
    }catch(e){console.error(e)}
    return r;
  };

  /* ---------- Eventos ---------- */
  document.addEventListener('click',e=>{
    const t=e.target;
    if(t.closest('#v85ChatBtn')||t.closest('[data-v85-chat]')){try{closeM('settingsModal')}catch{}v85OpenChat('');return}
    if(t.closest('[data-v85-close]')){v85CloseChat();return}
    if(t.closest('[data-v85-send]')){v85Send();return}
    const th=t.closest('[data-v85-th]');if(th){v85OpenChat(th.dataset.v85Th);return}
    if(t.closest('[data-v85-share]')){v85Share();return}
    if(t.closest('[data-v85-pip]')){try{closeM('settingsModal')}catch{}v85EnterPip();return}
    if(t.closest('[data-v85-keys-save]')){const v=($('#v85KeysMan')?.value||'').split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean);const bad=v.filter(k=>!v85KeyProv(k));if(bad.length){toast('Hay claves que no reconozco (deben empezar por gsk_, sk- o sk-ant-).');return}v85Ls.set(V85_MAN,[...new Set(v)]);const b=$('#v85KeysBody');if(b)b.innerHTML=v85KeysHtml();toast('✓ Claves guardadas');return}
    if(t.closest('[data-v85-keys-sync]')){v85SyncKeys(true).then(ok=>{const b=$('#v85KeysBody');if(b)b.innerHTML=v85KeysHtml();toast(ok?'✓ Claves actualizadas':'No se pudo conectar con el servidor.')});return}
    if(t.closest('[data-v85-req-open]')){v85Chat.reqNew=[];$('#v85ReqCard')?.remove();try{openRequests()}catch{}return}
    if(t.closest('[data-v85-req-ok]')){v85Chat.reqNew=[];$('#v85ReqCard')?.remove();return}
    if(t.closest('[data-v85-pro-new]')){const name=($('#v85ProName')?.value||'').trim(),days=Number($('#v85ProDays')?.value)||30;if(!name){toast('Escribe el nombre de la persona.');$('#v85ProName')?.focus();return}
      v85ProAct(async()=>{const j=await gas('pro_create',{name,days});v85Pro.list=[j.pro,...(v85Pro.list||[])];const n=$('#v85ProName');if(n)n.value='';v85ProPaint();try{NX?.shareText?.(v85ProShareText(j.pro))}catch{}},'✓ Código creado');return}
    const ps=t.closest('[data-v85-pro-share]');if(ps){const c=(v85Pro.list||[]).find(x=>x.id===ps.dataset.v85ProShare);if(c){try{if(NX?.shareText){NX.shareText(v85ProShareText(c));return}}catch{}prompt('Copia el código:',c.code)}return}
    const pd=t.closest('[data-v85-pro-days]');if(pd){v85ProAct(async()=>{const j=await gas('pro_update',{id:pd.dataset.v85ProDays,days:30});v85ProSet(j.pro)},'✓ 30 días más');return}
    const pl=t.closest('[data-v85-pro-free]');if(pl){if(!confirm('¿Liberar el teléfono de este código? Úsalo cuando la persona cambie de teléfono: el siguiente que lo escriba se queda con él y el anterior vuelve a gratis.'))return;v85ProAct(async()=>{const j=await gas('pro_update',{id:pl.dataset.v85ProFree,release:true});v85ProSet(j.pro)},'✓ Teléfono liberado');return}
    const pf=t.closest('[data-v85-pro-off]');if(pf){if(!confirm('¿Desactivar este código? La persona vuelve a la versión gratis (sus datos se quedan).'))return;v85ProAct(async()=>{const j=await gas('pro_update',{id:pf.dataset.v85ProOff,revoke:true});v85ProSet(j.pro)},'Código desactivado');return}
    const po=t.closest('[data-v85-pro-on]');if(po){v85ProAct(async()=>{const j=await gas('pro_update',{id:po.dataset.v85ProOn,revoke:false});v85ProSet(j.pro)},'✓ Código reactivado');return}
    const px=t.closest('[data-v85-pro-del]');if(px){if(!confirm('¿Borrar este código? Su carpeta en Drive no se borra.'))return;v85ProAct(async()=>{await gas('pro_delete',{id:px.dataset.v85ProDel});v85Pro.list=(v85Pro.list||[]).filter(x=>x.id!==px.dataset.v85ProDel)},'Código borrado');return}
  });
  document.addEventListener('change',e=>{if(e.target.matches('[data-v85-pip-auto]')){v85PipPrefs().auto=e.target.checked;persist(true);v85Pip.auto=null;v85PipWatch()}});
  document.addEventListener('keydown',e=>{if(e.target.id==='v85ChInput'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();v85Send()}});
  document.addEventListener('input',e=>{if(e.target.id==='v85ChInput'){e.target.style.height='auto';e.target.style.height=Math.min(120,e.target.scrollHeight)+'px'}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){v85BgPoll();if(v85Chat.open)v85Refresh(true)}});

  const _rna850=runNativeAction;
  runNativeAction=function(a){
    if(a==='go:chat'||a==='go:chat:prueba'){v85OpenChat(a.endsWith(':prueba')?'prueba':'');return}
    if(a==='go:pip'){v85EnterPip();return}
    return _rna850(a);
  };

  setTimeout(()=>{v85EnsureBtn();v85BgPoll();v85SyncKeys(false);v85CheckRequests()},2500);
  setInterval(()=>{v85EnsureBtn();v85BgPoll()},45000);
  setInterval(v85CheckRequests,5*60000);
  setInterval(v85PipWatch,1500);
  v85CheckMini();

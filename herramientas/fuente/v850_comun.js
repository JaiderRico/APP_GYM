  /* ===================== v8.5.0 (+8.5.15 ventana flotante): chat, varias claves de IA, compartir la app libre y ventana flotante ===================== */
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
    body.v85-mini{overflow:hidden!important}
    body.v85-mini #v85Mini{--s:1;display:flex;position:fixed;inset:0;flex-direction:column;justify-content:center;gap:calc(1.4vmin*var(--s));padding:calc(4vmin*var(--s)) calc(5vmin*var(--s));background:var(--bg);color:var(--text);overflow:hidden;font-family:inherit}
    body.v85-mini #v85Mini.lg{--s:1.18}body.v85-mini #v85Mini.sm{--s:.86}
    #v85Mini .mpc{align-self:flex-start;justify-self:start;display:inline-flex;align-items:center;gap:.4em;padding:.28em .7em;border-radius:99px;background:var(--panel2,#222);border:1px solid var(--line,#333);font-size:calc(5.2vmin*var(--s));font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
    #v85Mini .mpc.warm{color:#ffd49a;border-color:#725b37;background:#2a2418}
    #v85Mini .mpc.rest{color:var(--green2,var(--green));border-color:var(--green)}
    #v85Mini .mpc.pause{color:#ffaaa1;border-color:#724540}
    #v85Mini .mpn{font-size:calc(7.4vmin*var(--s));font-weight:800;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    #v85Mini .mph{display:flex;align-items:baseline;flex-wrap:wrap;gap:0 .3em;line-height:1}
    #v85Mini .mph b{font-size:calc(19vmin*var(--s));font-weight:900;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
    #v85Mini .mph span{font-size:calc(7vmin*var(--s));font-weight:700;color:var(--muted)}
    #v85Mini .mph.timer b{font-size:calc(24vmin*var(--s))}
    #v85Mini .mph.timer.low b{color:var(--green2,var(--green))}
    #v85Mini .mpf{display:flex;flex-wrap:wrap;gap:calc(1.6vmin*var(--s))}
    #v85Mini .mpf i{font-style:normal;font-size:calc(5.6vmin*var(--s));font-weight:700;padding:.25em .55em;border-radius:.6em;background:var(--panel,#1a1a1a);border:1px solid var(--line,#333);white-space:nowrap}
    #v85Mini .mpb{height:calc(2vmin*var(--s));min-height:4px;border-radius:99px;background:var(--panel2,#222);overflow:hidden}
    #v85Mini .mpb span{display:block;height:100%;background:var(--green);transition:width .4s linear}
    #v85Mini .mpx{border-top:1px solid var(--line,#333);padding-top:calc(2vmin*var(--s));font-size:calc(5.6vmin*var(--s));color:var(--muted);line-height:1.3}
    #v85Mini .mpx strong{display:block;color:var(--text);font-size:calc(6.4vmin*var(--s));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #v85Mini .mpm{font-size:calc(5.4vmin*var(--s));color:var(--muted);line-height:1.3}
    @media (min-aspect-ratio:5/4){
      body.v85-mini #v85Mini{display:grid;grid-template-columns:auto minmax(0,1fr);grid-auto-flow:dense;align-content:center;column-gap:5vmin}
      #v85Mini .mpc,#v85Mini .mpn,#v85Mini .mpx,#v85Mini .mpb,#v85Mini .mpm{grid-column:1/-1}
      #v85Mini .mph{grid-column:1}#v85Mini .mpf{grid-column:2;align-self:center}
    }
    .v85-pip-opts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}
    .v85-pip-opts button{margin:0;padding:9px 4px;font-size:12px;display:flex;flex-direction:column;align-items:center;gap:5px}
    .v85-pip-opts button.on{border-color:var(--green);color:var(--green2,var(--green));font-weight:800}
    .v85-pip-opts .shape{display:block;border:2px solid currentColor;border-radius:3px}
    .v85-req{border-left:4px solid var(--green)}
    .v85-ch-foot .v85-att{min-width:44px;padding:0;background:var(--panel2);color:var(--text)}
    .v85-sheet{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px 0;background:var(--panel);border-top:1px solid var(--line)}
    .v85-sheet.hidden{display:none}.v85-sheet button{margin:0;padding:10px 6px;font-size:13px}
    .v85-msg.media{padding:4px;max-width:72%}.v85-msg.media .cap{padding:4px 8px 0}
    .v85-mbox{position:relative;display:block;border-radius:12px;overflow:hidden;background:#0003;min-width:160px;min-height:110px;cursor:pointer}
    .v85-mbox img{display:block;width:100%;max-height:320px;object-fit:cover}
    .v85-mbox img.blur{filter:blur(8px);transform:scale(1.08)}
    .v85-mbox .ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;color:#fff;text-shadow:0 1px 3px #000;font-weight:800}
    .v85-mbox .ov .pl{font-size:34px;line-height:1}.v85-mbox .ov small{font-weight:600;font-size:11px}
    .v85-once{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:#0002;min-width:180px;cursor:pointer}
    .v85-once b{display:block;font-size:14px}.v85-once span{font-size:12px;opacity:.8}.v85-once .i{font-size:26px}
    .v85-once.off{cursor:default;opacity:.7}
    #v85View{position:fixed;inset:0;z-index:9600;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center}
    #v85View img,#v85View video{max-width:100%;max-height:calc(100% - 90px);-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
    #v85View .vh{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;color:#fff;background:linear-gradient(#000a,#0000)}
    #v85View .vh button{margin:0;background:#fff2;color:#fff;border:0}
    #v85View .cap{color:#fff;padding:10px 16px;text-align:center;white-space:pre-wrap}
    .v85-spin{width:26px;height:26px;border:3px solid #fff5;border-top-color:#fff;border-radius:50%;animation:v85sp 0.9s linear infinite}@keyframes v85sp{to{transform:rotate(1turn)}}
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
    let pool=v85Pool(prov,cur);
    if(!pool.length)return v85Fetch(input,init);
    let res=null;const tried=new Set();
    for(let i=0;i<pool.length;i++){
      const k=pool[i],hh={...h};tried.add(k);
      if(prov==='anthropic')hh['x-api-key']=k;else{delete hh.Authorization;hh.authorization='Bearer '+k}
      res=await v85Fetch(input,{...init,headers:hh});
      if(res.status!==429&&res.status!==401&&res.status!==403){
        if(k!==cur){try{const c=aiCfg();if(c.key===cur||!c.key){if(cur&&!v85AllKeys().includes(cur))v85Ls.set(V85_MAN,[...v85List(V85_MAN),cur]);aiSaveCfg({...c,key:k})}}catch{}
          try{toast('🔑 Una clave de IA se agotó: ya estoy usando la siguiente.')}catch{}}
        return res;
      }
      const ra=Number(res.headers?.get?.('retry-after'))||0;
      v85MarkCool(k,res.status===429?Math.max(ra*1000,5*60000):6*3600000);
      // Se acabaron las claves que tenía el teléfono: traer las del servidor (quizá agregaste nuevas) y seguir con esas
      if(i===pool.length-1&&prov==='groq'&&!init.__v85Synced&&Date.now()-(v85Ls.get('mp_ai_keys_force',0))>60000){
        init.__v85Synced=true;v85Ls.set('mp_ai_keys_force',Date.now());
        if(await v85SyncKeys(true)){const more=v85Pool(prov,'').filter(x=>!tried.has(x));pool=pool.concat(more)}
      }
    }
    return res;
  };
  async function v85SyncKeys(force){
    if(!v85Code())return false;
    const last=v85Ls.get('mp_ai_keys_sync',0);if(!force&&Date.now()-last<3*3600000)return false;
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
  function v85SaveCache(){
    const L=v85Chat.msgs.slice(-300),keep=L.length-60;
    v85Ls.set(v85CacheKey(),{msgs:L.map((m,i)=>i<keep&&m.media&&m.media.thumb?{...m,media:{...m.media,thumb:''}}:m),readByOther:v85Chat.readByOther});
  }
  function v85Out(){const o=v85Ls.get(v85OutKey,[]);return Array.isArray(o)?o:[]}
  const v85Me=()=>V85_ELLA?'ella':'jaider';
  function v85Merge(list){
    const byId=new Map(v85Chat.msgs.map(m=>[m.id,m]));let added=0;
    (list||[]).forEach(m=>{if(!m||!m.id)return;if(!byId.has(m.id))added++;const old=byId.get(m.id);
      const media=m.media?{...(old&&old.media||{}),...m.media,...(old&&old.media&&old.media.opened&&!m.media.opened?{opened:old.media.opened}:{})}:undefined;
      byId.set(m.id,{id:m.id,from:m.from,text:m.text||'',ts:Number(m.ts)||0,...(media?{media}:{})})});
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
    const sending=(v85Chat.sending||[]).filter(x=>(x.thread||'')===v85ThreadKey()&&!v85Chat.msgs.some(m=>m.id===x.id)).map(x=>({id:x.id,from:me,text:x.text,ts:x.ts,media:x.media,pending:true,sendErr:x.err}));
    const all=[...v85Chat.msgs,...pend.filter(p=>!v85Chat.msgs.some(m=>m.id===p.id)).map(p=>({...p,from:me,pending:true})),...sending];
    if(!all.length){box.innerHTML=`<div class="v85-ch-empty"><div style="font-size:40px">💬</div><p>Aún no hay mensajes. Escríbele a ${esc(v85Other())} lo que quieras: dudas de la rutina, cambios para la app o cómo te fue.</p></div>`;return}
    let h='',lastDay='';const lastMine=[...all].reverse().find(m=>m.from===me&&!m.pending);
    all.forEach(m=>{const day=v85DayLabel(m.ts||Date.now());if(day!==lastDay){h+=`<div class="v85-day">${esc(day)}</div>`;lastDay=day}
      const st=m.sendErr?`⚠️ No se envió · <a href="#" data-v85-retry="${esc(m.id)}" style="color:inherit;font-weight:800">Reintentar</a>`:m.pending?(m.media?'⏳ enviando… (puede tardar con videos)':'⏳ enviando'):esc(v85Time(m.ts));
      h+=m.media?`<div class="v85-msg media${m.from===me?' me':''}${m.pending&&!m.sendErr?' pend':''}">${v85MediaHtml(m,me)}${m.text?`<div class="cap">${esc(m.text)}</div>`:''}<small>${st}</small></div>`
        :`<div class="v85-msg${m.from===me?' me':''}${m.pending?' pend':''}">${esc(m.text)}<small>${st}</small></div>`;
      if(lastMine&&m.id===lastMine.id&&v85Chat.readByOther>=lastMine.ts)h+='<div class="v85-seen">✓✓ Visto</div>'});
    const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<80;
    box.innerHTML=h;if(atBottom||v85Chat.forceScroll){box.scrollTop=box.scrollHeight;v85Chat.forceScroll=false}
    v85AutoLoadImages();
  }

  /* ---------- 2b) Fotos y videos en el chat (normales o "ver una vez") ---------- */
  const V85_MAX_VIDEO=20*1024*1024,v85Full={},v85Loading={};
  const v85Kb=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
  const v85Dur=s=>s?`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`:'';
  function v85CachedImg(id){if(v85Full[id])return v85Full[id];try{const v=window.NativeStore?.loadPhoto?.('chatm_'+id);if(v&&/^data:image/.test(v)){v85Full[id]=v;return v}}catch{}return ''}
  function v85CacheImg(id,url){v85Full[id]=url;try{window.NativeStore?.savePhoto?.('chatm_'+id,url)}catch{}}
  function v85MediaHtml(m,me){
    const x=m.media,mine=m.from===me,vid=x.kind==='video',name=vid?'Video':'Foto';
    if(x.once){
      if(m.pending)return `<div class="v85-once off"><span class="i">👁</span><div><b>${name} · ver una vez</b><span>Enviando…</span></div></div>`;
      if(mine)return `<div class="v85-once off"><span class="i">${x.opened?'✓':'👁'}</span><div><b>${name} · ver una vez</b><span>${x.opened?'Abierta':'Sin abrir'}</span></div></div>`;
      return x.opened?`<div class="v85-once off"><span class="i">✓</span><div><b>${name} · ver una vez</b><span>Ya la abriste</span></div></div>`
        :`<div class="v85-once" data-v85-open="${esc(m.id)}"><span class="i">👁</span><div><b>${name} · ver una vez</b><span>Toca para abrir (se borra al cerrar)</span></div></div>`;
    }
    const full=!vid&&v85CachedImg(m.id),src=full||x.thumb||'';
    const ov=vid?`<div class="ov"><span class="pl">▶</span><small>${esc([v85Dur(x.dur),x.size?v85Kb(x.size):''].filter(Boolean).join(' · '))}</small></div>`:(!full&&!m.pending?'<div class="ov"><div class="v85-spin"></div></div>':'');
    return `<div class="v85-mbox" ${m.pending?'':`data-v85-open="${esc(m.id)}"`}>${src?`<img src="${src}" class="${full||vid?'':'blur'}" alt="">`:`<div style="height:140px"></div>`}${ov}</div>`;
  }
  // URL y cuerpo de cada app (código y, en la de Ella, app:'ella')
  function v85Url(){try{return V85_ELLA?herUrl():hmUrl()}catch{return MP_DRIVE_URL}}
  async function v85Big(action,extra){
    const body=JSON.stringify({action,code:v85Code(),...(V85_ELLA?{app:'ella'}:{}),...extra});
    let txt=null;
    try{const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),300000);
      const r=await fetch(v85Url(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body,signal:ctl.signal});clearTimeout(to);txt=await r.text()}
    catch(e){const r=await nxHttp('POST',v85Url(),{'Content-Type':'text/plain;charset=utf-8'},body);if(r.status<0)throw new Error('Sin conexión. Revisa tu internet.');txt=r.text}
    let j;try{j=JSON.parse(txt)}catch{throw new Error('No se pudo conectar con el servidor.')}
    if(!j.ok){const e=new Error(j.error||'Error del servidor');e.auth=/c[oó]digo/i.test(j.error||'')&&!/ver una vez/i.test(j.error||'');throw e}
    return j;
  }
  async function v85GetMedia(id){
    if(v85Loading[id])return v85Loading[id];
    return v85Loading[id]=(async()=>{try{const tk=v85ThreadKey();return (await v85Big('chat_media',{id,...(tk?{thread:tk}:{})})).media}finally{delete v85Loading[id]}})();
  }
  function v85AutoLoadImages(){
    if(!v85Chat.open)return;
    v85Chat.msgs.slice(-30).forEach(m=>{if(m.media&&m.media.kind==='image'&&!m.media.once&&!v85CachedImg(m.id)&&!v85Loading[m.id]&&!(v85Chat.failed||{})[m.id]){
      v85GetMedia(m.id).then(x=>{v85CacheImg(m.id,x.dataUrl);v85Render()}).catch(()=>{(v85Chat.failed=v85Chat.failed||{})[m.id]=1})}});
  }
  async function v85Open(id){
    const m=v85Chat.msgs.find(x=>x.id===id);if(!m||!m.media)return;const x=m.media;
    if(x.once&&m.from!==v85Me()&&!confirm(`Es ${x.kind==='video'?'un video':'una foto'} para ver una vez: al cerrarl${x.kind==='video'?'o':'a'} se borra. ¿Abrir ahora?`))return;
    v85Viewer(null,m);
    try{
      let url=x.kind==='image'&&!x.once?v85CachedImg(id):'';
      if(!url){const r=await v85GetMedia(id);url=r.dataUrl;if(x.kind==='image'&&!x.once)v85CacheImg(id,url)}
      if(x.once){x.opened=Date.now();v85SaveCache();v85Render()}
      if(!$('#v85View'))return;
      if(x.kind==='video'){const b=await (await fetch(url)).blob();v85Viewer(URL.createObjectURL(b),m)}else v85Viewer(url,m);
    }catch(e){$('#v85View')?.remove();toast(e.message||'No se pudo abrir.');if(/Ya lo abriste/.test(e.message||'')){x.opened=x.opened||Date.now();v85SaveCache();v85Render()}}
  }
  function v85Viewer(url,m){
    const old=$('#v85View');const oldUrl=old?.dataset.blob;if(oldUrl)try{URL.revokeObjectURL(oldUrl)}catch{}old?.remove();
    const x=m.media,vid=x.kind==='video';
    const body=!url?'<div class="v85-spin"></div>':vid?`<video src="${url}" controls autoplay playsinline controlslist="nodownload" ${x.once?'disablepictureinpicture':''}></video>`:`<img src="${url}" alt="">`;
    document.body.insertAdjacentHTML('beforeend',`<div id="v85View" ${url&&vid?`data-blob="${url}"`:''} oncontextmenu="return false"><div class="vh"><span>${x.once?'👁 Ver una vez · se borra al cerrar':esc(v85DayLabel(m.ts)+' '+v85Time(m.ts))}</span><button data-v85-view-close>✕ Cerrar</button></div>${body}${m.text?`<div class="cap">${esc(m.text)}</div>`:''}</div>`);
  }
  function v85CloseView(){const v=$('#v85View');if(!v)return;const u=v.dataset.blob;v.querySelector('video')?.pause();if(u)try{URL.revokeObjectURL(u)}catch{}v.remove()}
  // Preparar el archivo: fotos comprimidas (máx. 1600 px), videos tal cual (máx. 20 MB)
  function v85ReadUrl(file){return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=()=>no(new Error('No pude leer el archivo.'));r.readAsDataURL(file)})}
  function v85Jpeg(src,max,q){const sc=Math.min(1,max/Math.max(src.w,src.h)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(src.w*sc));c.height=Math.max(1,Math.round(src.h*sc));c.getContext('2d').drawImage(src.el,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)}
  function v85Thumb(src){for(const [mx,q] of [[120,.6],[90,.5],[64,.45]]){const t=v85Jpeg(src,mx,q);if(t.length<=11500)return t}return ''}
  async function v85PrepImage(file){
    const u=URL.createObjectURL(file);
    try{const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('No pude leer la foto.'));i.src=u});
      const src={el:img,w:img.naturalWidth,h:img.naturalHeight};
      return {dataUrl:v85Jpeg(src,1600,.82),thumb:v85Thumb(src),w:src.w,h:src.h,kind:'image'};
    }finally{URL.revokeObjectURL(u)}
  }
  async function v85PrepVideo(file){
    if(file.size>V85_MAX_VIDEO)throw new Error(`El video pesa ${v85Kb(file.size)}. El máximo es 20 MB: recórtalo o grábalo más corto.`);
    const type=/^video\/(mp4|3gpp|webm|quicktime|x-matroska)$/.test(file.type)?file.type:'video/mp4';
    let dataUrl=await v85ReadUrl(file);dataUrl=dataUrl.replace(/^data:[^;,]*;/,'data:'+type+';');
    let thumb='',w=0,h=0,dur=0;const u=URL.createObjectURL(file);
    try{await new Promise(ok=>{const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';const done=()=>ok();const t=setTimeout(done,5000);
      v.onloadedmetadata=()=>{dur=Math.round(v.duration)||0;w=v.videoWidth;h=v.videoHeight;try{v.currentTime=Math.min(0.5,(v.duration||1)/2)}catch{clearTimeout(t);done()}};
      v.onseeked=()=>{try{thumb=v85Thumb({el:v,w:v.videoWidth,h:v.videoHeight})}catch{}clearTimeout(t);done()};v.onerror=()=>{clearTimeout(t);done()};v.src=u})}
    finally{URL.revokeObjectURL(u)}
    return {dataUrl,thumb,w,h,dur,kind:'video'};
  }
  async function v85SendMedia(file,once){
    const vid=/^video\//.test(file.type)||/\.(mp4|3gp|webm|mov|mkv)$/i.test(file.name||'');
    const inp=$('#v85ChInput'),text=(inp?.value||'').trim().slice(0,1000);
    let prep;try{toast(vid?'Preparando el video…':'Preparando la foto…');prep=vid?await v85PrepVideo(file):await v85PrepImage(file)}catch(e){toast(e.message||'No se pudo preparar.');return}
    if(inp){inp.value='';inp.style.height=''}
    const item={id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),ts:Date.now(),text,thread:v85ThreadKey(),
      media:{kind:prep.kind,once:!!once,thumb:once?'':prep.thumb,w:prep.w,h:prep.h,dur:prep.dur||0,size:Math.round(prep.dataUrl.length*0.75)},data:prep};
    v85Chat.sending=[...(v85Chat.sending||[]),item];v85Chat.forceScroll=true;v85Render();v85SendItem(item);
  }
  async function v85SendItem(item){
    item.err='';v85Render();
    try{
      const p=item.data;
      const j=await v85Big('chat_send',{id:item.id,text:item.text,...(item.thread?{thread:item.thread}:{}),media:{dataUrl:p.dataUrl,kind:p.kind,once:item.media.once,thumb:item.media.thumb,w:p.w,h:p.h,dur:p.dur}});
      if(p.kind==='image'&&!item.media.once)v85CacheImg(item.id,p.dataUrl);
      if((item.thread||'')===v85ThreadKey())v85Merge([j.message]);
      v85Chat.sending=(v85Chat.sending||[]).filter(x=>x!==item);v85SaveCache();v85Render();
    }catch(e){item.err=e.message||'error';v85Render();toast(e.message||'No se pudo enviar.')}
  }
  function v85OpenChat(thread){
    if(!v85Code()){toast(V85_ELLA?'Activa tu app primero.':'Primero escribe tu código de administrador.');return}
    v85Chat.thread=V85_ELLA?'':(thread==='prueba'?'prueba':'');v85LoadCache();
    $('#v85Chat')?.remove();
    const th=V85_ELLA?'':`<div class="v85-th"><button class="secondary ${v85Chat.thread?'':'on'}" data-v85-th="">Con ${esc(v85Other())}</button><button class="secondary ${v85Chat.thread?'on':''}" data-v85-th="prueba">🧪 Prueba</button></div>`;
    document.body.insertAdjacentHTML('beforeend',`<div class="v85-chat" id="v85Chat" role="dialog" aria-modal="true"><div class="v85-ch-head"><h2>💬 ${esc(v85Other())}<span class="small" id="v85ChSub">${V85_ELLA&&(()=>{try{return kvGet('app_user')==='prueba'}catch{return false}})()?'🧪 Modo prueba: chat aparte':'Los mensajes llegan aunque la app esté cerrada'}</span></h2><button class="secondary" data-v85-close>Cerrar</button></div>${th}<div class="v85-ch-list" id="v85ChList"></div><div class="v85-sheet hidden" id="v85Sheet"><button class="secondary" data-v85-pick="image">📷 Foto</button><button class="secondary" data-v85-pick="video">🎥 Video</button><button class="secondary" data-v85-pick="image" data-once="1">👁 Foto · ver una vez</button><button class="secondary" data-v85-pick="video" data-once="1">👁 Video · ver una vez</button></div><input type="file" id="v85File" hidden><div class="v85-ch-foot"><button class="secondary v85-att" data-v85-attach aria-label="Adjuntar foto o video">📎</button><textarea id="v85ChInput" rows="1" maxlength="1000" placeholder="Escribe un mensaje…"></textarea><button class="primary" data-v85-send aria-label="Enviar">➤</button></div></div>`);
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
      else{const prev=v85Chat.unread;v85Chat.unread=Number(j.unread)||0;if(v85Chat.unread>prev){const last=[...v85Chat.msgs].reverse().find(m=>m.from!==v85Me());if(last)toast(`💬 ${v85Other()}: ${last.media?(last.media.kind==='video'?'🎥 Video':'📷 Foto')+(last.media.once?' (ver una vez)':''):last.text.slice(0,70)}`)}}
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
  // 8.5.15: forma elegible (vertical, 3:4, cuadrada, horizontal) y tamaño de letra; vista armada con datos
  // del entreno (no con el texto de la pantalla), que se adapta sola si agrandas la ventana con dos dedos.
  const v85Pip={ok:false,auto:null};
  try{v85Pip.ok=!!window.NativeStore?.savePhoto?.('__pip__','supported')}catch{}
  const V85_PIP_SHAPES={'9:16':'Vertical','3:4':'Media','1:1':'Cuadrada','16:9':'Horizontal'};
  function v85PipPrefs(){data.settings=data.settings||{};const p=data.settings.pip=Object.assign({auto:true,shape:'9:16',text:'md'},data.settings.pip||{});if(!V85_PIP_SHAPES[p.shape])p.shape='9:16';if(!['sm','md','lg'].includes(p.text))p.text='md';return p}
  const v85PipRatio=()=>v85PipPrefs().shape;
  function v85EnterPip(){
    if(!v85Pip.ok){toast('Tu teléfono no permite ventana flotante para esta app.');return}
    v85Mini(true);
    try{if(!window.NativeStore.savePhoto('__pip__','enter:'+v85PipRatio())){v85Mini(false);toast('No se pudo abrir la ventana flotante.')}}catch{v85Mini(false)}
  }
  function v85Training(){try{return typeof flowPhase!=='undefined'&&flowPhase!=='setup'&&!$('#focusWorkout')?.classList.contains('hidden')}catch{return false}}
  function v85PipWatch(){
    if(!v85Pip.ok)return;
    const want=!!(v85PipPrefs().auto&&v85Training()),key=want+'|'+v85PipRatio();
    // Formato "auto:w:h:1": las versiones viejas solo miraban si terminaba en 1.
    if(key!==v85Pip.auto){v85Pip.auto=key;try{window.NativeStore.savePhoto('__pip__','auto:'+v85PipRatio()+':'+(want?1:0))}catch{}}
    const b=$('#pauseWorkout');if(b&&!$('#v85PipBtn'))b.insertAdjacentHTML('afterend','<button class="secondary" id="v85PipBtn" data-v85-pip title="Seguir viendo el descanso mientras usas otra app">⧉ Ventana flotante</button>');
  }
  if(!document.getElementById('v85Mini'))document.body.insertAdjacentHTML('beforeend','<div id="v85Mini" aria-hidden="true"></div>');
  let v85MiniTimer=0,v85MiniKey='';
  function v85Mini(on){document.body.classList.toggle('v85-mini',!!on);clearInterval(v85MiniTimer);v85MiniKey='';if(on){v85MiniFill();v85MiniTimer=setInterval(v85MiniFill,500)}}
  const v85N=v=>{const n=Number(v);if(!Number.isFinite(n))return '';const r=Math.round(n*100)/100;return Number.isInteger(r)?String(r):String(r).replace('.',',')};
  const v85U=u=>u==='plates'?'placas':u==='lb'?'lb':'kg';
  // Carga de una serie en piezas cortas: número grande, unidad y nota (por lado / combinado / asistencia).
  function v85LoadParts(ex,st){
    if(!st)return null;
    const eq=(()=>{try{return setEquipment(st,ex.equipment||'')}catch{return st.equipment||ex.equipment||''}})();
    const has=st.load!==''&&st.load!=null&&Number(st.load)>0;
    if(!has)return eq==='Peso corporal'?{big:'Corporal',unit:'',note:''}:{big:'—',unit:'',note:'sin carga previa'};
    let mode='total';try{mode=loadMode(st,eq)}catch{}
    const unit=v85U(st.unit||'kg');let note='';
    if(mode==='per_side'){note='por lado';try{if((st.execution||'bilateral')!=='unilateral')note+=' · '+v85N(totalLoad(st,eq))+' '+unit+' total'}catch{}}
    else if(mode==='assistance')note='de asistencia';
    return {big:v85N(st.load),unit,note};
  }
  function v85SetInfo(ex,i){
    const st=ex?.sets?.[i];if(!st)return null;
    const warm=setType(st)==='warmup',sets=ex.sets||[];
    const pos=warm?sets.slice(0,i+1).filter(x=>setType(x)==='warmup').length:sets.slice(0,i+1).filter(isEffectiveSet).length;
    const tot=warm?sets.filter(x=>setType(x)==='warmup').length:sets.filter(isEffectiveSet).length;
    let reps='',rir='';
    if(warm){reps=Number(st.solo)>0?String(st.solo):'';rir='suave'}
    else{
      try{const t=todayTarget(ex,i);if(t&&t.reps)reps=String(t.reps)}catch{}
      if(!reps&&ex.plannedReps)reps=String(ex.plannedReps);
      if(!reps&&Number(st.solo)>0)reps=String(st.solo);
      rir=ex.plannedRir!=null&&ex.plannedRir!==''?String(ex.plannedRir):'';
    }
    const kind={drop:'Drop set',restpause:'Rest-pause',failure:'Al fallo'}[setType(st)]||'';
    return {st,warm,pos,tot,reps,rir,kind,load:v85LoadParts(ex,st)};
  }
  function v85MiniHtml(){
    const P=v85PipPrefs();
    if(!v85Training()){
      const hh=new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',hour12:false});
      return {key:'idle|'+hh+'|'+(v85Chat.unread||0),html:`<span class="mpc">Mi Progreso</span><div class="mph timer"><b>${hh}</b></div>${v85Chat.unread?`<div class="mpm">💬 ${v85Chat.unread} mensaje(s) nuevo(s)</div>`:'<div class="mpm">Sin entreno en curso</div>'}`};
    }
    let paused=false;try{paused=!!sessionPausedAt}catch{}
    if(flowPhase==='done')return {key:'done',html:'<span class="mpc rest">Listo</span><div class="mpn">Entrenamiento terminado</div><div class="mpm">Vuelve a la app para guardarlo.</div>'};
    if(flowPhase==='rest'){
      let left=0,total=0;try{left=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));total=Number(restOriginalSeconds)||0}catch{}
      if(paused){try{left=Math.max(0,Math.ceil((Number(pausedRestMs)||0)/1000))}catch{}}
      const pct=total>0?Math.max(0,Math.min(100,Math.round((1-left/total)*100))):0;
      let nx='',ni=null;
      try{const ex=draft.find(x=>x.id===pendingNext?.exerciseId);if(ex){const i=Math.max(0,ex.sets.findIndex(x=>x.id===pendingNext.setId));ni=v85SetInfo(ex,i>=0?i:Number(ex.completedSets)||0);nx=ex.name}}catch{}
      const prep=ni?.load&&ni.load.big!=='—'?`${ni.load.big}${ni.load.unit?' '+ni.load.unit:''}${ni.load.note?' '+ni.load.note.split(' · ')[0]:''}`:'';
      const nextHtml=nx?`<div class="mpx">Sigue${ni?` · ${ni.warm?'calentamiento':'serie'} ${ni.pos}/${ni.tot}`:''}<strong>${esc(nx)}</strong>${prep?`Prepara <b style="color:var(--text)">${esc(prep)}</b>`:''}</div>`:'<div class="mpx">Último descanso</div>';
      return {key:`rest|${left}|${pct}|${nx}|${prep}|${paused}|${P.text}`,html:`<span class="mpc ${paused?'pause':'rest'}">${paused?'⏸ Descanso en pausa':'⏱ Descanso'}</span><div class="mph timer ${left<=10?'low':''}"><b>${timeLabel(left)}</b></div><div class="mpb"><span style="width:${pct}%"></span></div>${nextHtml}`};
    }
    let ex=null,info=null;try{syncActiveIndices()}catch{}
    try{ex=draft[activeExercise];info=v85SetInfo(ex,activeSet)}catch{}
    if(!ex||!info)return {key:'none',html:'<span class="mpc">Entrenando</span><div class="mpm">Abre la app para elegir el ejercicio.</div>'};
    const chip=paused?'<span class="mpc pause">⏸ En pausa</span>':info.warm?`<span class="mpc warm">🔥 Calentamiento ${info.pos}/${info.tot}</span>`:`<span class="mpc">Serie ${info.pos}/${info.tot}${info.kind?' · '+esc(info.kind):''}</span>`;
    const L=info.load,facts=[info.reps?`× ${esc(info.reps)} reps`:'',info.rir&&!info.warm?`RIR ${esc(info.rir)}`:'',info.warm?'Suave, sin fatiga':''].filter(Boolean);
    const html=`${chip}<div class="mpn">${esc(ex.name)}</div><div class="mph"><b>${esc(L.big)}</b>${L.unit?`<span>${esc(L.unit)}</span>`:''}</div>${L.note?`<div class="mpm">${esc(L.note)}</div>`:''}${facts.length?`<div class="mpf">${facts.map(f=>`<i>${f}</i>`).join('')}</div>`:''}`;
    return {key:'set|'+html,html};
  }
  function v85MiniFill(){
    const box=document.getElementById('v85Mini');if(!box)return;
    const t=v85PipPrefs().text;box.classList.toggle('lg',t==='lg');box.classList.toggle('sm',t==='sm');
    let r;try{r=v85MiniHtml()}catch(e){r={key:'err',html:'<span class="mpc">Mi Progreso</span><div class="mpm">Abre la app para ver el entreno.</div>'}}
    if(r.key!==v85MiniKey){v85MiniKey=r.key;box.innerHTML=r.html}
  }
  // Se detecta la ventana flotante preguntándole al teléfono (si la agrandas puede pasar de 330 px de ancho).
  function v85PipActive(){try{return !!(v85Pip.ok&&window.NativeStore.savePhoto('__pip__','active'))}catch{return false}}
  function v85CheckMini(){const small=(window.innerWidth<330&&window.innerWidth>0)||v85PipActive();if(small!==document.body.classList.contains('v85-mini'))v85Mini(small)}
  window.addEventListener('resize',()=>{setTimeout(v85CheckMini,60);v85MiniKey=''});
  function v85PipSetHtml(){
    const P=v85PipPrefs(),sz={'9:16':[12,20],'3:4':[15,20],'1:1':[18,18],'16:9':[24,14]};
    return `<p class="small" style="margin-top:0">Deja el descanso y la serie en una ventanita encima de otras apps (música, WhatsApp…). Para agrandarla o achicarla: pellizca la ventana con dos dedos o arrastra una esquina.</p>
      <div class="small"><b>Forma</b></div><div class="v85-pip-opts">${Object.entries(V85_PIP_SHAPES).map(([k,l])=>`<button class="secondary ${P.shape===k?'on':''}" data-v85-pip-shape="${k}"><span class="shape" style="width:${sz[k][0]}px;height:${sz[k][1]}px"></span>${l}</button>`).join('')}</div>
      <div class="small"><b>Letra</b></div><div class="v85-pip-opts" style="grid-template-columns:repeat(3,1fr)">${[['sm','Pequeña'],['md','Normal'],['lg','Grande']].map(([k,l])=>`<button class="secondary ${P.text===k?'on':''}" data-v85-pip-text="${k}">${l}</button>`).join('')}</div>
      <button class="secondary" data-v85-pip>Abrir en ventana flotante ahora</button><label class="toggle-row"><input type="checkbox" data-v85-pip-auto ${P.auto?'checked':''}> Durante un entreno, al salir de la app pasar sola a ventana flotante (Android 12 o más)</label>`;
  }
  document.addEventListener('click',e=>{
    const sh=e.target.closest('[data-v85-pip-shape]'),tx=e.target.closest('[data-v85-pip-text]');if(!sh&&!tx)return;
    const P=v85PipPrefs();if(sh)P.shape=sh.dataset.v85PipShape;if(tx)P.text=tx.dataset.v85PipText;persist(true);v85Pip.auto=null;v85PipWatch();
    const body=document.getElementById('v85PipBody');if(body)body.innerHTML=v85PipSetHtml();
    toast(sh?`Ventana: ${V85_PIP_SHAPES[P.shape].toLowerCase()}`:'Letra de la ventana actualizada');
  });

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
      const pip=v85Pip.ok?`<details class="settings-group" id="v85PipSet"><summary>⧉ Ventana flotante</summary><div class="settings-section" id="v85PipBody">${v85PipSetHtml()}</div></details>`:'';
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
    if(t.closest('[data-v85-close]')){v85CloseView();v85CloseChat();return}
    if(t.closest('[data-v85-attach]')){$('#v85Sheet')?.classList.toggle('hidden');return}
    const pk=t.closest('[data-v85-pick]');if(pk){const f=$('#v85File');if(!f)return;f.value='';f.accept=pk.dataset.v85Pick==='video'?'video/*':'image/*';f.dataset.once=pk.dataset.once?'1':'';$('#v85Sheet')?.classList.add('hidden');f.click();return}
    const op=t.closest('[data-v85-open]');if(op){v85Open(op.dataset.v85Open);return}
    if(t.closest('[data-v85-view-close]')){v85CloseView();return}
    const rt=t.closest('[data-v85-retry]');if(rt){e.preventDefault();const it=(v85Chat.sending||[]).find(x=>x.id===rt.dataset.v85Retry);if(it)v85SendItem(it);return}
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
  document.addEventListener('change',e=>{if(e.target.id==='v85File'){const f=e.target.files&&e.target.files[0];if(f)v85SendMedia(f,e.target.dataset.once==='1');return}});
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

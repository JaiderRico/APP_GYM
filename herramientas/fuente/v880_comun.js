  /* ===================== v8.5.18 (las tres apps): botón/gesto de volver y Novedades en Ajustes ===================== */
  // Va justo antes de initV7(), después de v850/v860 (y del bloque v870 en la de Ella). La libre lo hereda de la de Jaider.

  /* ---------- 1) Volver con el gesto o el botón del teléfono ---------- */
  // La parte nativa (MainActivity.onBackPressed) hace webView.goBack() si hay historial y, si no, cierra la app.
  // Mientras haya algo abierto (chat, una ventana, otra pestaña, un entreno) dejamos una entrada en el historial:
  // al volver, el navegador dispara popstate y cerramos lo de encima en vez de salir de la app.
  const v88Vis=el=>!!el&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
  const V88_GATES='#adminGate,.her-gate,.pub-gate';
  function v88Top(){
    try{
      if($('#v85View'))return ()=>v85CloseView();
      if(typeof v85Chat!=='undefined'&&v85Chat.open){
        if(v85Chat.sel)return ()=>v85Select(null);
        const sh=$('#v85Sheet');if(sh&&!sh.classList.contains('hidden'))return ()=>sh.classList.add('hidden');
        if(v85Chat.reply)return ()=>v85SetReply(null);
        return ()=>v85CloseChat();
      }
      const nov=$('#v88Over');if(nov)return ()=>v88NovSeen();
      const h87=$('#h87Over');if(h87)return ()=>h87.querySelector('[data-h87-ok]')?.click();
      const mods=[...document.querySelectorAll('.modal:not(.hidden)')].filter(v88Vis);
      if(mods.length){const m=mods[mods.length-1],b=m.querySelector('.modal-head button');return ()=>{if(b)b.click();else m.classList.add('hidden')}}
      const fm=$('#fmOverlay');
      if(fm){const b=[...fm.querySelectorAll('[data-fm-back]')].find(v88Vis)||fm.querySelector('[data-fm-min]');return ()=>b?.click()}
      // Otras ventanas a pantalla completa (role=dialog) que tengan botón de cerrar o volver
      const dl=[...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(d=>v88Vis(d)&&!d.matches(V88_GATES)&&!d.closest(V88_GATES)&&!d.classList.contains('modal'));
      for(let i=dl.length-1;i>=0;i--){const b=[...dl[i].querySelectorAll('button')].find(x=>v88Vis(x)&&/^\s*(✕|×|‹|←|Cerrar|Volver|Atrás)/.test(x.textContent||''));if(b)return ()=>b.click()}
      if(document.body.classList.contains('workout-mode')&&v88Vis($('#focusWorkout'))&&$('#exitFocus'))
        return ()=>{if(confirm('¿Salir del entrenamiento? Queda guardado y lo puedes continuar desde Entrenar.'))$('#exitFocus').click()};
      const cur=$('.screen.active')?.id;
      if(cur&&cur!=='home'&&!$(V88_GATES))return ()=>go('home');
    }catch(e){console.error(e)}
    return null;
  }
  const v88Back={armed:false,skip:false};
  function v88Sync(){
    const need=!!v88Top();
    try{
      if(need&&!v88Back.armed){history.pushState({mpBack:Date.now()},'');v88Back.armed=true}
      else if(!need&&v88Back.armed&&!v88Back.skip){v88Back.skip=true;v88Back.armed=false;history.back()}
    }catch{}
  }
  window.addEventListener('popstate',()=>{
    if(v88Back.skip){v88Back.skip=false;return}
    v88Back.armed=false;
    const f=v88Top();if(f)try{f()}catch(e){console.error(e)}
    setTimeout(v88Sync,60);
  });
  setInterval(v88Sync,300);

  /* ---------- 2) Novedades: qué trajo cada actualización (siempre en Ajustes) ---------- */
  // a: j = Mi Progreso (Jaider), e = Ella, l = Libre. Al publicar una versión, agrega arriba su entrada.
  const V88_APP=(typeof MP_PUBLICA!=='undefined'&&MP_PUBLICA)?'l':(MP_APK_IS_ELLA?'e':'j');
  const V88_NOV=[
    {v:'8.5.18',f:'2026-11-08',i:[
      ['je','💬 Chat renovado, estilo WhatsApp: tu mensaje sale al instante (🕓 → ✓ enviado → ✓✓ recibido → ✓✓ azul leído), ves “en línea” y “escribiendo…”, y los mensajes llegan más rápido.'],
      ['je','↩ Responder un mensaje: deslízalo a la derecha, o mantenlo presionado → Responder / Copiar. Toca la cita para ir al mensaje original.'],
      ['je','⌄ Botón para bajar al último mensaje (con cuántos llegaron) y separador de “Mensajes sin leer”.'],
      ['jel','◀ Gesto o botón de volver del teléfono: cierra lo que esté abierto (chat, ventanas, otra pestaña) y vuelve al inicio antes de salir de la app. En pleno entreno pregunta antes de salir.'],
      ['jel','🆕 Esta sección: en Ajustes siempre puedes ver qué trajo cada actualización.']]},
    {v:'8.5.17',f:'2026-11-08',i:[
      ['je','🔒 La IA usa las claves del servidor: ya no se guardan en el teléfono.'],
      ['l','🔒 Pro: la IA pasa por el servidor; las claves ya no se guardan en el teléfono.'],
      ['e','🍽 Registrar tus comidas es parte del plan: la pestaña Comida siempre está.'],
      ['e','🥤 3 snacks al día altos en calorías que no llenan, con ideas, recordatorios y un botón para registrarlos.']]},
    {v:'8.5.16',f:'2026-11-06',i:[
      ['jel','⚖️ Si el peso de una serie no cuadra con tu historial (un cero de más, kg/lb, “por lado”), la app pregunta antes de guardarla.'],
      ['jel','🏆 Los pesos raros sin confirmar no cuentan como récord. En Logros puedes marcar “Era correcto”.'],
      ['jel','El récord de “más repeticiones” solo cuenta con el mismo peso.']]},
    {v:'8.5.15',f:'2026-11-04',i:[
      ['jel','⧉ Ventana flotante rediseñada: serie, ejercicio, peso grande, reps y RIR; en el descanso, el tiempo y qué sigue. En Ajustes eliges forma y tamaño de letra.'],
      ['jel','🔥 El primer ejercicio de cada músculo vuelve a recibir su calentamiento.']]},
    {v:'8.5.13',f:'',i:[
      ['je','📷 Fotos y videos en el chat (botón 📎), también para ver una sola vez.']]},
    {v:'8.5.12',f:'',i:[
      ['j','✦ Cada código Pro sirve en un solo teléfono; lo puedes liberar cuando la persona cambie de teléfono.'],
      ['l','🔑 Tu código Pro queda en este teléfono. Si cambias de teléfono, pide que lo liberen y recupera tu copia de la nube.']]},
    {v:'8.5.10',f:'',i:[
      ['je','💬 Chat entre las dos apps, con aviso aunque la app esté cerrada.'],
      ['jel','⧉ Ventana flotante: deja el descanso encima de otras apps.'],
      ['je','📲 Compartir la app libre con quien quieras.']]}
  ];
  function v88Items(n){return (n.i||[]).filter(x=>x[0].includes(V88_APP)).map(x=>x[1])}
  const v88List=()=>V88_NOV.map(n=>({...n,items:v88Items(n)})).filter(n=>n.items.length);
  const v88Cur=()=>{try{return APP_VERSION}catch{return ''}};
  const v88Fecha=f=>f?new Date(f+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}):'';
  function v88Block(n){return `<div style="margin:0 0 12px"><b>Versión ${esc(n.v)}</b>${n.f?` <span class="small">· ${esc(v88Fecha(n.f))}</span>`:''}<ul style="margin:6px 0 0;padding-left:18px">${n.items.map(x=>`<li class="small" style="margin:0 0 6px;color:var(--text)">${esc(x)}</li>`).join('')}</ul></div>`}
  function v88Html(){
    const L=v88List(),cur=v88Cur(),now=L.find(n=>n.v===cur)||L[0];if(!now)return '';
    const rest=L.filter(n=>n!==now);
    return `<details class="settings-group" id="v88NovSet"><summary>🆕 Novedades · versión ${esc(cur||now.v)}</summary><div class="settings-section">${v88Block(now)}${rest.length?`<details><summary class="small" style="cursor:pointer;margin-bottom:8px">Versiones anteriores</summary>${rest.map(v88Block).join('')}</details>`:''}</div></details>`;
  }
  const _rs880=renderSettings;
  renderSettings=function(){
    const r=_rs880.apply(this,arguments);
    try{const box=$('#settingsContent');if(box&&!$('#v88NovSet'))box.insertAdjacentHTML('afterbegin',v88Html())}catch(e){console.error(e)}
    return r;
  };
  // Una sola vez después de actualizar: ventana con lo nuevo de esta versión.
  const V88_SEEN='mp_nov_seen_v1';
  function v88NovSeen(){try{localStorage.setItem(V88_SEEN,v88Cur())}catch{}$('#v88Over')?.remove()}
  function v88NovShow(){
    try{
      const cur=v88Cur();if(!cur||localStorage.getItem(V88_SEEN)===cur||$('#v88Over')||$(V88_GATES)||$('#h87Over')||$('#v85Chat'))return;
      if(document.body.classList.contains('workout-mode'))return;
      const n=v88List().find(x=>x.v===cur);if(!n){localStorage.setItem(V88_SEEN,cur);return}
      document.body.insertAdjacentHTML('beforeend',`<div id="v88Over" style="position:fixed;inset:0;z-index:9300;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;padding:16px"><div style="width:min(460px,100%);max-height:80vh;overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:20px 18px"><div style="font-size:34px">🆕</div><h2 style="margin:4px 0 10px;font-size:20px">Novedades de la versión ${esc(cur)}</h2>${v88Block(n).replace(/^<div[^>]*><b>[^<]*<\/b>(?: <span[^>]*>[^<]*<\/span>)?/,'<div>')}<p class="small" style="margin:4px 0 12px">Siempre las puedes volver a ver en Ajustes ⚙ → 🆕 Novedades.</p><button class="primary" data-v88-ok style="width:100%;margin:0">Entendido</button></div></div>`);
    }catch(e){console.error(e)}
  }
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-v88-ok]')){v88NovSeen();return}if(e.target.id==='v88Over')v88NovSeen()});
  setTimeout(v88NovShow,4500);
  setInterval(v88NovShow,20000);

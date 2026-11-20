  /* ===================== v8.6.16 · Qué ver en Entrenar, comidas solo con sugerencias y pesa realista ===================== */
  // Va al final, justo antes de `initV7();` (después de v8615). Solo app de Jaider (la libre lo heredaría tal cual; no tiene nada de Ella).
  // (1) Ajustes → «🏋️ Qué ver en Entrenar»: esconder Simulador, «Por qué» del plan, Calculadora de discos y aviso de fatiga.
  //     data.settings.trainHide = {sim, why, plates, fatigue} (true = escondido) → clases th-* en <body>.
  // (2) Comida (interfaz de chips): ya no se listan todos los alimentos ni las pestañas por categoría; solo lo que llevas
  //     marcado en esta comida (tocar = quitar). Lo demás aparece como sugerencia al escribir (v93RenderSug).
  //     «✏️ Mis alimentos» sigue disponible.
  // (3) Pesa del inicio: SVG realista (barra con moleteado, manga cromada, discos olímpicos en 3/4 y collarín) en vez de
  //     los rectángulos de .hero:before/:after.

  /* ---------- (1) Qué ver en Entrenar ---------- */
  const V8616_TH=[['sim','🧪 Simulador'],['why','📚 «Por qué» de mi semana'],['plates','◉ Calculadora de discos'],['fatigue','🔋 Aviso de fatiga']];
  function v8616Hidden(){const h=data.settings?.trainHide;return h&&typeof h==='object'?h:{}}
  function v8616ApplyTh(){const h=v8616Hidden();for(const [k] of V8616_TH)document.body.classList.toggle('th-'+k,!!h[k])}
  function v8616SetHtml(){
    const h=v8616Hidden();
    return `<details class="settings-group" id="v8616ThSet"><summary>🏋️ Qué ver en Entrenar (simulador, discos…)</summary><div class="settings-section"><p class="small" style="margin:0 0 10px">Apaga lo que no usas al preparar el entreno. Nada se borra: lo vuelves a prender aquí cuando quieras.</p>${V8616_TH.map(([k,l])=>`<label class="toggle-row"><input type="checkbox" data-v8616-th="${k}" ${h[k]?'':'checked'}> ${l}</label>`).join('')}</div></details>`;
  }
  try{const pd=$('#plateOptions')?.closest('details');if(pd)pd.classList.add('v8616-plates')}catch{}
  const _rs8616=renderSettings;
  renderSettings=function(){const r=_rs8616.apply(this,arguments);try{const host=$('#settingsContent');if(host&&!$('#v8616ThSet'))host.insertAdjacentHTML('beforeend',v8616SetHtml())}catch(e){console.error(e)}return r};
  document.addEventListener('change',e=>{
    const c=e.target.closest?.('[data-v8616-th]');if(!c)return;
    const h={...v8616Hidden()};if(c.checked)delete h[c.dataset.v8616Th];else h[c.dataset.v8616Th]=true;
    data.settings.trainHide=h;persist(true);v8616ApplyTh();
    const l=(V8616_TH.find(x=>x[0]===c.dataset.v8616Th)||[])[1]||'';toast(`${l}: ${c.checked?'visible':'escondido'} en Entrenar`);
  });
  try{v8616ApplyTh()}catch(e){console.error(e)}

  /* ---------- (2) Comidas: solo lo marcado + sugerencias al escribir ---------- */
  if(typeof v93ChipsHtml==='function'){
    v93ChipsHtml=function(){
      const sel=(fSel&&fSel.items)||[];
      const chips=sel.length?sel.map(x=>`<button type="button" class="fchip on" data-chip="${esc(x)}" title="Tocar para quitar">${esc(x)} <span class="v8616-x">✕</span></button>`).join(''):'<span class="small">Escribe abajo lo que comiste y te sugiero lo que ya has puesto antes.</span>';
      return `<div class="fchips">${chips}</div><div class="v8616-man"><button type="button" class="secondary mini" data-v93-manage>✏️ Mis alimentos</button></div>`;
    };
    const _rf8616=renderFood;
    renderFood=function(){const r=_rf8616.apply(this,arguments);try{const w=$('#foodBody .food-log .v93-wrap');const n=w?.closest('.menu-comp')?.querySelector('.comp-name');if(n&&!/^Otros$/.test(n.textContent))n.textContent='Lo que comiste';n?.parentElement?.querySelectorAll(':scope > .small').forEach(s=>{if(/última vez/.test(s.textContent))s.textContent='Marcado: lo de la última vez. Toca para quitar.'});const inp=$('#foodNew');if(inp)inp.placeholder='Escribe lo que comiste (ej. huevos)…'}catch(e){console.error(e)}return r};
  }

  /* ---------- (3) Pesa realista en el inicio ---------- */
  function v8616BarbellSvg(){
    // Vista 3/4 de un extremo de barra olímpica: discos 25/20/15/10 kg (colores de competencia), collarín y manga.
    const plates=[[98,9,46,'#d7263d','#7d0f1f'],[107,9,41,'#2a63e0','#123579'],[116,8,35,'#f0bf2c','#8a6508'],[124,8,29,'#22a35a','#0d5a2f']];
    const cy=58;let p='';
    for(const [x,t,ry,c,d] of plates){
      const rx=Math.round(ry*.24);
      p+=`<path d="M${x} ${cy-ry} h${t} a${rx} ${ry} 0 0 1 0 ${ry*2} h-${t} a${rx} ${ry} 0 0 1 0 -${ry*2}z" fill="${d}"/>`+
         `<path d="M${x} ${cy-ry} h${t}" stroke="#ffffff30" stroke-width="1"/>`+
         `<ellipse cx="${x+t}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#bbF${c.slice(1)})"/>`+
         `<ellipse cx="${x+t}" cy="${cy}" rx="${rx-1.6}" ry="${ry-3.5}" fill="none" stroke="#00000040" stroke-width="1.2"/>`+
         `<ellipse cx="${x+t}" cy="${cy}" rx="${rx*.45}" ry="${ry*.42}" fill="#00000026"/>`+
         `<ellipse cx="${x+t-.6}" cy="${cy}" rx="2.6" ry="8" fill="url(#bbHub)"/>`;
    }
    const grads=plates.map(([, , ,c,d])=>`<linearGradient id="bbF${c.slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient>`).join('');
    let knurl='';for(let x=22;x<84;x+=2.4)knurl+=`<path d="M${x} ${cy-2.6}l2 5.2" stroke="#00000038" stroke-width=".7"/>`;
    return `<svg class="v8616-bb" viewBox="0 0 172 116" aria-hidden="true"><defs>
<linearGradient id="bbBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6168"/><stop offset=".35" stop-color="#eef1f4"/><stop offset=".6" stop-color="#9aa1a9"/><stop offset="1" stop-color="#4a4f55"/></linearGradient>
<linearGradient id="bbSleeve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#70777f"/><stop offset=".3" stop-color="#ffffff"/><stop offset=".55" stop-color="#b9c0c7"/><stop offset="1" stop-color="#555b62"/></linearGradient>
<radialGradient id="bbHub" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b8bec5"/><stop offset="1" stop-color="#5d636a"/></radialGradient>
<radialGradient id="bbShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
${grads}</defs>
<ellipse cx="118" cy="108" rx="52" ry="6" fill="url(#bbShadow)"/>
<rect x="-4" y="${cy-3}" width="94" height="6" rx="3" fill="url(#bbBar)"/>${knurl}
<rect x="88" y="${cy-6}" width="10" height="12" rx="2" fill="url(#bbSleeve)"/>
<rect x="96" y="${cy-4.6}" width="74" height="9.2" rx="3" fill="url(#bbSleeve)"/>
${p}
<rect x="133" y="${cy-9}" width="9" height="18" rx="2.5" fill="#2b2f35"/><rect x="133" y="${cy-9}" width="9" height="5" rx="2" fill="#4a5058"/><rect x="141.5" y="${cy-3}" width="5" height="3" rx="1" fill="#e0b13a"/>
<ellipse cx="169.5" cy="${cy}" rx="1.8" ry="4.6" fill="#d8dde2"/></svg>`;
  }
  try{const hero=$('#home .hero');if(hero&&!hero.querySelector('.v8616-bb')){hero.classList.add('v8616-hero');hero.insertAdjacentHTML('beforeend',v8616BarbellSvg())}}catch(e){console.error(e)}

  document.head.insertAdjacentHTML('beforeend',`<style id="v8616Css">
    body.th-sim #v8611SimCard,body.th-why #trainExtras .hyp-line,body.th-plates details.v8616-plates,body.th-fatigue #fatigueSetup{display:none!important}
    .v8616-man{margin-top:8px}.v8616-x{opacity:.65;font-size:.85em;margin-left:2px}
    .hero.v8616-hero{position:relative}
    .hero.v8616-hero:before,.hero.v8616-hero:after{content:none!important;display:none!important}
    .v8616-bb{position:absolute;right:-4px;bottom:16px;width:138px;height:auto;z-index:-1;pointer-events:none;filter:drop-shadow(0 6px 10px #0007);animation:v8616In .9s var(--ease,cubic-bezier(.2,.8,.2,1)) both}
    @keyframes v8616In{from{opacity:0;transform:translateX(60px)}}
    @media (max-width:380px){.v8616-bb{width:124px}}
  </style>`);

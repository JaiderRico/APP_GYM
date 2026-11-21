  /* ===================== v8.6.26 · Sin sección de Comida (solo creatina) ===================== */
  // Solo app de Jaider (la libre lo trae apagado por MP_PUBLICA/V88_APP). Va al final, justo antes de `initV7();`.
  // Jaider pidió quitar Comida (registro, metas, pesar comida y el bloqueo por no registrar). Queda la creatina.
  // Los datos de comidas (data.meals…) NO se borran. Para volver: data.settings.foodOff=false (o quitar este bloque).
  // - Esconde la pestaña Comida (arriba y abajo) y cualquier ir a 'food' (widget, avisos) lleva a Resumen.
  // - Resumen → «Hoy»: solo la creatina 5 g (marcar/desmarcar).
  // - Apaga los recordatorios de comidas (reminders.meals=false, copia en settings.foodOffPrev) y el bloqueo de v940
  //   (v94LockDay → null). Los recordatorios de creatina de la noche (v940) siguen igual.
  const V8626_ON=!(typeof MP_PUBLICA!=='undefined'&&MP_PUBLICA)&&(typeof V88_APP==='undefined'||V88_APP==='j');
  if(V8626_ON){
    data.settings=data.settings||{};
    if(data.settings.foodOff===undefined){
      data.settings.foodOff=true;
      try{const r=s81().reminders;data.settings.foodOffPrev={meals:!!r.meals};r.meals=false}catch{}
      try{persist(true)}catch{}
    }
  }
  if(V8626_ON&&data.settings.foodOff){
    document.head.insertAdjacentHTML('beforeend',`<style id="v8626css">
      [data-screen="food"]{display:none!important}
      .tabs6{grid-template-columns:repeat(5,1fr)!important}.navin.nav6{grid-template-columns:repeat(5,1fr)!important}
      .tabs5{grid-template-columns:repeat(4,1fr)!important}.navin.nav5{grid-template-columns:repeat(4,1fr)!important}
      .v8626-cr{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:14px;border-radius:14px;margin:0}
      .v8626-cr span{font-size:26px}.v8626-cr b{display:block;font-size:15px}.v8626-cr small{color:var(--muted);font-size:12px}
      .v8626-cr.ok{border-color:var(--green)}
    </style>`);
    try{v94LockDay=()=>null}catch{}
    try{$('#v94Lock')?.remove();$('#v94Bar')?.remove()}catch{}
    try{const r=s81().reminders;if(r.meals){r.meals=false;persist(true)}}catch{}
    try{pushReminders()}catch{}
    const _go8626=go;
    go=function(screen,...a){return _go8626(screen==='food'?'home':screen,...a)};
    try{openFoodNew=function(){go('home')}}catch{}
    renderToday=function(){
      const host=$('#todayBox');if(!host)return;
      const t=today(),cr=creatineDays().includes(t),late=new Date().getHours()>=12;
      host.innerHTML=`<div class="card today-card"><button class="secondary v8626-cr ${cr?'ok':late?'late':''}" data-creatine-day="${t}"><span>${cr?'✅':'💊'}</span><div><b>Creatina 5 g</b><small>${cr?'Tomada hoy · toca para desmarcar':'Toca cuando te la tomes'}</small></div></button></div>`;
    };
    try{if($('#food')?.classList.contains('active'))go('home')}catch{}
    try{renderToday()}catch{}
  }

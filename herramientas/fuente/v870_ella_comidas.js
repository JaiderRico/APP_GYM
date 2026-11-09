  /* ===================== v8.5.17 (+8.5.19 lista editable) (solo app de Ella): registrar comidas siempre + snacks que suman calorías sin llenar ===================== */
  // A ella le cuesta comer: la pestaña Comida queda siempre activa, la app le pide registrar las comidas y varias
  // veces al día le recomienda un snack alto en calorías y poco saciante (líquidos, frutos secos, grasas buenas…).
  const H87_SLOTS=[['snack1','10:30'],['snack2','16:00'],['snack3','21:00']];
  const H87_IDEAS=[
    {id:'d1',t:'Batido de leche entera con banano, avena molida y 1 cda de mantequilla de maní',k:550,p:20,w:'Líquido: entra fácil y casi no llena.'},
    {id:'d2',t:'Puñado de maní o mezcla de frutos secos con uvas pasas (50 g)',k:300,p:10,w:'Mucha energía en un bocado pequeño.'},
    {id:'d3',t:'Pan tostado con mantequilla de maní y miel',k:350,p:10,w:'Pocas mordidas, muchas calorías.'},
    {id:'d4',t:'Queso con bocadillo',k:300,p:12,w:'Clásico, rápido y denso en calorías.'},
    {id:'d5',t:'Vaso grande de leche entera achocolatada',k:350,p:14,w:'Se toma en un minuto y no te quita el hambre de la comida.'},
    {id:'d6',t:'Yogur entero con granola y miel',k:380,p:12,w:'Se come rápido y aporta bastante energía.'},
    {id:'d7',t:'Chocolatina con almendras o maní',k:250,p:5,w:'Pequeña y muy calórica.'},
    {id:'d8',t:'Medio aguacate con galletas de soda y sal',k:320,p:5,w:'Grasa buena: muchas calorías sin volumen.'},
    {id:'d9',t:'Dátiles o mango deshidratado (50 g) con un puñado de almendras',k:300,p:6,w:'La fruta seca llena mucho menos que la fresca.'},
    {id:'d10',t:'Avena líquida con leche entera y canela',k:300,p:11,w:'Bebida, no plato: entra sin esfuerzo.'},
    {id:'d11',t:'Galletas con arequipe',k:260,p:3,w:'Para un antojo rápido entre comidas.'},
    {id:'d12',t:'Jugo de fruta en leche entera (mora, guanábana o mango)',k:260,p:9,w:'Líquido y con azúcar natural: no sacia.'}
  ];
  const H87_TIPS='Mejor líquidos y bocados pequeños: llenan menos. Cómelo 2 a 3 horas antes de la siguiente comida y deja el agua para después, no antes.';
  const h87Day=d=>Math.floor(parseD(d).getTime()/DAY_MS);
  // 8.5.19: la lista viene del servidor (la editan ella y Jaider, ver v890); sin conexión, la de siempre.
  function h87List(){try{const c=typeof v89Cached==='function'?v89Cached():null;if(c)return c.list}catch{}return H87_IDEAS}
  const h87New=x=>x&&x.by==='jaider'&&Date.now()-(Number(x.at)||0)<3*DAY_MS;
  function h87Idea(d,i){
    const L=h87List();if(!L.length)return null;
    const nu=L.filter(h87New),rest=L.filter(x=>!h87New(x)),ord=nu.length&&d===today()?[...nu,...rest]:L;
    const k=nu.length&&d===today()?i:h87Day(d)*3+i;
    return ord[((k%ord.length)+ord.length)%ord.length];
  }
  const h87ById=id=>h87List().find(x=>x.id===id)||H87_IDEAS.find(x=>x.id===id);
  const h87Snacks=d=>(data.meals||[]).filter(m=>m.date===d&&m.type==='snack');
  let h87Shift=0;

  // Comidas siempre activas (ya no es opcional) y recordatorios de snacks encendidos la primera vez.
  function h87Force(){
    const p=herPrefs(),r=s81().reminders;let ch=false;
    if(!p.meals){p.meals=true;ch=true}
    if(!data.settings.h87){data.settings.h87={at:Date.now()};r.meals=true;if(r.snacks==null)r.snacks=true;ch=true}
    if(r.snacks==null)r.snacks=true;
    H87_SLOTS.forEach(([k,v])=>{if(!r[k])r[k]=v});
    if(ch){try{herSavePrefs()}catch{persist(true)}try{applyPrefs()}catch{}try{pushReminders()}catch{}}
  }

  document.head.insertAdjacentHTML('beforeend',`<style id="h87css">
    .h87-card{border-left:4px solid var(--green)}
    .h87-bar{height:8px;border-radius:9px;background:var(--panel2);border:1px solid var(--line);overflow:hidden;margin:8px 0 4px}.h87-bar i{display:block;height:100%;background:var(--green)}
    .h87-idea{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:9px 0;border-top:1px solid var(--line)}
    .h87-idea b{display:block;font-size:14px}.h87-idea span{font-size:12px;color:var(--muted)}
    .h87-idea button{flex:none;margin:0;padding:8px 12px}
    .h87-over{position:fixed;inset:0;z-index:9400;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px}
    .h87-box{width:min(420px,100%);background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:22px 18px}
    .h87-box h2{margin:4px 0 8px;font-size:21px}.h87-box p{margin:0 0 10px;color:var(--muted);font-size:15px}
    .h87-box button{width:100%;margin-top:6px}
  </style>`);

  function h87CardHtml(d){
    const n=h87Snacks(d).length,goal=H87_SLOTS.length,L=h87List(),cnt=Math.min(3,L.length),ideas=[];
    for(let i=0;i<cnt;i++){const x=h87Idea(d,i+h87Shift*3);if(x&&!ideas.includes(x))ideas.push(x)}
    return `<div class="card h87-card" id="h87Card"><div class="row" style="justify-content:space-between"><strong>🥤 Snacks para sumar calorías</strong><span class="small">${Math.min(n,goal)}/${goal} hoy</span></div>
      <div class="h87-bar"><i style="width:${Math.min(100,Math.round(n/goal*100))}%"></i></div>
      <p class="small" style="margin:4px 0 6px">Registrar todo lo que comes es parte del plan: sin registro no hay forma de saber si estás comiendo lo suficiente. Además de tus comidas, come ${goal} snacks al día que te den energía sin llenarte.</p>
      ${ideas.length?ideas.map(x=>`<div class="h87-idea"><div><b>${esc(x.t)}</b><span>${h87New(x)?'💡 <b style="display:inline;font-size:12px">Nuevo de Jaider</b> · ':''}${x.k?`~${x.k} kcal`:''}${x.w?` · ${esc(x.w)}`:''}</span></div><button class="secondary" data-h87-add="${esc(x.id)}" data-h87-day="${esc(d)}">+ Lo comí</button></div>`).join(''):'<p class="small">Tu lista de snacks está vacía. Agrega los que te gusten.</p>'}
      <p class="small" style="margin:8px 0 0">💡 ${esc(H87_TIPS)}</p>
      <div class="row" style="gap:8px;margin-top:8px">${L.length>3?'<button class="secondary" data-h87-more style="flex:1;margin:0">Ver otras ideas</button>':''}<button class="secondary" data-v89-open style="flex:1;margin:0">✏️ Mi lista (${L.length})</button></div></div>`;
  }

  const _h87Food=renderFood;
  renderFood=function(){
    const r=_h87Food.apply(this,arguments);
    try{const host=$('#foodBody');if(host&&!$('#h87Card'))host.insertAdjacentHTML('afterbegin',h87CardHtml(typeof foodDate!=='undefined'&&foodDate?foodDate:today()))}catch(e){console.error(e)}
    return r;
  };

  // Inicio: aviso del snack que toca si va atrasada.
  const _h87Banners=bannersHtml;
  bannersHtml=function(){
    let extra='';
    try{
      const t=today(),now=new Date(),hm=now.getHours()*60+now.getMinutes(),r=s81().reminders;
      const due=H87_SLOTS.filter(([k,v])=>{const [h,m]=String(r[k]||v).split(':').map(Number);return hm>=h*60+m}).length;
      const n=h87Snacks(t).length;
      const x=h87Idea(t,n);if(due>n&&x){extra=`<div class="card her-banner" data-her-go="food"><div class="ic">🥤</div><div><strong>Toca tu snack ${n+1} de ${H87_SLOTS.length}</strong><span class="small">Idea: ${esc(x.t)} (~${x.k} kcal). Regístralo cuando lo comas.</span></div><span class="go">›</span></div>`}
    }catch(e){console.error(e)}
    return extra+_h87Banners.apply(this,arguments);
  };

  // Notificaciones: varias veces al día, con una idea distinta cada vez.
  const _h87Rem=buildReminders;
  buildReminders=function(){
    const out=_h87Rem.apply(this,arguments);
    try{
      const r=s81().reminders;if(!r.snacks)return out;
      const now=Date.now(),t=today(),tm=addDays(t,1),n=h87Snacks(t).length;
      H87_SLOTS.forEach(([k,v],i)=>{
        const time=r[k]||v;let at=tsAt(t,time),d=t;
        if(at<=now||n>i){at=tsAt(tm,time);d=tm}
        const x=h87Idea(d,i)||H87_IDEAS[i];
        out.push({id:'h87_'+k,at,repeat:DAY_MS,maxLate:2*3600000,title:`🥤 Hora de tu snack (${i+1} de ${H87_SLOTS.length})`,text:`${x.t} · ~${x.k} kcal. ${x.w} Regístralo al comerlo.`,action:'food:new:snack',button:'Registrar'});
      });
    }catch(e){console.error(e)}
    return out;
  };

  // Ajustes → Recordatorios: snacks y sus horas.
  const _h87Set=settings81Html;
  settings81Html=function(){
    let h=_h87Set.apply(this,arguments);
    try{
      const r=s81().reminders;
      const rows=`<label class="rem-row"><span><b>Snacks para subir calorías</b><br><small class="small">${H87_SLOTS.length} al día, con ideas que no llenan.</small></span><input type="checkbox" data-rem="snacks" ${r.snacks?'checked':''}></label>
      ${r.snacks?H87_SLOTS.map(([k,v],i)=>`<div class="rem-row"><span>Snack ${i+1}</span><input type="time" data-rem="${k}" value="${esc(r[k]||v)}"></div>`).join(''):''}`;
      const i=h.indexOf('<label class="rem-row"><span><b>Pesarme');
      const j=h.indexOf('<p class="small">Activa “Peso y medidas”');
      const at=i>=0?i:j;
      h=at>=0?h.slice(0,at)+rows+h.slice(at):h.replace('</h3>','</h3>'+rows);
      h=h.replace('Solo te avisa si aún no la anotaste.','Es parte del plan: te avisa si aún no la anotaste.');
    }catch(e){console.error(e)}
    return h;
  };

  // Onboarding: Comidas ya no se pregunta (siempre está activa).
  const _h87Steps=onbSteps;
  onbSteps=function(){return _h87Steps.apply(this,arguments).filter(s=>s!=='meals')};
  const _h87Onb=showOnboarding;
  showOnboarding=function(){const r=_h87Onb.apply(this,arguments);try{onb.a.meals=true}catch{}return r};
  const _h87Fin=finishOnboarding;
  finishOnboarding=function(){try{onb.a.meals=true}catch{}const r=_h87Fin.apply(this,arguments);h87Force();return r};

  // IA: que sepa que le cuesta comer.
  const H87_AI='Contexto importante: a esta persona le cuesta comer (poco apetito) y quiere ganar masa. Pídele que registre todas sus comidas y recomiéndale varios snacks al día altos en calorías y poco saciantes (batidos con leche entera, frutos secos, mantequilla de maní, queso, aguacate, fruta deshidratada, avena líquida); nada de recomendar comer menos ni alimentos que llenen mucho con pocas calorías.';
  const _h87Ask=aiAsk;
  aiAsk=function(o){
    try{if(o&&typeof o.system==='string'&&!/json/i.test(o.system)&&(/nutri|aliment|comida|coach/i.test(o.system)||/Comidas/.test(String(o.user||''))))o={...o,system:o.system+' '+H87_AI}}catch{}
    return _h87Ask.call(this,o);
  };

  // Aviso una sola vez (después del cuestionario inicial).
  function h87Notice(){
    try{
      const st=data.settings.h87||{};if(st.seen||!herPrefs().done||$('#h87Over'))return;
      document.body.insertAdjacentHTML('beforeend',`<div class="h87-over" id="h87Over"><div class="h87-box"><div style="font-size:38px">🍽</div><h2>Desde ahora registras tus comidas</h2>
        <p>Tu progreso depende tanto de lo que comes como del entreno. Anota cada comida (con las comidas fijas es un toque).</p>
        <p>Como te cuesta comer, te voy a recordar ${H87_SLOTS.length} snacks al día que suman calorías sin llenarte: batidos, frutos secos, queso con bocadillo… En la pestaña <b>Comida</b> tienes ideas y un botón para registrarlos.</p>
        <button class="primary" data-h87-ok>Entendido</button><button class="secondary" data-h87-go>Ver ideas de snacks</button></div></div>`);
    }catch(e){console.error(e)}
  }
  function h87Seen(){const st=data.settings.h87||(data.settings.h87={});st.seen=Date.now();persist(true);$('#h87Over')?.remove()}

  document.addEventListener('click',e=>{
    const t=e.target;
    const a=t.closest('[data-h87-add]');
    if(a){const d=a.dataset.h87Day||today(),x=h87ById(a.dataset.h87Add);if(!x)return;
      data.meals.push({id:uid(),date:d,type:'snack',text:x.t,protein:x.p,kcal:x.k,createdAt:Date.now()});
      persist(true);try{renderFood()}catch{}try{renderToday()}catch{}try{pushReminders()}catch{}
      const n=h87Snacks(d).length;toast(n>=H87_SLOTS.length?`✓ Snack registrado. ¡Llevas ${n} hoy, muy bien!`:`✓ Snack registrado (${n} de ${H87_SLOTS.length}).`);return}
    if(t.closest('[data-h87-more]')){h87Shift++;try{renderFood()}catch{}return}
    if(t.closest('[data-h87-ok]')){h87Seen();return}
    if(t.closest('[data-h87-go]')){h87Seen();try{openFoodNew('snack')}catch{}return}
  });

  h87Force();
  setTimeout(h87Notice,3500);
  setInterval(h87Notice,20000);

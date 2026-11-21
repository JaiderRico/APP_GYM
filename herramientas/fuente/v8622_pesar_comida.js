  /* ===================== v8.6.22 · Pesar la comida: cuánto servir de cada cosa ===================== */
  // Solo app de Jaider (la libre lo trae apagado por MP_PUBLICA). Va al final, justo antes de `initV7();` (después de v8619).
  // Meta fija: data.settings.nutritionGoals {kcal, protein} (la misma tarjeta «🎯 Metas diarias»); la primera vez se pone
  // 2400 kcal / 140 g (70 kg, 20 años, entreno 6 días: mantenimiento ≈ 2600–2700, leve déficit para recomposición).
  // Comida → «⚖️ Pesar comida»: eliges tipo y alimentos; la app reparte lo que te queda del día entre las comidas que faltan
  // (V8622_SPLIT) y dice cuántos gramos servir de cada uno. Cambias los gramos a lo que de verdad pesaste y guardas:
  // queda una comida normal (texto «Arroz 180 g, …», kcal y proteína) con `pesada:[{n,g,k,p}]`.
  // Base de alimentos V8622_DB (por 100 g, como se come: cocido/escurrido; tablas USDA/ICBF, aproximado) + los propios en
  // data.settings.v8622.mine {id:{n,k,p,c,f,r,u?,ug?}}. r = rol: P proteína · C carbohidrato · V verdura · G grasa · F fijo.
  const V8622_ON=!(typeof MP_PUBLICA!=='undefined'&&MP_PUBLICA)&&(typeof V88_APP==='undefined'||V88_APP==='j');
  const V8622_SPLIT={desayuno:25,almuerzo:35,snack:10,cena:30};
  const V8622_DEF={kcal:2400,protein:140};
  // [id, nombre, kcal, prot, carb, grasa, rol, unidad?, gramos por unidad?, gramos por defecto (V/G/F)]
  const V8622_DB=[
    ['arroz','Arroz blanco cocido',130,2.7,28,.3,'C'],
    ['pasta','Pasta / espagueti cocido',158,5.8,31,.9,'C'],
    ['papa','Papa cocida',87,1.9,20,.1,'C'],
    ['papaaire','Papa en freidora de aire',125,2.6,24,2.5,'C'],
    ['yuca','Yuca cocida',130,1.2,31,.3,'C'],
    ['platano','Plátano maduro cocido/asado',120,1.2,31,.3,'C'],
    ['patacon','Patacón',260,1.5,38,12,'C'],
    ['arepa','Arepa de maíz',210,4.5,42,2.5,'C','arepa',80],
    ['pan','Pan tajado',265,9,49,3.2,'C','tajada',25],
    ['panint','Pan integral',250,12,43,3.5,'C','tajada',28],
    ['avena','Avena en hojuelas (cruda)',380,13,67,7,'C'],
    ['banano','Banano',89,1.1,23,.3,'C','banano',120],
    ['fruta','Fruta (mango, papaya, piña)',55,.7,14,.3,'C'],
    ['lentejas','Lentejas cocidas',116,9,20,.4,'C'],
    ['frijol','Fríjoles cocidos',127,8.7,23,.5,'C'],
    ['garbanzo','Garbanzos cocidos',164,8.9,27,2.6,'C'],
    ['pollo','Pechuga de pollo cocida',165,31,0,3.6,'P'],
    ['pollopierna','Pierna/muslo de pollo sin piel',190,25,0,9.5,'P'],
    ['res','Carne de res magra cocida',215,27,0,11,'P'],
    ['molida','Carne molida cocida',250,26,0,15,'P'],
    ['cerdo','Lomo de cerdo cocido',200,28,0,9,'P'],
    ['atun','Atún en agua (escurrido)',116,26,0,.8,'P','lata',120],
    ['atunac','Atún en aceite (escurrido)',198,29,0,8,'P','lata',120],
    ['sardina','Sardinas en salsa de tomate',186,21,.5,10.5,'P'],
    ['huevo','Huevo entero',143,12.6,.7,9.5,'P','huevo',50],
    ['clara','Clara de huevo',52,11,.7,.2,'P','clara',33],
    ['queso','Queso campesino/costeño',270,18,3,21,'P','tajada',30],
    ['whey','Proteína en polvo',400,80,8,6,'P','scoop',30],
    ['yogur','Yogur griego natural',97,9,4,5,'P'],
    ['leche','Leche entera (ml)',61,3.2,4.8,3.3,'F','vaso',250,250],
    ['chocolate','Chocolate en taza con leche',104,3.6,12,4.8,'F','taza',250,250],
    ['ensalada','Ensalada (solo sal)',20,1,4,.2,'V',null,null,100],
    ['verduras','Verduras cocidas',35,2,7,.3,'V',null,null,100],
    ['sopa','Sopa / caldo (plato)',45,2.5,6,1.5,'F','plato',300,300],
    ['aguacate','Aguacate',160,2,8.5,14.7,'G',null,null,50],
    ['aceite','Aceite',884,0,0,100,'G','cucharada',13,5],
    ['mani','Mantequilla de maní',588,25,20,50,'G','cucharada',16,16],
    ['fideos','Fideos instantáneos (paquete preparado)',447,9.4,61,17.6,'F','paquete',85,85],
  ].map(a=>({id:a[0],n:a[1],k:a[2],p:a[3],c:a[4],f:a[5],r:a[6],u:a[7]||'',ug:a[8]||0,dg:a[9]||0}));
  const V8622_ROLE={P:'🍗 Proteína',C:'🍚 Carbohidrato',V:'🥗 Verdura',G:'🥑 Grasa',F:'📌 Fijo'};
  let v8622St=null;

  function v8622Cfg(){data.settings=data.settings||{};const c=data.settings.v8622=data.settings.v8622||{};c.mine=c.mine||{};c.last=c.last||{};return c}
  function v8622Init(){
    const c=v8622Cfg();if(c.init)return;
    c.prev=data.settings.nutritionGoals||null;
    data.settings.nutritionGoals={kcal:V8622_DEF.kcal,protein:V8622_DEF.protein};
    c.init=Date.now();try{persist(true)}catch{}
  }
  function v8622Foods(){const mine=Object.entries(v8622Cfg().mine).map(([id,x])=>({id:'m_'+id,mine:1,u:'',ug:0,dg:0,c:0,f:0,...x}));return mine.concat(V8622_DB)}
  const v8622Food=id=>v8622Foods().find(x=>x.id===id);
  const v8622Norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  const v8622R5=g=>Math.max(0,Math.round(g/5)*5);
  const v8622Of=(f,g)=>({k:f.k*g/100,p:f.p*g/100});

  // Presupuesto de la comida: lo que queda del día repartido entre esta comida y las que faltan.
  function v8622Budget(type,date,skipId){
    const G=goals(),K=G.kcal||V8622_DEF.kcal,P=G.protein||V8622_DEF.protein;
    const ms=mealsOn(date).filter(m=>m.id!==skipId);
    // Una comida registrada sin kcal (p. ej. el almuerzo de la universidad) cuenta como si fuera su parte normal del día.
    const est=(m,v,T)=>Number(v)>0?Number(v):T*(V8622_SPLIT[m.type]||10)/100;
    const usedK=ms.reduce((n,m)=>n+est(m,m.kcal,K),0),usedP=ms.reduce((n,m)=>n+est(m,m.protein,P),0);
    const pend=['desayuno','almuerzo','snack','cena'].filter(t=>t===type||!ms.some(m=>m.type===t));
    const tot=pend.reduce((n,t)=>n+V8622_SPLIT[t],0)||1,sh=V8622_SPLIT[type]/tot;
    const remK=Math.max(0,K-usedK),remP=Math.max(0,P-usedP);
    let k=remK*sh,p=remP*sh;
    if(type==='snack'){k=Math.min(k,K*.15);p=Math.min(p,P*.2)}
    return {k:Math.round(k),p:Math.round(p),remK,usedK,K,P,usedP};
  }

  // Reparte gramos: verduras/grasas/fijos con su porción; proteínas hasta la meta de proteína; carbohidratos con lo que sobra.
  function v8622Plan(){
    const S=v8622St,B=v8622Budget(S.type,S.date,S.editId);S.B=B;
    const rows=S.rows.map(r=>({...r,f:v8622Food(r.id)})).filter(r=>r.f);
    const snapP=(f,g)=>f.ug?Math.max(f.ug,Math.round(g/f.ug)*f.ug):v8622R5(g);
    for(const r of rows)if(!r.manual&&'VGF'.includes(r.f.r))r.g=r.f.dg||r.f.ug||100;
    let k0=0,p0=0;
    for(const r of rows)if(r.manual||'VGF'.includes(r.f.r)){const o=v8622Of(r.f,r.g);k0+=o.k;p0+=o.p}
    const Ps=rows.filter(r=>!r.manual&&r.f.r==='P'),Cs=rows.filter(r=>!r.manual&&r.f.r==='C');
    // Tres pasadas: la proteína que traen los carbohidratos (lentejas, fríjol, arroz) baja lo que deben poner las proteínas.
    let carbP=0,k=k0,p=p0;
    for(let it=0;it<3;it++){
      k=k0;p=p0;
      if(Ps.length){
        const needP=Math.max(B.p-p0-carbP,Ps.length*6),capK=Math.max(0,B.k*.6);
        for(const r of Ps){
          let g=(needP/Ps.length)/(r.f.p/100);
          if(g*r.f.k/100>capK/Ps.length)g=(capK/Ps.length)/(r.f.k/100);
          r.g=snapP(r.f,Math.min(g,400));const o=v8622Of(r.f,r.g);k+=o.k;p+=o.p;
        }
      }
      carbP=0;
      if(Cs.length){
        const left=Math.max(0,B.k-k);
        for(const r of Cs){r.g=v8622R5(Math.min((left/Cs.length)/(r.f.k/100),600));const o=v8622Of(r.f,r.g);k+=o.k;p+=o.p;carbP+=o.p}
      }
    }
    S.rows=rows.map(({f,...r})=>r);
    return {k:Math.round(k),p:Math.round(p)};
  }
  function v8622Tot(){let k=0,p=0;for(const r of v8622St.rows){const f=v8622Food(r.id);if(!f)continue;const o=v8622Of(f,r.g||0);k+=o.k;p+=o.p}return {k:Math.round(k),p:Math.round(p)}}
  function v8622Units(f,g){if(!f.ug||!g)return '';const n=Math.round(g/f.ug*10)/10;return ` ≈ ${String(n).replace('.',',')} ${f.u}${n===1?'':(/[aeiou]$/.test(f.u)?'s':'es')}`}

  function v8622Html(){
    const S=v8622St,B=S.B||v8622Budget(S.type,S.date,S.editId),T=v8622Tot();
    const q=v8622Norm(S.q),list=v8622Foods().filter(f=>!S.rows.some(r=>r.id===f.id)&&(!q||v8622Norm(f.n).includes(q)));
    const diff=T.k-B.k,dCls=Math.abs(diff)<=60?'ok':diff>0?'over':'under';
    const rows=S.rows.map(r=>{const f=v8622Food(r.id);if(!f)return '';const o=v8622Of(f,r.g||0);
      return `<div class="v8622-row"><div class="nm"><b>${esc(f.n)}</b><small>${V8622_ROLE[f.r]||''}${r.manual?' · lo pesaste':''}</small></div>
      <div class="gr"><button class="secondary" data-v8622-step="${esc(r.id)}" data-d="-1">−</button><input type="number" inputmode="numeric" min="0" step="5" value="${Math.round(r.g||0)}" data-v8622-g="${esc(r.id)}"><span>g</span><button class="secondary" data-v8622-step="${esc(r.id)}" data-d="1">＋</button></div>
      <div class="kc">${Math.round(o.k)} kcal · ${Math.round(o.p)} g prot${esc(v8622Units(f,r.g))}</div><button class="v8622-x" data-v8622-del="${esc(r.id)}" aria-label="Quitar">✕</button></div>`}).join('');
    return `<div class="v8622p"><div class="v8622-h"><h2>⚖️ Pesar comida</h2><button class="v8622-x" data-v8622-close aria-label="Cerrar">✕</button></div>
      <div class="seg2 meal-tabs">${Object.entries(MEAL_TYPES).map(([k,v])=>`<button type="button" class="${S.type===k?'on':''}" data-v8622-type="${k}">${v}</button>`).join('')}</div>
      <div class="v8622-goal"><div><span>Para esta comida</span><b>${B.k} kcal · ${B.p} g prot</b></div><div><span>Llevas hoy</span><b>${Math.round(B.usedK)} / ${B.K} kcal</b></div></div>
      ${S.rows.length?`<div class="v8622-list">${rows}</div>
      <div class="v8622-tot ${dCls}"><b>Total: ${T.k} kcal · ${T.p} g proteína</b><span>${Math.abs(diff)<=60?'Justo en lo que te toca 👌':diff>0?`Te pasas ~${diff} kcal`:`Te faltan ~${-diff} kcal`}</span></div>
      <div class="row v8622-act"><button class="secondary" data-v8622-auto>↺ Recalcular</button><button class="primary" data-v8622-save>${S.editId?'Guardar cambios':'✓ Ya lo pesé, guardar'}</button></div>
      <p class="small">Pesa todo como se come (arroz y carne ya cocidos, atún escurrido). Si sirves otra cantidad, escríbela: lo demás se reajusta.</p>`
      :`<p class="small" style="margin:12px 0 4px">Elige lo que vas a comer y te digo cuántos gramos servir de cada cosa.</p>`}
      <div class="v8622-add"><input id="v8622Q" placeholder="Buscar alimento (arroz, pollo, huevo…)" autocomplete="off" value="${esc(S.q||'')}">
      <div class="v8622-chips">${list.slice(0,q?30:16).map(f=>`<button class="fchip" data-v8622-add="${esc(f.id)}">${f.mine?'⭐ ':''}${esc(f.n)}</button>`).join('')||'<span class="small">No está en la lista.</span>'}</div>
      <details class="v8622-new"${q&&!list.length?' open':''}><summary class="small">＋ Agregar un alimento propio (de la etiqueta)</summary>
        <div class="v8622-nf"><input id="v8622N" placeholder="Nombre" value="${esc(q&&!list.length?S.q:'')}"><input id="v8622K" type="number" inputmode="decimal" placeholder="kcal por 100 g"><input id="v8622P" type="number" inputmode="decimal" placeholder="Proteína por 100 g">
        <select id="v8622R">${Object.entries(V8622_ROLE).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><button class="secondary" data-v8622-mine>Guardar alimento</button></div></details></div></div>`;
  }
  function v8622Render(){const o=$('#v8622');if(!o)return;const y=o.querySelector('.v8622p')?.scrollTop||0;o.innerHTML=v8622Html();const p=o.querySelector('.v8622p');if(p)p.scrollTop=y}
  function v8622Recalc(){v8622Plan();v8622Render()}
  function v8622Open(type,editMeal){
    v8622Init();
    const date=typeof foodDate!=='undefined'?foodDate:today();
    type=type||(typeof autoMealType==='function'?autoMealType(date):'almuerzo');
    let rows;
    if(editMeal?.pesada)rows=editMeal.pesada.filter(x=>v8622Food(x.id)).map(x=>({id:x.id,g:x.g,manual:true}));
    else rows=(v8622Cfg().last[type]||[]).filter(id=>v8622Food(id)).map(id=>({id,g:0}));
    v8622St={type,date,rows,q:'',editId:editMeal?.id||null};
    document.getElementById('v8622')?.remove();
    document.body.insertAdjacentHTML('beforeend','<div id="v8622" role="dialog" aria-modal="true"></div>');
    if(editMeal)v8622Plan();else v8622Recalc();v8622Render();
  }
  function v8622Close(){document.getElementById('v8622')?.remove();v8622St=null}
  function v8622Save(){
    const S=v8622St,rows=S.rows.filter(r=>(r.g||0)>0&&v8622Food(r.id));
    if(!rows.length){toast('Agrega al menos un alimento con gramos.');return}
    const pes=rows.map(r=>{const f=v8622Food(r.id),o=v8622Of(f,r.g);return {id:r.id,n:f.n.replace(/\s*\(.*\)$/,''),g:Math.round(r.g),k:Math.round(o.k),p:Math.round(o.p*10)/10}});
    const items=pes.map(x=>`${x.n} ${x.g} g`),k=pes.reduce((n,x)=>n+x.k,0),p=Math.round(pes.reduce((n,x)=>n+x.p,0));
    v8622Cfg().last[S.type]=rows.map(r=>r.id);
    const old=S.editId?(data.meals||[]).find(m=>m.id===S.editId):null;
    if(old){Object.assign(old,{type:S.type,items,text:items.join(', '),protein:p,kcal:k,pesada:pes,editedAt:Date.now()})}
    else data.meals.push({id:uid(),date:S.date,type:S.type,items,text:items.join(', '),menu:false,protein:p,kcal:k,pesada:pes,createdAt:Date.now()});
    v8622Close();persist(true);try{renderFood()}catch{}try{renderToday()}catch{}
    toast(`${MEAL_TYPES[S.type]} guardado ✓ · ${k} kcal`);
  }

  if(V8622_ON){
    document.head.insertAdjacentHTML('beforeend',`<style id="v8622css">
      #v8622{position:fixed;inset:0;z-index:9400;background:#000b;display:flex;align-items:flex-end;justify-content:center}
      .v8622p{background:var(--panel);border:1px solid var(--line);border-radius:20px 20px 0 0;width:min(560px,100%);max-height:94vh;overflow:auto;padding:16px 14px calc(18px + env(safe-area-inset-bottom))}
      .v8622-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.v8622-h h2{margin:0;font-size:20px}
      .v8622-x{margin:0;min-width:0;width:34px;height:34px;padding:0;border-radius:50%;background:transparent;border:1px solid var(--line);color:var(--muted)}
      .v8622-goal{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.v8622-goal>div{background:var(--panel2);border-radius:12px;padding:9px 11px}
      .v8622-goal span{display:block;font-size:11px;color:var(--muted)}.v8622-goal b{font-size:14px}
      .v8622-list{display:grid;gap:8px}
      .v8622-row{position:relative;display:grid;grid-template-columns:1fr auto;gap:4px 8px;align-items:center;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:10px 40px 10px 12px}
      .v8622-row .nm b{display:block;font-size:14px;line-height:1.25}.v8622-row .nm small,.v8622-row .kc{font-size:11.5px;color:var(--muted)}
      .v8622-row .kc{grid-column:1/-1}.v8622-row .v8622-x{position:absolute;top:8px;right:8px;width:26px;height:26px;font-size:12px}
      .v8622-row .gr{display:flex;align-items:center;gap:4px}.v8622-row .gr button{margin:0;min-width:0;width:34px;height:38px;padding:0}
      .v8622-row .gr input{width:70px;height:38px;margin:0;text-align:center;font-size:18px;font-weight:800;padding:4px}.v8622-row .gr span{font-size:12px;color:var(--muted)}
      .v8622-tot{margin-top:10px;padding:10px 12px;border-radius:12px;display:flex;flex-direction:column;gap:2px;background:var(--panel2);border-left:4px solid var(--green)}
      .v8622-tot.over{border-left-color:var(--orange,#f59e0b)}.v8622-tot.under{border-left-color:#60a5fa}.v8622-tot span{font-size:12px;color:var(--muted)}
      .v8622-act{display:grid!important;grid-template-columns:1fr 1.6fr;gap:8px;margin-top:10px}.v8622-act button{margin:0}
      .v8622-add{margin-top:14px;border-top:1px solid var(--line);padding-top:12px}.v8622-add>input{width:100%}
      .v8622-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
      .v8622-nf{display:grid;gap:6px;margin-top:8px}.v8622-nf button{margin:0}
      .v8622-card{display:flex;align-items:center;gap:12px}.v8622-card .ic{font-size:28px}.v8622-card>div{flex:1}.v8622-card button{margin:0}
    </style>`);
    v8622Init();
    const _rf8622=renderFood;
    renderFood=function(){
      _rf8622();const host=$('#foodBody');if(!host||host.querySelector('.v8622-card'))return;
      const d=typeof foodDate!=='undefined'?foodDate:today();if(d>today())return;
      const G=goals(),used=kcalOn(d);
      const html=`<div class="card v8622-card"><span class="ic">⚖️</span><div><b>Pesar comida</b><div class="small">Meta ${G.kcal||V8622_DEF.kcal} kcal · llevas ${Math.round(used)}. Dime qué vas a comer y te digo cuánto servir.</div></div><button class="primary" data-v8622-open>Pesar</button></div>`;
      const ref=host.querySelector('.goals-day')||host.querySelector('.goals-card');
      if(ref)ref.insertAdjacentHTML('afterend',html);else host.insertAdjacentHTML('afterbegin',html);
      host.querySelectorAll('[data-meal-del]').forEach(b=>{const m=(data.meals||[]).find(x=>x.id===b.dataset.mealDel);if(m?.pesada&&!b.parentElement.querySelector('[data-v8622-edit]'))b.insertAdjacentHTML('beforebegin',`<button class="secondary" data-v8622-edit="${esc(m.id)}" aria-label="Cambiar gramos">⚖️</button>`)});
    };
    $('#foodBody')?.addEventListener('click',e=>{
      if(e.target.closest('[data-v8622-open]')){v8622Open();return}
      const ed=e.target.closest('[data-v8622-edit]');if(ed){e.stopPropagation();const m=(data.meals||[]).find(x=>x.id===ed.dataset.v8622Edit);if(m)v8622Open(m.type,m)}
    },true);
    document.addEventListener('click',e=>{
      const o=e.target.closest('#v8622');if(!o||!v8622St)return;
      const S=v8622St,t=e.target;
      if(t===o||t.closest('[data-v8622-close]')){v8622Close();return}
      const ty=t.closest('[data-v8622-type]');if(ty){S.type=ty.dataset.v8622Type;if(!S.rows.length)S.rows=(v8622Cfg().last[S.type]||[]).filter(id=>v8622Food(id)).map(id=>({id,g:0}));v8622Recalc();return}
      const ad=t.closest('[data-v8622-add]');if(ad){S.rows.push({id:ad.dataset.v8622Add,g:0});S.q='';v8622Recalc();return}
      const dl=t.closest('[data-v8622-del]');if(dl){S.rows=S.rows.filter(r=>r.id!==dl.dataset.v8622Del);v8622Recalc();return}
      const st=t.closest('[data-v8622-step]');if(st){const r=S.rows.find(x=>x.id===st.dataset.v8622Step),f=v8622Food(r?.id);if(r&&f){const s=f.ug||(f.r==='G'?5:10);r.g=Math.max(0,(Number(r.g)||0)+s*Number(st.dataset.d));r.manual=true;v8622Recalc()}return}
      if(t.closest('[data-v8622-auto]')){S.rows.forEach(r=>{r.manual=false});v8622Recalc();return}
      if(t.closest('[data-v8622-save]')){v8622Save();return}
      if(t.closest('[data-v8622-mine]')){
        const n=($('#v8622N')?.value||'').trim(),k=Number(String($('#v8622K')?.value).replace(',','.')),p=Number(String($('#v8622P')?.value).replace(',','.'))||0,r=$('#v8622R')?.value||'C';
        if(!n||!(k>0)){toast('Pon el nombre y las kcal por 100 g.');return}
        const id=uid();v8622Cfg().mine[id]={n,k,p,r};S.rows.push({id:'m_'+id,g:0});S.q='';persist(true);v8622Recalc();toast('Alimento guardado ✓');return}
    });
    document.addEventListener('change',e=>{
      const i=e.target.closest?.('[data-v8622-g]');if(!i||!v8622St)return;
      const r=v8622St.rows.find(x=>x.id===i.dataset.v8622G);if(!r)return;r.g=Math.max(0,Number(i.value)||0);r.manual=true;v8622Recalc();
    });
    document.addEventListener('input',e=>{
      if(e.target.id!=='v8622Q'||!v8622St)return;v8622St.q=e.target.value;
      const pos=e.target.selectionStart;v8622Render();const q=$('#v8622Q');if(q){q.focus();try{q.setSelectionRange(pos,pos)}catch{}}
    });
  }

  /* ===================== v8.5.23: comidas por categorías, sugerencias al escribir y editar ===================== */
  // (Mismo bloque en las tres apps: va al final, justo antes de `initV7();`, después de todos los demás bloques.)
  // - Cada alimento tiene categoría (se adivina por palabras clave; se cambia en "Mis alimentos" → data.foodCats).
  // - Al escribir un alimento sugiere los que ya existen (sin tildes, plurales ni mayúsculas) y, al agregar uno casi
  //   igual a otro, pregunta si es el mismo para no repetirlo. "Mis alimentos": cambiar categoría, renombrar/unir
  //   repetidos (también en las comidas guardadas) y quitar de la lista (data.foodHidden).
  // - ✏️ en cada comida registrada: se carga en el formulario y "Guardar cambios" la reemplaza (misma id).
  // Dos interfaces: la de chips (Jaider y libre: #foodNew, fSel) y la de texto (Ella: #mealText).
  const V93_CATS=[['proteina','🥩','Proteínas'],['lacteo','🥛','Lácteos'],['carbo','🍚','Harinas y granos'],['fruta','🍎','Frutas'],['verdura','🥗','Verduras'],['grasa','🥑','Grasas y frutos secos'],['bebida','🥤','Bebidas'],['dulce','🍫','Dulces y paquetes'],['suple','💊','Suplementos'],['otro','🍽','Otros']];
  const V93_CAT=Object.fromEntries(V93_CATS.map(c=>[c[0],c]));
  const V93_KW={
    suple:['creatina','whey','proteina en polvo','multivitaminico','vitamina','omega 3','colageno','scoop','preentreno'],
    bebida:['jugo','cafe','tinto','te','agua','gaseosa','coca cola','limonada','batido','malteada','aromatica','cerveza','refresco','bebida','smoothie','colada','chocolate caliente','milo','pony malta','electrolit','gatorade'],
    proteina:['pollo','pechuga','muslo','alitas','carne','res','cerdo','lomo','bistec','posta','sobrebarriga','ternera','pescado','tilapia','salmon','atun','sardina','camaron','mojarra','huevo','jamon','salchicha','salchichon','chorizo','pavo','higado','mortadela','chicharron','costilla','albondiga','hamburguesa','proteina','tofu','pernil','cecina','salami','morcilla','nuggets','pescado'],
    lacteo:['leche','queso','yogur','yogurt','kumis','kefir','cuajada','quesillo','crema de leche','griego','lacteo'],
    carbo:['arroz','pan','arepa','papa','pasta','espagueti','spaghetti','macarron','avena','platano','maduro','patacon','yuca','tortilla','cereal','granola','mazorca','maiz','quinoa','tostada','empanada','frijol','lenteja','garbanzo','arveja','almojabana','pandebono','bunuelo','tamal','sandwich','sanduche','wrap','pizza','harina','arepas','tostadas','casabe','galleta de soda'],
    fruta:['banano','banana','manzana','pera','fresa','mango','papaya','pina','uva','naranja','mandarina','sandia','patilla','melon','guayaba','mora','kiwi','fruta','durazno','maracuya','lulo','granadilla','arandano','coco','ciruela','cereza','frutas'],
    verdura:['ensalada','tomate','lechuga','cebolla','zanahoria','brocoli','pepino','espinaca','verdura','habichuela','ahuyama','calabacin','remolacha','repollo','pimenton','champinon','vegetal','apio','coliflor','verduras','vegetales'],
    grasa:['aguacate','mantequilla','mani','almendra','nuez','nueces','aceite','mayonesa','maranon','semillas','chia','linaza','crema de mani','pistacho','frutos secos','mantequilla de mani'],
    dulce:['galleta','galletas','chocolatina','chocolate','postre','helado','torta','dulce','ponque','papas fritas','chips','brownie','arequipe','bocadillo','panela','azucar','gomitas','mecato','paquete','golosina','donut','dona','cheetos','doritos','pastel','flan','gelatina','mermelada','miel','nutella','barra de cereal','barrita']
  };
  const V93_STOP=new Set(['de','del','con','la','el','los','las','y','en','un','una','al','a']);
  const v93Norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ñ ]+/g,' ').replace(/\s+/g,' ').trim();
  const v93Key=s=>v93Norm(s);
  const v93Clean=s=>String(s||'').replace(/\s+/g,' ').replace(/^[\s\-–•*]+|[\s.;:]+$/g,'').trim();
  // Para comparar: sin plural ni palabras de relleno ("2 Huevos revueltos" ≈ "2 huevo revuelto").
  const v93Stem=w=>w.length>4&&/es$/.test(w)&&!/[aeiou]es$/.test(w)?w.slice(0,-2):w.length>3&&/s$/.test(w)?w.slice(0,-1):w;
  const v93Toks=s=>v93Norm(s).split(' ').filter(w=>w&&!V93_STOP.has(w)).map(v93Stem);
  const v93Dk=s=>v93Toks(s).join(' ');
  const v93Nums=s=>(v93Norm(s).match(/\d+/g)||[]).join(',');
  let v93KwRe=null;
  function v93Guess(name){
    const n=' '+v93Norm(name)+' ';
    if(!v93KwRe){v93KwRe=[];for(const [cat,list] of Object.entries(V93_KW))for(const kw of list){const k=v93Norm(kw);v93KwRe.push([cat,k.length,new RegExp('[^a-z0-9ñ]'+k.replace(/ /g,' ')+(k.length<=3?'(e?s)?(?![a-zñ])':''))])}}
    let best=null;
    for(const [cat,len,re] of v93KwRe){const m=re.exec(n);if(!m)continue;if(!best||m.index<best.i||(m.index===best.i&&len>best.len))best={cat,i:m.index,len}}
    return best?best.cat:'otro';
  }
  function v93CatOf(name){const c=(data.foodCats||{})[v93Key(name)];return V93_CAT[c]?c:v93Guess(name)}
  function v93Hidden(){if(!Array.isArray(data.foodHidden))data.foodHidden=[];return data.foodHidden}
  // Partes de una comida (las comidas fijas se guardan como "Nombre: a, b").
  function v93Parts(m){
    if(Array.isArray(m.items)&&m.items.length)return m.items.map(v93Clean).filter(Boolean);
    let t=String(m.text||'');if(m.tpl)t=t.replace(/^[^:]{1,60}:\s*/,'');
    return t.split(/[,;\n+]/).map(v93Clean).filter(x=>x&&x.length<=45);
  }
  let v93LibC=null;
  function v93Lib(){
    const sig=(data.meals||[]).length+'|'+(data.savedAt||0)+'|'+JSON.stringify(data.foodCats||{}).length+'|'+v93Hidden().length;
    if(v93LibC&&v93LibC.sig===sig)return v93LibC.list;
    const map=new Map(),hid=new Set(v93Hidden());
    const add=(name,n,at)=>{const k=v93Key(name);if(!k||hid.has(k))return;let o=map.get(k);if(!o)map.set(k,o={key:k,name,n:0,at:0});o.n+=n;if(at>=o.at){o.at=at;o.name=name}};
    for(const m of data.meals||[])for(const x of v93Parts(m))add(x,1,m.createdAt||0);
    const fl=data.foodItems&&typeof data.foodItems==='object'?data.foodItems:{};
    for(const t of Object.values(fl))for(const [name,c] of Object.entries(t||{}))if(!map.has(v93Key(name)))add(name,Number(c)||1,0);
    const list=[...map.values()].map(o=>({...o,cat:v93CatOf(o.name)})).sort((a,b)=>b.n-a.n||b.at-a.at);
    v93LibC={sig,list};return list;
  }
  function v93Lev(a,b){if(a===b)return 0;if(!a.length)return b.length;if(!b.length)return a.length;let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]}
  // ¿Es el mismo alimento escrito distinto? 'same' = igual sin tildes/plural/mayúsculas; 'near' = casi igual (letra de más o de menos).
  function v93Dup(a,b){
    const x=v93Dk(a),y=v93Dk(b);if(!x||!y)return '';
    if(x===y)return 'same';
    if(v93Nums(a)!==v93Nums(b))return '';
    const L=Math.max(x.length,y.length);if(L<5)return '';
    const d=v93Lev(x,y);return d<=(L>=10?2:1)?'near':'';
  }
  function v93FindDup(name,lib){let near=null;for(const o of lib){const r=v93Dup(name,o.name);if(r==='same')return {o,r};if(r==='near'&&!near)near={o,r}}return near}
  // Sugerencias para lo que estás escribiendo.
  function v93Suggest(q,lib,max=6){
    const qt=v93Toks(q);if(!qt.length||v93Norm(q).length<2)return [];
    const qn=v93Norm(q),out=[];
    for(const o of lib){
      const ct=v93Toks(o.name),cn=v93Norm(o.name);let s=0;
      if(qt.every(t=>ct.some(c=>c.startsWith(t)||t.startsWith(c)&&c.length>=3)))s=0.9;
      else if(cn.includes(qn))s=0.8;
      else{const a=qt.join(' '),b=ct.join(' ');const r=1-v93Lev(a,b.slice(0,Math.max(a.length+2,0)))/Math.max(a.length,1);if(r>=0.7)s=0.55+r*0.2}
      if(s)out.push({o,s:s+Math.min(o.n,30)/300});
    }
    return out.sort((a,b)=>b.s-a.s).slice(0,max).map(x=>x.o);
  }
  const v93CatChip=c=>{const x=V93_CAT[c]||V93_CAT.otro;return x[1]};

  if(!document.getElementById('v93css'))document.head.insertAdjacentHTML('beforeend',`<style id="v93css">
    .v93-acts{display:flex;gap:6px;align-items:flex-start}
    .v93-acts button{padding:7px 10px}
    .meal-row.v93-editing{background:color-mix(in srgb,var(--green) 12%,transparent);border-radius:10px;padding-left:8px;padding-right:8px}
    .v93-sug{margin-top:6px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);overflow:hidden}
    .v93-sug:empty{display:none}
    .v93-sug .v93-sh{font-size:12px;color:var(--muted);padding:7px 12px 2px}
    .v93-sug button{display:flex;width:100%;justify-content:space-between;gap:8px;text-align:left;background:none;border:0;border-top:1px solid var(--line);padding:10px 12px;color:var(--text);font-size:14px;border-radius:0}
    .v93-sug button:first-of-type{border-top:0}
    .v93-sug button small{color:var(--muted);white-space:nowrap}
    .v93-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px;margin-top:6px;scrollbar-width:none}
    .v93-tabs::-webkit-scrollbar{display:none}
    .v93-tabs button{flex:0 0 auto;padding:7px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text);font-size:12.5px;white-space:nowrap}
    .v93-tabs button.on{border-color:var(--green);color:var(--green2);font-weight:800}
    .v93-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
    .v93-chip{padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font-size:13px;line-height:1.2;text-align:left}
    .v93-chip.on{background:var(--green);color:#15171a;border-color:transparent;font-weight:700}
    .v93-edit-bar{border:1px solid var(--green);border-radius:12px;padding:10px 12px;margin-top:10px;background:color-mix(in srgb,var(--green) 10%,transparent)}
    .v93-edit-bar .row{gap:8px;align-items:center}
    .v93-edit-bar input[type=date]{max-width:170px}
    .v93-man-cat{margin-top:14px}
    .v93-man-cat h4{margin:0 0 4px;font-size:14px}
    .v93-man-row{display:grid;grid-template-columns:1fr auto auto auto;gap:6px;align-items:center;padding:7px 0;border-top:1px solid var(--line)}
    .v93-man-row select{max-width:120px;padding:6px;font-size:12.5px}
    .v93-man-row button{padding:6px 9px}
    .v93-man-row small{display:block;color:var(--muted)}
    .v93-dups{border:1px solid var(--orange);border-radius:12px;padding:8px 10px;margin-top:8px}
    .v93-dups .row{justify-content:space-between;gap:8px;padding:5px 0}
  </style>`);

  let v93Tab='freq',v93Edit=null,v93EllaOpen=false;
  const v93IsChip=()=>!!document.getElementById('foodNew');

  /* ----- Barra de edición (las dos interfaces) ----- */
  function v93EditBar(m){
    const d=v93Edit.date||m.date;
    return `<div class="v93-edit-bar" id="v93EditBar"><div class="row" style="justify-content:space-between"><strong>✏️ Editando ${esc((MEAL_TYPES[m.type]||m.type||'comida').toLowerCase())}</strong><button type="button" class="secondary mini" data-v93-cancel>Cancelar</button></div>
      <div class="row" style="margin-top:6px"><label class="small" for="v93Date">Fecha</label><input type="date" id="v93Date" value="${esc(d)}"></div>
      <div class="small" style="margin-top:4px">Cambia lo que necesites y toca «Guardar cambios». La comida se reemplaza, no se duplica.</div></div>`;
  }
  function v93EditMeal(){return v93Edit?(data.meals||[]).find(x=>x.id===v93Edit.id)||null:null}
  function v93StartEdit(id){
    const m=(data.meals||[]).find(x=>x.id===id);if(!m)return;
    const prefix=m.tpl?((String(m.text||'').match(/^([^:]{1,60}):\s*/)||[])[1]||''):'';
    v93Edit={id,date:m.date,prefix};
    foodDate=m.date;
    if(v93IsChip()){
      fSel={date:foodDate,type:m.type in MEAL_TYPES?m.type:'snack',useMenu:false,menu:{},items:v93Parts(m),prot:m.protein??'',kcal:m.kcal??'',newText:'',editId:id};
    }else{
      v93Edit.type=m.type;v93Edit.text=Array.isArray(m.items)&&m.items.length?m.items.join(', '):(prefix?String(m.text||'').slice(String(m.text||'').indexOf(':')+1).trim():String(m.text||''));
      v93Edit.prot=m.protein??'';v93Edit.kcal=m.kcal??'';
    }
    renderFood();
    setTimeout(()=>{const el=document.getElementById('v93EditBar');el?.closest('.card')?.scrollIntoView({behavior:'smooth',block:'start'})},60);
  }
  function v93Cancel(){v93Edit=null;if(v93IsChip()&&typeof fSel!=='undefined'&&fSel&&fSel.editId)fSel=null;renderFood()}
  function v93AfterSave(msg){v93Edit=null;persist(true);renderFood();try{renderToday()}catch{}toast(msg)}
  function v93SaveChip(){
    const m=v93EditMeal();if(!m){v93Cancel();return}
    const items=selItems();if(!items.length){toast('Toca o escribe lo que comiste.');return}
    const lib=foodLib(),old=v93Parts(m),oldK=new Set(old.map(v93Key)),newK=new Set(items.map(v93Key));
    if(lib[m.type])for(const x of old)if(!newK.has(v93Key(x))&&lib[m.type][x]>0){lib[m.type][x]--;if(lib[m.type][x]<=0)delete lib[m.type][x]}
    lib[fSel.type]=lib[fSel.type]||{};for(const x of items)if(!oldK.has(v93Key(x))||fSel.type!==m.type)lib[fSel.type][x]=(lib[fSel.type][x]||0)+1;
    const d=document.getElementById('v93Date')?.value||v93Edit.date||m.date;
    m.type=fSel.type;m.date=d;m.protein=numOrEmpty(fSel.prot);m.kcal=numOrEmpty(fSel.kcal);m.editedAt=Date.now();
    if(!m.tpl||(Array.isArray(m.items)&&m.items.length))m.items=[...items];
    m.text=(m.tpl&&v93Edit.prefix?v93Edit.prefix+': ':'')+items.join(', ');
    fSel=null;foodDate=d;v93AfterSave(`${MEAL_TYPES[m.type]||'Comida'} actualizada ✓`);
  }
  function v93SaveText(){
    const m=v93EditMeal();if(!m){v93Cancel();return}
    const text=($('#mealText')?.value||'').trim();if(!text){toast('Escribe qué comiste.');return}
    const d=document.getElementById('v93Date')?.value||m.date;
    m.type=$('#mealType')?.value||m.type;m.date=d;m.protein=numOrEmpty($('#mealProt')?.value);m.kcal=numOrEmpty($('#mealKcal')?.value);m.editedAt=Date.now();
    m.text=m.tpl&&v93Edit.prefix?v93Edit.prefix+': '+text:text;
    if(Array.isArray(m.items)&&m.items.length)m.items=text.split(/[,;\n+]/).map(v93Clean).filter(Boolean);
    foodDate=d;v93AfterSave('Comida actualizada ✓');
  }

  /* ----- Interfaz de chips (Jaider y libre) ----- */
  function v93ChipsHtml(){
    const lib=v93Lib(),sel=fSel.items||[],selK=new Set(sel.map(v93Key));
    const counts={};for(const o of lib)counts[o.cat]=(counts[o.cat]||0)+1;
    for(const x of sel)if(!lib.some(o=>o.key===v93Key(x))){const c=v93CatOf(x);counts[c]=(counts[c]||0)+1}
    if(v93Tab!=='freq'&&!counts[v93Tab])v93Tab='freq';
    let names;
    if(v93Tab==='freq'){
      const base=(typeof libFor==='function'?libFor(fSel.type):[]).filter(x=>!v93Hidden().includes(v93Key(x)));
      names=[];const seen=new Set();for(const x of [...sel,...base.slice(0,14)]){const k=v93Key(x);if(!seen.has(k)){seen.add(k);names.push(x)}}
    }else{
      names=lib.filter(o=>o.cat===v93Tab).map(o=>o.name);
      for(const x of sel)if(v93CatOf(x)===v93Tab&&!names.some(n=>v93Key(n)===v93Key(x)))names.unshift(x);
    }
    // El chip usa el nombre tal como está en tu selección (para que tocarlo lo quite).
    const label=x=>sel.find(s=>v93Key(s)===v93Key(x))||x;
    const tabs=`<div class="v93-tabs"><button type="button" class="${v93Tab==='freq'?'on':''}" data-v93-tab="freq">⭐ Frecuentes</button>${V93_CATS.filter(c=>counts[c[0]]).map(c=>`<button type="button" class="${v93Tab===c[0]?'on':''}" data-v93-tab="${c[0]}">${c[1]} ${esc(c[2])} <small>${counts[c[0]]}</small></button>`).join('')}<button type="button" data-v93-manage>✏️ Mis alimentos</button></div>`;
    const chips=names.length?names.map(x=>{const v=label(x);return `<button type="button" class="fchip ${selK.has(v93Key(v))?'on':''}" data-chip="${esc(v)}">${v93Tab==='freq'?v93CatChip(v93CatOf(v))+' ':''}${esc(v)}</button>`}).join(''):'<span class="small">Escribe abajo lo que comiste; la app lo irá recordando.</span>';
    return tabs+`<div class="fchips">${chips}</div>`;
  }
  function v93DecorateChip(){
    const host=$('#foodBody');if(!host||!fSel)return;
    // Chips por categoría
    const box=host.querySelector('.food-log [data-chip]')?.closest('.fchips')||[...host.querySelectorAll('.food-log .menu-comp .fchips')].find(x=>!x.querySelector('[data-menu-chip]'));
    if(box){const wrap=document.createElement('div');wrap.className='v93-wrap';wrap.innerHTML=v93ChipsHtml();box.replaceWith(wrap)}
    // Sugerencias debajo del campo
    const inp=$('#foodNew');if(inp&&!$('#v93Sug')){inp.placeholder='Escribe y te sugiero lo que ya tienes (ej. huevos)';inp.closest('.formrow')?.insertAdjacentHTML('afterend','<div class="v93-sug" id="v93Sug"></div>');if(inp.value)v93RenderSug()}
    // Modo edición
    const m=fSel.editId?v93EditMeal():null;
    if(fSel.editId&&!m){fSel.editId=null;v93Edit=null}
    if(m){
      const card=host.querySelector('.food-log');
      card?.querySelector('.meal-tabs')?.insertAdjacentHTML('beforebegin',v93EditBar(m));
      const sv=card?.querySelector('[data-food-save]');if(sv)sv.textContent='Guardar cambios';
      card?.querySelectorAll('.menu-comp > .small').forEach(x=>{if(/última vez/.test(x.textContent))x.textContent='Marcado: lo que tiene esta comida. Toca para quitar o agregar.'});
      host.querySelectorAll('.pend-card [data-quick-confirm]').forEach(b=>b.disabled=true);
    }
  }
  function v93RenderSug(){
    const box=$('#v93Sug'),inp=$('#foodNew');if(!box||!inp)return;
    const seg=inp.value.split(',').pop()||'',lib=v93Lib(),sel=new Set((fSel?.items||[]).map(v93Key));
    const list=v93Suggest(seg,lib);
    if(!list.length){box.innerHTML='';return}
    box.innerHTML=`<div class="v93-sh">¿Es alguno de estos? Toca para usarlo</div>`+list.map(o=>`<button type="button" data-v93-sug="${esc(o.name)}"><span>${v93CatChip(o.cat)} ${esc(o.name)}</span><small>${sel.has(o.key)?'✓ ya marcado':o.n>1?o.n+' veces':'1 vez'}</small></button>`).join('');
  }
  function v93AddTyped(){
    const inp=$('#foodNew');const raw=(inp?.value||'').split(',').map(v93Clean).filter(Boolean);
    if(!raw.length){toast('Escribe el alimento.');return}
    const lib=v93Lib(),notes=[];
    for(let x of raw){
      const inSel=(fSel.items||[]).find(s=>v93Dup(s,x)==='same');if(inSel)continue;
      const f=v93FindDup(x,lib);
      if(f&&(f.r==='same'||confirm(`¿«${x}» es lo mismo que «${f.o.name}», que ya tienes?\n\nAceptar: usar «${f.o.name}» (no se repite)\nCancelar: guardarlo como uno nuevo`)))x=f.o.name;
      else{const k=v93Key(x),h=v93Hidden(),i=h.indexOf(k);if(i>=0)h.splice(i,1);notes.push(`${x} → ${V93_CAT[v93CatOf(x)][1]} ${V93_CAT[v93CatOf(x)][2]}`)}
      if(!fSel.items.some(s=>v93Key(s)===v93Key(x)))fSel.items.push(x);
    }
    fSel.newText='';renderFood();
    if(notes.length)toast(`Nuevo: ${notes.join(', ')}. Cámbialo en ✏️ Mis alimentos si no es.`);
  }

  /* ----- Interfaz de texto (Ella) ----- */
  function v93DecorateText(){
    const host=$('#foodBody'),ta=$('#mealText');if(!host||!ta)return;
    const card=ta.closest('.card');
    if(!$('#v93Sug'))ta.closest('.field')?.insertAdjacentHTML('beforeend','<div class="v93-sug" id="v93Sug"></div>');
    ta.placeholder='Escribe y te sugiero lo que ya has comido (separa con comas)';
    // Tus alimentos por categoría
    if(!$('#v93Lib')){
      const lib=v93Lib();
      ta.closest('.field')?.insertAdjacentHTML('afterend',`<details class="v93-libbox" id="v93Lib" ${v93EllaOpen?'open':''} style="margin-top:10px"><summary><strong>🗂 Tus alimentos por categoría</strong> <span class="small">(${lib.length})</span></summary><div id="v93LibIn"></div></details>`);
      v93RenderTextLib();
    }
    const m=v93Edit?v93EditMeal():null;
    if(v93Edit&&!m)v93Edit=null;
    if(m&&card&&!$('#v93EditBar')){
      card.querySelector('.field')?.insertAdjacentHTML('beforebegin',v93EditBar(m));
      const ty=$('#mealType');if(ty)ty.value=v93Edit.type||m.type;
      ta.value=v93Edit.text||'';
      if($('#mealProt'))$('#mealProt').value=v93Edit.prot??'';
      if($('#mealKcal'))$('#mealKcal').value=v93Edit.kcal??'';
      const sv=card.querySelector('[data-food-save]');if(sv)sv.textContent='Guardar cambios';
      v93RenderTextLib();
    }
  }
  function v93RenderTextLib(){
    const box=$('#v93LibIn');if(!box)return;
    const lib=v93Lib(),counts={};for(const o of lib)counts[o.cat]=(counts[o.cat]||0)+1;
    if(v93Tab==='freq'||!counts[v93Tab])v93Tab=V93_CATS.find(c=>counts[c[0]])?.[0]||'otro';
    const cur=new Set(String($('#mealText')?.value||'').split(/[,;\n+]/).map(v93Key).filter(Boolean));
    if(!lib.length){box.innerHTML='<p class="small" style="margin:6px 0 0">Aquí aparecerán los alimentos que registres, ordenados por categoría.</p>';return}
    box.innerHTML=`<div class="v93-tabs">${V93_CATS.filter(c=>counts[c[0]]).map(c=>`<button type="button" class="${v93Tab===c[0]?'on':''}" data-v93-tab="${c[0]}">${c[1]} ${esc(c[2])} <small>${counts[c[0]]}</small></button>`).join('')}<button type="button" data-v93-manage>✏️ Mis alimentos</button></div>
      <div class="v93-chips">${lib.filter(o=>o.cat===v93Tab).map(o=>`<button type="button" class="v93-chip ${cur.has(o.key)?'on':''}" data-v93-put="${esc(o.name)}">${esc(o.name)}</button>`).join('')}</div>
      <p class="small" style="margin:6px 0 0">Toca para agregarlo a lo que comiste (o quitarlo).</p>`;
  }
  function v93TextSegs(){const ta=$('#mealText');return String(ta?.value||'').split(',').map(s=>s.trim())}
  function v93RenderTextSug(){
    const box=$('#v93Sug'),ta=$('#mealText');if(!box||!ta)return;
    const seg=v93TextSegs().pop()||'',list=v93Suggest(seg,v93Lib());
    const done=new Set(v93TextSegs().slice(0,-1).map(v93Key));
    const l2=list.filter(o=>!done.has(o.key)&&o.key!==v93Key(seg));
    box.innerHTML=l2.length?`<div class="v93-sh">¿Es alguno de estos? Toca para usarlo</div>`+l2.map(o=>`<button type="button" data-v93-sug="${esc(o.name)}"><span>${v93CatChip(o.cat)} ${esc(o.name)}</span><small>${o.n>1?o.n+' veces':'1 vez'}</small></button>`).join(''):'';
  }
  function v93TextUse(name,replaceLast){
    const ta=$('#mealText');if(!ta)return;
    let segs=v93TextSegs();if(replaceLast)segs.pop();segs=segs.filter(Boolean);
    const k=v93Key(name),i=segs.findIndex(s=>v93Key(s)===k);
    if(i>=0&&!replaceLast)segs.splice(i,1);else if(i<0)segs.push(name);
    ta.value=segs.join(', ')+(segs.length?', ':'');
    if(v93Edit)v93Edit.text=ta.value;
    v93RenderTextSug();v93RenderTextLib();
    {ta.focus();try{ta.setSelectionRange(ta.value.length,ta.value.length)}catch{}}
  }
  // Al guardar en la de Ella: si escribió casi igual a algo que ya existe, preguntar.
  function v93FixTextDups(){
    const ta=$('#mealText');if(!ta)return true;
    const lib=v93Lib(),segs=ta.value.split(/[,;\n]/).map(v93Clean).filter(Boolean);let ch=false;
    const out=segs.map(x=>{if(lib.some(o=>o.key===v93Key(x)))return x;const f=v93FindDup(x,lib);if(f&&(f.r==='same'||confirm(`¿«${x}» es lo mismo que «${f.o.name}», que ya tienes?\n\nAceptar: usar «${f.o.name}»\nCancelar: dejarlo como lo escribiste`))){ch=true;return f.o.name}return x});
    if(ch||/[,;]\s*$/.test(ta.value))ta.value=out.join(', ');
    for(const x of out){const h=v93Hidden(),i=h.indexOf(v93Key(x));if(i>=0)h.splice(i,1)}
    return true;
  }

  /* ----- Mis alimentos (categorías, renombrar/unir, quitar) ----- */
  function v93Rename(oldName,newName){
    const ok=v93Key(oldName),nk=v93Key(newName);newName=v93Clean(newName);if(!ok||!nk||!newName)return;
    const fl=data.foodItems&&typeof data.foodItems==='object'?data.foodItems:null;
    if(fl)for(const t of Object.values(fl)){if(!t)continue;for(const [n,c] of Object.entries(t))if(v93Key(n)===ok&&n!==newName){t[newName]=(t[newName]||0)+(Number(c)||0);delete t[n]}}
    for(const m of data.meals||[]){
      if(Array.isArray(m.items)&&m.items.length){
        if(!m.items.some(x=>v93Key(x)===ok))continue;
        const seen=new Set();m.items=m.items.map(x=>v93Key(x)===ok?newName:x).filter(x=>{const k=v93Key(x);if(seen.has(k))return false;seen.add(k);return true});
        const pre=m.tpl?((String(m.text||'').match(/^[^:]{1,60}:\s*/)||[''])[0]):'';
        m.text=pre+m.items.join(', ');
      }else{
        const t=String(m.text||''),pre=m.tpl?((t.match(/^[^:]{1,60}:\s*/)||[''])[0]):'',body=t.slice(pre.length);
        const segs=body.split(',');if(!segs.some(s=>v93Key(v93Clean(s))===ok))continue;
        m.text=pre+segs.map(s=>v93Key(v93Clean(s))===ok?(s.match(/^\s*/)[0]+newName):s).join(',');
      }
    }
    const fc=data.foodCats=data.foodCats||{};if(fc[ok]&&!fc[nk])fc[nk]=fc[ok];if(ok!==nk)delete fc[ok];
    if(typeof fSel!=='undefined'&&fSel&&Array.isArray(fSel.items))fSel.items=[...new Set(fSel.items.map(x=>v93Key(x)===ok?newName:x))];
    v93LibC=null;
  }
  function v93DupPairs(lib){
    const out=[],used=new Set();
    for(let i=0;i<lib.length;i++)for(let j=i+1;j<lib.length;j++){const a=lib[i],b=lib[j];if(used.has(a.key)||used.has(b.key))continue;if(v93Dup(a.name,b.name)){out.push([a,b]);used.add(b.key)}}
    return out.slice(0,15);
  }
  function v93OpenManager(){
    const lib=v93Lib(),dups=v93DupPairs(lib);
    const opts=c=>V93_CATS.map(x=>`<option value="${x[0]}" ${x[0]===c?'selected':''}>${x[1]} ${esc(x[2])}</option>`).join('');
    const html=`<p class="small">Cambia la categoría de cada alimento, corrige su nombre o únelo con otro igual. Al renombrar también se corrigen tus comidas guardadas.</p>
      ${dups.length?`<div class="v93-dups"><strong>⚠️ Posibles repetidos</strong>${dups.map(([a,b])=>`<div class="row"><span class="small">«${esc(b.name)}» y «${esc(a.name)}»</span><button type="button" class="secondary mini" data-v93-merge="${esc(b.name)}" data-into="${esc(a.name)}">Unir</button></div>`).join('')}</div>`:''}
      ${lib.length?V93_CATS.filter(c=>lib.some(o=>o.cat===c[0])).map(c=>`<div class="v93-man-cat"><h4>${c[1]} ${esc(c[2])}</h4>${lib.filter(o=>o.cat===c[0]).map(o=>`<div class="v93-man-row"><div>${esc(o.name)}<small>${o.n} ${o.n===1?'vez':'veces'}</small></div><select data-v93-cat="${esc(o.name)}" aria-label="Categoría">${opts(o.cat)}</select><button type="button" class="secondary" data-v93-ren="${esc(o.name)}" aria-label="Renombrar">✏️</button><button type="button" class="secondary danger" data-v93-hide="${esc(o.name)}" aria-label="Quitar de la lista">🗑</button></div>`).join('')}</div>`).join(''):'<div class="card empty">Aún no tienes alimentos registrados.</div>'}
      <p class="small" style="margin-top:12px">🗑 solo lo quita de las sugerencias; tus comidas guardadas no cambian.</p>`;
    openFoodModal('Mis alimentos',html);
  }
  function v93Refresh(){v93LibC=null;persist(true);renderFood()}
  function v93ManagerClick(e){
    const t=e.target;
    const mg=t.closest('[data-v93-merge]');if(mg){v93Rename(mg.dataset.v93Merge,mg.dataset.into);v93Refresh();v93OpenManager();toast('Unidos ✓');e.stopPropagation();return}
    const rn=t.closest('[data-v93-ren]');if(rn){const old=rn.dataset.v93Ren,nv=v93Clean(prompt('Nuevo nombre para «'+old+'»:',old)||'');e.stopPropagation();if(!nv||nv===old)return;
      const other=v93Lib().find(o=>o.key===v93Key(nv)&&o.key!==v93Key(old));
      if(other&&!confirm(`Ya tienes «${other.name}». ¿Unirlos en uno solo?`))return;
      v93Rename(old,other?other.name:nv);v93Refresh();v93OpenManager();toast(other?'Unidos ✓':'Nombre cambiado ✓');return}
    const hd=t.closest('[data-v93-hide]');if(hd){e.stopPropagation();const n=hd.dataset.v93Hide;if(!confirm(`¿Quitar «${n}» de tus sugerencias? Tus comidas guardadas no cambian.`))return;
      const k=v93Key(n),h=v93Hidden();if(!h.includes(k))h.push(k);
      const fl=data.foodItems&&typeof data.foodItems==='object'?data.foodItems:{};for(const t2 of Object.values(fl))if(t2)for(const x of Object.keys(t2))if(v93Key(x)===k)delete t2[x];
      v93Refresh();v93OpenManager();return}
  }
  const v93Modal=$('#foodModalBody');
  if(v93Modal){
    v93Modal.addEventListener('click',e=>{if(e.target.closest('[data-v93-merge],[data-v93-ren],[data-v93-hide]'))v93ManagerClick(e)},true);
    v93Modal.addEventListener('change',e=>{const s=e.target.closest('[data-v93-cat]');if(!s)return;const fc=data.foodCats=data.foodCats||{};fc[v93Key(s.dataset.v93Cat)]=s.value;v93Refresh();v93OpenManager();toast('Categoría guardada ✓')});
  }

  /* ----- Ganchos ----- */
  const _v93Food=renderFood;
  renderFood=function(){
    const r=_v93Food.apply(this,arguments);
    try{
      const host=$('#foodBody');if(!host)return r;
      // ✏️ en cada comida guardada
      host.querySelectorAll('[data-meal-del]').forEach(b=>{if(b.parentElement.classList.contains('v93-acts'))return;const id=b.dataset.mealDel;const w=document.createElement('div');w.className='v93-acts';b.replaceWith(w);w.innerHTML=`<button type="button" class="secondary" data-v93-edit="${esc(id)}" aria-label="Editar comida">✏️</button>`;w.appendChild(b);if(v93Edit&&v93Edit.id===id)w.closest('.meal-row')?.classList.add('v93-editing')});
      if(v93IsChip())v93DecorateChip();else v93DecorateText();
    }catch(err){console.error(err)}
    return r;
  };
  const v93Host=$('#foodBody');
  if(v93Host){
    v93Host.addEventListener('click',e=>{
      const t=e.target,stop=()=>{e.stopPropagation();e.preventDefault()};
      const ed=t.closest('[data-v93-edit]');if(ed){stop();v93StartEdit(ed.dataset.v93Edit);return}
      if(t.closest('[data-v93-cancel]')){stop();v93Cancel();return}
      if(t.closest('[data-v93-manage]')){stop();v93OpenManager();return}
      const tb=t.closest('[data-v93-tab]');if(tb){stop();v93Tab=tb.dataset.v93Tab;if(v93IsChip())renderFood();else v93RenderTextLib();return}
      const sg=t.closest('[data-v93-sug]');if(sg){stop();
        if(v93IsChip()){const inp=$('#foodNew'),segs=(inp?.value||'').split(',');segs.pop();const name=sg.dataset.v93Sug;if(!fSel.items.some(s=>v93Key(s)===v93Key(name)))fSel.items.push(name);fSel.newText=segs.map(s=>s.trim()).filter(Boolean).join(', ');renderFood();setTimeout(()=>$('#foodNew')?.focus(),30)}
        else v93TextUse(sg.dataset.v93Sug,true);
        return}
      const pu=t.closest('[data-v93-put]');if(pu){stop();v93TextUse(pu.dataset.v93Put,false);return}
      if(v93IsChip()&&typeof fSel!=='undefined'&&fSel){
        if(t.closest('[data-food-add]')){stop();v93AddTyped();return}
        if(fSel.editId){
          if(t.closest('[data-food-save]')){stop();v93SaveChip();return}
          const tab=t.closest('[data-meal-tab]');
          if(tab&&tab.closest('.food-log')){stop();fSel.type=tab.dataset.mealTab;renderFood();return}
          if(tab||t.closest('[data-food-step],[data-food-day],[data-food-today]')){v93Edit=null;fSel=null}
          const del=t.closest('[data-meal-del]');if(del&&del.dataset.mealDel===fSel.editId){v93Edit=null;fSel.editId=null}
        }
      }else if(!v93IsChip()){
        if(t.closest('[data-food-save]')){
          if(v93Edit){stop();v93FixTextDups();v93SaveText();return}
          v93FixTextDups();  // sigue el guardado normal con el texto ya corregido
        }
        if(v93Edit&&t.closest('[data-food-step],[data-food-day],[data-food-today]'))v93Edit=null;
        const del=t.closest('[data-meal-del]');if(del&&v93Edit&&del.dataset.mealDel===v93Edit.id)v93Edit=null;
      }
    },true);
    v93Host.addEventListener('input',e=>{
      const id=e.target.id;
      if(id==='foodNew')v93RenderSug();
      else if(id==='mealText'){v93RenderTextSug();v93RenderTextLib();if(v93Edit)v93Edit.text=e.target.value}
      else if(v93Edit&&!v93IsChip()){if(id==='mealProt')v93Edit.prot=e.target.value;else if(id==='mealKcal')v93Edit.kcal=e.target.value}
      if(id==='v93Date'&&v93Edit)v93Edit.date=e.target.value;
    });
    v93Host.addEventListener('change',e=>{if(e.target.id==='mealType'&&v93Edit)v93Edit.type=e.target.value;if(e.target.id==='v93Date'&&v93Edit)v93Edit.date=e.target.value});
    v93Host.addEventListener('toggle',e=>{if(e.target.id==='v93Lib')v93EllaOpen=e.target.open},true);
  }

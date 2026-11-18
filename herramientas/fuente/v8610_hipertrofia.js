  /* ===== v8.6 · Animaciones de ejercicios (figura SVG con cinemática inversa) ===== */
  const HYA=(()=>{
    const L={torso:52,neck:5,head:11,ua:30,fa:28,th:42,sh:40,ft:13},R=Math.PI/180;
    const D=a=>[Math.sin(a*R),Math.cos(a*R)];
    const add=(p,l,a)=>{const d=D(a);return [p[0]+l*d[0],p[1]+l*d[1]]};
    const ang=(p,q)=>Math.atan2(q[0]-p[0],q[1]-p[1])/R;
    const P=(a,b)=>[a[0]+b[0],a[1]+b[1]];
    const mir=(p,cx)=>[2*cx-p[0],p[1]];
    function ik(Pt,T,a,b,pref){
      const dx=T[0]-Pt[0],dy=T[1]-Pt[1],d=Math.hypot(dx,dy)||.001,dd=Math.max(Math.abs(a-b)+.5,Math.min(a+b-.4,d));
      const base=Math.atan2(dy,dx),c=Math.acos(Math.max(-1,Math.min(1,(a*a+dd*dd-b*b)/(2*a*dd))));
      const j1=[Pt[0]+a*Math.cos(base+c),Pt[1]+a*Math.sin(base+c)],j2=[Pt[0]+a*Math.cos(base-c),Pt[1]+a*Math.sin(base-c)];
      const sc=v=>(v[0]-Pt[0])*pref[0]+(v[1]-Pt[1])*pref[1],J=sc(j1)>=sc(j2)?j1:j2;
      return [J,add(J,b,ang(J,T))];
    }
    function lerp(A,B,k){const o={};for(const key of Object.keys(A)){const a=A[key],b=B[key]??a;if(typeof a==='number')o[key]=a+(b-a)*k;else if(Array.isArray(a)&&typeof a[0]==='number')o[key]=a.map((x,i)=>x+((b?.[i]??x)-x)*k);else o[key]=a}for(const key of Object.keys(B))if(!(key in o))o[key]=B[key];return o}
    function limbArm(S,H,head,p,t,pre){
      const arm=p[pre+'arm'];
      if(arm){const off=p.armRel?-t:0,E=add(S,L.ua,arm[0]+off);return [E,add(E,L.fa,arm[1]+off)]}
      const hand=p[pre+'hand'],hr=p[pre+'hr'],hh=p[pre+'hh'];
      const T=hand?hand:hr?P(S,hr):hh?P(H,hh):p.handAtHead?P(head,[4,7]):add(S,58,0);
      return ik(S,T,L.ua,L.fa,p.ep||[0,1]);
    }
    function limbLeg(H,p,pre){
      const leg=p[pre+'leg'];let K,A;
      if(leg){K=add(H,L.th,leg[0]);A=add(K,L.sh,leg[1])}
      else{let T=p[pre+'foot'];const toe=p[pre+'toe'];if(toe)T=add(toe,-L.ft,p.ta??95);if(!T)T=add(H,80,0);[K,A]=ik(H,T,L.th,L.sh,p.kp||[1,0])}
      return [K,A,add(A,L.ft,p[pre+'ta']??p.ta??95)];
    }
    function solve(p){
      const H=[p.hx,p.hy],t=p.t||0,u=[Math.sin(t*R),-Math.cos(t*R)];
      const S=[H[0]+L.torso*u[0],H[1]+L.torso*u[1]],head=[S[0]+(L.neck+L.head)*u[0],S[1]+(L.neck+L.head)*u[1]];
      const J={H,S,head,t,u,front:p.view==='front'};
      if(!J.front){
        [J.E,J.W]=limbArm(S,H,head,p,t,'');
        [J.K,J.A,J.T]=limbLeg(H,p,'');
        if(p.leg2||p.foot2)[J.K2,J.A2,J.T2]=limbLeg(H,p,'2');
      }else{
        const cx=H[0];J.SR=[S[0]+15,S[1]];J.SL=mir(J.SR,cx);J.HR=[H[0]+9,H[1]];J.HL=mir(J.HR,cx);
        const [E,W]=limbArm(J.SR,J.HR,head,p,0,'');J.ER=E;J.WR=W;J.EL=mir(E,cx);J.WL=mir(W,cx);
        let K,A;
        if(p.leg){K=add(J.HR,L.th,p.leg[0]);A=add(K,L.sh,p.leg[1])}
        else{const T=p.foot||[J.HR[0]+4,J.HR[1]+80];[K,A]=ik(J.HR,T,L.th,L.sh,p.kp||[1,0])}
        J.KR=K;J.AR=A;J.TR=[A[0]+9,A[1]+2];J.KL=mir(K,cx);J.AL=mir(A,cx);J.TL=mir(J.TR,cx);
      }
      return J;
    }
    const f=n=>Math.round(n*10)/10;
    const ln=(a,b,c)=>`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" class="${c}"/>`;
    const ci=(p,r,c)=>`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" class="${c}"/>`;
    const glow=(p,r)=>`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" class="an-glow"/>`;
    // Accesorios
    const PR={
      ground:()=>`<line x1="8" y1="210" x2="232" y2="210" class="an-gr"/>`,
      db:(W,a=0)=>{const d=D(a+90),p1=[W[0]-9*d[0],W[1]-9*d[1]],p2=[W[0]+9*d[0],W[1]+9*d[1]];return ln(p1,p2,'an-pb')+ci(p1,5,'an-pw')+ci(p2,5,'an-pw')},
      bar:(W,r=13)=>ci(W,r,'an-pw')+ci(W,3,'an-pb2'),
      cable:(from,W)=>ln(from,W,'an-cb')+ci(from,4,'an-pw'),
      handle:W=>ci(W,4.5,'an-pw'),
      bench:(a,b)=>ln(a,b,'an-bench'),
      pad:(p,r=7)=>ci(p,r,'an-pad'),
    };
    const seatBack=(J,back=8)=>{const n=[-J.u[1],J.u[0]];const o=[n[0]*-back,n[1]*-back];return PR.bench(P(J.H,[o[0]*0.4-J.u[0]*6,o[1]*0.4+6]),P(J.S,[o[0]+J.u[0]*4,o[1]+J.u[1]*4]))};
    const BASE={hx:120,hy:120,t:0,ta:95,kp:[1,0],ep:[0,1]};
    const S0=(o)=>Object.assign({},BASE,o);
    const PAT={
      squat:{A:S0({hx:116,hy:121,t:6,foot:[122,197],hr:[16,18],ep:[0,1]}),B:S0({hx:90,hy:160,t:38,foot:[122,197],hr:[16,18],ep:[0,1]}),hl:['th','hip'],fg:J=>PR.db(J.W,90),
        cues:['Pies al ancho de hombros, peso en todo el pie.','Baja controlado (2–3 s) hasta donde mantengas la espalda neutra.','Sube empujando el piso; no bloquees las rodillas arriba.']},
      legPress:{A:S0({hx:84,hy:156,t:-58,foot:[118,118],ta:200,kp:[-.2,-1],hand:[92,168],ep:[0,1]}),B:S0({hx:84,hy:156,t:-58,foot:[148,94],ta:200,kp:[-.2,-1],hand:[92,168],ep:[0,1]}),hl:['th'],
        bg:J=>{const d=D(ang(J.A,J.T)),p1=[J.A[0]-10*d[0],J.A[1]-10*d[1]],p2=[J.A[0]+24*d[0],J.A[1]+24*d[1]];return seatBack(J,9)+PR.bench([60,170],[104,170])+ln(p1,p2,'an-plat')+ln([J.A[0]+12,J.A[1]+12],[214,40],'an-rail')},
        cues:['Espalda y glúteo pegados al respaldo todo el tiempo.','Baja controlado hasta ~90–100° de rodilla: más profundo no dio más cuádriceps (Larsen 2025).','Empuja con todo el pie sin bloquear las rodillas.']},
      legExt:{A:S0({hx:96,hy:142,t:-20,leg:[92,6],ta:96,arm:[8,40]}),B:S0({hx:96,hy:142,t:-20,leg:[92,88],ta:176,arm:[8,40]}),hl:['th'],
        bg:J=>seatBack(J,8)+PR.bench([76,150],[138,150])+ln([110,150],[110,206],'an-rail'),
        fg:J=>{const a=ang(J.K,J.A),d=D(a),n=[Math.cos(a*R),-Math.sin(a*R)];return PR.pad([J.A[0]-4*d[0]+9*n[0],J.A[1]-4*d[1]+9*n[1]])},
        cues:['Respaldo reclinado si se puede: más recto femoral (Larsen 2024).','Sube hasta extender casi por completo y aprieta 1 s.','Baja lento; en la última serie puedes añadir parciales abajo.']},
      seatedCurl:{A:S0({hx:96,hy:142,t:-16,leg:[92,90],ta:178,arm:[8,40]}),B:S0({hx:96,hy:142,t:-16,leg:[92,-28],ta:60,arm:[8,40]}),hl:['th'],
        bg:J=>seatBack(J,8)+PR.bench([76,150],[138,150])+ln([110,150],[110,206],'an-rail'),
        fg:J=>{const a=ang(J.K,J.A),d=D(a),n=[Math.cos(a*R),-Math.sin(a*R)];return PR.pad([J.A[0]-4*d[0]-9*n[0],J.A[1]-4*d[1]-9*n[1]])+PR.pad(P(J.K,[-14,-10]),6)},
        cues:['Ajusta el rodillo justo encima del talón y la almohadilla sobre los muslos.','Flexiona hasta llevar los talones bajo el asiento.','Vuelve lento hasta casi extender: el estiramiento es la parte clave (Maeo 2021).']},
      lyingCurl:{A:S0({hx:116,hy:150,t:-90,leg:[90,90],ta:180,arm:[-30,-70]}),B:S0({hx:116,hy:150,t:-90,leg:[90,195],ta:290,arm:[-30,-70]}),hl:['th'],
        bg:()=>PR.bench([50,160],[178,160])+ln([110,160],[110,206],'an-rail'),
        fg:J=>{const a=ang(J.K,J.A),d=D(a),n=[Math.cos(a*R),-Math.sin(a*R)];return PR.pad([J.A[0]-4*d[0]+9*n[0],J.A[1]-4*d[1]+9*n[1]])},
        cues:['Cadera pegada al banco, no la levantes al subir.','Lleva los talones hacia el glúteo.','Baja controlado hasta casi extender.']},
      standingCurl:{A:S0({hx:118,hy:121,t:10,leg:[4,2],ta:96,foot2:[118,197],hand:[150,108],ep:[0,1]}),B:S0({hx:118,hy:121,t:10,leg:[4,-112],ta:-30,foot2:[118,197],hand:[150,108],ep:[0,1]}),hl:['th'],
        bg:()=>ln([150,108],[150,206],'an-rail'),
        cues:['Apoya la cadera contra la almohadilla.','Flexiona la rodilla sin mover el muslo.','Baja lento hasta extender.']},
      rdl:{A:S0({hx:118,hy:121,t:4,foot:[121,197],arm:[0,0],kp:[1,0]}),B:S0({hx:96,hy:126,t:80,foot:[121,197],arm:[0,0],kp:[1,0]}),hl:['th','hip'],fg:J=>PR.bar(J.W,13),
        cues:['Rodillas apenas flexionadas y espalda neutra.','Lleva la cadera hacia atrás con la barra pegada a las piernas hasta sentir estiramiento en isquios.','Siempre a RIR 2: es el ejercicio que más fatiga.']},
      hipExt45:{A:S0({hx:130,hy:132,t:150,foot:[82,194],kp:[1,0],armRel:true,arm:[20,155]}),B:S0({hx:130,hy:132,t:40,foot:[82,194],kp:[1,0],armRel:true,arm:[20,155]}),hl:['th','hip'],
        bg:()=>ln([116,150],[146,124],'an-bench')+ln([86,206],[130,150],'an-rail')+PR.pad([86,200],6),
        cues:['Almohadilla bajo la cadera, que puedas doblarte libremente.','Baja con la espalda neutra hasta estirar isquios.','Sube apretando glúteo hasta quedar en línea con las piernas (Bourne 2017).']},
      hipThrust:{A:S0({hx:122,hy:182,t:-62,foot:[164,197],kp:[0,-1],hh:[0,-8],ep:[0,-1]}),B:S0({hx:128,hy:150,t:-92,foot:[164,197],kp:[0,-1],hh:[0,-8],ep:[0,-1]}),hl:['hip'],
        bg:()=>`<rect x="40" y="150" width="34" height="58" rx="5" class="an-pad2"/>`,fg:J=>PR.bar(P(J.H,[0,-10]),13),
        cues:['Parte alta de la espalda en el banco, pies bajo las rodillas arriba.','Sube hasta que cadera y tronco queden en línea; aprieta glúteo 1 s.','Mentón metido; baja controlado.']},
      adductor:{A:S0({view:'front',hx:120,hy:140,t:0,leg:[52,4],hand:[146,150],ep:[1,1]}),B:S0({view:'front',hx:120,hy:140,t:0,leg:[8,2],hand:[146,150],ep:[1,1]}),hl:['th'],
        bg:()=>PR.bench([86,148],[154,148]),fg:J=>PR.pad(P(J.KR,[-7,0]),5)+PR.pad(P(J.KL,[7,0]),5),
        cues:['Espalda apoyada y almohadillas en la cara interna de las rodillas.','Junta las piernas con control.','Abre lento hasta un estiramiento cómodo.']},
      calfStand:{A:S0({hx:127,hy:126,t:2,toe:[140,198],ta:118,arm:[2,2]}),B:S0({hx:128,hy:112,t:2,toe:[140,198],ta:55,arm:[2,2]}),hl:['sh'],
        bg:()=>`<rect x="132" y="199" width="40" height="11" rx="2" class="an-pad2"/>`,fg:J=>PR.db(J.W,0),
        cues:['De pie con rodilla extendida: así crece el gemelo (Kinoshita 2023).','Baja hasta el máximo estiramiento y pausa 1–2 s.','Sube lo más alto posible sin rebotar.']},
      calfSeat:{A:S0({hx:96,hy:150,t:0,toe:[152,198],ta:115,kp:[0,-1],arm:[10,60]}),B:S0({hx:96,hy:150,t:0,toe:[152,198],ta:58,kp:[0,-1],arm:[10,60]}),hl:['sh'],
        bg:()=>PR.bench([72,158],[130,158])+`<rect x="144" y="199" width="34" height="11" rx="2" class="an-pad2"/>`,fg:J=>PR.pad(P(J.K,[0,-8]),6),
        cues:['Sentado trabaja sobre todo el sóleo: prioriza la versión de pie.','Baja al estiramiento máximo y pausa.','Sube completo, sin rebote.']},
      inclinePress:{A:S0({hx:120,hy:162,t:-56,hr:[12,-6],ep:[-.3,1],foot:[156,197],kp:[0,-1]}),B:S0({hx:120,hy:162,t:-56,hr:[32,-46],ep:[-.3,1],foot:[156,197],kp:[0,-1]}),hl:['chest'],
        bg:J=>seatBack(J,8)+PR.bench([96,170],[134,170])+ln([110,170],[110,206],'an-rail'),fg:J=>PR.db(J.W,-56),
        cues:['Banco a 30–45°, omóplatos atrás y abajo.','Baja controlado hasta sentir estiramiento en el pecho.','Empuja hacia arriba sin rebotar; RIR 1–2.']},
      flatPress:{A:S0({hx:100,hy:150,t:-8,hr:[8,6],ep:[-1,.2],foot:[142,197],kp:[0,-1]}),B:S0({hx:100,hy:150,t:-8,hr:[56,6],ep:[-1,.2],foot:[142,197],kp:[0,-1]}),hl:['chest'],
        bg:J=>seatBack(J,8)+PR.bench([80,158],[124,158])+ln([100,158],[100,206],'an-rail'),fg:J=>ln(P(J.W,[0,-9]),P(J.W,[0,9]),'an-pb'),
        cues:['Asiento a la altura que las manijas queden a media altura del pecho.','Empuja al frente sin despegar la espalda.','Regresa lento hasta sentir el estiramiento.']},
      fly:{A:S0({view:'front',hx:120,hy:150,t:0,hr:[50,-2],ep:[0,1],leg:[30,2]}),B:S0({view:'front',hx:120,hy:150,t:0,hr:[-10,4],ep:[.3,1],leg:[30,2]}),hl:['chest'],
        bg:()=>PR.bench([92,158],[148,158]),fg:J=>PR.handle(J.WR)+PR.handle(J.WL),
        cues:['Codos ligeramente flexionados y fijos.','Abre hasta sentir estiramiento en el pecho, sin pasar el hombro hacia atrás.','Cierra apretando el pecho 1 s.']},
      ohPress:{A:S0({view:'front',hx:120,hy:150,t:0,hr:[12,-4],ep:[1,1],leg:[30,2]}),B:S0({view:'front',hx:120,hy:150,t:0,hr:[5,-56],ep:[1,.2],leg:[30,2]}),hl:['delt'],
        bg:()=>PR.bench([92,158],[148,158]),fg:J=>PR.db(J.WR,0)+PR.db(J.WL,0),
        cues:['Espalda apoyada, abdomen firme.','Baja hasta que las manos queden a la altura de las orejas.','Empuja hacia arriba sin arquear la zona lumbar.']},
      latRaise:{A:S0({view:'front',hx:120,hy:122,t:0,hr:[8,54],ep:[1,0],foot:[133,197]}),B:S0({view:'front',hx:120,hy:122,t:0,hr:[54,2],ep:[0,1],foot:[133,197]}),hl:['delt'],
        fg:J=>PR.db(J.WR,90)+PR.db(J.WL,90),
        cues:['Sube por los lados hasta la altura del hombro, codo ligeramente flexionado.','Lidera con el codo, no con la mano.','Baja lento; polea o mancuerna crecen igual (Larsen 2025).']},
      revFly:{A:S0({view:'front',hx:120,hy:150,t:0,hr:[-10,4],ep:[.3,1],leg:[30,2]}),B:S0({view:'front',hx:120,hy:150,t:0,hr:[50,-2],ep:[0,1],leg:[30,2]}),hl:['delt'],
        bg:()=>PR.bench([92,158],[148,158]),fg:J=>PR.handle(J.WR)+PR.handle(J.WL),
        cues:['Pecho contra el respaldo, brazos casi extendidos.','Abre llevando las manos hacia atrás y afuera.','Regresa lento sin perder la postura.']},
      facePull:{A:S0({hx:116,hy:121,t:-4,hr:[54,0],ep:[0,1],foot:[120,197]}),B:S0({hx:116,hy:121,t:-4,hr:[10,-12],ep:[-1,-.5],foot:[120,197]}),hl:['delt'],
        fg:J=>PR.cable([212,62],J.W),
        cues:['Polea a la altura de la cara, agarre con cuerda.','Tira hacia la frente separando las manos, codos altos.','Regresa controlado.']},
      pulldown:{A:S0({view:'front',hx:120,hy:150,t:0,hr:[24,-54],ep:[1,0],leg:[30,2]}),B:S0({view:'front',hx:120,hy:150,t:0,hr:[22,-2],ep:[1,1],leg:[30,2]}),hl:['lat'],
        bg:J=>ln([120,4],[120,J.WR[1]],'an-cb')+ln(J.WL,J.WR,'an-pb')+PR.bench([92,158],[148,158]),
        cues:['Muslos bajo las almohadillas, pecho alto.','Tira la barra hacia la parte alta del pecho llevando los codos abajo.','Sube controlado hasta estirar del todo los dorsales.']},
      pullup:{A:S0({view:'front',hx:120,hy:134,t:0,hand:[146,26],ep:[1,0],leg:[4,8]}),B:S0({view:'front',hx:120,hy:96,t:0,hand:[146,26],ep:[1,1],leg:[4,8]}),hl:['lat'],
        bg:()=>ln([80,26],[160,26],'an-pb'),
        cues:['Agarre algo más ancho que hombros.','Sube llevando el pecho a la barra y los codos hacia abajo.','Baja completo hasta estirar los dorsales.']},
      pullover:{A:S0({hx:112,hy:121,t:28,foot:[120,197],arm:[150,150]}),B:S0({hx:112,hy:121,t:28,foot:[120,197],arm:[12,12]}),hl:['lat'],
        fg:J=>PR.cable([210,30],J.W),
        cues:['Cadera atrás y brazos casi rectos.','Lleva las manos de arriba hasta los muslos con los dorsales.','Vuelve lento hasta sentir el estiramiento.']},
      row:{A:S0({hx:100,hy:150,t:12,hr:[54,8],ep:[0,1],foot:[160,178],kp:[0,-1]}),B:S0({hx:100,hy:150,t:-6,hr:[4,24],ep:[-1,0],foot:[160,178],kp:[0,-1]}),hl:['lat'],
        bg:J=>PR.bench([80,158],[124,158])+ln([164,184],[164,206],'an-rail'),fg:J=>PR.cable([228,128],J.W),
        cues:['Pecho alto, sin balancear el tronco.','Lleva los codos atrás pegados al cuerpo.','Estira los brazos adelante dejando que los omóplatos se separen.']},
      curl:{A:S0({hx:118,hy:121,t:2,foot:[121,197],arm:[2,2]}),B:S0({hx:118,hy:121,t:2,foot:[121,197],arm:[10,160]}),hl:['ua'],fg:J=>PR.db(J.W,0),
        cues:['Codo fijo al costado.','Sube sin balancear el cuerpo.','Baja controlado hasta extender el brazo.']},
      inclineCurl:{A:S0({hx:116,hy:164,t:-36,foot:[156,197],kp:[0,-1],arm:[-2,-2]}),B:S0({hx:116,hy:164,t:-36,foot:[156,197],kp:[0,-1],arm:[-2,150]}),hl:['ua'],
        bg:J=>seatBack(J,8)+PR.bench([92,172],[132,172])+ln([112,172],[112,206],'an-rail'),fg:J=>PR.db(J.W,0),
        cues:['Banco a ~45°, brazos colgando detrás del tronco.','Sube sin adelantar el codo.','Baja hasta extender: el estiramiento hace crecer la parte alta del brazo (Kassiano 2025).']},
      preacher:{A:S0({hx:96,hy:152,t:8,arm:[48,60],foot:[132,197],kp:[0,-1]}),B:S0({hx:96,hy:152,t:8,arm:[48,168],foot:[132,197],kp:[0,-1]}),hl:['ua'],
        bg:J=>ln(P(J.S,[4,10]),P(J.E,[2,9]),'an-bench')+ln(P(J.E,[2,9]),[J.E[0]-6,206],'an-rail')+PR.bench([76,160],[118,160]),fg:J=>ln(P(J.W,[0,-8]),P(J.W,[0,8]),'an-pb'),
        cues:['Axila pegada al borde del banco.','Sube sin despegar el brazo del cojín.','Baja lento hasta casi extender (crece más la parte baja, Kassiano 2025).']},
      bayesCurl:{A:S0({hx:118,hy:121,t:4,foot:[121,197],arm:[-24,-24]}),B:S0({hx:118,hy:121,t:4,foot:[121,197],arm:[-24,130]}),hl:['ua'],
        fg:J=>PR.cable([22,170],J.W),
        cues:['De espaldas a la polea, brazo un poco por detrás del cuerpo.','Sube sin mover el codo.','Baja hasta estirar el bíceps.']},
      pushdown:{A:S0({hx:116,hy:121,t:10,foot:[120,197],arm:[4,128]}),B:S0({hx:116,hy:121,t:10,foot:[120,197],arm:[4,6]}),hl:['ua'],
        fg:J=>PR.cable([168,8],J.W),
        cues:['Codos pegados al cuerpo.','Empuja hasta extender por completo.','Sube controlado hasta ~90°.']},
      ohExt:{A:S0({hx:116,hy:121,t:2,foot:[120,197],arm:[166,-18]}),B:S0({hx:116,hy:121,t:2,foot:[120,197],arm:[166,174]}),hl:['ua'],
        fg:J=>PR.db(J.W,90),
        cues:['Codos apuntando arriba, cerca de la cabeza.','Baja detrás de la cabeza hasta el máximo estiramiento.','Extiende sin abrir los codos: ~40% más tríceps que el pushdown (Maeo 2023).']},
      cableCrunch:{A:S0({hx:110,hy:160,t:16,leg:[2,-90],ta:-90,handAtHead:true,ep:[1,0]}),B:S0({hx:110,hy:160,t:108,leg:[2,-90],ta:-90,handAtHead:true,ep:[1,0]}),hl:['abs'],
        fg:J=>PR.cable([150,0],J.W),
        cues:['De rodillas, cuerda junto a la cabeza.','Enrolla el tronco llevando el pecho a la pelvis; la cadera no se mueve.','Sube lento hasta estirar el abdomen.']},
      crunch:{A:S0({hx:124,hy:188,t:-90,foot:[160,197],kp:[0,-1],handAtHead:true,ep:[0,-1]}),B:S0({hx:124,hy:188,t:-52,foot:[160,197],kp:[0,-1],handAtHead:true,ep:[0,-1]}),hl:['abs'],
        cues:['Zona lumbar pegada al suelo.','Enrolla el tronco despegando los hombros.','Baja controlado sin descansar arriba.']},
      legRaise:{A:S0({hx:120,hy:132,t:0,hand:[126,24],ep:[1,0],leg:[2,2],ta:20}),B:S0({hx:120,hy:132,t:0,hand:[126,24],ep:[1,0],leg:[84,84],ta:120}),hl:['abs'],
        bg:()=>ln([90,24],[160,24],'an-pb'),
        cues:['Cuelga quieto, sin balancearte.','Sube las piernas enrollando la pelvis.','Baja lento.']},
    };
    // Mapa ejercicio → patrón
    const MAP=[
      [/press de pecho|press plano|chest press/i,'flatPress'],[/press inclinado|press de banca|press banca/i,'inclinePress'],
      [/aperturas? inversa|peck deck inverso|pec deck inverso|p[aá]jaros|deltoides posterior/i,'revFly'],[/face pull/i,'facePull'],
      [/apertura|pec deck|peck deck|cruce de poleas|fly/i,'fly'],
      [/elevaci[oó]n(es)? lateral|m[aá]quina de elevaci[oó]n/i,'latRaise'],[/press militar|press de hombro|press arnold/i,'ohPress'],
      [/dominada/i,'pullup'],[/jal[oó]n/i,'pulldown'],[/pullover/i,'pullover'],[/remo/i,'row'],
      [/curl.*inclinado/i,'inclineCurl'],[/predicador/i,'preacher'],[/bayesian/i,'bayesCurl'],
      [/femoral sentado/i,'seatedCurl'],[/femoral acostado/i,'lyingCurl'],[/femoral de pie/i,'standingCurl'],
      [/curl/i,'curl'],
      [/sobre cabeza|trasnuca|franc[eé]s/i,'ohExt'],[/tr[ií]ceps|pressdown|extensi[oó]n con cuerda|extensi[oó]n unilateral/i,'pushdown'],
      [/pantorrilla sentado/i,'calfSeat'],[/pantorrilla|gemelo/i,'calfStand'],
      [/prensa/i,'legPress'],[/extensi[oó]n de cu[aá]driceps/i,'legExt'],
      [/peso muerto|buenos d[ií]as/i,'rdl'],[/extensi[oó]n de cadera|hiperextensi/i,'hipExt45'],[/hip thrust|glute bridge|puente/i,'hipThrust'],
      [/aduc/i,'adductor'],[/sentadilla|squat|zancada|b[uú]lgara/i,'squat'],
      [/crunch en polea/i,'cableCrunch'],[/elevaci[oó]n de piernas/i,'legRaise'],[/crunch|abdom/i,'crunch'],
    ];
    const GROUP_FALLBACK={'Pecho':'flatPress','Espalda':'row','Hombro':'ohPress','Hombro posterior':'revFly','Bíceps':'curl','Tríceps':'pushdown','Cuádriceps':'squat','Cuádriceps/Glúteo':'squat','Femoral':'seatedCurl','Femoral/Glúteo':'rdl','Glúteo':'hipThrust','Aductores':'adductor','Aductores/Glúteo':'squat','Pantorrilla':'calfStand','Abdomen':'crunch'};
    function patternFor(name,group){for(const [re,k] of MAP)if(re.test(name||''))return {key:k,generic:false};const g=GROUP_FALLBACK[group]||GROUP_FALLBACK[String(group||'').split('/')[0]];return {key:g||'squat',generic:true}}
    function render(key,k){
      const pat=PAT[key]||PAT.squat,p=lerp(pat.A,pat.B,k),J=solve(p),hl=new Set(pat.hl||[]);
      const B=(a,b,seg,extra='')=>ln(a,b,(hl.has(seg)?'an-hl':'an-b')+extra);
      let s=PR.ground()+(pat.bg?pat.bg(J,p):'');
      // brillo del músculo objetivo
      if(J.front){
        if(hl.has('chest'))s+=glow(P(J.SR,[-8,10]),8)+glow(P(J.SL,[8,10]),8);
        if(hl.has('delt'))s+=glow(J.SR,7)+glow(J.SL,7);
        if(hl.has('lat'))s+=ln(P(J.SR,[-2,8]),P(J.HR,[2,-16]),'an-glowl')+ln(P(J.SL,[2,8]),P(J.HL,[-2,-16]),'an-glowl');
      }else{
        const n=[-J.u[1],J.u[0]];
        if(hl.has('chest'))s+=glow([J.S[0]-J.u[0]*12-n[0]*5,J.S[1]-J.u[1]*12-n[1]*5],9);
        if(hl.has('delt'))s+=glow(J.S,8);
        if(hl.has('lat'))s+=ln([J.S[0]-J.u[0]*8,J.S[1]-J.u[1]*8],[J.H[0]+J.u[0]*14,J.H[1]+J.u[1]*14],'an-glowl');
        if(hl.has('abs'))s+=ln([J.H[0]+J.u[0]*8-n[0]*6,J.H[1]+J.u[1]*8-n[1]*6],[J.S[0]-J.u[0]*14-n[0]*6,J.S[1]-J.u[1]*14-n[1]*6],'an-glowl');
        if(hl.has('hip'))s+=glow(J.H,10);
      }
      if(J.front){
        s+=B(J.HL,J.KL,'th')+B(J.KL,J.AL,'sh')+B(J.AL,J.TL,'ft')+B(J.HR,J.KR,'th')+B(J.KR,J.AR,'sh')+B(J.AR,J.TR,'ft');
        s+=ln(J.HL,J.HR,'an-b')+ln([J.H[0],J.H[1]],J.S,hl.has('abs')?'an-hl':'an-b')+ln(J.SL,J.SR,'an-b');
        s+=B(J.SL,J.EL,'ua')+B(J.EL,J.WL,'fa')+B(J.SR,J.ER,'ua')+B(J.ER,J.WR,'fa');
      }else{
        if(J.K2)s+=B(J.H,J.K2,'th',' an-far')+B(J.K2,J.A2,'sh',' an-far')+B(J.A2,J.T2,'ft',' an-far');
        s+=B(J.H,J.K,'th')+B(J.K,J.A,'sh')+B(J.A,J.T,'ft');
        s+=ln(J.H,J.S,hl.has('abs')?'an-hl':'an-b');
        s+=B(J.S,J.E,'ua')+B(J.E,J.W,'fa');
      }
      s+=`<circle cx="${f(J.head[0])}" cy="${f(J.head[1])}" r="${L.head}" class="an-head"/>`;
      s+=pat.fg?pat.fg(J,p):'';
      return s;
    }
    const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
    // ciclo: pausa 0.4 s · fase de fuerza 1 s · pausa 0.4 s · bajada 2 s
    function phase(ms){const c=ms%3800;if(c<400)return {k:0,ph:'start'};if(c<1400)return {k:ease((c-400)/1000),ph:'up'};if(c<1800)return {k:1,ph:'top'};return {k:1-ease((c-1800)/2000),ph:'down'}}
    let raf=0;
    function mount(svg,key,cap){
      cancelAnimationFrame(raf);const t0=performance.now();let last='';
      const tick=now=>{if(!svg.isConnected)return;const {k,ph}=phase(now-t0);svg.innerHTML=render(key,k);if(cap&&ph!==last){last=ph;cap.textContent=ph==='up'?'▲ Fase de fuerza · ~1 s':ph==='down'?'▼ Vuelve controlado · ~2 s':ph==='top'?'● Aprieta':'● Posición inicial'}raf=requestAnimationFrame(tick)};
      raf=requestAnimationFrame(tick);
    }
    function stop(){cancelAnimationFrame(raf)}
    return {PAT,patternFor,render,mount,stop,cues:k=>(PAT[k]||PAT.squat).cues||[]};
  })();

  /* ===== v8.6 · Modo hipertrofia basado en evidencia ===== */
  const HYP_ON=(()=>{try{return V88_APP==='j'}catch{return true}})();
  const HYP_S={
    refalo23:['Refalo 2023','Ir al fallo o quedarse cerca da hipertrofia similar (meta-análisis).','https://pubmed.ncbi.nlm.nih.gov/36334240/'],
    refalo24:['Refalo 2024','En entrenados, fallo vs RIR 1–2: crecimiento similar en 8 semanas.','https://openrepository.aut.ac.nz/items/dbe641c7-a606-4e00-94bc-bb2fbe253afa'],
    robinson24:['Robinson 2024','Más cerca del fallo → algo más de hipertrofia (dosis-respuesta).','https://rke.abertay.ac.uk/en/publications/exploring-the-dose-response-relationship-between-estimated-resist/'],
    moran17:['Morán-Navarro 2017','Entrenar al fallo alarga la recuperación 24–48 h.','https://pubmed.ncbi.nlm.nih.gov/28965198/'],
    pelland24:['Pelland 2024','Más series suman, con rendimientos decrecientes; la frecuencia importa poco a igual volumen.','https://bibbase.org/network/publication/joshuapelland-jacobremmert-zacrobinson-sethhinson-michaelzourdos-theresistancetrainingdoseresponsemetaregressionsexploringtheeectsofweeklyvolumeandfrequencyonmusclehypertrophyandstrengthgain-2024'],
    schoenfeld16:['Schoenfeld 2016','3 min de descanso dieron más hipertrofia que 1 min.','https://pubmed.ncbi.nlm.nih.gov/26605807/'],
    singer24:['Singer 2024','Descansar más de 60 s ayuda; más de 90 s no muestra beneficio extra claro.','https://pubmed.ncbi.nlm.nih.gov/39205815/'],
    schoenfeld17:['Schoenfeld 2017','Cargas bajas y altas dan hipertrofia similar si te acercas al fallo.','https://pubmed.ncbi.nlm.nih.gov/28834797/'],
    coleman24:['Coleman 2024','Una semana de descarga programada no mejoró la hipertrofia.','https://pmc.ncbi.nlm.nih.gov/articles/PMC10809978/'],
    haugen23:['Haugen 2023','Máquinas y peso libre: hipertrofia similar (meta-análisis).','https://doaj.org/article/a7282dba5e674176bde2a8239832d2f7'],
    larsen25lp:['Larsen 2025 · prensa','Prensa a ~100° de rodilla: mismo crecimiento de cuádriceps que al rango máximo.','https://www.strengthlog.com/range-of-motion-in-the-leg-press/'],
    larsen24le:['Larsen 2024 · preprint','Extensión de cuádriceps reclinado (cadera ~40°): más recto femoral que sentado recto.','https://doi.org/10.51224/SRXIV.407'],
    maeo21:['Maeo 2021','Femoral sentado hizo crecer más los isquios que el acostado.','https://pubmed.ncbi.nlm.nih.gov/33009197/'],
    maeo23:['Maeo 2023','Extensión sobre cabeza: ~40% más tríceps que el pushdown.','https://barbend.com/overhead-triceps-extensions-vs-pushdowns-muscle-growth-study'],
    kinoshita23:['Kinoshita 2023','Pantorrilla de pie hizo crecer el gemelo; sentado casi no.','https://www.frontiersin.org/articles/10.3389/fphys.2023.1272106/full'],
    kassiano25:['Kassiano 2025','Curl inclinado: más parte alta del brazo; predicador: más parte baja.','https://pubmed.ncbi.nlm.nih.gov/39809454/'],
    larsen25lat:['Larsen 2025 · laterales','Elevaciones laterales con polea o mancuerna crecen igual.','https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1611468/full'],
    bourne17:['Bourne 2017','La extensión de cadera hizo crecer más la cabeza larga del bíceps femoral que el nórdico.','https://acuresearchbank.acu.edu.au/item/8q534/impact-of-the-nordic-hamstring-and-hip-extension-exercises-on-hamstring-architecture-and-morphology-implications-for-injury-prevention'],
    plotkin23:['Plotkin 2023','Hip thrust y sentadilla: mismo glúteo; la sentadilla da más cuádriceps y aductores.','https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1279170/full'],
    wolf25:['Wolf 2025','Parciales en estiramiento ≈ rango completo en entrenados (brazos).','https://peerj.com/articles/18904'],
    wolf23:['Wolf 2023','Rango parcial vs completo: ventaja posible de las parciales en estiramiento (meta-análisis).','https://doaj.org/article/99e86b317bec40f5abc2f0008358737e'],
    pec22:['Estudio agudo 2022','Inclinado activa más el pecho superior; plano, el medio-inferior (una sesión, no crecimiento).','https://pubmed.ncbi.nlm.nih.gov/36334406/'],
  };
  const HYP_EV={
    'Prensa':['Compuesto de cuádriceps con poca fatiga general. En máquina crece igual que con peso libre, y no necesitas bajar al fondo: ~100° de rodilla bastan.',['haugen23','larsen25lp']],
    'Extensión de cuádriceps':['Aislamiento de cuádriceps de poca fatiga. Si la máquina deja, reclina el respaldo para trabajar más el recto femoral.',['larsen24le']],
    'Femoral sentado':['El mejor ejercicio de isquios con evidencia: estira el músculo más que el acostado.',['maeo21']],
    'Aductores':['Complemento. La prensa ya trabaja aductores; es lo primero que puedes quitar si vas corto de tiempo.',['plotkin23']],
    'Pantorrilla':['Hazla de pie o en la prensa con la rodilla extendida y pausa abajo: sentado casi no crece el gemelo.',['kinoshita23']],
    'Pantorrilla de pie':['Rodilla extendida = gemelo estirado. Pausa 1–2 s abajo.',['kinoshita23']],
    'Pantorrilla en prensa':['Rodilla extendida como de pie: buena opción para el gemelo.',['kinoshita23']],
    'Pantorrilla sentado':['Trabaja sobre todo el sóleo; para el gemelo, prioriza la versión de pie.',['kinoshita23']],
    'Crunch en polea':['No hay comparativas fuertes entre ejercicios de abdomen: progresa la carga como en cualquier otro.',[]],
    'Press inclinado':['Carga más el pecho superior. Si te estancas, la versión en máquina crece igual y es más fácil de progresar.',['pec22','haugen23']],
    'Press inclinado en máquina':['Misma hipertrofia que con mancuernas y más estable para acercarte al fallo con seguridad.',['haugen23']],
    'Press de pecho en máquina':['Press plano: carga más la porción media-inferior, la mayor parte del pecho. Complementa al inclinado.',['pec22','haugen23']],
    'Aperturas / Pec Deck':['Aislamiento de pecho estable y de poca fatiga. Cuando hagas el tope del rango en todas las series, sube carga.',[]],
    'Aperturas':['Aislamiento de pecho estable y de poca fatiga.',[]],
    'Press militar':['El deltoides anterior ya recibe mucho del press inclinado: 2 series bastan.',['pelland24']],
    'Elevaciones laterales':['Clave para el deltoides lateral. Polea o mancuerna crecen igual: usa la que progreses mejor.',['larsen25lat']],
    'Elevaciones laterales en polea':['Polea o mancuerna crecen igual: usa la que progreses mejor.',['larsen25lat']],
    'Tríceps trasnuca / extensión sobre cabeza':['El tríceps estirado sobre la cabeza crece ~40% más que con pushdown. Va primero en tus días de brazo.',['maeo23']],
    'Tríceps en polea':['Crece menos que la extensión sobre cabeza; úsalo como complemento.',['maeo23']],
    'Tríceps unilateral en polea':['Complemento; la extensión sobre cabeza es la prioridad.',['maeo23']],
    'Jalón al pecho':['Estable y de baja fatiga. No hay evidencia de que dominadas u otra variante hagan crecer más.',['haugen23']],
    'Remo apoyado / máquina':['Con el pecho apoyado no cargas la zona lumbar (razonamiento biomecánico, no un estudio de crecimiento).',['haugen23']],
    'Remo':['Remo en máquina: estable y fácil de progresar.',['haugen23']],
    'Peck deck inverso':['Deltoides posterior: 3 series 2 veces por semana para llegar a ~6 directas.',['pelland24']],
    'Peck deck inverso unilateral':['Deltoides posterior: 3 series 2 veces por semana para llegar a ~6 directas.',['pelland24']],
    'Curl de bíceps inclinado':['Brazo detrás del cuerpo = bíceps estirado: hace crecer más la parte alta del brazo.',['kassiano25']],
    'Curl predicador':['Complementa al inclinado: hace crecer más la parte baja del brazo, cerca del codo.',['kassiano25']],
    'Curl en polea':['Complemento. Cambiarlo por curl inclinado o bayesiano suma estímulo en estiramiento.',['kassiano25']],
    'Curl bayesiano':['Brazo por detrás del cuerpo: bíceps estirado, como el curl inclinado.',['kassiano25']],
    'Peso muerto rumano':['La extensión de cadera hace crecer partes del isquio que el femoral no cubre. Es lo que más fatiga: siempre a RIR 2.',['bourne17','moran17']],
    'Extensión de cadera a 45°':['Es justo el ejercicio del estudio de Bourne: mismo estímulo de cadera que el rumano con mucha menos fatiga y sin cargar la espalda.',['bourne17']],
    'Hip thrust':['Opcional: la sentadilla/prensa da el mismo glúteo y además cuádriceps y aductores.',['plotkin23']],
    'Hack squat':['Alternativa a la prensa; no hay evidencia de que una sea superior.',['haugen23']],
  };
  const HYP_SWAPS=[
    ['Peso muerto rumano','Extensión de cadera a 45°','si te deja muy cansado: mismo estímulo de cadera con menos fatiga (Bourne 2017).'],
    ['Press inclinado','Press inclinado en máquina','si te estancas: crece igual (Haugen 2023) y es más fácil de progresar.'],
    ['Jalón al pecho','Jalón agarre neutro','si sigue estancado; no hay variante con ventaja demostrada.'],
    ['Prensa','Hack squat','para variar; o recorta la profundidad a ~100° (Larsen 2025).'],
    ['Tríceps en polea','Extensión de tríceps sobre cabeza con cuerda','para sumar estiramiento (Maeo 2023).'],
    ['Pantorrilla sentado','Pantorrilla de pie','para el gemelo (Kinoshita 2023).'],
  ];
  const HYP_C='180',HYP_P=(sets,reps,rir,rest)=>({sets,reps,rir,rest});
  const HYP_ISO='1 · última 0';
  const HYP_PLAN={
    1:{title:'Lunes · Pierna A · Cuádriceps',items:['Prensa','Extensión de cuádriceps','Femoral sentado','Aductores','Pantorrilla','Crunch en polea'],prescription:{
      'Prensa':HYP_P(4,'6–10','1–2',240),'Extensión de cuádriceps':HYP_P(3,'10–15',HYP_ISO,180),'Femoral sentado':HYP_P(3,'8–12',HYP_ISO,180),'Aductores':HYP_P(2,'10–15','1',180),'Pantorrilla':HYP_P(4,'8–15',HYP_ISO,120),'Crunch en polea':HYP_P(3,'8–12','1',180)}},
    2:{title:'Martes · Push',items:['Press inclinado','Aperturas / Pec Deck','Press militar','Elevaciones laterales','Tríceps trasnuca / extensión sobre cabeza'],prescription:{
      'Press inclinado':HYP_P(3,'6–10','1–2',180),'Aperturas / Pec Deck':HYP_P(3,'10–15',HYP_ISO,180),'Press militar':HYP_P(2,'6–10','1–2',180),'Elevaciones laterales':HYP_P(3,'10–20',HYP_ISO,180),'Tríceps trasnuca / extensión sobre cabeza':HYP_P(3,'8–12',HYP_ISO,180)}},
    3:{title:'Miércoles · Pull',items:['Jalón al pecho','Remo apoyado / máquina','Peck deck inverso','Curl de bíceps inclinado','Curl predicador'],prescription:{
      'Jalón al pecho':HYP_P(3,'6–10','1–2',180),'Remo apoyado / máquina':HYP_P(3,'8–12','1–2',180),'Peck deck inverso':HYP_P(3,'12–20',HYP_ISO,180),'Curl de bíceps inclinado':HYP_P(3,'8–12',HYP_ISO,180),'Curl predicador':HYP_P(2,'8–12',HYP_ISO,180)}},
    4:{title:'Jueves · Descanso',items:[],prescription:{}},
    5:{title:'Viernes · Pierna B · Posterior',items:['Peso muerto rumano','Femoral sentado','Prensa','Extensión de cuádriceps','Pantorrilla'],prescription:{
      'Peso muerto rumano':HYP_P(3,'6–10','2',240),'Femoral sentado':HYP_P(3,'8–12',HYP_ISO,180),'Prensa':HYP_P(3,'8–12','1–2',240),'Extensión de cuádriceps':HYP_P(2,'12–15',HYP_ISO,180),'Pantorrilla':HYP_P(4,'8–15',HYP_ISO,120)}},
    6:{title:'Sábado · Torso',items:['Remo','Press de pecho en máquina','Jalón al pecho','Aperturas','Peck deck inverso unilateral','Crunch en polea'],prescription:{
      'Remo':HYP_P(3,'8–12','1–2',180),'Press de pecho en máquina':HYP_P(3,'8–12','1–2',180),'Jalón al pecho':HYP_P(3,'8–12','1–2',180),'Aperturas':HYP_P(3,'10–15',HYP_ISO,180),'Peck deck inverso unilateral':HYP_P(3,'12–20',HYP_ISO,180),'Crunch en polea':HYP_P(3,'8–12','1',180)}},
    7:{title:'Domingo · Hombros + Brazos',items:['Elevaciones laterales en polea','Tríceps trasnuca / extensión sobre cabeza','Tríceps en polea','Curl predicador','Curl en polea'],prescription:{
      'Elevaciones laterales en polea':HYP_P(4,'10–20',HYP_ISO,180),'Tríceps trasnuca / extensión sobre cabeza':HYP_P(3,'8–12',HYP_ISO,180),'Tríceps en polea':HYP_P(3,'10–15',HYP_ISO,180),'Curl predicador':HYP_P(3,'8–12',HYP_ISO,180),'Curl en polea':HYP_P(2,'10–15',HYP_ISO,180)}},
  };
  const HYP_ORIG=structuredClone(BUILTIN_ROUTINES);
  const HYP_AI=' Contexto con evidencia para hipertrofia: compuestos a RIR 1–2 y aislamiento con solo la última serie al fallo (Refalo 2023 y 2024; Robinson 2024); unas 10–16 series directas por músculo por semana repartidas en 2 sesiones (Pelland 2024); de 6 a 15 repeticiones sirven (Schoenfeld 2017); máquinas y peso libre dan hipertrofia similar (Haugen 2023); prioriza ejercicios con el músculo estirado (femoral sentado, extensión de tríceps sobre cabeza, curl inclinado, pantorrilla de pie); sugiere descarga solo con fatiga alta y estancamiento (Coleman 2024). No recomiendes descansos menores a 3 minutos.';

  function hypOn(){return !!data.settings?.hypPlan}
  function hypSyncBuiltins(){if(!HYP_ON)return;const on=hypOn();for(const k of Object.keys(HYP_ORIG))BUILTIN_ROUTINES[k]=structuredClone(on?HYP_PLAN[k]:HYP_ORIG[k])}
  const _rebuildHyp=rebuildRoutines;
  rebuildRoutines=function(){try{hypSyncBuiltins();hypThemeApply()}catch(e){console.error(e)}return _rebuildHyp.apply(this,arguments)};
  function hypApply(){
    if(!confirm('¿Aplicar el plan de hipertrofia?\n\nGuardo una copia de tus rutinas actuales y lo puedes deshacer cuando quieras.'))return;
    try{saveBackupVersion('Antes del plan de hipertrofia')}catch{}
    const st=data.settings,prev={customRoutines:{},routineOrder:{},hideBuiltinRoutines:!!st.hideBuiltinRoutines};
    for(const [id,r] of Object.entries(data.customRoutines||{})){const d=Number(r?.day);if(d>=1&&d<=7){prev.customRoutines[id]=r;delete data.customRoutines[id]}}
    st.routineOrder=st.routineOrder||{};for(const k of ['1','2','3','4','5','6','7'])if(st.routineOrder[k]){prev.routineOrder[k]=st.routineOrder[k];delete st.routineOrder[k]}
    st.hideBuiltinRoutines=false;st.hypPlan={v:1,applied:today(),prev};
    rebuildRoutines();persist();toast('Plan de hipertrofia aplicado.');try{hypRenderModal()}catch{}
  }
  function hypUndo(){
    const st=data.settings,h=st.hypPlan;if(!h)return;
    if(!confirm('¿Volver a tus rutinas anteriores?'))return;
    const prev=h.prev||{};data.customRoutines=data.customRoutines||{};
    for(const [id,r] of Object.entries(prev.customRoutines||{}))data.customRoutines[id]=r;
    st.routineOrder=Object.assign(st.routineOrder||{},prev.routineOrder||{});st.hideBuiltinRoutines=!!prev.hideBuiltinRoutines;delete st.hypPlan;
    rebuildRoutines();persist();toast('Rutinas anteriores restauradas.');try{hypRenderModal()}catch{}
  }

  /* --- utilidades de presentación --- */
  const HYP_CERT={refalo23:'media',refalo24:'media',robinson24:'media',moran17:'media',pelland24:'alta',schoenfeld16:'baja',singer24:'baja',schoenfeld17:'alta',coleman24:'baja',haugen23:'media',larsen25lp:'baja',larsen24le:'baja',maeo21:'baja',maeo23:'baja',kinoshita23:'baja',kassiano25:'baja',larsen25lat:'baja',bourne17:'baja',plotkin23:'baja',wolf25:'baja',wolf23:'media',pec22:'baja'};
  const HYP_CERT_TXT={alta:'Certeza alta: varios estudios o meta-análisis coinciden',media:'Certeza media: meta-análisis con pocos estudios o resultados que no siempre coinciden',baja:'Certeza baja: un solo estudio, preprint o medición indirecta'};
  const hypCite=k=>{const s=HYP_S[k];if(!s)return '';const c=HYP_CERT[k]||'baja';return `<button type="button" class="hyp-cite" data-hyp-url="${esc(s[2])}" title="${esc(s[1]+' · '+HYP_CERT_TXT[c])}"><i class="hyp-cert ${c}"></i>📄 ${esc(s[0])}</button>`};
  const hypEvFor=name=>HYP_EV[name]||HYP_EV[String(name||'').replace(/ (con mancuernas|en máquina|en polea)$/,'')]||null;
  const hyaBtn=(name,cls='')=>`<button type="button" class="hya-btn ${cls}" data-hya="${esc(name)}">▶ Cómo se hace</button>`;
  function hypIsCompound(name){return COMPOUND_RE.test(name||'')||!!catalogEntry(name).warmup}
  function hypOpenUrl(u){try{if(window.NativeX?.openUrl){window.NativeX.openUrl(u);return}}catch{}try{window.open(u,'_blank')}catch{}}

  /* --- Modal de evidencia / plan --- */
  function hypEnsureModals(){
    if($('#hypModal'))return;
    document.body.insertAdjacentHTML('beforeend',`<div class="modal hidden" id="hypModal" role="dialog" aria-modal="true" aria-label="Plan de hipertrofia"><div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0">📈 Plan de hipertrofia</h2><div class="small">Cada decisión con el estudio que la respalda.</div></div><button class="secondary" data-hyp-close>Cerrar</button></div><div id="hypModalBody"></div></div></div>
<div class="modal hidden" id="hyaModal" role="dialog" aria-modal="true" aria-label="Cómo se hace"><div class="modal-panel"><div class="modal-head"><div><h2 style="margin:0" id="hyaTitle">Cómo se hace</h2><div class="small" id="hyaSub"></div></div><button class="secondary" data-hya-close>Cerrar</button></div><div id="hyaBody"></div></div></div>`);
  }
  function hypRenderModal(){
    const host=$('#hypModalBody');if(!host)return;const on=hypOn();
    const pr=(t,ks)=>`<li>${t}<div>${ks.map(hypCite).join('')}</div></li>`;
    const days=Object.entries(HYP_PLAN).map(([d,r])=>`<details class="hyp-day" ${String(dayOf(today()))===d?'open':''}><summary><b>${esc(r.title)}</b>${r.items.length?` <span class="small">· ${r.items.length} ejercicios</span>`:''}</summary>${r.items.length?r.items.map(n=>{const p=r.prescription[n],ev=hypEvFor(n);return `<div class="hyp-ex"><div class="row between" style="gap:8px;align-items:flex-start"><div><b>${esc(n)}</b><div class="small">${p.sets} × ${esc(p.reps)} · RIR ${esc(p.rir)}</div><label class="hyp-rest small">⏱ Descanso ${hypRestSel(n,p.rest)}</label></div>${hyaBtn(n,'mini')}</div>${ev?`<div class="small hyp-why">${esc(ev[0])}</div><div>${ev[1].map(hypCite).join('')}</div>`:''}</div>`}).join(''):'<p class="small">Descanso: el músculo crece mientras te recuperas.</p>'}</details>`).join('');
    host.innerHTML=`${HYP_ON?`<div class="hyp-status ${on?'on':''}">${on?`✅ Plan activo desde el ${esc(dateLabel(data.settings.hypPlan.applied))}.`:'El plan aún no está aplicado: tus rutinas actuales siguen igual.'}<div class="row" style="gap:8px;margin-top:8px">${on?'<button class="secondary" data-hyp-undo>↩ Volver a mis rutinas anteriores</button>':'<button class="primary" data-hyp-apply>Aplicar plan</button>'}</div></div>`:''}
<h3 class="hyp-h">Cómo entrenar</h3><ul class="hyp-pr">
${pr('<b>Esfuerzo:</b> compuestos (prensa, rumano, press, jalón, remo) a RIR 1–2 en todas las series. Aislamiento a RIR 1 y solo la última serie al fallo. Crece igual y te recuperas antes.',['refalo23','refalo24','robinson24','moran17'])}
${pr('<b>Volumen:</b> ~10–16 series directas por músculo por semana, repartidas en 2 sesiones. Más series suman cada vez menos.',['pelland24'])}
${pr('<b>Repeticiones:</b> de 6 a 15 todas sirven si llegas cerca del fallo.',['schoenfeld17'])}
${pr('<b>Progresión doble:</b> cuando hagas el tope del rango en todas las series con el RIR indicado, sube el mínimo de carga. La app te lo propone en cada serie.',[])}
${pr('<b>Descanso:</b> 3 min (4 en prensa y rumano) para recuperar el músculo y el sistema nervioso y no perder repeticiones en la siguiente serie. Lo que coinciden los estudios: menos de 60 s es peor; entre 90 s y 3 min la diferencia en crecimiento no está clara (pocos estudios y pequeños), así que no hay razón para bajarlo. Puedes cambiar el descanso de cada ejercicio abajo, en «Tu semana».',['schoenfeld16','singer24'])}
${pr('<b>Máquinas:</b> crecen igual que el peso libre y cansan menos. Si un ejercicio libre te estanca o fatiga, pásalo a máquina.',['haugen23'])}
${pr('<b>Parciales:</b> en la última serie de aislamiento puedes sumar repeticiones parciales en la parte estirada.',['wolf25','wolf23'])}
${pr('<b>Descarga:</b> solo cuando hay fatiga alta y estancamiento; programarla sin señales no da más músculo.',['coleman24'])}
</ul>
<h3 class="hyp-h">Tu semana</h3>${days}
<h3 class="hyp-h">Si un ejercicio te fatiga demasiado</h3><ul class="hyp-pr">${HYP_SWAPS.map(([a,b,w])=>`<li><b>${esc(a)}</b> → <b>${esc(b)}</b> ${esc(w)} ${hyaBtn(b,'mini')}</li>`).join('')}</ul>
<h3 class="hyp-h">Estudios</h3><p class="small" style="margin:0 0 8px">No todos pesan igual. El punto de color dice qué tan seguro es: <i class="hyp-cert alta"></i> alta (varios estudios coinciden) · <i class="hyp-cert media"></i> media · <i class="hyp-cert baja"></i> baja (un solo estudio o indirecto). Cuando uno de certeza baja choca con uno de certeza alta, manda el de alta.</p><ul class="hyp-pr hyp-studies">${['alta','media','baja'].map(c=>Object.keys(HYP_S).filter(k=>(HYP_CERT[k]||'baja')===c).map(k=>`<li>${hypCite(k)} <span class="small">${esc(HYP_S[k][1])} · <b>certeza ${c}</b></span></li>`).join('')).join('')}</ul>
<p class="small">Si cambias de gimnasio según el día (Principal / U), revisa que los ejercicios de cada día existan allí.</p>`;
  }
  function hypOpenModal(){hypEnsureModals();hypRenderModal();openM('hypModal')}

  /* --- Modal de animación --- */
  function hyaOpen(name){
    hypEnsureModals();const c=catalogEntry(name),pf=HYA.patternFor(name,c.group),ev=hypEvFor(name);
    $('#hyaTitle').textContent=name;$('#hyaSub').textContent=`${c.group||'Ejercicio'}${pf.generic?' · animación genérica del grupo':''}`;
    $('#hyaBody').innerHTML=`<div class="hya-stage"><svg class="an-svg" viewBox="0 0 240 220" aria-label="Animación de ${esc(name)}"></svg><div class="hya-cap small"></div></div><p class="small" style="margin:6px 0 10px">En color: el músculo que trabaja.</p><h3 class="hyp-h">Técnica</h3><ol class="hya-cues">${HYA.cues(pf.key).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${ev?`<h3 class="hyp-h">Por qué está en tu plan</h3><p class="small hyp-why">${esc(ev[0])}</p><div>${ev[1].map(hypCite).join('')}</div>`:''}`;
    openM('hyaModal');HYA.mount($('#hyaBody svg'),pf.key,$('#hyaBody .hya-cap'));
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-hya]');if(a){e.preventDefault();e.stopPropagation();hyaOpen(a.dataset.hya);return}
    if(e.target.closest('[data-hya-close]')){HYA.stop();closeM('hyaModal');return}
    if(e.target.closest('[data-hyp-close]')){closeM('hypModal');return}
    const u=e.target.closest('[data-hyp-url]');if(u){e.preventDefault();e.stopPropagation();hypOpenUrl(u.dataset.hypUrl);return}
    if(e.target.closest('[data-hyp-open]')){hypOpenModal();return}
    if(e.target.closest('[data-hyp-apply]')){hypApply();return}
    if(e.target.closest('[data-hyp-undo]')){hypUndo();return}
    const sw=e.target.closest('[data-hyp-theme]');if(sw){hypSetTheme({id:sw.dataset.hypTheme});return}
    if(e.target.id==='hyaModal'){HYA.stop();closeM('hyaModal')}
    if(e.target.id==='hypModal')closeM('hypModal');
  },true);

  /* --- Tarjetas en Resumen y Entrenar --- */
  function hypCardHtml(){
    if(!HYP_ON)return '';
    if(!hypOn())return `<div class="card hyp-card"><div class="hyp-badge">📈 Basado en estudios</div><strong>Plan de hipertrofia</strong><p class="small" style="margin:4px 0 10px">6 días, cada músculo 2 veces por semana, ~10–16 series semanales y compuestos a RIR 1–2. Lun Pierna A · Mar Push · Mié Pull · Jue descanso · Vie Pierna B · Sáb Torso · Dom Hombros + brazos.</p><div class="row" style="gap:8px"><button class="primary" data-hyp-apply>Aplicar plan</button><button class="secondary" data-hyp-open>Ver el plan y los estudios</button></div></div>`;
    const r=HYP_PLAN[dayOf(today())];
    return `<div class="card hyp-card on"><div class="row between" style="gap:8px"><div><strong>📈 Plan de hipertrofia activo</strong><div class="small">Hoy: ${esc(r?.title||'—')}</div></div><button class="secondary" data-hyp-open>📚 Por qué</button></div></div>`;
  }
  const _rheHyp=renderHomeExtras;
  renderHomeExtras=function(){const r=_rheHyp.apply(this,arguments);try{const h=$('#homeExtras');if(h&&HYP_ON)h.insertAdjacentHTML('afterbegin',hypCardHtml())}catch(e){console.error(e)}return r};
  const _rteHyp=renderTrainExtras;
  renderTrainExtras=function(){const r=_rteHyp.apply(this,arguments);try{const h=$('#trainExtras');if(h&&flowPhase==='setup'){h.insertAdjacentHTML('beforeend',HYP_ON?(hypOn()?`<div class="hyp-line"><span>📈 Plan de hipertrofia · compuestos RIR 1–2, aislamiento: última serie al fallo.</span><button class="secondary mini" data-hyp-open>📚 Por qué</button></div>`:hypCardHtml()):'')}}catch(e){console.error(e)}return r};

  /* --- Botón ▶ en las tarjetas de la sesión --- */
  const _rdHyp=renderDraft;
  renderDraft=function(){const r=_rdHyp.apply(this,arguments);try{draft.forEach(ex=>{const card=$(`#draftExercises [data-ex-id="${ex.id}"]`);if(!card||card.querySelector('.hya-btn'))return;card.querySelector('strong')?.insertAdjacentHTML('afterend',' '+hyaBtn(ex.name,'mini'))})}catch(e){console.error(e)}return r};

  const _rfcHyp=renderFocusContent;
  renderFocusContent=function(){const r=_rfcHyp.apply(this,arguments);try{if(flowPhase==='set'||flowPhase==='warmup'){const h=$('#focusContent h1');const ex=draft[activeExercise];if(h&&ex&&!$('#focusContent .hya-top'))h.insertAdjacentHTML('afterend',`<div class="hya-top" style="margin:-2px 0 8px">${hyaBtn(ex.name,'mini')}</div>`)}}catch(e){console.error(e)}return r};
  /* --- Guía de esfuerzo durante la serie --- */
  function hypSetHint(ex,index){
    if(!HYP_ON)return '';
    if(deloadState())return '<div class="hyp-hint">🌙 Semana de descarga: deja 3 repeticiones en reserva.</div>';
    const eff=(ex.sets||[]).filter(isEffectiveSet),pos=(ex.sets||[]).slice(0,index+1).filter(isEffectiveSet).length,last=pos>=eff.length;
    let t;
    if(/peso muerto|buenos d/i.test(ex.name))t='🎯 RIR 2 en todas: es el ejercicio que más fatiga.';
    else if(hypIsCompound(ex.name))t='🎯 Compuesto: deja 1–2 repeticiones en reserva en todas las series.';
    else t=last?'🔥 Última serie: puedes llegar al fallo (RIR 0). Si quieres, suma parciales en la parte estirada.':'🎯 Deja 1 repetición en reserva; la última serie sí puede ir al fallo.';
    return `<div class="hyp-hint">${t}</div>`;
  }
  const _sgHyp=seriesGuidance;
  seriesGuidance=function(ex,index){let h=_sgHyp.apply(this,arguments);try{h+=hypSetHint(ex,index)}catch(e){console.error(e)}return h};

  const hypHinted=new Set();let hypToastT=0;
  function hypToast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(hypToastT);hypToastT=setTimeout(()=>t.classList.remove('show'),5500)}
  function hypAfterSet(e,st){
    if(hypHinted.has(e.id)||!isEffectiveSet(st)||setType(st)!=='normal')return;
    let msg='';const rir=st.rir;
    if(hypIsCompound(e.name)&&rir!==''&&rir!=null&&Number(rir)===0)msg='Llevaste un compuesto al fallo. En las siguientes deja 1–2 en reserva: crece igual y te recuperas antes (Refalo 2024).';
    else{const done=(e.sets||[]).filter(s=>isEffectiveSet(s)&&s.completedAt&&Number(s.solo)>0),first=done[0];
      if(done.length>=2&&first!==st&&Number(first.load)===Number(st.load)&&Number(st.solo)<=Number(first.solo)*0.7)msg=`Perdiste ${Number(first.solo)-Number(st.solo)} repeticiones desde la 1.ª serie: descansa el tiempo completo y no lleves la primera al fallo.`}
    if(msg){hypHinted.add(e.id);setTimeout(()=>hypToast(msg),2500)}
  }
  const _finHyp=finishCurrentSet;
  finishCurrentSet=function(){
    let e,st,was;try{syncActiveIndices();e=draft[activeExercise];st=e?.sets?.[activeSet];was=st?.completedAt}catch{}
    const r=_finHyp.apply(this,arguments);
    try{if(HYP_ON&&e&&st&&st.completedAt&&st.completedAt!==was&&!editingExisting&&!deloadState())hypAfterSet(e,st)}catch(err){console.error(err)}
    return r;
  };

  /* --- Sustituciones: primero la mejor respaldada o la de menos fatiga --- */
  if(HYP_ON){
    SUBSTITUTIONS['Peso muerto rumano']=['Extensión de cadera a 45°','Peso muerto rumano con mancuernas','Buenos días'];
    SUBSTITUTIONS['Press inclinado']=['Press inclinado en máquina','Press inclinado con mancuernas','Press de pecho en máquina'];
    SUBSTITUTIONS['Tríceps en polea']=['Extensión de tríceps sobre cabeza con cuerda','Extensión unilateral sobre cabeza','Extensión con cuerda'];
    SUBSTITUTIONS['Femoral sentado']=['Femoral acostado','Curl femoral de pie','Extensión de cadera a 45°'];
    SUBSTITUTIONS['Curl en polea']=['Curl bayesiano','Curl de bíceps inclinado','Curl con barra EZ'];
    SUBSTITUTIONS['Pantorrilla']=['Pantorrilla de pie','Pantorrilla en prensa','Pantorrilla sentado'];
    SUBSTITUTIONS['Press de pecho en máquina']=['Press inclinado en máquina','Aperturas / Pec Deck','Cruce de poleas'];
    SUBSTITUTIONS['Extensión de cadera a 45°']=['Peso muerto rumano con mancuernas','Peso muerto rumano','Femoral sentado'];
  }
  const _osmHyp=openSubstituteModal;
  openSubstituteModal=function(){const r=_osmHyp.apply(this,arguments);try{if(!HYP_ON)return r;const box=$('#subContent');if(!box||box.querySelector('.hyp-subnote'))return r;
    box.querySelectorAll('[data-substitute]').forEach(b=>{const ev=hypEvFor(b.dataset.substitute);b.insertAdjacentHTML('beforeend',`${ev?`<div class="small hyp-why">📚 ${esc(ev[0])}</div>`:''}`)});
    box.insertAdjacentHTML('afterbegin','<p class="small hyp-subnote" style="margin:0 0 8px">Ordenadas: primero la opción con mejor respaldo o menos fatiga.</p>')}catch(e){console.error(e)}return r};

  /* --- Descarga y fatiga alineadas con la evidencia --- */
  if(HYP_ON){
    deloadAdvice=function(){
      if(deloadState())return null;const st=stalledList().length,f=fatigueAssessment().level,wk=trainingWeeksInRow();
      const lastDl=data.settings.deloadDismissed||'';if(lastDl&&addDaysStr(lastDl,14)>today())return null;
      if(f==='high'&&(st>=2||wk>=4))return {wk,st,f};return null;
    };
    const _dhHyp=deloadHtml;
    deloadHtml=function(){return String(_dhHyp.apply(this,arguments)||'').replace('Una semana más suave suele ayudar a volver a subir.','Con estas señales, una semana suave ayuda a recuperar rendimiento. Programarla sin señales no da más músculo (Coleman 2024).')};
    const _faHyp=fatigueAssessment;
    fatigueAssessment=function(){const f=_faHyp.apply(this,arguments);if(f?.level==='high')f.advice='Primero quita el fallo en los compuestos (RIR 2) durante 1–2 semanas. Si sigues muy cansado, haz 5–7 días con la mitad de series y RIR 3.';else if(f?.level==='medium')f.advice='Compuestos a RIR 1–2 y el fallo solo en la última serie de aislamiento. Si se repite el cansancio, baja un poco el volumen.';return f};
    const _aiHyp=aiAsk;
    aiAsk=function(o){try{if(o&&/entrenador|rutina|entreno/i.test(o.system||''))o={...o,system:(o.system||'')+HYP_AI}}catch{}return _aiHyp.call(this,o)};
  }

  /* --- Colores de la app (8.6.11: temas completos — fondo, tarjetas, texto, bordes y acento) --- */
  // Cada tema define toda la paleta. Los colores fijos del CSS (los que no usan variables) se traducen
  // al vuelo: los grises se ubican en la escala del tema por su luminosidad y los verdes pasan al acento.
  const HYP_THEMES=[
    {id:'esmeralda',name:'Original',bg:'#101512',panel:'#1b1c1f',panel2:'#222428',line:'#333539',muted:'#a4a7ac',text:'#eff5f2',green:'#76e7a5',green2:'#abf0c8',ink:'#0b120d'},
    {id:'grafito',name:'Grafito',bg:'#0f1012',panel:'#1a1b1e',panel2:'#222327',line:'#323438',muted:'#a0a4aa',text:'#eef0f3',green:'#8ab4f8',green2:'#c3d7fb',ink:'#0b1324'},
    {id:'medianoche',name:'Medianoche',bg:'#0a0f1e',panel:'#131a2d',panel2:'#1a2238',line:'#2a3452',muted:'#9aa4c4',text:'#eef1fb',green:'#7aa2ff',green2:'#bccdff',ink:'#08122e'},
    {id:'ambar',name:'Carbón y ámbar',bg:'#0f0e0c',panel:'#1b1916',panel2:'#23201c',line:'#36312b',muted:'#aaa294',text:'#f4efe6',green:'#f2b45a',green2:'#f8d49c',ink:'#1c1305'},
    {id:'vino',name:'Vino',bg:'#140c11',panel:'#21151c',panel2:'#291b23',line:'#3d2b35',muted:'#b59ca8',text:'#f7edf1',green:'#ff7aa2',green2:'#ffb7cc',ink:'#2b0815'},
    {id:'bosque',name:'Bosque',bg:'#0a110d',panel:'#142019',panel2:'#1a281f',line:'#293c30',muted:'#9aaf9f',text:'#edf5ef',green:'#a6e36e',green2:'#d0f1b1',ink:'#0f1b05'},
    {id:'lavanda',name:'Lavanda',bg:'#100e19',panel:'#1b1827',panel2:'#221e31',line:'#342f48',muted:'#a8a2c1',text:'#f2effb',green:'#b9a6ff',green2:'#dbd0ff',ink:'#170d33'},
    {id:'oled',name:'Negro OLED',bg:'#000000',panel:'#0e0f10',panel2:'#161718',line:'#29292c',muted:'#a2a3a8',text:'#f5f5f7',green:'#5eead4',green2:'#a8f4e8',ink:'#00211c'},
    {id:'claro',name:'Claro',light:true,bg:'#f3f5f4',panel:'#ffffff',panel2:'#eceff0',line:'#d6dcdb',muted:'#5d6a66',text:'#131916',green:'#13914c',green2:'#0d7038',ink:'#ffffff'},
    {id:'nube',name:'Nube',light:true,bg:'#edf1f7',panel:'#ffffff',panel2:'#e5ebf4',line:'#d0d9e7',muted:'#596579',text:'#111827',green:'#2f6fe4',green2:'#1c4fb4',ink:'#ffffff'},
    {id:'arena',name:'Arena',light:true,bg:'#f5efe6',panel:'#fffcf7',panel2:'#efe6d9',line:'#ded1bf',muted:'#6d6255',text:'#231c15',green:'#bf5530',green2:'#953f20',ink:'#ffffff'},
    {id:'rosado',name:'Rosado',light:true,bg:'#fbf1f4',panel:'#ffffff',panel2:'#f6e6eb',line:'#ebd3db',muted:'#74606a',text:'#24161c',green:'#c93d6e',green2:'#9c2a53',ink:'#ffffff'},
  ];
  const HYP_TH_KEYS=['bg','panel','panel2','line','muted','text','green','green2'];
  function hypHsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));const x=v=>Math.round(v*255).toString(16).padStart(2,'0');return '#'+x(f(0))+x(f(8))+x(f(4))}
  function hypHueTheme(h,base){
    h=((Number(h)||0)%360+360)%360;base=base||'dark';
    if(base==='light')return {id:'custom',name:'Personalizado',hue:h,base,light:true,bg:hypHsl(h,22,96),panel:'#ffffff',panel2:hypHsl(h,18,93),line:hypHsl(h,14,85),muted:hypHsl(h,8,38),text:hypHsl(h,20,9),green:hypHsl(h,68,40),green2:hypHsl(h,72,30),ink:'#ffffff'};
    const blk=base==='black';
    return {id:'custom',name:'Personalizado',hue:h,base,bg:blk?'#000000':hypHsl(h,24,6),panel:blk?hypHsl(h,6,6):hypHsl(h,12,10.5),panel2:blk?hypHsl(h,6,9):hypHsl(h,12,13.5),line:hypHsl(h,10,blk?17:21),muted:hypHsl(h,8,66),text:hypHsl(h,20,95),green:hypHsl(h,78,70),green2:hypHsl(h,85,84),ink:hypHsl(h,60,8)};
  }
  function hypThemeCur(){const t=data.settings?.hypTheme;if(!t)return HYP_THEMES[0];if(t.id==='custom')return hypHueTheme(t.hue,t.base);return HYP_THEMES.find(x=>x.id===t.id)||HYP_THEMES[0]}

  // --- traductor de colores fijos del CSS ---
  const hypRx=/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
  function hypParse(s){
    s=s.trim();let m;
    if(s[0]==='#'){let h=s.slice(1);if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');if(h.length!==6&&h.length!==8)return null;const n=i=>parseInt(h.slice(i,i+2),16);return {r:n(0),g:n(2),b:n(4),a:h.length===8?n(6)/255:1}}
    if((m=s.match(/^rgba?\(([^)]*)\)$/i))){const p=m[1].split(/[\s,\/]+/).filter(Boolean);if(p.length<3)return null;const v=x=>/%$/.test(x)?parseFloat(x)*2.55:parseFloat(x);const a=p[3]===undefined?1:(/%$/.test(p[3])?parseFloat(p[3])/100:parseFloat(p[3]));return {r:v(p[0]),g:v(p[1]),b:v(p[2]),a}}
    if((m=s.match(/^hsla?\(([^)]*)\)$/i))){const p=m[1].split(/[\s,\/]+/).filter(Boolean);if(p.length<3)return null;const c=hypParse(hypHsl(parseFloat(p[0]),parseFloat(p[1]),parseFloat(p[2])));if(!c)return null;c.a=p[3]===undefined?1:(/%$/.test(p[3])?parseFloat(p[3])/100:parseFloat(p[3]));return c}
    return null;
  }
  function hypHslOf(c){const r=c.r/255,g=c.g/255,b=c.b/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return {h,s,l,ch:d}}
  const hypMix=(a,b,k)=>({r:a.r+(b.r-a.r)*k,g:a.g+(b.g-a.g)*k,b:a.b+(b.b-a.b)*k,a:a.a});
  const hypOut=c=>{const f=v=>Math.max(0,Math.min(255,Math.round(v)));const a=Math.round((c.a??1)*1000)/1000;return a>=1?`rgb(${f(c.r)},${f(c.g)},${f(c.b)})`:`rgba(${f(c.r)},${f(c.g)},${f(c.b)},${a})`};
  function hypMapper(th){
    const P=k=>hypParse(th[k]),bg=P('bg'),deep=th.light?hypMix(bg,{r:0,g:0,b:0,a:1},.06):hypMix(bg,{r:0,g:0,b:0,a:1},.35);
    const ramp=[[0,deep],[7,bg],[11.5,P('panel')],[14.5,P('panel2')],[21,P('line')],[66,P('muted')],[95,P('text')],[100,P('text')]];
    const acc=P('green'),acc2=P('green2'),ink=P('ink'),panel=P('panel'),cache=new Map();
    const onRamp=L=>{for(let i=1;i<ramp.length;i++){const [l1,c1]=ramp[i-1],[l2,c2]=ramp[i];if(L<=l2){const k=l2===l1?0:(L-l1)/(l2-l1);return hypMix(c1,c2,Math.max(0,Math.min(1,k)))}}return ramp[ramp.length-1][1]};
    const one=(tok,prop)=>{
      const key=prop+'|'+tok;if(cache.has(key))return cache.get(key);
      const c=hypParse(tok);let out=tok;
      if(c){const {h,s,l,ch}=hypHslOf(c),a=c.a;let n=null;
        if(l<.12&&ch<.1&&(/shadow/.test(prop)||a<.75))n=null; // sombras y velos negros: igual
        else if(ch<.1){ // grises (neutros): escala del tema por luminosidad
          if(prop==='color'&&l<.2)n={...ink};
          else n=onRamp(l*100);
        }else if(h>=85&&h<=175){ // verdes de la app: acento del tema
          if(l>=.5){const k=Math.max(0,Math.min(1,(l-.7)/.15));n=hypMix(acc,acc2,k)}
          else n=hypMix(panel,acc,Math.max(.08,Math.min(.6,(l-.05)/.6)));
        }else if(th.light){ // naranja, rojo, azul… en temas claros: que se lean sobre blanco
          const fg=prop==='color'||/border|outline|stroke|fill/.test(prop);
          if(fg&&l>.5)n=hypParse(hypHsl(h,Math.min(85,s*100),36));
          else if(!fg&&l<.35)n=hypParse(hypHsl(h,Math.min(70,s*80),91));
        }
        if(n){n.a=a;out=hypOut(n)}
      }
      cache.set(key,out);return out;
    };
    return (val,prop)=>val.replace(hypRx,tok=>one(tok,prop));
  }
  const hypOrig=new WeakMap(),hypSeen=new Set();
  function hypRules(list,cb){for(const r of list||[]){if(r.style)cb(r);if(r.cssRules)hypRules(r.cssRules,cb)}}
  function hypCollect(rule){
    if(hypOrig.has(rule))return hypOrig.get(rule);
    const o=[],st=rule.style;
    for(let i=0;i<st.length;i++){const p=st[i];if(p.startsWith('--'))continue;const v=st.getPropertyValue(p);if(v&&(v.includes('#')||/rgba?\(|hsla?\(/.test(v)))o.push([p,v,st.getPropertyPriority(p)])}
    hypOrig.set(rule,o);return o;
  }
  function hypSheets(fn){for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules}catch{continue}if(sh.ownerNode?.id==='hypVars')continue;hypRules(rs,fn)}}
  function hypRemap(th){
    const map=th&&th.id!=='esmeralda'?hypMapper(th):null;
    if(!map&&!hypSeen.size)return; // diseño original y nunca se cambió: nada que tocar
    hypSheets(rule=>{const o=hypCollect(rule);if(!o.length)return;hypSeen.add(rule);for(const [p,v,pr] of o){const nv=map?map(v,p):v;if(rule.style.getPropertyValue(p)!==nv)rule.style.setProperty(p,nv,pr)}});
  }
  function hypThemeApply(){
    const raw=data.settings?.hypTheme,t=hypThemeCur(),def=!raw||t.id==='esmeralda',r=document.documentElement.style;
    document.documentElement.classList.toggle('hyp-themed',!def);
    document.documentElement.classList.toggle('hyp-light',!!t.light);
    if(def){for(const k of HYP_TH_KEYS)r.removeProperty('--'+k);for(const k of ['--hyp-chart','--hyp-chart2','--orange','--red','--gold','--ink'])r.removeProperty(k);r.colorScheme=''}
    else{for(const k of HYP_TH_KEYS)r.setProperty('--'+k,t[k]);r.setProperty('--hyp-chart',t.green);r.setProperty('--hyp-chart2',t.green2);r.setProperty('--ink',t.ink);
      if(t.light){r.setProperty('--orange','#b45309');r.setProperty('--red','#c0392b');r.setProperty('--gold','#9a6b00')}else{r.removeProperty('--orange');r.removeProperty('--red');r.removeProperty('--gold')}
      r.colorScheme=t.light?'light':'dark'}
    try{hypRemap(def?null:t)}catch(e){console.error(e)}
    try{document.querySelector('meta[name="theme-color"]')?.setAttribute('content',def?'#101512':t.bg)}catch{}
  }
  // estilos que se agregan después (otros bloques) también se traducen
  try{new MutationObserver(ms=>{if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeName==='STYLE'||n.nodeName==='LINK'))){clearTimeout(hypThemeApply._t);hypThemeApply._t=setTimeout(()=>{try{const t=hypThemeCur();if(t.id!=='esmeralda')hypRemap(t)}catch{}},60)}}).observe(document.head,{childList:true})}catch{}
  function hypSetTheme(t){data.settings.hypTheme=t;hypThemeApply();persist(true);try{const box=$('#hypThemeSet');if(box){const open=box.open;box.outerHTML=hypThemeHtml();$('#hypThemeSet').open=open}}catch{}}
  function hypC(v,d){try{return getComputedStyle(document.documentElement).getPropertyValue(v==='--green'?'--hyp-chart':'--hyp-chart2').trim()||d}catch{return d}}
  function hypSwatch(t,cur){const on=cur.id===t.id;return `<button type="button" class="hyp-sw ${on?'on':''}" data-hyp-theme="${t.id}" style="background:${t.bg};border-color:${on?t.green:t.line};color:${t.text}"><span class="hyp-sw-card" style="background:${t.panel};border-color:${t.line}"><b style="color:${t.text}">Aa</b><i style="background:${t.green}"></i><em style="background:${t.muted}"></em></span><span class="hyp-sw-n">${esc(t.name)}${on?' ✓':''}</span></button>`}
  function hypThemeHtml(){
    const cur=hypThemeCur(),raw=data.settings?.hypTheme||{},base=raw.id==='custom'?(raw.base||'dark'):'dark',hue=raw.id==='custom'?raw.hue:150;
    const dark=HYP_THEMES.filter(t=>!t.light),light=HYP_THEMES.filter(t=>t.light);
    return `<details class="settings-group" id="hypThemeSet"><summary>🎨 Colores de la app</summary><div class="settings-section"><p class="small" style="margin:0 0 10px">Cambia toda la app: fondo, tarjetas, texto, bordes y botones. «Original» es el diseño de siempre.</p><div class="hyp-th-h">Oscuros</div><div class="hyp-sws">${dark.map(t=>hypSwatch(t,cur)).join('')}</div><div class="hyp-th-h">Claros</div><div class="hyp-sws">${light.map(t=>hypSwatch(t,cur)).join('')}</div><div class="hyp-th-h">Personalizado ${cur.id==='custom'?'· activo':''}</div><div class="hyp-base">${[['dark','Oscuro'],['black','Negro'],['light','Claro']].map(([v,n])=>`<button type="button" class="${cur.id==='custom'&&base===v?'on':''}" data-hyp-base="${v}">${n}</button>`).join('')}</div><input type="range" min="0" max="359" value="${hue}" data-hyp-hue class="hyp-hue" aria-label="Tono"><p class="small" style="margin:6px 0 0">Elige base y mueve la barra: la app ajusta sola brillo y contraste para que todo se lea bien.</p></div></details>`;
  }
  const hypCustomBase=()=>{const t=data.settings?.hypTheme;return t?.id==='custom'?(t.base||'dark'):'dark'};
  let hypHueT=0;
  document.addEventListener('input',e=>{const h=e.target.closest?.('[data-hyp-hue]');if(!h)return;data.settings.hypTheme={id:'custom',hue:Number(h.value),base:hypCustomBase()};clearTimeout(hypHueT);hypHueT=setTimeout(hypThemeApply,40)});
  document.addEventListener('change',e=>{const h=e.target.closest?.('[data-hyp-hue]');if(!h)return;hypSetTheme({id:'custom',hue:Number(h.value),base:hypCustomBase()})});
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-hyp-base]');if(!b)return;const t=data.settings?.hypTheme;hypSetTheme({id:'custom',hue:t?.id==='custom'?t.hue:150,base:b.dataset.hypBase})});
  const _rsHyp=renderSettings;
  renderSettings=function(){const r=_rsHyp.apply(this,arguments);try{const box=$('#settingsContent');if(box&&!$('#hypThemeSet')){const nov=$('#v88NovSet');if(nov)nov.insertAdjacentHTML('afterend',hypThemeHtml());else box.insertAdjacentHTML('afterbegin',hypThemeHtml())}
    if(box&&HYP_ON&&!$('#hypSetPlan'))$('#hypThemeSet')?.insertAdjacentHTML('afterend',`<details class="settings-group" id="hypSetPlan"><summary>📈 Plan de hipertrofia</summary><div class="settings-section"><p class="small" style="margin:0 0 8px">${hypOn()?'Activo. Puedes volver a tus rutinas anteriores cuando quieras.':'No aplicado.'}</p><button class="secondary" data-hyp-open>Ver plan y estudios</button></div></details>`)}catch(e){console.error(e)}return r};

  document.head.insertAdjacentHTML('beforeend',`<style id="hypCss">
    html.hyp-themed body{background:radial-gradient(120% 60% at 50% -12%,color-mix(in srgb,var(--green) 12%,var(--bg)) 0%,transparent 55%),var(--bg)}
    html.hyp-themed .primary{background:linear-gradient(180deg,color-mix(in srgb,var(--green) 88%,#fff),color-mix(in srgb,var(--green) 82%,#000));box-shadow:0 8px 22px -10px color-mix(in srgb,var(--green) 66%,transparent),inset 0 1px 0 #ffffff55}
    html.hyp-themed .primary:active{box-shadow:0 4px 12px -6px color-mix(in srgb,var(--green) 66%,transparent)}
    html.hyp-themed .mark{background:conic-gradient(from 210deg,var(--green),color-mix(in srgb,var(--green) 68%,#000),var(--green));box-shadow:inset 0 0 0 4px #0003,0 0 0 2px color-mix(in srgb,var(--green) 20%,transparent)}
    html.hyp-themed .navbtn:before{background:color-mix(in srgb,var(--green) 12%,transparent)}
    html.hyp-themed ::selection{background:color-mix(in srgb,var(--green) 33%,transparent)}
    html.hyp-themed .completion-bar>span,html.hyp-themed .goal-bar span.full,html.hyp-themed .mbar span.ok{background:linear-gradient(90deg,color-mix(in srgb,var(--green) 70%,#000),var(--green))}
    html.hyp-themed .toast{background:color-mix(in srgb,var(--green2) 28%,#fff);color:#14161a}
    html.hyp-themed .timerfloat{background:color-mix(in srgb,var(--green2) 45%,#fff);border-color:var(--green2)}
    html.hyp-themed .today-item.ok{border-color:color-mix(in srgb,var(--green) 33%,transparent);background:color-mix(in srgb,var(--green) 8%,transparent)}
    html.hyp-themed .chip.up{color:var(--green);border-color:color-mix(in srgb,var(--green) 33%,transparent)}
    html.hyp-themed .pill.green{background-color:color-mix(in srgb,var(--green) 7%,transparent)}
    html.hyp-themed input:focus,html.hyp-themed select:focus,html.hyp-themed textarea:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--green) 15%,transparent)}
    html.hyp-themed .modal-panel{background:color-mix(in srgb,var(--panel) 88%,#000)}
    .hyp-card{border-color:color-mix(in srgb,var(--green) 35%,var(--line))}
    .hyp-badge{display:inline-block;font-size:11px;font-weight:800;color:var(--green2);background:color-mix(in srgb,var(--green) 12%,transparent);border-radius:99px;padding:2px 9px;margin-bottom:6px}
    .hyp-line{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13px;color:var(--muted);padding:8px 2px}
    .hyp-hint{margin-top:8px;padding:8px 10px;border-radius:12px;font-size:13px;background:color-mix(in srgb,var(--green) 9%,var(--panel2));border:1px solid color-mix(in srgb,var(--green) 28%,var(--line))}
    .hya-btn{padding:6px 11px;border-radius:99px;font-size:12.5px;font-weight:700;background:color-mix(in srgb,var(--green) 13%,var(--panel2));color:var(--green2);border:1px solid color-mix(in srgb,var(--green) 35%,var(--line))}
    .hya-btn.mini{padding:3px 9px;font-size:11.5px;white-space:nowrap}
    .hyp-cite{display:inline-block;padding:2px 8px;margin:4px 5px 0 0;border-radius:99px;border:1px solid var(--line);background:var(--panel2);color:var(--green2);font-size:11.5px}
    .hyp-h{margin:16px 0 8px;font-size:15px}
    .hyp-pr{margin:0;padding-left:18px}.hyp-pr li{margin:0 0 10px;font-size:13.5px}
    .hyp-studies li{list-style:none;margin-left:-18px}
    .hyp-why{margin:4px 0 0;color:var(--muted)}
    .hyp-day{border:1px solid var(--line);border-radius:14px;padding:9px 11px;margin:0 0 8px;background:var(--panel2)}
    .hyp-day summary{cursor:pointer}
    .hyp-ex{padding:9px 0;border-top:1px solid var(--line)}.hyp-ex:first-of-type{margin-top:8px}
    .hyp-status{padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);font-size:13.5px}.hyp-status.on{border-color:color-mix(in srgb,var(--green) 40%,var(--line))}
    .hya-stage{border:1px solid var(--line);border-radius:18px;background:radial-gradient(260px 160px at 50% 30%,color-mix(in srgb,var(--green) 8%,var(--panel2)),var(--panel2));padding:6px 6px 2px;max-width:420px;margin:0 auto}
    .hya-cap{text-align:center;padding:2px 0 6px;color:var(--green2);font-weight:700}
    .hya-cues{margin:0;padding-left:20px}.hya-cues li{margin:0 0 6px;font-size:13.5px}
    .an-svg{width:100%;height:auto;display:block}
    .an-b{stroke:var(--text);stroke-width:8;stroke-linecap:round}
    .an-hl{stroke:var(--green);stroke-width:9;stroke-linecap:round}
    .an-far{opacity:.4}.an-head{fill:var(--text)}
    .an-glow{fill:var(--green);opacity:.35}.an-glowl{stroke:var(--green);stroke-width:9;stroke-linecap:round;opacity:.3}
    .an-gr{stroke:var(--line);stroke-width:3;stroke-linecap:round}
    .an-bench{stroke:var(--muted);stroke-width:7;stroke-linecap:round;opacity:.75}
    .an-rail{stroke:var(--line);stroke-width:4;stroke-linecap:round}
    .an-plat{stroke:var(--muted);stroke-width:6;stroke-linecap:round}
    .an-pb{stroke:var(--muted);stroke-width:4;stroke-linecap:round}.an-pb2{fill:var(--muted)}
    .an-pw{fill:var(--panel2);stroke:var(--muted);stroke-width:2.5}
    .an-cb{stroke:var(--muted);stroke-width:1.6;stroke-dasharray:3 3}
    .an-pad{fill:var(--panel2);stroke:var(--muted);stroke-width:2.5}.an-pad2{fill:var(--panel2);stroke:var(--line);stroke-width:2}
    .hyp-sws{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .hyp-sw{border:2px solid;border-radius:14px;padding:6px 5px 6px;display:flex;flex-direction:column;align-items:stretch;gap:5px;font-size:11px;font-weight:700;line-height:1.15}
    .hyp-sw-card{display:flex;align-items:center;gap:5px;border:1px solid;border-radius:9px;padding:5px 6px}
    .hyp-sw-card b{font-size:13px}.hyp-sw-card i{flex:1;height:9px;border-radius:99px}.hyp-sw-card em{width:9px;height:9px;border-radius:50%;opacity:.7}
    .hyp-sw-n{text-align:center;min-height:2.3em;display:flex;align-items:center;justify-content:center}
    .hyp-sw.on{box-shadow:0 0 0 2px color-mix(in srgb,var(--green) 45%,transparent)}
    .hyp-th-h{font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:12px 0 7px}
    .hyp-base{display:flex;gap:6px;margin-bottom:10px}.hyp-base button{flex:1;padding:8px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font-weight:700}
    .hyp-base button.on{background:var(--green);color:var(--ink,#0b120d);border-color:var(--green)}
    .hyp-hue{width:100%;accent-color:var(--green);height:28px;background:linear-gradient(90deg,hsl(0 78% 72%),hsl(60 78% 72%),hsl(120 78% 72%),hsl(180 78% 72%),hsl(240 78% 72%),hsl(300 78% 72%),hsl(359 78% 72%));border-radius:99px;-webkit-appearance:none;appearance:none;padding:0;border:0}
    .hyp-hue::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:3px solid #0008}
  </style>`);
  try{hypThemeApply()}catch(e){console.error(e)}
  try{hypSyncBuiltins();_rebuildHyp()}catch(e){console.error(e)}

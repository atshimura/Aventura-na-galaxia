/** Desenhos de biomas, paisagens e obstáculos. Não requer rede. */
import {getPlanet} from './world.mjs';
const PI=Math.PI,W=960,H=540;
function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,PI*2);c.fill();}
function line(c,x1,y1,x2,y2,color,width=2){c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function poly(c,p,color){c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
const noise=n=>{let x=Math.sin(n*159.73+23.14)*43758.55;return x-Math.floor(x);};
function hill(c,y,amp,shift,color,seed){c.beginPath();c.moveTo(0,H);
 for(let x=-20;x<W+40;x+=16)c.lineTo(x,y+amp*(.6*Math.sin(x*.015+shift+seed)+.4*Math.sin(x*.008+seed*2)));
 c.lineTo(W,H);c.closePath();c.fillStyle=color;c.fill();}
/** Vida e vegetação parallax específicas de cada bioma, com animação leve. */
function drawBiomeLife(c,p,shift,time){
 const biome=p.biome,phase=time*.001,flora=['forest','coral','ocean','desert','ice','lava','aurora','crystals','rings','storm','portals','ruins','city','asteroids'].includes(biome);
 const treeLike=['forest','ice','aurora','ruins','rings'].includes(biome);
 if(!flora)return;
 for(let i=0;i<12;i++){
   const x=((i*155+p.stage*57-shift*.83)%(W+220)+W+220)%(W+220)-90;
   const y=422+Math.sin(i*3.1+p.stage)*23;
   const r=22+noise(i*5+p.stage)*20;
   c.save();c.translate(x,y);
   if(treeLike){
     // Troncos tortos, raízes e três camadas de copa.
     const purple=biome==='aurora'||biome==='rings';
     const icy=biome==='ice';
     line(c,0,45,-r*.15,-r*1.48,purple?'#9e7ad0':icy?'#d3e8f7':'#4a3a53',9);
     line(c,0,10,-r*.58,-r*.85,purple?'#9e7ad0':'#53665f',4);
     line(c,-2,-8,r*.44,-r*.94,purple?'#9e7ad0':'#53665f',4);
     for(const [dx,dy,m] of [[-r*.55,-r*1.13,.70],[r*.45,-r*1.22,.78],[-r*.1,-r*1.7,1]]){
       const halo=icy?'#e4fcff':p.highlight;
       circle(c,dx,dy,r*m*.68,halo+'ae');
       circle(c,dx-5,dy-6,r*m*.40,icy?'#ffffffaa':p.ground+'ee');
     }
     if(biome==='forest')for(let k=0;k<4;k++)circle(c,-r+(k*17),-r*.5,3,'#fff7b4');
   }else if(['ocean','coral'].includes(biome)){
     // Algas altas com ondulação e flores de coral.
     for(let t=0;t<4;t++){
       const x=t*11-17,bend=Math.sin(phase*1.3+i+t)*8;
       c.strokeStyle=t%2?'#74ffb9':'#348aa3';c.lineWidth=4;c.lineCap='round';c.beginPath();
       c.moveTo(x,34);c.quadraticCurveTo(x+bend,-10,x+bend*1.4,-r*1.6);c.stroke();
       circle(c,x+bend*1.4,-r*1.6,4,p.highlight);
     }
     if(biome==='coral'){
       for(let t=0;t<5;t++){line(c,0,21,(t-2)*r*.44,-r*(.5+noise(t+i)*.5),'#ff96bc',6);circle(c,(t-2)*r*.44,-r*(.5+noise(t+i)*.5),5,'#ffe3b5');}
     }
   }else if(biome==='desert'){
     // Árvores-cacto e tufos dourados diferentes das florestas.
     line(c,0,30,0,-r*1.35,'#356c45',12);circle(c,0,-r*1.35,6,'#b4f2a3');
     line(c,0,-6,-16,-17,'#356c45',8);line(c,-16,-17,-16,-r*1.06,'#356c45',8);
     line(c,0,-21,17,-27,'#356c45',8);line(c,17,-27,17,-r*1.19,'#356c45',8);
   }else if(biome==='lava'){
     // Basalto vulcânico, fungos de fogo e gases quentes.
     poly(c,[[-18,33],[-10,-r*.9],[2,-r*1.9],[15,-r*.3],[21,33]],'#272139');
     poly(c,[[-7,26],[1,-r*1.3],[6,-r*.2]],'#ff7544');circle(c,4,-r*.92,8,'#ffcf79a8');
   }else if(biome==='city'||biome==='ruins'){
     const h=r*2.1;c.fillStyle=biome==='city'?'#5d8aab':'#a7a0b7';
     c.fillRect(-r*.45,35-h,r*.9,h);c.fillStyle=p.highlight;
     for(let row=0;row<4;row++)for(let col=0;col<2;col++)c.fillRect(-r*.3+col*r*.34,8-h+row*15,5,8);
     line(c,0,35-h,0,25-h,'#dcefff',2);circle(c,0,20-h,4,p.highlight);
   }else if(biome==='storm'){
     poly(c,[[-r,38],[0,-r*1.65],[r,38]],'#7a7ba7');
     line(c,-3,-r*.8,10,-r*.2,'#e0feff',4);
   }else{
     poly(c,[[-r,34],[0,-r*1.65],[r,34]],p.highlight+'d4');
     poly(c,[[0,-r*1.65],[r,34],[0,20]],'#fff6ec62');
   }
   c.restore();
 }
 // Animais e criaturas amigáveis. Espécies variam por grupo de bioma.
 for(let i=0;i<7;i++){
   const x=((i*207+p.stage*61-shift*(.55+noise(i)*.22))%(W+190)+W+190)%(W+190)-90;
   const yy=410+(i%3)*24, bob=Math.sin(phase*2+i*2+p.stage)*3;
   c.save();c.translate(x,yy+bob);c.scale(.8+noise(i+p.stage)*.6,.8+noise(i+p.stage)*.6);
   if(['ocean','coral'].includes(biome)){
     // Peixinhos alienígenas com cauda e olhos expressivos.
     poly(c,[[-28,0],[-44,-13],[-43,14]],p.highlight);
     c.fillStyle=i%2?'#ffb6d9':'#7ff8e6';c.beginPath();c.ellipse(0,0,27,15,0,0,PI*2);c.fill();
     poly(c,[[-4,-8],[8,-26],[16,-8]],'#e5ecff95');
     circle(c,16,-4,4,'#1e3357');circle(c,17,-5,1.5,'#fff');
     for(let b=0;b<3;b++)circle(c,30+b*10,-25-b*7,2+b,'#defffc99');
   }else if(['forest','desert','ice','lava','asteroids'].includes(biome)){
     // Quadrúpedes saltitantes em diferentes cores; lagartos da lava e raposas do gelo.
     const body=biome==='ice'?'#d3f4ff':biome==='lava'?'#ec7360':biome==='desert'?'#d7b878':biome==='forest'?'#a7ec9a':'#bb9ac9';
     c.fillStyle=body;c.beginPath();c.ellipse(0,0,26,15,0,0,PI*2);c.fill();
     for(const leg of [-16,13])line(c,leg,8,leg-4,20,body,6);
     circle(c,20,-12,15,body);
     for(const a of [-1,1])poly(c,[[20+a*8,-21],[20+a*12,-34],[20+a*3,-25]],body);
     circle(c,25,-15,3,'#21365b');circle(c,26,-16,1.1,'#fff');
     c.strokeStyle=body;c.lineWidth=6;c.beginPath();c.moveTo(-20,-5);c.quadraticCurveTo(-40,-24-bob,-40,-3);c.stroke();
   }else if(['city','ruins'].includes(biome)){
     // Pequenos robôs moradores do planeta.
     c.fillStyle='#bcd6e8';c.beginPath();c.roundRect(-20,-17,40,30,7);c.fill();
     circle(c,-9,-5,5,'#59ffdf');circle(c,10,-5,5,'#59ffdf');
     line(c,0,-17,0,-28,'#e3e9f9',3);circle(c,0,-30,4,'#fff2c0');
     line(c,-10,13,-11,23,'#7492b5',5);line(c,10,13,11,23,'#7492b5',5);
   }else{
     // Criaturinhas aéreas com quatro tentáculos e bioluminescência.
     const rise=14*Math.sin(phase*1.2+i);
     c.translate(0,-rise);
     circle(c,0,0,20,i%2?p.highlight:p.ground);
     for(const k of [-14,-5,5,14])line(c,k,8,k+4*Math.sin(phase+i+k),26,p.highlight,3);
     circle(c,-7,-4,3,'#21345c');circle(c,7,-4,3,'#21345c');circle(c,0,3,2,'#fff');
     circle(c,-13,-12,4,'#ffffff79');
   }
   c.restore();
 }
}

export function drawPlanetEnvironment(c,game,time){
 const p=game.planet,shift=game.planetElapsed*55;
 const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,p.sky);sky.addColorStop(.5,p.ground);sky.addColorStop(1,p.sky);
 c.fillStyle=sky;c.fillRect(0,0,W,H);
 const g=c.createRadialGradient(760,145,2,760,145,190);g.addColorStop(0,p.highlight);g.addColorStop(1,p.highlight+'00');
 c.fillStyle=g;c.fillRect(540,-35,450,390);circle(c,760,145,62,p.highlight+'88');
 hill(c,328,92,shift*.002,p.sky+'db',p.stage*.34);
 hill(c,399,64,shift*.005,p.ground+'bd',p.stage*.45);
 // Silhuetas geométricas no solo dependem do tipo de planeta.
 for(let i=0;i<17;i++){
  const x=((i*118+34-shift*.6)%(W+180)+W+180)%(W+180)-90,y=413+Math.sin(i*7.6)*27;
  const r=13+noise(i*4+p.stage)*26;
  c.save();c.translate(x,y);
  if(['forest','coral'].includes(p.biome)){
    line(c,0,42,0,-r*.7,p.biome==='coral'?'#e67d96':'#1f805d',6);
    for(const dir of [-1,0,1]){line(c,0,0,dir*r*.7,-r*1.1,p.highlight,4);circle(c,dir*r*.7,-r*1.1,r*.19,p.highlight+'b6');}
  }else if(['ice','crystals'].includes(p.biome)){
    poly(c,[[-r*.7,28],[0,-r*1.7],[r*.7,-r*.4],[r,28]],p.highlight+'dd');
    poly(c,[[0,-r*1.7],[r*.7,-r*.4],[r,28],[0,15]],'#ffffff83');
  }else if(['city','ruins'].includes(p.biome)){
    c.fillStyle=p.highlight+'9c';c.fillRect(-r*.5,-r*1.8,r,r*2.5);
    for(let k=0;k<4;k++)circle(c,0,-r*1.4+k*r*.45,2,'#e9fbff');
  }else if(['portals','rings'].includes(p.biome)){
    c.strokeStyle=p.highlight;c.lineWidth=6;c.beginPath();c.ellipse(0,-r*.5,r*.65,r*1.5,.1,0,PI*2);c.stroke();
  }else if(p.biome==='storm'){
    line(c,-5,-r*.8,6,-r*.1,'#e3faff',4);line(c,6,-r*.1,-1,r,'#e3faff',4);
  }else{
    poly(c,[[-r,30],[-r*.4,-r],[r*.2,-r*1.3],[r,30]],p.highlight+'ba');
  }c.restore();
 }
 if(p.biome==='ocean')for(let i=0;i<4;i++){
  c.strokeStyle=p.highlight+'9b';c.lineWidth=3;c.beginPath();
  for(let x=0;x<W;x+=16){const y=452+i*18+Math.sin(x*.016+i+time*.001)*9;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
 }
 drawBiomeLife(c,p,shift,time);
 hill(c,515,24,shift*.008,p.sky+'e6',p.stage);
 c.textAlign='left';c.font='bold 17px system-ui';c.fillStyle='#faffff';c.shadowColor='#071330';c.shadowBlur=9;
 c.fillText(p.icon+' '+(game.save.planetNames[game.stage.number]||p.name)+' — '+p.landmark,28,100);c.shadowBlur=0;
}
export function drawSpaceEnvironment(c,game,time){
 const p=game.planet,shift=game.distance*.23,feature=p.highlight,kind=p.biome;
 c.save();
 if(['asteroids','desert','rings'].includes(kind)){
  for(let i=0;i<18;i++){const x=((i*133+200-shift*.7)%(W+230)+W+230)%(W+230)-120,y=95+noise(i*19+p.stage)*350,r=5+noise(i*21)*12;
   poly(c,[[x-r,y],[x-4,y-r],[x+r,y-4],[x+r*.6,y+r],[x-r*.3,y+r]],feature+'69');}
 }
 if(['forest','coral','crystals'].includes(kind)){
  for(let i=0;i<12;i++){const x=((i*160+70-shift*.5)%(W+230)+W+230)%(W+230)-110,y=310+35*Math.sin(i*2);
   line(c,x,y+200,x+Math.sin(i)*22,y-25,feature+'6e',8);circle(c,x+Math.sin(i)*22,y-25,21,feature+'61');}
 }
 if(['portals','ruins','city'].includes(kind)){
  for(let i=0;i<6;i++){const x=((i*210+100-shift*.45)%(W+230)+W+230)%(W+230)-100;
   c.strokeStyle=feature+'6b';c.lineWidth=7;c.beginPath();c.ellipse(x,285,55,125,-.2,0,PI*2);c.stroke();
   if(kind==='city'){c.fillStyle=p.sky+'99';c.fillRect(x-15,300,30,230);}}
 }
 if(['storm','lava'].includes(kind)){
  for(let i=0;i<15;i++){const x=((i*91+time*.024)%(W+100)+W+100)%(W+100)-60,y=70+noise(i*9)*400;
   line(c,x,y,x+15,y-38,feature+'8a',2+noise(i)*2);}
 }
 if(['ice','ocean','aurora'].includes(kind)){
  for(let i=0;i<5;i++){c.strokeStyle=feature+'50';c.lineWidth=4;c.beginPath();
   for(let x=0;x<W;x+=24){const y=70+i*85+20*Math.sin(x*.009+time*.0007+i);x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
 }
 if(kind==='rings'){c.strokeStyle=feature+'a5';c.lineWidth=17;c.beginPath();c.ellipse(510,270,550,165,-.24,0,PI*2);c.stroke();}
 c.restore();
}
export function drawPlanetApproach(c,game,time){
 if(!game.canExplorePlanet())return;const p=getPlanet(game.stage.number),q=(game.elapsed/game.duration-.27)/.35;
 const x=1060-1250*q,y=318+Math.sin(time/900)*8,r=92+23*Math.sin(q*PI);
 c.save();c.shadowColor=p.highlight;c.shadowBlur=20;
 const g=c.createRadialGradient(x-r*.35,y-r*.4,3,x,y,r);g.addColorStop(0,p.highlight);g.addColorStop(.7,p.sky);g.addColorStop(1,'#0c1332');
 c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,PI*2);c.fill();c.shadowBlur=0;
 c.strokeStyle=p.highlight;c.lineWidth=4;c.beginPath();c.ellipse(x,y,r*1.35,r*.36,-.2,0,PI*2);c.stroke();
 c.strokeStyle='#ffffffaa';c.lineWidth=2;c.setLineDash([6,8]);c.beginPath();c.arc(x,y,r+12,0,PI*2);c.stroke();c.setLineDash([]);
 c.font='bold 18px system-ui';c.fillStyle='#ffffff';c.textAlign='center';c.fillText('🪐 '+(game.save.planetNames[game.stage.number]||p.name),x,y+r+34);c.restore();
}
export function drawGem(c,item,time){
 c.save();c.translate(item.x,item.y);c.rotate(Math.sin(time*.002)*.2);const r=item.r||18;
 c.shadowColor='#b4fff2';c.shadowBlur=15;
 poly(c,[[0,-r*1.3],[r*.8,-r*.2],[r*.3,r],[0,r*1.2],[-r*.7,r],[-r*.8,-r*.2]],'#6ef5e9');
 poly(c,[[0,-r*1.3],[r*.8,-r*.2],[0,r*1.2]],'#e3fff6a8');
 c.restore();
}
export function drawHazard(c,item,time){
 c.save();c.translate(item.x,item.y);const r=item.r||28;const kind=item.kind;
 c.rotate(Math.sin(time*.002+(item.id||0)*7)*.13);c.shadowColor='#b6a8ff';c.shadowBlur=10;
 if(kind==='debris'){poly(c,[[-r,-r*.4],[-r*.4,-r],[r,-r*.5],[r*.5,r],[-r*.8,r*.7]],'#8e9bb7');c.fillStyle='#193351';c.fillRect(-r*.5,-r*.4,r,r*.7);}
 if(kind==='comet'){for(let i=0;i<5;i++)line(c,-r*(1.1+i*.7),i*8-15,0,0,i%2?'#ffa554':'#f47367',7-i);circle(c,0,0,r,'#ffb17a');circle(c,-5,-5,r*.5,'#ffebaf');}
 if(kind==='mine'){for(let i=0;i<10;i++){const a=i*PI/5;poly(c,[[Math.cos(a-.15)*r*.5,Math.sin(a-.15)*r*.5],[Math.cos(a)*r*1.25,Math.sin(a)*r*1.25],[Math.cos(a+.15)*r*.5,Math.sin(a+.15)*r*.5]],'#ff8586');}circle(c,0,0,r*.77,'#596680');circle(c,0,0,r*.3,'#ff4e7b');}
 if(kind==='plasma'){circle(c,0,0,r,'#444ca3');c.strokeStyle='#9dfaff';c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.arc(0,0,r*(.34+i*.2),i,i+3.7);c.stroke();}circle(c,0,0,7,'#ffffff');}
 if(kind==='drone'){poly(c,[[-r,0],[-r*.4,-r*.6],[r*.5,-r*.6],[r,0],[r*.5,r*.6],[-r*.4,r*.6]],'#c2d2ef');circle(c,0,0,r*.35,'#2e4570');circle(c,0,0,r*.19,'#79eafc');for(const x of [-r,r]){c.strokeStyle='#8defff';c.lineWidth=3;c.beginPath();c.ellipse(x,0,r*.3,r*.86,0,0,PI*2);c.stroke();}}
 if(kind==='crystal'){poly(c,[[0,-r*1.3],[r*.8,-r*.4],[r*.6,r],[0,r*1.3],[-r*.7,r],[-r*.8,-r*.4]],'#ee93f5');line(c,0,-r*1.2,0,r,'#ffffff',3);}
 if(kind==='vortex'){c.strokeStyle='#c0a1fa';c.lineWidth=7;for(let i=0;i<4;i++){c.beginPath();c.arc(0,0,r*(.32+i*.24),time*.002+i*.7,time*.002+i*.7+3.8);c.stroke();}circle(c,0,0,7,'#ffffff');}
 if(kind==='planet-hazard'){const icy=String(item.style||'').includes('ice')||String(item.style||'').includes('crystal');
  poly(c,[[-r*.8,r],[0,-r*1.3],[r*.65,-r*.14],[r,r]],icy?'#d8ffff':item.style==='lava-spire'?'#ff815b':'#b7a2cb');
  poly(c,[[0,-r*1.3],[r*.65,-r*.14],[r,r],[0,r]],icy?'#91ceee':'#66589a');}
 c.restore();
}

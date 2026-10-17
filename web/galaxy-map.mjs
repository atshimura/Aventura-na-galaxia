/** Mapa da Galáxia: lógica pura de rota, conquistas e ilustrações offline. */
import {PLANETS} from './world.mjs';

export const GALAXY_WIDTH=4740;
export const GALAXY_HEIGHT=540;
const COORDS=Object.freeze([
 [205,334],[434,213],[665,315],[914,155],[1139,276],
 [1356,408],[1601,254],[1818,136],[2053,312],[2287,403],
 [2508,249],[2741,151],[2962,333],[3198,408],[3417,264],
 [3646,133],[3868,251],[4094,391],[4338,314],[4570,180]
]);
export const GALAXY_POINTS=Object.freeze(COORDS.map(([x,y],i)=>
 Object.freeze({x,y,stage:i+1,planet:PLANETS[i]})));

export function getMapStatus(save,stage){
 const n=Math.max(1,Math.min(20,Math.floor(Number(stage)||1)));
 const completed=Math.max(0,Math.min(20,Math.floor(Number(save?.completed)||0)));
 return {
  stage:n,
  unlocked:n<=completed+1,
  completed:n<=completed,
  explored:save?.exploredPlanets?.[n]===true,
  current:n===Math.min(20,completed+1),
  best:Number(save?.bestByStage?.[n])||0
 };
}
export function mapStartScroll(save,viewportWidth=960){
 const current=Math.min(20,Math.max(1,(Number(save?.completed)||0)+1));
 const point=GALAXY_POINTS[current-1];
 return Math.max(0,Math.min(GALAXY_WIDTH-Math.max(0,viewportWidth),point.x-viewportWidth/2));
}
const TAU=Math.PI*2;
function circle(c,x,y,r,fill){
 c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=fill;c.fill();
}
function oval(c,x,y,rx,ry,color,rot=0){
 c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fillStyle=color;c.fill();
}
function line(c,pts,color,w=3){
 c.beginPath();c.moveTo(...pts[0]);
 for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);
 c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();
}
function polygon(c,pts,color){
 c.beginPath();c.moveTo(...pts[0]);
 for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);
 c.closePath();c.fillStyle=color;c.fill();
}
function gradient(c,x,y,r,c1,c2){
 const g=c.createRadialGradient(x-r*.4,y-r*.5,r*.08,x,y,r*1.15);
 g.addColorStop(0,c1);g.addColorStop(.75,c2);g.addColorStop(1,'#11152e');
 return g;
}
function routeSegment(c,a,b){
 const d=(b.x-a.x)*.53;
 c.moveTo(a.x,a.y);
 c.bezierCurveTo(a.x+d,a.y,b.x-d,b.y,b.x,b.y);
}
export function drawGalaxyRoute(c,save){
 const width=GALAXY_WIDTH,height=GALAXY_HEIGHT;
 const sky=c.createLinearGradient(0,0,0,height);
 sky.addColorStop(0,'#050a1e');sky.addColorStop(.6,'#101537');sky.addColorStop(1,'#030817');
 c.fillStyle=sky;c.fillRect(0,0,width,height);
 // Nebulosas estáticas, com cores que acompanham a viagem.
 const clouds=[
  [190,130,385,'#7147be30'],[805,406,510,'#2474a94c'],
  [1490,155,380,'#b84d8440'],[2140,275,490,'#524e9b57'],
  [2940,140,500,'#227e8a48'],[3660,372,570,'#9b3c8145'],
  [4480,170,440,'#927d343d']
 ];
 for(const [x,y,r,color] of clouds){
  const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#090d2200');
  c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
 }
 // Fundo de estrelas reproduzível, sem consumo de gerador a cada quadro.
 let seed=49217;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<620;i++){
  const x=rand()*width,y=rand()*height,r=.4+rand()*1.65;
  c.globalAlpha=.22+rand()*.65;
  circle(c,x,y,r,rand()>.82?'#fae2f7':'#c5e9ff');
 }
 c.globalAlpha=1;
 // Grandes silhuetas e rastros espaciais sem alinhamento geométrico rígido.
 for(let i=0;i<8;i++){
  const x=360+i*574,y=87+(i*71)%385;
  c.save();c.translate(x,y);c.rotate((i-3)*.19);
  c.strokeStyle='#93b9f923';c.lineWidth=2;
  c.beginPath();c.ellipse(0,0,104+i%3*25,22,0,0,TAU);c.stroke();
  c.restore();
 }
 const unlocked=Math.min(20,Math.max(1,(Number(save?.completed)||0)+1));
 // Futuro tracejado e nebuloso: os 20 destinos continuam no mesmo percurso.
 for(let i=0;i<GALAXY_POINTS.length-1;i++){
  const a=GALAXY_POINTS[i],b=GALAXY_POINTS[i+1],reached=i+1<unlocked;
  c.save();c.setLineDash(reached?[]:[10,13]);
  c.beginPath();routeSegment(c,a,b);c.lineWidth=reached?17:9;
  c.strokeStyle=reached?'#2d8bba63':'#6b769052';c.stroke();
  c.beginPath();routeSegment(c,a,b);c.lineWidth=reached?5:2;
  c.strokeStyle=reached?'#99ffed':'#91a5ce77';
  c.shadowColor=reached?'#60ffd8':'#7da4de';
  c.shadowBlur=reached?18:2;c.stroke();
  c.restore();
 }
 for(let i=unlocked;i<GALAXY_POINTS.length;i++){
  const {x,y}=GALAXY_POINTS[i],r=115+(i%4)*16;
  const fog=c.createRadialGradient(x,y,3,x,y,r);
  fog.addColorStop(0,'#8792be70');fog.addColorStop(.5,'#5a6c9766');fog.addColorStop(1,'#24345200');
  c.fillStyle=fog;c.fillRect(x-r,y-r,r*2,r*2);
 }
}

function drawSurface(c,p,r){
 const stage=p.stage,clamp=r*.82;
 // Planícies e efeitos atmosféricos são diferentes nos mundos repetidos.
 switch(stage){
  case 1: // Cortinas luminosas
   for(let i=-4;i<=5;i++)line(c,[[i*11,-r],[i*9-10,0],[i*10+15,r]],i%2?'#d4ffbca8':'#ffb0e4b3',7);
   for(let i=0;i<12;i++)circle(c,(i*19)%84-42,i*17%90-45,2,'#f6fff1');
   break;
  case 2:case 13:
   for(let i=0;i<8;i++){
    const x=(i*31)%95-47,y=(i*47)%94-47;
    polygon(c,[[x-14,y+14],[x-6,y-13],[x+11,y-16],[x+17,y+13]],stage===2?'#8e827c':'#ed955c');
    circle(c,x+5,y,4,stage===2?'#503a4b':'#9b453e');
   }break;
  case 3:case 18:
   for(let i=0;i<9;i++){
    const x=(i*31)%99-49;
    polygon(c,[[x-12,44],[x,-45-(i%3)*7],[x+13,45]],stage===3?'#eaffffdd':'#b1caffc9');
    line(c,[[x,-24],[x+9,36]],'#8ac8e4',3);
   }
   if(stage===18){circle(c,-22,-26,17,'#8aa2d9');circle(c,29,-10,13,'#e5f4ff');}
   break;
  case 4:case 11:
   for(let i=0;i<11;i++){
    const x=(i*37)%110-55,y=(i*49)%107-53;
    line(c,[[x,y+17],[x-4,y-10]],'#265a42',5);
    circle(c,x-7,y-12,13,stage===4?'#95ffa3':'#ffc3df');
    circle(c,x+5,y-17,10,stage===4?'#43cb87':'#d4ff8e');
   }break;
  case 5:case 19:
   for(let i=0;i<5;i++){
    const x=(i-2)*20;
    c.beginPath();c.ellipse(x,0,15,44,.4,0,TAU);
    c.strokeStyle=stage===5?'#ffa5f2':'#ffeabd';c.lineWidth=5;c.stroke();
   }
   for(let i=0;i<16;i++)circle(c,(i*17)%100-50,(i*29)%90-45,2,'#f9ffff');
   break;
  case 6:
   for(let i=0;i<7;i++){
    const x=i*23-68;
    polygon(c,[[x-12,52],[x,6-i%3*22],[x+16,52]],'#38283b');
    line(c,[[x,45],[x+4,22],[x,8]],'#ffbd4b',4);
   }break;
  case 7:
   for(let i=0;i<11;i++){
    const x=(i*29)%105-50,y=(i*37)%110-55;
    polygon(c,[[x-14,y+15],[x,y-20],[x+16,y+15]],i%2?'#a1ffe6':'#51cdcc');
   }break;
  case 8:
   for(let i=-3;i<5;i++){oval(c,i*34,12+i%3*16,51,14,i%2?'#e6a05a':'#fff0b5',-.1);}
   break;
  case 9:case 14:
   for(let i=-3;i<5;i++){
    const y=i*23;
    c.beginPath();c.moveTo(-r,y);
    c.bezierCurveTo(-r*.35,y-19,r*.22,y+22,r,y-6);
    c.lineWidth=stage===9?13:10;c.strokeStyle=stage===9?'#a6feeed0':'#d2feffb9';c.stroke();
   }
   if(stage===14)for(let i=0;i<5;i++)circle(c,i*21-46,-30+i*8,5,'#61d4e5');
   break;
  case 10:case 20:
   for(let i=0;i<10;i++){
    const x=i*17-72,h=25+i*13%64;
    c.fillStyle=stage===10?'#233e62':'#a27c4e';c.fillRect(x,49-h,16,h);
    if(stage===20){polygon(c,[[x-2,49-h],[x+8,31-h],[x+18,49-h]],'#f9e7ab');}
    else for(let j=0;j<3;j++){c.fillStyle='#97edff';c.fillRect(x+5,54-h+j*13,4,6);}
   }break;
  case 12:
   for(let i=0;i<5;i++){
    const x=i*28-60;
    c.fillStyle='#d7bce3';c.fillRect(x,-24,10,78);
    c.fillRect(x-4,-29,19,7);
    polygon(c,[[x-7,53],[x+17,53],[x+20,59],[x-10,59]],'#72599d');
   }break;
  case 15:
   for(let i=0;i<12;i++){
    const x=(i*25)%105-55,y=(i*37)%100-50;
    line(c,[[x,y+22],[x,y-11],[x-13,y-24]],'#fba5b9',7);
    line(c,[[x,y-8],[x+13,y-22]],'#ffdfc2',5);
   }break;
  case 16:
   for(let i=-4;i<=4;i++)oval(c,0,i*17,85,9,i%2?'#cbb6ee':'#8070b4');
   break;
  case 17:
   for(let i=0;i<7;i++){
    const x=i*24-70;
    polygon(c,[[x,-45],[x+18,-16],[x+2,-12],[x+19,28],[x-13,-4],[x,-7]],'#effcff');
   }break;
 }
 if(stage!==1){
  c.globalAlpha=.20;for(let i=0;i<8;i++){const x=(i*53)%116-58,y=(i*29)%92-46;circle(c,x,y,3+i%4,'#ffffff');}c.globalAlpha=1;
 }
}
export function drawPlanetPortrait(c,p,{locked=false,size=144}={}){
 const r=size*.35,center=size/2;
 c.clearRect(0,0,size,size);
 c.save();c.translate(center,center);
 if(locked){
  const g=gradient(c,0,0,r,'#8b91b3','#273350');
  circle(c,0,0,r,g);
  oval(c,-r*.32,-r*.29,r*.22,r*.45,'#d2dcff34',-.38);
  c.restore();return;
 }
 c.save();c.shadowColor=p.highlight;c.shadowBlur=18;circle(c,0,0,r+1,p.highlight+'85');c.restore();
 // Anéis externos, desenhados antes e depois do globo para dar profundidade.
 if([8,16].includes(p.stage)){
  c.save();c.rotate(-.36);c.strokeStyle=p.highlight+'90';c.lineWidth=9;
  c.beginPath();c.ellipse(0,0,r*1.27,r*.31,0,0,TAU);c.stroke();c.restore();
 }
 const g=gradient(c,0,0,r,p.highlight,p.sky);
 circle(c,0,0,r,g);
 c.save();c.beginPath();c.arc(0,0,r-1,0,TAU);c.clip();
 drawSurface(c,p,r);
 const shade=c.createLinearGradient(-r,-r,r,r);
 shade.addColorStop(0,'#ffffff3f');shade.addColorStop(.48,'#ffffff00');shade.addColorStop(1,'#010615aa');
 c.fillStyle=shade;c.fillRect(-r,-r,r*2,r*2);
 c.restore();
 c.strokeStyle=p.highlight+'bb';c.lineWidth=1.4;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();
 c.restore();
}

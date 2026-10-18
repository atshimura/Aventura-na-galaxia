/** Ilustração vetorial dos habitantes e perigos; nenhuma imagem externa.
 * Silhuetas e detalhes distintos por espécie, animações a partir do estado da IA.
 */
const PI=Math.PI,TAU=PI*2;
const oval=(c,x,y,rx,ry,fill,stroke=null)=>{
 c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);
 c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}
};
function shape(c,points,fill,stroke=null){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=1.7;c.strokeStyle=stroke;c.stroke();}
}
function stroke(c,points,color,width=2){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
const star=(c,x,y,r,n,color)=>{
 const pts=[];for(let i=0;i<2*n;i++){const a=i*PI/n-PI/2,d=i%2?r*.45:r;pts.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);}
 shape(c,pts,color,'#f8ffff');
};
function eyes(c,variant,hostile){
 const count=variant%5===0?3:variant%3===0?1:2;
 for(let i=0;i<count;i++){
  const x=count===1?6:-3+i*10;
  oval(c,x,-5,3.6,4.3,hostile?'#622847':'#15355c','#f0fdff');
  oval(c,x-1,-6,1.25,1.8,'#ffffff');
 }
}
function legs(c,n=4,color='#a5f5ff',wiggle=0){
 for(let i=0;i<n;i++){
  const xx=-12+i*24/(n-1),offset=(i%2?1:-1)*wiggle;
  stroke(c,[[xx,7],[xx+offset,16],[xx+offset+3,19]],color,2.7);
 }
}
const wing=(c,sign,color,angle=0)=>{
 shape(c,[[-9,0],[-25,-18*sign+angle],[5,-14*sign+angle],[14,-2*sign]],color,'#edffff');
};
export function drawPlanetCreature(c,o,time=0){
 c.save();c.translate(o.x,o.y);
 const t=time*.001+o.phase;
 const breathing=1+Math.sin(t*2)*.045;
 const hidden=o.visible===false;
 c.globalAlpha=hidden?.3:1;
 c.scale(hidden?.64:1,hidden?.52:breathing);
 if(o.shape==='titan'||o.shape==='giant')c.scale(1.35,1.3);
 const p=o.primary||'#9cf7e8',a=o.accent||'#f9b8ff',deep=o.hostile?'#8c496b':'#224a73';
 const move=Math.sin(t*3+o.member),v=o.variant||0;
 // Forma corporal individual: pele, apêndices, carapaça, asas e distribuição dos olhos.
 switch(o.shape){
  case 'jelly':{
   oval(c,0,-6,17,15,p,'#ffffff');for(let i=-2;i<=2;i++)stroke(c,[[i*6,4],[i*6+move*2,18]],a,2.5);
   oval(c,0,-13,10,4,a);break;
  }
  case 'bunny':{
   oval(c,-8,-17,5,13,a);oval(c,8,-17,5,13,a);oval(c,0,1,16,14,p,deep);legs(c,2,p,move);break;
  }
  case 'puff':{
   for(const [x,y] of [[-11,0],[-6,-10],[7,-11],[13,0],[0,6]])oval(c,x,y,10,10,p);
   for(let i=0;i<3;i++)oval(c,-11+i*11,10,3,2,a);break;
  }
  case 'pebble':case 'shard':case 'crystal':case 'prism':{
   shape(c,[[-18,7],[-12,-11],[0,-20],[16,-10],[20,11],[1,16]],p,a);
   for(let j=0;j<3;j++)stroke(c,[[-10+j*9,-8],[j*5,8]],a,2);if(o.shape==='prism')oval(c,0,-14,6,4,'#fff');break;
  }
  case 'shell':case 'conch':case 'roller':{
   legs(c,4,a,move*3);oval(c,0,-2,19,16,p,a);
   for(let j=0;j<3;j++)oval(c,1-j*3,-2,12-j*4,11-j*3,j===2?'#fff1c4':a);
   break;
  }
  case 'mole':{
   legs(c,4,a,move);oval(c,0,4,19,12,p);
   oval(c,14,6,9,6,a);oval(c,-14,-6,5,7,p);break;
  }
  case 'skater':case 'stilt':{
   stroke(c,[[-13,10],[-15,21],[-24,23]],a,3);
   stroke(c,[[13,10],[17,21],[28,23]],a,3);
   oval(c,0,0,18,11,p,a);oval(c,9,-8,9,9,p);break;
  }
  case 'kite':case 'manta':case 'ray':case 'petal':{
   shape(c,[[-4,-8],[-31,-17],[0,10],[32,-19],[25,10],[2,16],[-22,9]],p,a);
   oval(c,1,0,12,8,a);if(o.shape==='petal')wing(c,-1,'#f5b4e7',move*4);break;
  }
  case 'fang':case 'wolf':case 'predator':{
   legs(c,4,p,move*2);shape(c,[[-23,3],[-14,-15],[8,-17],[22,-3],[19,13],[-14,12]],p,a);
   shape(c,[[2,8],[7,16],[12,9],[17,16],[23,5]],'#fff');break;
  }
  case 'leaf':case 'branch':case 'vine':{
   stroke(c,[[0,14],[0,-13]],a,4);
   shape(c,[[0,-11],[-26,-22],[-20,-3],[0,6]],p);
   shape(c,[[0,-11],[25,-21],[22,0],[0,6]],p);
   if(o.shape==='branch')for(const xx of [-13,13])stroke(c,[[xx,0],[xx*1.35,-19]],a,3);
   else oval(c,0,-5,9,11,a);break;
  }
  case 'flower':case 'coral':case 'spore':{
   if(o.shape==='spore')shape(c,[[-22,-3],[-13,-19],[13,-19],[22,-3]],a,'#fff');
   else for(let i=0;i<6;i++){const ang=i*TAU/6;oval(c,Math.cos(ang)*15,Math.sin(ang)*13,9,7,a);}
   oval(c,0,0,12,12,p,deep);break;
  }
  case 'ring':case 'orb':case 'moon':case 'star':{
   if(o.shape==='star')star(c,0,0,22,5,p);
   else if(o.shape==='moon'){oval(c,0,0,21,21,p);oval(c,9,-8,19,17,'#16345d');}
   else {oval(c,0,0,21,21,p,a);oval(c,0,0,10,10,'#1c3066');}
   if(o.shape==='orb'||o.shape==='ring')oval(c,0,-21,3,3,a);
   break;
  }
  case 'spring':case 'hopper':case 'bubble':{
   if(o.shape==='bubble'){
    for(const [x,y,r] of [[-10,5,12],[9,0,13],[0,-13,8]])oval(c,x,y,r,r,'#aafaffb0',a);
   }else{
    stroke(c,[[-9,11],[-16,19],[-5,19],[-12,11],[8,11],[16,19],[6,19],[12,11]],a,3);
    oval(c,0,-1,17,14,p);oval(c,0,-12,12,6,a);
   }break;
  }
  case 'eye':case 'guardian':case 'guard':case 'gold':{
   shape(c,[[-20,7],[-14,-14],[0,-21],[17,-11],[23,9],[0,19]],p,a);
   oval(c,0,-2,14,12,deep,'#fff');oval(c,1,-2,8,8,a);
   if(o.shape==='gold'||o.shape==='guardian')for(const xx of [-15,15])shape(c,[[xx,-12],[xx*1.55,-17],[xx*1.4,6]],a);
   break;
  }
  case 'lizard':case 'crawler':case 'salamander':{
   legs(c,4,a,move*3);shape(c,[[-16,0],[-35,-9],[-28,5],[-12,12]],a);
   oval(c,0,3,22,11,p);oval(c,16,-6,10,10,p);break;
  }
  case 'spark':case 'electric':{
   star(c,0,0,24,7,p);for(const sign of [-1,1])stroke(c,[[sign*10,8],[sign*15,15],[sign*19,12]],a,2.5);break;
  }
  case 'wasp':case 'drone':case 'zigzag':{
   wing(c,-1,a,move*3);wing(c,1,a,move*3);oval(c,0,2,17,10,p,deep);
   if(o.shape==='drone')oval(c,0,-15,5,4,a);else shape(c,[[-22,2],[-32,6],[-22,9]],a);
   break;
  }
  case 'slug':case 'dart':{
   shape(c,[[-25,13],[-12,-4],[9,-11],[23,0],[20,12]],p,a);
   for(const xx of [5,15])stroke(c,[[xx,-3],[xx+2,-18]],a,2);
   break;
  }
  case 'crab':case 'beetle':case 'spider':{
   legs(c,o.shape==='spider'?8:6,a,move*3);
   oval(c,0,0,20,14,p,a);
   if(o.shape==='crab')for(const sign of [-1,1])shape(c,[[sign*16,-3],[sign*30,-18],[sign*33,-4]],a);
   else stroke(c,[[-10,-11],[0,13],[10,-11]],a,2);
   break;
  }
  case 'robot':case 'ceremony':case 'rune':{
   legs(c,2,a,move*3);
   shape(c,[[-18,-14],[18,-14],[19,14],[-19,14]],p,a);
   if(o.shape==='ceremony')shape(c,[[-16,-15],[-10,-27],[0,-18],[10,-27],[17,-15]],'#ffdf7a');
   if(o.shape==='rune')stroke(c,[[-11,-4],[0,-10],[11,8]],a,3);
   else oval(c,0,-20,5,5,a);break;
  }
  case 'shadow':case 'puffball':{
   for(let i=0;i<5;i++)oval(c,-14+i*7,6-Math.sin(i)*9,11,14,p);
   oval(c,0,0,13,12,a);break;
  }
  case 'giant':case 'titan':{
   legs(c,2,a,move*1.3);shape(c,[[-19,10],[-24,-7],[-7,-20],[10,-20],[24,-7],[19,12]],p,a);
   shape(c,[[-19,-9],[-32,-3],[-29,12],[-15,7]],a);shape(c,[[19,-9],[32,-3],[29,12],[15,7]],a);break;
  }
  default:{
   legs(c,4,a,move);oval(c,0,0,19,15,p,a);break;
  }
 }
 // Olhos luminosos e marca corporal individual distinguem parentes do mesmo arquétipo.
 if(!['eye','guard','guardian','gold'].includes(o.shape))eyes(c,v,o.hostile);
 if(v%3===1){oval(c,-13,8,3,3,a);}
 if(v%3===2){for(const xx of [-9,9])stroke(c,[[xx,-12],[xx,-23]],a,2);}
 if(o.hostile){stroke(c,[[-17,20],[-7,23],[6,23],[18,20]],'#ffad7d',2);}
 if(o.reaction==='startled')star(c,23,-22,5,4,'#fff2a7');
 if(o.reaction==='alert'){
  // Aviso visível enquanto o predador camuflado emerge e ainda não causa dano.
  c.globalAlpha=1;star(c,19,-27,7,5,'#fff3a0');
  stroke(c,[[19,-31],[19,-24]],'#7e4664',2);
 }
 if(o.reaction==='chasing')stroke(c,[[-22,-20],[0,-25],[22,-20]],'#ffc37b',2);
 c.restore();
}
export function drawPlanetObstacle(c,o,time=0){
 c.save();c.translate(o.x,o.y);const p=o.primary||'#ffbb99',a=o.accent||'#b7efff';
 const t=time*.001+o.phase,s=Math.sin(t*2);
 c.globalAlpha=o.active===false&&o.kind!=='scenery'?.47:1;
 const form=o.shape||'rock';
 switch(form){
  case 'flower':{
   stroke(c,[[0,15],[0,-8]],'#4caf78',4);
   for(let j=0;j<6;j++){const q=j*TAU/6;oval(c,Math.cos(q)*13,Math.sin(q)*13-7,8,6,a);}
   oval(c,0,-7,7,7,p);break;
  }
  case 'arch':{
   c.beginPath();c.arc(0,9,27,PI,TAU);c.strokeStyle=a;c.lineWidth=6;c.stroke();
   for(const xx of [-25,25])oval(c,xx,9,4,8,p);break;
  }
  case 'rock':case 'boulder':case 'block':{
   if(form==='block')shape(c,[[-19,-17],[19,-17],[19,16],[-19,16]],p,a);
   else shape(c,[[-23,12],[-18,-8],[-5,-18],[13,-13],[24,7],[12,17]],p,a);
   stroke(c,[[-6,-11],[1,0],[13,4]],a,2);break;
  }
  case 'shard':case 'spike':case 'ice':case 'crystal':{
   for(let j=-1;j<=1;j++)shape(c,[[j*14-10,17],[j*14-1,-23+(j===0?-8:7)],[j*14+10,17]],j===0?p:a,'#eeffff');
   break;
  }
  case 'root':case 'vine':{
   for(let j=-1;j<=1;j++)stroke(c,[[j*13-2,18],[j*9+s*5,-4],[j*14-4,-23]],p,5);
   oval(c,0,-12,5,7,a);break;
  }
  case 'thorn':case 'cactus':case 'coral':{
   stroke(c,[[0,18],[0,-22]],p,7);
   for(const xx of [-13,13]){stroke(c,[[0,0],[xx,0],[xx,-14]],a,4);}
   for(let j=0;j<3;j++)shape(c,[[j*11-13,-8],[j*11-9,-17],[j*11-6,-7]],'#fff3dc');
   break;
  }
  case 'orb':case 'ring':case 'portal':case 'gear':{
   oval(c,0,0,24,24,p,'#f7ffff');oval(c,0,0,15,15,'#17326b',a);
   if(form==='gear'||form==='orb')for(let i=0;i<6;i++){const q=i*TAU/6+t*.25;oval(c,Math.cos(q)*25,Math.sin(q)*25,4,4,a);}
   break;
  }
  case 'vent':case 'geyser':case 'jet':{
   shape(c,[[-18,17],[-13,6],[14,6],[18,17]],p,a);
   for(let i=-1;i<=1;i++)stroke(c,[[i*7,6],[i*8+s*3,-12],[i*6,-30]],a,4);
   break;
  }
  case 'fissure':case 'plate':case 'bridge':{
   shape(c,[[-29,15],[-24,5],[23,5],[29,15]],p,a);
   stroke(c,[[-12,5],[-2,12],[7,6],[15,15]],'#fff1a0',3);break;
  }
  case 'tornado':{
   for(let i=0;i<4;i++)oval(c,s*6,12-i*11,21-i*4,4,i%2?a:p);
   break;
  }
  case 'pool':case 'current':{
   oval(c,0,13,26,7,a,p);
   for(let i=0;i<3;i++)stroke(c,[[-19+i*15,11],[-13+i*15,7],[-5+i*15,11]],'#e2ffff',2);
   break;
  }
  case 'piston':case 'tower':case 'barrier':{
   shape(c,[[-20,17],[-20,-22],[20,-22],[20,17]],p,a);
   for(let i=0;i<3;i++)stroke(c,[[-15,-17+i*11],[15,-17+i*11]],a,2);
   break;
  }
  case 'electric':case 'lightning':case 'beam':{
   shape(c,[[-5,-28],[11,-28],[1,-8],[17,-8],[-13,23],[-7,1],[-19,1]],a,'#ffffff');
   oval(c,0,20,15,4,p);break;
  }
  case 'seed':case 'bubble':case 'urchin':{
   if(form==='urchin')star(c,0,0,23,10,p);
   else for(let i=0;i<3;i++)oval(c,i*13-12,-i*6,12-i*2,12-i*2,i%2?p:a,'#fff');
   break;
  }
  default:{
   shape(c,[[-20,16],[-10,-19],[0,-1],[10,-24],[21,16]],p,a);
  }
 }
 if(o.warning){c.globalAlpha=1;oval(c,0,0,29+4*Math.sin(t*8),26,'#ffffff13','#fff19c');}
 c.restore();
}

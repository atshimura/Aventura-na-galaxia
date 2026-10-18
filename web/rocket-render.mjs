/** Modelos vetoriais únicos compartilhados por garagem, voo e pouso.
 * Coordenadas normalizadas: nariz voltado para a direita; dimensões aproximadas 100x70.
 * Sem dependência de imagens externas e sem efeitos sobre física ou colisões.
 */
import {rocketById} from './rockets.mjs';
const TAU=Math.PI*2;
function polygon(c,points,fill,stroke='#bcefff',width=1.6){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function ellipse(c,x,y,rx,ry,fill,stroke){
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();
 if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
}
function window(c,x,y,r=7,color='#76eaff'){
 ellipse(c,x,y,r+2,r+2,'#193c73','#effbff');ellipse(c,x-1,y-1,r-1,r-1,color);
 ellipse(c,x-2,y-2,Math.max(1,r/4),Math.max(1,r/4),'#f7ffff');
}
function flame(c,x,y,length=14,color='#ffab49'){
 polygon(c,[[x,y-5],[x-length,y],[x,y+5]],color,null);
 polygon(c,[[x,y-2.5],[x-length*.58,y],[x,y+2.5]],'#fff5bf',null);
}
export function drawRocketModel(c,id,{x=0,y=0,scale=1,rotation=0,thrust=true,time=0}={}){
 const r=rocketById(id);
 c.save();c.translate(x,y);c.rotate(rotation);c.scale(scale,scale);
 c.lineJoin='round';c.lineCap='round';
 const f=14+3*Math.sin(time/110);
 if(r.id==='aurora'){
  if(thrust)flame(c,-39,0,f,'#ff9d4b');
  polygon(c,[[-23,-14],[-43,-23],[-36,0],[-43,23],[-23,14]],'#ea314f','#ffd5dd');
  polygon(c,[[-34,-13],[13,-17],[39,0],[13,17],[-34,13]],'#f6fbff','#c7d4ed',2);
  polygon(c,[[13,-17],[39,0],[13,17],[19,0]],'#f1324d','#fbd7e0');
  window(c,3,0,10,'#43b8ff');
  polygon(c,[[-36,-9],[-29,-9],[-29,9],[-36,9]],'#476c9d',null);
 }else if(r.id==='cometa'){
  if(thrust){flame(c,-38,-12,f,'#47ceff');flame(c,-38,12,f,'#47ceff');}
  polygon(c,[[-26,-11],[-43,-34],[10,-20],[25,-9],[-20,0]],'#1555a0','#82eaff');
  polygon(c,[[-26,11],[-43,34],[10,20],[25,9],[-20,0]],'#1555a0','#82eaff');
  polygon(c,[[-37,-12],[10,-11],[47,0],[10,11],[-37,12]],'#1686d2','#a6efff');
  polygon(c,[[-12,-9],[12,-7],[35,0],[12,7],[-12,9]],'#083967','#76edff');
  window(c,14,0,5,'#d5ffff');
  polygon(c,[[-26,-9],[-35,-13],[-35,-7],[-26,-3]],'#7ff1ff',null);
  polygon(c,[[-26,3],[-35,7],[-35,13],[-26,9]],'#7ff1ff',null);
 }else if(r.id==='flor'){
  if(thrust){flame(c,-36,-12,f*.9,'#fff066');flame(c,-36,12,f*.9,'#fff066');}
  polygon(c,[[-11,-12],[-37,-34],[-16,-27],[18,-23],[35,-14],[16,0]],'#17bbb3','#bafff2');
  polygon(c,[[-11,12],[-37,34],[-16,27],[18,23],[35,14],[16,0]],'#17bbb3','#bafff2');
  ellipse(c,-2,0,42,20,'#16aee4','#a5ffee');
  ellipse(c,2,-3,29,14,'#36d2ed','#fff3a1');
  window(c,-18,4,5);window(c,0,5,5);window(c,18,4,5);
  polygon(c,[[-31,-8],[-40,0],[-31,8]],'#7f55c8','#d9b9ff');
 }else if(r.id==='guardiao'){
  if(thrust){flame(c,-43,-13,f,'#ffd45b');flame(c,-43,13,f,'#ffd45b');}
  polygon(c,[[-28,-15],[-43,-29],[-8,-29],[11,-18],[24,0],[11,18],[-8,29],[-43,29],[-28,15]],'#a9650c','#fff0a7',2.5);
  polygon(c,[[-39,-13],[15,-17],[43,0],[15,17],[-39,13]],'#ffca32','#fff0b4',3);
  polygon(c,[[-27,-15],[-9,-22],[15,-17],[25,-10],[18,0],[25,10],[15,17],[-9,22],[-27,15]],'#e7a71b','#8a5408',2);
  polygon(c,[[-6,-10],[8,-11],[19,0],[8,11],[-6,10],[-15,0]],'#2675ae','#f9e4a7',2);
  polygon(c,[[13,-17],[43,0],[13,17],[26,0]],'#ffdf71','#fff1ac');
  c.strokeStyle='#fff2bd';c.lineWidth=3;c.beginPath();c.moveTo(-28,-11);c.lineTo(-28,11);c.stroke();
 }else if(r.id==='falcao'){
  if(thrust){for(const yy of [-16,0,16])flame(c,-41,yy,f+5,'#ff8a25');}
  polygon(c,[[-20,-14],[-37,-31],[10,-22],[36,-9],[6,0]],'#ec641b','#ffdb73');
  polygon(c,[[-20,14],[-37,31],[10,22],[36,9],[6,0]],'#ec641b','#ffdb73');
  polygon(c,[[-42,-14],[4,-13],[48,0],[4,13],[-42,14]],'#ff9a26','#ffe4a4');
  polygon(c,[[-15,-11],[19,-7],[37,0],[19,7],[-15,11]],'#245da2','#a6eaff');
  window(c,10,0,8,'#2ad9ff');
  for(const yy of [-16,0,16])polygon(c,[[-42,yy-5],[-31,yy-5],[-31,yy+5],[-42,yy+5]],'#6a7d9a','#e6ffff');
 }else if(r.id==='nebulon'){
  if(thrust){for(const yy of [-10,10])flame(c,-32,yy,f*.8,'#e765ff');}
  polygon(c,[[-12,-9],[-42,-31],[-15,-23],[16,-24],[40,-8],[22,0]],'#7d30b7','#6ffaff');
  polygon(c,[[-12,9],[-42,31],[-15,23],[16,24],[40,8],[22,0]],'#7d30b7','#6ffaff');
  ellipse(c,-3,0,43,17,'#8a31d5','#74ffff');
  ellipse(c,0,-3,26,13,'#cd3aff','#fbadff');
  ellipse(c,3,-5,16,9,'#e548ff','#ffddff');
  for(const xx of [-23,-9,9,25])ellipse(c,xx,12,3.5,3.5,'#58fff5');
  c.strokeStyle='#75fff0';c.lineWidth=2;c.beginPath();c.moveTo(-38,0);c.quadraticCurveTo(0,23,37,0);c.stroke();
 }
 c.restore();
}

/** Cenários 2D ilustrados: cada um dos vinte planetas possui motivos exclusivos. */
import {WORLD_LENGTH,groundAt,FLIGHT_PAD_X,pitsForStage} from './platformer.mjs';
import {drawRocketModel} from './rocket-render.mjs';
import {drawPlanetCreature,drawPlanetObstacle} from './planet-ecology-render.mjs';
const PI=Math.PI,TAU=PI*2;
const motifs=Object.freeze([
 'aurora-curtains','asteroid-craters','ice-spires','forest-giants',
 'wormholes','volcanoes','crystal-valley','sand-rings','floating-ocean',
 'cyber-city','hanging-gardens','ancient-ruins','red-canyons','waterfalls',
 'coral-reef','giant-rings','electrical-storm','twin-moons','star-bridges','golden-temples'
]);
export function planetSceneSignature(stage){
 const index=Math.max(0,Math.min(19,(Number(stage)||1)-1));
 return motifs[index];
}
function disk(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function ell(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
function stroke(c,x1,y1,x2,y2,color,width=3){
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';
 c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
}
function polygon(c,pts,color){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function lineRibbon(c,x,phase,width,y,color){
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();
 for(let h=0;h<=500;h+=16){
  const px=x+Math.sin(h*.013+phase)*28+Math.sin(h*.037+phase)*10;
  h===0?c.moveTo(px,y+h):c.lineTo(px,y+h);
 }c.stroke();
}
function cloud(c,x,y,size,color){
 ell(c,x,y,size*1.25,size*.28,color);
 disk(c,x-size*.5,y-9,size*.33,color);disk(c,x+size*.35,y-13,size*.43,color);
}
function drawSky(c,p,stage,time,camera){
 const t=time*.001,x=(v,f=.10)=>v-camera*f,biome=p.biome;
 const gr=c.createLinearGradient(0,0,0,540);
 gr.addColorStop(0,p.sky);gr.addColorStop(.56,p.ground);gr.addColorStop(1,'#09162a');
 c.fillStyle=gr;c.fillRect(0,0,960,540);
 // Atmosfera e astros diferentes em cada planeta.
 if([2,3,13,18].includes(stage)){
  disk(c,x(742,.035),128,stage===18?64:48,'#eaf5ffc5');
  if(stage===18)disk(c,x(580,.07),205,35,'#ba9fe6b0');
 }else if([8,16].includes(stage)){
  disk(c,x(720,.04),117,82,stage===8?'#f4b87a':'#d2b5fe');
  c.save();c.translate(x(720,.04),117);c.rotate(-.24);
  c.strokeStyle='#f5edf3b9';c.lineWidth=17;c.beginPath();c.ellipse(0,0,137,33,0,0,TAU);c.stroke();c.restore();
 }else if([9,14,15].includes(stage)){
  disk(c,x(790,.05),104,56,'#d6faffae');
 }else{
  disk(c,x(794,.03),116,stage===1?72:48,p.highlight+'b8');
 }
 const slow=camera*.13,shift=x=>x-slow;
 switch(stage){
  case 1:
   // Arcos de aurora e pequenos pontos luminosos, bem visíveis desde o início.
   for(let i=0;i<7;i++){
    c.save();c.globalAlpha=.29+.04*i;
    lineRibbon(c,shift(i*165+60)+Math.sin(t+i)*8,i+t*.35,25,0,i%2?'#83ffe7':'#ffc9f0');c.restore();
   }
   for(let i=0;i<35;i++)disk(c,(i*91+13+Math.sin(t+i)*9)%960,62+(i*39)%270,1.3+i%3*.75,'#eaffdc');
   break;
  case 2:
   for(let i=0;i<11;i++){
    const a=shift(i*126-80),y=192+(i%4)*39;
    polygon(c,[[a-52,y+100],[a-17,y-36],[a+57,y-9],[a+83,y+105]],'#344765b5');
    disk(c,a+4,y+12,12,'#a59dac85');disk(c,a+32,y+43,7,'#b7a7a088');
   }break;
  case 3:
   for(let i=0;i<10;i++){const x=shift(i*160);
    polygon(c,[[x-68,409],[x+10,171+i%3*35],[x+84,408]],'#c8f5ff98');
    polygon(c,[[x+8,174+i%3*35],[x+85,408],[x+17,401]],'#eaffffae');
    for(let j=0;j<3;j++)polygon(c,[[x-30+j*18,320],[x-23+j*18,356],[x-12+j*18,320]],'#ffffffb8');
   }break;
  case 4:
   for(let i=0;i<9;i++){const x=shift(i*181);
    stroke(c,x,425,x-22,156,'#165b4c',26);
    ell(c,x-20,141,100,76,'#1b8a69ad');
    ell(c,x+36,121,80,59,'#65d88a99');
    for(let j=0;j<3;j++)stroke(c,x+j*26-35,176,x+j*26-39,307,'#c2ff84',3);
   }break;
  case 5:
   for(let i=0;i<5;i++){const x=shift(i*265+120);
    c.strokeStyle='#f9d7ff';c.lineWidth=13;c.beginPath();c.ellipse(x,252,57,119,.18,0,TAU);c.stroke();
    c.strokeStyle='#b4b5ff';c.lineWidth=4;c.beginPath();c.ellipse(x,252,38,96,-.18,0,TAU);c.stroke();
    polygon(c,[[x,172],[x+16,248],[x-11,302]],'#d2a5ff63');
   }break;
  case 6:
   for(let i=0;i<7;i++){const x=shift(i*175-80);
    polygon(c,[[x-115,433],[x-44,260],[x,196+(i%3)*25],[x+103,433]],'#432b4b');
    polygon(c,[[x-34,267],[x,195+(i%3)*25],[x+32,269]],'#ff7b45');
    cloud(c,x-5,145-11*Math.sin(t+i),40,'#f8bc9282');
   }break;
  case 7:
   for(let i=0;i<13;i++){const x=shift(i*114);
    polygon(c,[[x-48,427],[x-16,297],[x+2,196+(i%4)*28],[x+59,427]],i%2?'#85ffcfac':'#8ab3eb9c');
    polygon(c,[[x+2,196+(i%4)*28],[x+59,427],[x+4,365]],'#e9ffe2a7');
   }break;
  case 8:
   for(let i=0;i<6;i++){const x=shift(i*220);
    ell(c,x,378+(i%2)*32,230,60,i%2?'#dca46c8e':'#fbd499b0');
    disk(c,x+43,291,4,'#fff4d0');
   }break;
  case 9:
   for(let i=0;i<8;i++){const x=shift(i*160),y=302+(i%3)*19;
    ell(c,x,y,104,20,'#7eeaf4a5');
    polygon(c,[[x-55,y],[x-25,y-60],[x+30,y-40],[x+65,y]],'#2bbab4a9');
    for(let j=0;j<3;j++)stroke(c,x-20+j*16,y,x-18+j*16,y+53,'#a7effcc0',3);
   }break;
  case 10:
   for(let i=0;i<19;i++){const x=shift(i*63-30),h=98+i*17%160;
    c.fillStyle=i%2?'#354d79':'#20395f';c.fillRect(x,409-h,54,h);
    c.fillStyle=i%2?'#7deaff':'#e7baf9';
    for(let j=0;j<6;j++)for(let k=0;k<3;k++)c.fillRect(x+7+k*14,420-h+j*21,5,9);
    if(i%4===0){ell(c,x+45,246+(i%2)*29,23,6,'#f2b5fc');stroke(c,x+28,248,x+61,248,'#ffffff',2);}
   }break;
  case 11:
   for(let i=0;i<8;i++){const x=shift(i*163),y=240+(i%3)*46;
    ell(c,x,y,85,21,'#93e3b0ca');
    for(let j=0;j<5;j++){stroke(c,x-47+j*21,y,x-48+j*21,y-48,'#74bca5',7);
     disk(c,x-47+j*21,y-49,22,j%2?'#f4c8ed':'#d8ffa4');}
    for(let j=0;j<5;j++)stroke(c,x-44+j*20,y+6,x-45+j*20,y+46,'#d7f4b9',2);
   }break;
  case 12:
   for(let i=0;i<7;i++){const x=shift(i*168+10);
    c.fillStyle='#8d75ad';c.fillRect(x,262,22,150);c.fillRect(x+92,263,22,150);
    c.fillRect(x-5,257,123,13);
    c.fillStyle='#ccb8dc';c.fillRect(x+7,273,8,25);c.fillRect(x+98,273,8,25);
    polygon(c,[[x+42,393],[x+62,335],[x+81,393]],'#d6a5fe95');
   }break;
  case 13:
   for(let i=0;i<10;i++){const x=shift(i*123);
    polygon(c,[[x-85,420],[x-51,245-i%3*16],[x+13,259],[x+80,417]],i%2?'#975643':'#b77655');
    for(let k=0;k<3;k++)stroke(c,x-48+k*20,280+k*27,x-12+k*18,289+k*27,'#ecb389',3);
   }break;
  case 14:
   for(let i=0;i<8;i++){const x=shift(i*152);
    polygon(c,[[x-79,318],[x-23,233],[x+67,266],[x+80,317]],'#31999f');
    for(let j=0;j<5;j++){stroke(c,x-25+j*11,307,x-25+j*11,408,'#c0fbff92',4);}
    ell(c,x,388,110,23,'#9ce3dbb0');
   }break;
  case 15:
   for(let i=0;i<13;i++){const x=shift(i*99);
    stroke(c,x,415,x-8,295,'#fd849c',13);
    for(let k=0;k<4;k++)stroke(c,x-8,362-k*19,x+((k%2)*2-1)*38,340-k*32,'#ffb4b7',8);
    ell(c,x+44,244+(i%3)*39,20,13,'#acf4ead9');
    for(let k=0;k<4;k++)stroke(c,x+38+k*5,251,x+34+k*7,273,'#f6e4f1',2);
   }break;
  case 16:
   for(let i=0;i<7;i++){const x=shift(i*177+50),y=240+i%3*51;
    ell(c,x,y,67,25,'#c1b8f3a6');disk(c,x,y-10,30,'#907bc6');
    c.strokeStyle='#e9d8ff';c.lineWidth=8;c.beginPath();c.ellipse(x,y,73,20,-.25,0,TAU);c.stroke();
   }break;
  case 17:
   for(let i=0;i<9;i++){const x=shift(i*137),y=149+i%3*42;
    cloud(c,x,y,68,'#323c74d9');
    polygon(c,[[x+7,y+20],[x-12,y+94],[x+7,y+75],[x-1,y+149],[x+37,y+64],[x+17,y+82]],'#ebfaffd7');
   }break;
  case 18:
   for(let i=0;i<11;i++){const x=shift(i*125);
    ell(c,x,378,73,40,'#a6c5ecb4');ell(c,x+4,390,46,20,'#516ea599');
    polygon(c,[[x-73,425],[x-25,289],[x+25,416]],'#e1edff9e');
   }break;
  case 19:
   for(let i=0;i<6;i++){const x=shift(i*215+20),y=248+i%2*28;
    c.strokeStyle='#fbdcff';c.lineWidth=15;c.beginPath();c.moveTo(x,y+140);c.quadraticCurveTo(x+69,y-80,x+137,y+140);c.stroke();
    stroke(c,x+11,y+112,x+129,y+112,'#fffbc9',11);
    for(let k=0;k<5;k++)disk(c,x+20+k*25,y+65-Math.sin(k)*35,4,'#e4ffff');
   }break;
  case 20:
   for(let i=0;i<8;i++){const x=shift(i*142),w=100,h=160+(i%3)*35;
    polygon(c,[[x-50,416],[x-50,416-h],[x,366-h],[x+50,416-h],[x+50,416]],'#987750');
    polygon(c,[[x-60,416-h],[x,332-h],[x+60,416-h]],'#f8e3a1');
    for(let k=0;k<3;k++){stroke(c,x-29+k*29,416-h+18,x-29+k*29,416,'#f8de90',7);}
    disk(c,x,370-h,11,'#fff9ca');
   }break;
 }
}
function drawGroundDecoration(c,x,y,index,p,stage,time){
 const biome=p.biome,s=Math.sin(time*.001+index),color=p.highlight;
 if(stage===1){
  // Primeira visita: prados suaves de flores luminescentes; nenhuma armadilha.
  for(let k=0;k<4;k++){
   stroke(c,x+k*15-20,y,x+k*15-19,y-19-6*Math.sin(k+index),'#6ef0a5',2);
   disk(c,x+k*15-19,y-20-6*Math.sin(k+index),4+k%2,color);
  }
  disk(c,x+30,y-43+s*3,3,'#ebfff3');
 }else if(biome==='asteroids'){
  polygon(c,[[x-38,y],[x-28,y-32],[x,y-42],[x+35,y-10],[x+38,y]],'#6c6879');
  disk(c,x+6,y-18,8,'#b7a89a8a');
 }else if(biome==='ice'){
  polygon(c,[[x-22,y],[x-6,y-55],[x+23,y]],'#e0ffff');
  polygon(c,[[x-3,y-45],[x+23,y],[x+1,y]],'#78c9ec');
 }else if(biome==='forest'){
  stroke(c,x,y,x-8,y-74,'#345d56',10);
  for(const dx of [-26,3,25])disk(c,x+dx,y-75+Math.sin(index+dx)*6,25,stage===11?'#fab5dc':'#61df89');
  if(stage===4){for(let j=0;j<2;j++)disk(c,x+j*22-10,y-26,8,'#ffc5ea');}
 }else if(biome==='portals'){
  c.strokeStyle=color;c.lineWidth=5;c.beginPath();c.ellipse(x,y-54,22,55,0,0,TAU);c.stroke();
  disk(c,x,y-52,9,'#ffffff8a');
 }else if(biome==='lava'){
  polygon(c,[[x-24,y],[x-9,y-72],[x+5,y-50],[x+26,y]],'#42304a');
  stroke(c,x,y-41,x+9,y-17,'#ffb55c',5);
 }else if(biome==='crystals'){
  polygon(c,[[x-22,y],[x-5,y-68],[x+20,y]],'#9fffd4');
  polygon(c,[[x-5,y-68],[x+20,y],[x,y-8]],'#eaffc9');
 }else if(biome==='desert'){
  stroke(c,x,y,x,y-77,'#357e56',11);
  stroke(c,x,y-41,x-18,y-47,'#357e56',8);
  stroke(c,x-18,y-47,x-18,y-67,'#357e56',8);
 }else if(biome==='ocean'||biome==='coral'){
  for(let j=0;j<4;j++){
   const ox=x+j*12-18;
   stroke(c,ox,y,ox+Math.sin(time*.002+j)*8,y-35-j*7,j%2?'#45e9ae':'#6ab9ff',4);
  }
  if(biome==='coral'){
   for(let j=0;j<3;j++)disk(c,x+j*10-9,y-47-(j%2)*12,10,'#ffb5c4');
  }
 }else if(biome==='city'||biome==='ruins'){
  c.fillStyle=stage===20?'#d2b476':'#668ca5';c.fillRect(x-24,y-85,48,85);
  if(stage===12){c.fillStyle='#e6cae3';c.fillRect(x-27,y-89,54,8);}
  else for(let j=0;j<4;j++){c.fillStyle=color;c.fillRect(x-15,y-75+j*18,30,6);}
 }else if(biome==='rings'){
  c.strokeStyle=color;c.lineWidth=5;c.beginPath();c.ellipse(x,y-43,30,13,-.4,0,TAU);c.stroke();
  disk(c,x,y-43,15,'#b5c7e3');
 }else if(biome==='storm'){
  polygon(c,[[x-24,y],[x-6,y-69],[x+17,y]],'#535d91');
  stroke(c,x-5,y-49,x+9,y-20,'#e4ffff',4);
 }else{
  polygon(c,[[x-18,y],[x,y-60],[x+18,y]],color);
 }
}
function groundShade(c,p,stage){
 if(stage===1)return ['#66cb92','#134b63'];
 return ({asteroids:['#ab876f','#3c334e'],ice:['#c6f2ff','#48698f'],
  forest:['#73ce8a','#174846'],portals:['#a289cd','#39295e'],
  lava:['#b24c4c','#291c3c'],crystals:['#67d7a8','#165251'],
  desert:['#f9d496','#985b43'],ocean:['#94e5da','#246d8c'],
  city:['#708fb2','#223652'],ruins:['#baa2d0','#5a4672'],
  coral:['#ffa5c7','#884d86'],rings:['#b6a6d7','#4b467d'],
  storm:['#797dc3','#222653']})[p.biome]||[p.highlight,p.ground];
}
export function drawPlatformPlanet(c,game,time){
 const p=game.planet,stage=p.stage;
 const person=game.astronaut,world=game.surface||{objects:[]};
 const camera=Math.max(0,Math.min(WORLD_LENGTH-960,(person?.x||200)-310));
 game.cameraX=camera;
 drawSky(c,p,stage,time,camera);
 c.save();c.translate(-camera,0);
 // Sombras de colinas de fundo preservam paralaxe sem repetir a mesma imagem.
 for(let i=0;i<12;i++){
  const x=i*240-230+camera*.7;
  polygon(c,[[x-120,470],[x,295+((i*37+stage*17)%85)],[x+160,470]],p.sky+'45');
 }
 for(let i=0;i<18;i++){
  const x=115+i*142;
  if(x<camera-110||x>camera+1100)continue;
  const y=groundAt(x,p.biome,stage)??440;
  drawGroundDecoration(c,x,y,i,p,stage,time);
 }
 const [surfaceColor,deepColor]=groundShade(c,p,stage);
 const fill=c.createLinearGradient(0,405,0,540);fill.addColorStop(0,surfaceColor);fill.addColorStop(1,deepColor);
 const left=Math.floor(camera/8)*8;
 for(let x=left;x<camera+975;x+=8){
  const y=groundAt(x,p.biome,stage);
  if(y===null)continue;
  c.fillStyle=fill;c.fillRect(x,y,9,541-y);
  c.fillStyle=stage===1?'#dbffe6':p.highlight;c.fillRect(x,y,9,3);
  if(x%72<8){c.fillStyle=stage===6?'#fc925b':p.highlight+'6b';c.fillRect(x+2,y+13,5,12);}
 }
 // Buracos ganham bordas visualmente identificáveis, sem perigos na fase 1.
 for(const pit of pitsForStage(stage)){
  if(pit.end<camera-20||pit.start>camera+1000)continue;
  stroke(c,pit.start-2,(groundAt(pit.start-3,p.biome,stage)??440)+4,pit.start+2,490,p.highlight,3);
  stroke(c,pit.end+2,(groundAt(pit.end+3,p.biome,stage)??440)+4,pit.end-2,490,p.highlight,3);
 }
 for(const o of world.objects||[]){
  if(o.x<camera-90||o.x>camera+1060||o.collected)continue;
  if(o.kind==='gem'){
   c.save();c.translate(o.x,o.y);c.rotate(Math.sin(time/340+o.x)*.10);
   polygon(c,[[0,-19],[14,0],[0,18],[-14,0]],'#a1f9fa');
   disk(c,-3,-5,4,'#ffffff');c.restore();
  }else if(o.kind==='checkpoint'){
   stroke(c,o.x,o.y+28,o.x,o.y-31,o.active?'#95ffbd':'#e7f9ff',4);
   disk(c,o.x,o.y-39,11,o.active?'#66ffad':'#b1d1e7');
   c.font='bold 11px system-ui';c.fillStyle='#ffffff';c.fillText('SALVAR',o.x-21,o.y-55);
  }else if(o.kind==='animal'){
   drawPlanetCreature(c,o,time);
  }else if(o.kind==='hazard'||o.kind==='scenery'){
   drawPlanetObstacle(c,o,time);
  }
 }
 // Foguete: os apoios repousam precisamente sobre o terreno real.
 const landY=(groundAt(FLIGHT_PAD_X,p.biome,stage)??440)-28;
 let rocketY=landY;
 if(game.state==='landing')rocketY-=Math.pow(1-game.transitionProgress,2)*245;
 if(game.state==='takeoff')rocketY-=Math.pow(game.transitionProgress,2)*330;
 c.save();c.translate(FLIGHT_PAD_X,rocketY);
 drawRocketModel(c,game.rocketModel.id,{scale:1.03,rotation:-Math.PI/2,thrust:game.state==='landing'||game.state==='takeoff',time});
 if(['disembarking','walking','boarding','landed'].includes(game.state))stroke(c,16,11,46,27,'#f5cf99',3);
 c.restore();c.restore();
 c.font='bold 16px system-ui';c.fillStyle='#ffffff';c.shadowColor='#000';c.shadowBlur=6;
 c.fillText(p.icon+' '+(game.save.planetNames[p.stage]||p.name)+' — EXPLORAÇÃO LIVRE',24,92);
 c.font='12px system-ui';c.fillStyle='#efffff';
 c.fillText(p.landmark,24,113);
 c.shadowBlur=0;
}

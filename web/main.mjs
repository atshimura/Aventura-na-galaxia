import {GameState, WIDTH, HEIGHT, STAGE_SECONDS, REPAIR_COST, normalizePointer, joystickVector, stationPose, sanitizeSave} from './core.mjs';
import {SpaceAudio} from './music.mjs';
const $=id=>document.getElementById(id);
const canvas=$('scene'),ctx=canvas.getContext('2d');
const KEY='aventura-na-galaxia-v1';
function loadSave(){try{return sanitizeSave(JSON.parse(localStorage.getItem(KEY)))}catch{return sanitizeSave(null)}}
let game=new GameState({save:loadSave()});
let toastTimeout=0,framePrevious=0,displayMode='menu';
const audio=new SpaceAudio(window);
let steeringPointer=null,steering={x:0,y:0},keys=new Set();
const stick=$('joystick'),knob=$('joystick-knob');
function resetSteering(){steeringPointer=null;steering={x:0,y:0};knob.style.transform='translate(-50%,-50%)';game.stopSteering();}
function updateStick(e){
  const r=stick.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
  const radius=Math.min(r.width,r.height)*.34;
  steering=joystickVector(x,y,radius);
  const mag=Math.hypot(x,y),scale=mag>radius?radius/mag:1;
  knob.style.transform=`translate(-50%,-50%) translate(${(x*scale).toFixed(1)}px,${(y*scale).toFixed(1)}px)`;
}
stick.addEventListener('pointerdown',e=>{
  if(game.state!=='playing'||steeringPointer!==null)return;
  e.preventDefault();steeringPointer=e.pointerId;stick.setPointerCapture(e.pointerId);updateStick(e);
});
stick.addEventListener('pointermove',e=>{if(e.pointerId===steeringPointer){e.preventDefault();updateStick(e);}});
function releaseStick(e){if(e.pointerId!==steeringPointer)return;resetSteering();if(stick.hasPointerCapture(e.pointerId))stick.releasePointerCapture(e.pointerId);}
stick.addEventListener('pointerup',releaseStick);stick.addEventListener('pointercancel',releaseStick);
stick.addEventListener('lostpointercapture',e=>{if(e.pointerId===steeringPointer)resetSteering();});
function persist(){try{localStorage.setItem(KEY,JSON.stringify(game.save))}catch{/* armazenamento indisponível */}}
function panels(active){
  displayMode=active;
  for(const id of ['menu','pause-menu','result'])$(id).classList.toggle('hidden',active!==id);
  $('hud').classList.toggle('hidden',active!=='playing');
  stick.classList.toggle('hidden',active!=='playing'||game.state!=='playing');
}
function menu(){audio.pause();resetSteering();game.state='menu';panels('menu');$('menu-wallet').textContent=`🪙 ${game.save.wallet} moedas`;$('menu-best').textContent=`🏆 Recorde: ${game.save.best}`;$('sound').textContent=game.save.sound?'🎵 Música e efeitos: ligados':'🔇 Música e efeitos: desligados';}
function begin(){
  audio.setEnabled(game.save.sound);audio.unlock();
  game=new GameState({difficulty:$('difficulty').value,save:game.save});game.start();
  resetSteering();panels('playing');updateHud();framePrevious=performance.now();
}
function result(){audio.pause();persist();const victory=game.state==='victory';panels('result');$('result-icon').textContent=victory?'🛰️':'💥';$('result-title').textContent=victory?'ESTAÇÃO ESPACIAL!':'FIM DE JOGO';$('result-desc').textContent=victory?'Você concluiu a primeira fase e chegou à estação espacial!':'Você perdeu os três corações. Tente novamente a mesma fase!';$('result-score').textContent=game.score;$('result-wallet').textContent=game.save.wallet;$('repair-info').classList.toggle('hidden',!victory);$('repair').classList.toggle('hidden',!victory);$('result-note').textContent=victory?'Esta é a versão inicial: as demais fases serão criadas nas próximas etapas.':'Suas moedas e o recorde ficam guardados para a próxima tentativa.';updateRepair();}
function updateRepair(){$('repair').disabled=game.hearts>=3||game.save.wallet<REPAIR_COST;$('repair').textContent=game.hearts>=3?'❤️ FOGUETE TOTALMENTE CONSERTADO':`🔧 RECUPERAR 1 CORAÇÃO — ${REPAIR_COST} 🪙`;}
function updateHud(){$('hearts').textContent='❤️ '.repeat(game.hearts).trim()+' 🖤'.repeat(3-game.hearts);$('hearts').setAttribute('aria-label',`${game.hearts} vidas restantes`);$('score').textContent=`⭐ ${game.score} ${game.score===1?'PONTO':'PONTOS'}`;$('wallet').textContent=`🪙 ${game.save.wallet}`;$('shield').hidden=!game.shield;$('progress-fill').style.width=`${Math.min(100,game.elapsed/STAGE_SECONDS*100).toFixed(1)}%`;}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');toastTimeout=1.4;}
$('start').addEventListener('click',begin);$('retry').addEventListener('click',begin);$('home').addEventListener('click',menu);$('quit').addEventListener('click',menu);
$('pause').addEventListener('click',()=>{resetSteering();game.pause();audio.pause();panels('pause-menu');});
$('resume').addEventListener('click',()=>{audio.unlock();game.resume();panels('playing');framePrevious=performance.now();});
$('repair').addEventListener('click',()=>{if(game.repair()){persist();$('result-wallet').textContent=game.save.wallet;updateRepair();audio.sound('pickup');}});
$('sound').addEventListener('click',()=>{game.save.sound=!game.save.sound;persist();audio.setEnabled(game.save.sound);menu();});
function updatePointer(e){const p=normalizePointer(e.clientX,e.clientY,canvas.getBoundingClientRect());game.setTarget(p.x,p.y);}
canvas.addEventListener('pointerdown',e=>{if(game.state!=='playing')return;canvas.setPointerCapture(e.pointerId);updatePointer(e);});
canvas.addEventListener('pointermove',e=>{if(game.state==='playing'&&(e.buttons||e.pointerType==='touch'))updatePointer(e);});
canvas.addEventListener('pointerup',e=>{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(game.state==='playing'||game.state==='docking')){$('pause').click();}});
window.addEventListener('blur',()=>{if(game.state==='playing'||game.state==='docking'){$('pause').click();}});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(game.state==='playing'||game.state==='docking'){$('pause').click();}else if(game.state==='paused'){$('resume').click();}}
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){keys.add(e.key);e.preventDefault();}
});
document.addEventListener('keyup',e=>{keys.delete(e.key);});
window.addEventListener('blur',()=>{keys.clear();resetSteering();});
const seeded=(seed)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const rand=seeded(71926);
const stars=Array.from({length:125},(_,i)=>({x:rand()*WIDTH,y:rand()*HEIGHT,r:.6+rand()*1.6,speed:.08+rand()*.30,glow:rand(),phase:rand()*7}));
const planets=[{x:730,y:138,r:115,c1:'#b73fae',c2:'#3b3ca2',speed:.08},{x:150,y:460,r:82,c1:'#32b1b1',c2:'#18467b',speed:.12},{x:1120,y:390,r:58,c1:'#e98d60',c2:'#904071',speed:.1}];
function glow(x,y,r,color){const gr=ctx.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,color);gr.addColorStop(1,'transparent');ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2);}
function background(t){const bg=ctx.createLinearGradient(0,0,0,HEIGHT);bg.addColorStop(0,'#060b29');bg.addColorStop(.5,'#14134e');bg.addColorStop(1,'#0a1744');ctx.fillStyle=bg;ctx.fillRect(0,0,WIDTH,HEIGHT);
  glow(660,150,390,'#5920a650');glow(170,470,315,'#057fba2c');glow(900,510,250,'#ff428020');
  planets.forEach(p=>{let x=((p.x-t*p.speed+290)%(WIDTH+450)+(WIDTH+450))%(WIDTH+450)-230;
    const light=ctx.createRadialGradient(x-p.r*.32,p.y-p.r*.4,3,x,p.y,p.r*1.06);light.addColorStop(0,p.c1);light.addColorStop(.7,p.c2);light.addColorStop(1,'#0b0c30');
    ctx.fillStyle=light;ctx.beginPath();ctx.arc(x,p.y,p.r,0,7);ctx.fill();ctx.strokeStyle='#cda8ef66';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,p.y,p.r*1.36,p.r*.35,-.24,0,2*Math.PI);ctx.stroke();});
  for(const s of stars){const x=((s.x-t*s.speed)%WIDTH+WIDTH)%WIDTH;const alpha=.4+Math.sin(t*.002+s.phase)*.25;ctx.fillStyle=`rgba(218,246,255,${alpha})`;ctx.beginPath();ctx.arc(x,s.y,s.r,0,Math.PI*2);ctx.fill();if(s.glow>.95)glow(x,s.y,11,'#7de9fc44');}
}
function drawRocket(x,y,t,invincible=0,shield=false,docked=false){ctx.save();ctx.translate(x,y);if(invincible>0&&Math.floor(t/95)%2===0)ctx.globalAlpha=.48;
  const thrust=docked?0:14+Math.sin(t/77)*8;const fire=ctx.createLinearGradient(-58,0,-12,0);fire.addColorStop(0,'#f65d42');fire.addColorStop(.4,'#ffa44a');fire.addColorStop(1,'#f7f4bd');ctx.fillStyle=fire;
  if(!docked){ctx.beginPath();ctx.moveTo(-23,-11);ctx.quadraticCurveTo(-45,-8,-56-thrust,0);ctx.quadraticCurveTo(-42,8,-23,11);ctx.fill();}
  ctx.fillStyle='#f95f94';ctx.beginPath();ctx.moveTo(-15,-9);ctx.lineTo(-36,-29);ctx.lineTo(7,-16);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-15,9);ctx.lineTo(-36,29);ctx.lineTo(7,16);ctx.closePath();ctx.fill();
  let body=ctx.createLinearGradient(0,-18,0,18);body.addColorStop(0,'#fbfcff');body.addColorStop(.55,'#b8e6ff');body.addColorStop(1,'#4e97dd');ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-33,-16);ctx.lineTo(17,-16);ctx.quadraticCurveTo(34,-7,43,0);ctx.quadraticCurveTo(34,7,17,16);ctx.lineTo(-33,16);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#77e9ff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#173d85';ctx.beginPath();ctx.arc(5,-1,10,0,7);ctx.fill();ctx.fillStyle='#68eeff';ctx.beginPath();ctx.arc(4,-3,7,0,7);ctx.fill();ctx.fillStyle='#ecfffd';ctx.beginPath();ctx.arc(1,-6,2,0,7);ctx.fill();
  ctx.fillStyle='#fd6c92';ctx.fillRect(-30,-13,10,26);
  if(shield){ctx.strokeStyle='#70eeff';ctx.lineWidth=4;ctx.shadowBlur=19;ctx.shadowColor='#39def9';ctx.beginPath();ctx.arc(0,0,43,0,7);ctx.stroke();}
  ctx.restore();}
function asteroid(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);let gr=ctx.createLinearGradient(-o.r,-o.r,o.r,o.r);gr.addColorStop(0,'#e7b3a9');gr.addColorStop(.5,'#a2768a');gr.addColorStop(1,'#513d66');ctx.fillStyle=gr;ctx.strokeStyle='#ffb7a077';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=o.r*(.85+.15*Math.sin(i*7+o.id*20));const px=Math.cos(a)*r,py=Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#58466388';for(const [a,b,r] of [[-.3,-.2,.22],[.32,.23,.17],[-.23,.38,.12]]){ctx.beginPath();ctx.arc(o.r*a,o.r*b,o.r*r,0,7);ctx.fill();}ctx.restore();}
/** Satélite com painéis fotovoltaicos, células, antena e carcaça metálica. */
function satellite(o){
  ctx.save();ctx.translate(o.x,o.y);ctx.rotate(Math.sin(o.x*.003+o.id*9)*.06);
  ctx.shadowColor='#70b9f9';ctx.shadowBlur=13;
  for(const side of [-1,1]){
    const x=side*21-(side<0?32:0),w=32;
    const gr=ctx.createLinearGradient(x,-17,x+32,17);
    gr.addColorStop(0,'#153966');gr.addColorStop(.5,'#356eb2');gr.addColorStop(1,'#0b183b');
    ctx.fillStyle=gr;ctx.strokeStyle='#a4bbcf';ctx.lineWidth=2;ctx.fillRect(x,-17,w,34);ctx.strokeRect(x,-17,w,34);
    ctx.shadowBlur=0;ctx.strokeStyle='#66b7ec99';ctx.lineWidth=.8;
    for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*8,-16);ctx.lineTo(x+i*8,16);ctx.stroke();}
    for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(x,-17+i*11.3);ctx.lineTo(x+w,-17+i*11.3);ctx.stroke();}
  }
  ctx.strokeStyle='#c6d8ef';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-21,0);ctx.lineTo(21,0);ctx.stroke();
  const metal=ctx.createLinearGradient(-12,-14,13,14);
  metal.addColorStop(0,'#f0f4ff');metal.addColorStop(.45,'#879dbb');metal.addColorStop(1,'#384761');
  ctx.fillStyle=metal;ctx.strokeStyle='#ddefff';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(-14,-13,28,26,6);ctx.fill();ctx.stroke();
  ctx.fillStyle='#d2ad62';ctx.fillRect(-8,-8,16,16);
  ctx.strokeStyle='#cedbeb';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(3,-25);ctx.stroke();
  ctx.beginPath();ctx.ellipse(3,-27,10,4,-.25,0,Math.PI);ctx.stroke();
  ctx.fillStyle='#73eaff';ctx.shadowColor='#41cbf4';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(0,8,2.8,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
/** Casco graduado, asas com relevos, cabine de vidro e motores alienígenas. */
function ship(o){
  ctx.save();ctx.translate(o.x,o.y);ctx.rotate(Math.sin(o.x*.004+o.id*8)*.04);
  ctx.shadowColor='#6ae7f1';ctx.shadowBlur=13;
  const wing=ctx.createLinearGradient(-31,-26,23,23);
  wing.addColorStop(0,'#c27fda');wing.addColorStop(.45,'#6e428c');wing.addColorStop(1,'#202952');
  ctx.fillStyle=wing;ctx.strokeStyle='#a5d5e9';ctx.lineWidth=1.7;
  ctx.beginPath();ctx.moveTo(-28,-9);ctx.lineTo(-10,-27);ctx.lineTo(19,-20);ctx.lineTo(13,-9);ctx.lineTo(31,0);ctx.lineTo(13,9);ctx.lineTo(19,20);ctx.lineTo(-10,27);ctx.lineTo(-28,9);ctx.lineTo(-12,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.shadowBlur=0;
  ctx.fillStyle='#26394f';ctx.beginPath();ctx.moveTo(-23,-8);ctx.quadraticCurveTo(8,-15,28,0);ctx.quadraticCurveTo(8,15,-23,8);ctx.closePath();ctx.fill();
  const hull=ctx.createLinearGradient(0,-12,0,12);hull.addColorStop(0,'#def5fd');hull.addColorStop(.5,'#7b9eac');hull.addColorStop(1,'#34446d');
  ctx.fillStyle=hull;ctx.beginPath();ctx.ellipse(0,0,25,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#0b4865';ctx.beginPath();ctx.ellipse(8,-2,10,6,-.1,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#92f9fc';ctx.beginPath();ctx.ellipse(9,-3,6,3,-.1,0,Math.PI*2);ctx.fill();
  for(const y of [-8,8]){ctx.shadowBlur=8;ctx.shadowColor='#41eefa';ctx.fillStyle='#39d3e6';ctx.beginPath();ctx.arc(-25,y,3.4,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
function coin(o,t){ctx.save();ctx.translate(o.x,o.y);ctx.scale(.70+.3*Math.abs(Math.cos(o.rot)),1);ctx.shadowBlur=15;ctx.shadowColor='#ffcf51';ctx.fillStyle='#ffb72c';ctx.beginPath();ctx.arc(0,0,16,0,7);ctx.fill();ctx.shadowBlur=0;ctx.lineWidth=3;ctx.strokeStyle='#ffe79d';ctx.beginPath();ctx.arc(0,0,12,0,7);ctx.stroke();ctx.fillStyle='#fff1bc';ctx.font='bold 19px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',0,0);ctx.restore();}
function crate(o,t){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(Math.sin(t/400)*.1);ctx.shadowColor='#93f3ff';ctx.shadowBlur=19;ctx.fillStyle='#6a47c9';ctx.strokeStyle='#91efff';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(-19,-19,38,38,8);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',0,-1);ctx.restore();}
/** Estação surge e cresce durante os últimos oito segundos da fase. */
function station(t){
 const pose=stationPose(game.state==='victory'?1:game.dockingProgress);
 ctx.save();ctx.translate(pose.x,pose.y);ctx.scale(pose.scale,pose.scale);
 glow(0,0,225,'#27bfe133');
 ctx.strokeStyle='#8798b8';ctx.lineWidth=12;ctx.beginPath();ctx.ellipse(0,0,120,123,-.4,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle='#93eafa88';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,121,124,-.4,0,Math.PI*2);ctx.stroke();
 const solar=ctx.createLinearGradient(-145,-26,145,26);solar.addColorStop(0,'#122e68');solar.addColorStop(.5,'#3e6caf');solar.addColorStop(1,'#122e68');
 for(const side of [-1,1]){
   ctx.fillStyle=solar;ctx.strokeStyle='#90c8e4';ctx.lineWidth=3;
   ctx.fillRect(side<0?-218:78,-30,140,60);ctx.strokeRect(side<0?-218:78,-30,140,60);
   ctx.lineWidth=1;
   for(let i=1;i<=6;i++){const x=(side<0?-218:78)+i*20;ctx.beginPath();ctx.moveTo(x,-30);ctx.lineTo(x,30);ctx.stroke();}
   for(let i=-10;i<=10;i+=20){ctx.beginPath();ctx.moveTo(side<0?-218:78,i);ctx.lineTo(side<0?-78:218,i);ctx.stroke();}
 }
 ctx.fillStyle='#92a8c8';ctx.fillRect(-100,-7,200,14);
 const metal=ctx.createLinearGradient(-50,-92,78,91);metal.addColorStop(0,'#cce7f8');metal.addColorStop(.4,'#6387a6');metal.addColorStop(1,'#1a3158');
 ctx.fillStyle=metal;ctx.strokeStyle='#b7e5f5';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,79,94,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#203a60';ctx.beginPath();ctx.ellipse(0,0,52,56,0,0,7);ctx.fill();ctx.strokeStyle='#97dcfa';ctx.lineWidth=4;ctx.stroke();
 ctx.fillStyle='#9af4f9';ctx.beginPath();ctx.arc(0,-15,15,0,7);ctx.fill();
 for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.fillStyle=i%2?'#ffbd81':'#b6fcff';ctx.beginPath();ctx.arc(Math.cos(a)*64,Math.sin(a)*76,3.5,0,7);ctx.fill();}
 // Porta de acoplagem à esquerda; a nave encerra a fase dentro dela.
 ctx.fillStyle='#748fad';ctx.fillRect(-115,-17,53,39);
 ctx.fillStyle='#102b4f';ctx.fillRect(-120,-14,43,33);
 ctx.strokeStyle='#86edff';ctx.lineWidth=3;ctx.strokeRect(-120,-14,43,33);
 ctx.fillStyle='#8df7ff';ctx.fillRect(-116,0,33,3);
 if(game.dockingProgress>.82){ctx.fillStyle='#61fcbe';ctx.beginPath();ctx.arc(-119,-20,4,0,7);ctx.fill();}
 ctx.restore();
}
function render(t){
 const active=['playing','paused','docking','gameover','victory'].includes(game.state);
 const shift=active?game.distance:t*.04;background(shift);
 if(active){
   const fade=game.state==='docking'?Math.max(0,1-game.dockingProgress*2):1;
   ctx.save();ctx.globalAlpha=fade;
   for(const o of game.objects){if(o.kind==='asteroid')asteroid(o);else if(o.kind==='satellite')satellite(o);else if(o.kind==='ship')ship(o);else if(o.kind==='coin')coin(o,t);else if(o.kind==='crate')crate(o,t);}
   ctx.restore();
   if(game.dockingProgress>0||game.state==='victory')station(t);
   const docked=game.state==='victory';
   drawRocket(game.rocket.x,game.rocket.y+(docked?0:Math.sin(t/155)*2),t,docked?0:game.invincible,game.shield,docked);
   if(game.state==='playing'&&game.invincible>1.4){ctx.fillStyle='#fa537716';ctx.fillRect(0,0,WIDTH,HEIGHT);}
 }else drawRocket(190,330+Math.sin(t/400)*12,t);
}
function loop(now){
 const dt=framePrevious?Math.min(.05,(now-framePrevious)/1000):0;framePrevious=now;
 if(game.state==='playing'){
   const keyboard={x:Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a')),
     y:Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'))};
   const input=steeringPointer!==null?steering:keyboard;
   const mag=Math.hypot(input.x,input.y);
   if(mag>.0001)game.steer({x:input.x/Math.max(1,mag),y:input.y/Math.max(1,mag)},dt);
 }
 if(game.state==='playing'||game.state==='docking'){
   const previous=game.state;game.update(dt);let dirty=false;
   for(const event of game.events){
     if(event==='Moeda coletada!'){dirty=true;audio.sound('pickup');}
     else if(event==='Colisão!')audio.sound('hit');
     else if(['Escudo ativado!','Coração recuperado!','Invencibilidade!'].includes(event)){audio.sound('crate');toast(event);}
     else if(event==='Aproximação à estação espacial!'){resetSteering();audio.sound('dock');toast('🛰️ Aproximando da estação!');panels('playing');}
     else if(event==='Fase concluída!')audio.sound('win');
   }
   if(dirty||previous!==game.state)persist();
   updateHud();
   if(game.state==='gameover'||game.state==='victory'){resetSteering();audio.pause();result();}
 }
 audio.tick(game.state==='playing'||game.state==='docking');
 if(toastTimeout>0){toastTimeout-=dt;if(toastTimeout<=0)$('toast').classList.remove('visible');}
 render(now);requestAnimationFrame(loop);
}
menu();requestAnimationFrame(loop);
// Somente para testes de integração no navegador; não modifica a interface.
if(typeof window!=='undefined'&&new URLSearchParams(location.search).has('test'))window.__gameTest={get game(){return game},get steering(){return steering},begin,menu};


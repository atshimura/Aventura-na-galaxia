import {GameState, WIDTH, HEIGHT, STAGE_SECONDS, REPAIR_COST, normalizePointer, sanitizeSave} from './core.mjs';
const $=id=>document.getElementById(id);
const canvas=$('scene'),ctx=canvas.getContext('2d');
const KEY='aventura-na-galaxia-v1';
function loadSave(){try{return sanitizeSave(JSON.parse(localStorage.getItem(KEY)))}catch{return sanitizeSave(null)}}
let game=new GameState({save:loadSave()});
let toastTimeout=0,framePrevious=0,displayMode='menu',audio=null,lastBeat=-1;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(game.save))}catch{/* armazenamento indisponível */}}
function panels(active){displayMode=active;for(const id of ['menu','pause-menu','result'])$(id).classList.toggle('hidden',active!==id);$('hud').classList.toggle('hidden',active!=='playing');}
function menu(){game.state='menu';panels('menu');$('menu-wallet').textContent=`🪙 ${game.save.wallet} moedas`;$('menu-best').textContent=`🏆 Recorde: ${game.save.best}`;$('sound').textContent=game.save.sound?'🔊 Som ligado':'🔇 Som desligado';}
function begin(){initAudio();game=new GameState({difficulty:$('difficulty').value,save:game.save});game.start();panels('playing');updateHud();framePrevious=performance.now();}
function result(){persist();const victory=game.state==='victory';panels('result');$('result-icon').textContent=victory?'🛰️':'💥';$('result-title').textContent=victory?'ESTAÇÃO ESPACIAL!':'FIM DE JOGO';$('result-desc').textContent=victory?'Você concluiu a primeira fase e chegou à estação espacial!':'Você perdeu os três corações. Tente novamente a mesma fase!';$('result-score').textContent=game.score;$('result-wallet').textContent=game.save.wallet;$('repair-info').classList.toggle('hidden',!victory);$('repair').classList.toggle('hidden',!victory);$('result-note').textContent=victory?'Esta é a versão inicial: as demais fases serão criadas nas próximas etapas.':'Suas moedas e o recorde ficam guardados para a próxima tentativa.';updateRepair();}
function updateRepair(){$('repair').disabled=game.hearts>=3||game.save.wallet<REPAIR_COST;$('repair').textContent=game.hearts>=3?'❤️ FOGUETE TOTALMENTE CONSERTADO':`🔧 RECUPERAR 1 CORAÇÃO — ${REPAIR_COST} 🪙`;}
function updateHud(){$('hearts').textContent='❤️ '.repeat(game.hearts).trim()+' 🖤'.repeat(3-game.hearts);$('hearts').setAttribute('aria-label',`${game.hearts} vidas restantes`);$('score').textContent=`⭐ ${game.score} ${game.score===1?'PONTO':'PONTOS'}`;$('wallet').textContent=`🪙 ${game.save.wallet}`;$('shield').hidden=!game.shield;$('progress-fill').style.width=`${Math.min(100,game.elapsed/STAGE_SECONDS*100).toFixed(1)}%`;}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');toastTimeout=1.4;}
$('start').addEventListener('click',begin);$('retry').addEventListener('click',begin);$('home').addEventListener('click',menu);$('quit').addEventListener('click',menu);
$('pause').addEventListener('click',()=>{game.pause();panels('pause-menu');});$('resume').addEventListener('click',()=>{game.resume();panels('playing');framePrevious=performance.now();});
$('repair').addEventListener('click',()=>{if(game.repair()){persist();$('result-wallet').textContent=game.save.wallet;updateRepair();sound('pickup');}});
$('sound').addEventListener('click',()=>{game.save.sound=!game.save.sound;persist();menu();if(game.save.sound)initAudio();});
function updatePointer(e){const p=normalizePointer(e.clientX,e.clientY,canvas.getBoundingClientRect());game.setTarget(p.x,p.y);}
canvas.addEventListener('pointerdown',e=>{if(game.state!=='playing')return;canvas.setPointerCapture(e.pointerId);updatePointer(e);});
canvas.addEventListener('pointermove',e=>{if(game.state==='playing'&&(e.buttons||e.pointerType==='touch'))updatePointer(e);});
canvas.addEventListener('pointerup',e=>{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.state==='playing'){game.pause();panels('pause-menu');}});
window.addEventListener('blur',()=>{if(game.state==='playing'){game.pause();panels('pause-menu');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(game.state==='playing'){$('pause').click();}else if(game.state==='paused'){$('resume').click();}}});
// Música sintetizada, sem arquivos externos e sem conexão à internet.
function initAudio(){if(!game.save.sound)return;try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext){audio??=new AudioContext();audio.resume().catch(()=>{});}}catch{audio=null}}
function beep(hz,length=.12,kind='sine',vol=.045,when=0){if(!game.save.sound||!audio||audio.state!=='running')return;try{const now=audio.currentTime+when,o=audio.createOscillator(),g=audio.createGain();o.type=kind;o.frequency.setValueAtTime(hz,now);g.gain.setValueAtTime(0.0001,now);g.gain.exponentialRampToValueAtTime(vol,now+.018);g.gain.exponentialRampToValueAtTime(.0001,now+length);o.connect(g).connect(audio.destination);o.start(now);o.stop(now+length+.02);}catch{}}
function sound(kind){if(kind==='pickup'){beep(730,.1,'triangle');beep(1080,.17,'sine',.03,.07);}else if(kind==='hit'){beep(130,.38,'sawtooth',.065);}else if(kind==='crate'){beep(540,.17,'triangle');beep(830,.25,'triangle',.045,.14);}else if(kind==='win'){[392,523,659,784].forEach((f,i)=>beep(f,.33,'triangle',.07,i*.16));}}
function music(){if(!audio||!game.save.sound||game.state!=='playing')return;const beat=Math.floor(game.elapsed*2.4);if(beat!==lastBeat){lastBeat=beat;const notes=[196,247,294,392,330,294,247,220];beep(notes[beat%notes.length],.27,'sine',.019);if(beat%4===0)beep(98,.5,'triangle',.014);}}
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
function drawRocket(x,y,t,invincible=0,shield=false){ctx.save();ctx.translate(x,y);if(invincible>0&&Math.floor(t/95)%2===0)ctx.globalAlpha=.48;
  const thrust=14+Math.sin(t/77)*8;const fire=ctx.createLinearGradient(-58,0,-12,0);fire.addColorStop(0,'#f65d42');fire.addColorStop(.4,'#ffa44a');fire.addColorStop(1,'#f7f4bd');ctx.fillStyle=fire;
  ctx.beginPath();ctx.moveTo(-23,-11);ctx.quadraticCurveTo(-45,-8,-56-thrust,0);ctx.quadraticCurveTo(-42,8,-23,11);ctx.fill();
  ctx.fillStyle='#f95f94';ctx.beginPath();ctx.moveTo(-15,-9);ctx.lineTo(-36,-29);ctx.lineTo(7,-16);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-15,9);ctx.lineTo(-36,29);ctx.lineTo(7,16);ctx.closePath();ctx.fill();
  let body=ctx.createLinearGradient(0,-18,0,18);body.addColorStop(0,'#fbfcff');body.addColorStop(.55,'#b8e6ff');body.addColorStop(1,'#4e97dd');ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-33,-16);ctx.lineTo(17,-16);ctx.quadraticCurveTo(34,-7,43,0);ctx.quadraticCurveTo(34,7,17,16);ctx.lineTo(-33,16);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#77e9ff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#173d85';ctx.beginPath();ctx.arc(5,-1,10,0,7);ctx.fill();ctx.fillStyle='#68eeff';ctx.beginPath();ctx.arc(4,-3,7,0,7);ctx.fill();ctx.fillStyle='#ecfffd';ctx.beginPath();ctx.arc(1,-6,2,0,7);ctx.fill();
  ctx.fillStyle='#fd6c92';ctx.fillRect(-30,-13,10,26);
  if(shield){ctx.strokeStyle='#70eeff';ctx.lineWidth=4;ctx.shadowBlur=19;ctx.shadowColor='#39def9';ctx.beginPath();ctx.arc(0,0,43,0,7);ctx.stroke();}
  ctx.restore();}
function asteroid(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);let gr=ctx.createLinearGradient(-o.r,-o.r,o.r,o.r);gr.addColorStop(0,'#e7b3a9');gr.addColorStop(.5,'#a2768a');gr.addColorStop(1,'#513d66');ctx.fillStyle=gr;ctx.strokeStyle='#ffb7a077';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=o.r*(.85+.15*Math.sin(i*7+o.id*20));const px=Math.cos(a)*r,py=Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#58466388';for(const [a,b,r] of [[-.3,-.2,.22],[.32,.23,.17],[-.23,.38,.12]]){ctx.beginPath();ctx.arc(o.r*a,o.r*b,o.r*r,0,7);ctx.fill();}ctx.restore();}
function satellite(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot*.35);ctx.strokeStyle='#8ee7ff';ctx.lineWidth=2;ctx.fillStyle='#1d5895';ctx.fillRect(-35,-15,23,30);ctx.fillRect(12,-15,23,30);ctx.strokeRect(-35,-15,23,30);ctx.strokeRect(12,-15,23,30);ctx.fillStyle='#edf8ff';ctx.fillRect(-12,-10,24,20);ctx.fillStyle='#e7c159';ctx.fillRect(-8,-7,16,14);ctx.strokeStyle='#76d6f8';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,-27);ctx.stroke();ctx.restore();}
function ship(o){ctx.save();ctx.translate(o.x,o.y);ctx.fillStyle='#f35695';ctx.strokeStyle='#ffe1f6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-28,-13);ctx.lineTo(7,-16);ctx.lineTo(30,0);ctx.lineTo(7,16);ctx.lineTo(-28,13);ctx.lineTo(-11,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#a1f4ff';ctx.beginPath();ctx.ellipse(5,0,10,7,0,0,7);ctx.fill();ctx.restore();}
function coin(o,t){ctx.save();ctx.translate(o.x,o.y);ctx.scale(.70+.3*Math.abs(Math.cos(o.rot)),1);ctx.shadowBlur=15;ctx.shadowColor='#ffcf51';ctx.fillStyle='#ffb72c';ctx.beginPath();ctx.arc(0,0,16,0,7);ctx.fill();ctx.shadowBlur=0;ctx.lineWidth=3;ctx.strokeStyle='#ffe79d';ctx.beginPath();ctx.arc(0,0,12,0,7);ctx.stroke();ctx.fillStyle='#fff1bc';ctx.font='bold 19px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',0,0);ctx.restore();}
function crate(o,t){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(Math.sin(t/400)*.1);ctx.shadowColor='#93f3ff';ctx.shadowBlur=19;ctx.fillStyle='#6a47c9';ctx.strokeStyle='#91efff';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(-19,-19,38,38,8);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',0,-1);ctx.restore();}
function station(t){const x=WIDTH-Math.max(0,game.elapsed-STAGE_SECONDS+5)*50;ctx.save();ctx.translate(x,HEIGHT/2);glow(0,0,145,'#24d9f951');ctx.fillStyle='#436aab';ctx.strokeStyle='#96eeff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,85,110,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#a1c8ff';ctx.fillRect(-135,-20,270,40);ctx.fillStyle='#2b5c9a';ctx.fillRect(-148,-14,296,28);ctx.fillStyle='#deedff';ctx.beginPath();ctx.arc(0,0,50,0,7);ctx.fill();ctx.fillStyle='#274c90';ctx.beginPath();ctx.arc(0,0,36,0,7);ctx.fill();ctx.fillStyle='#8af3ff';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('★',0,12);ctx.restore();}
function render(t){const shift=(game.state==='playing'||game.state==='paused'||game.state==='victory'||game.state==='gameover')?game.distance:t*.04;background(shift);
 if(game.state==='playing'||game.state==='paused'||game.state==='gameover'||game.state==='victory'){
   for(const o of game.objects){if(o.kind==='asteroid')asteroid(o);else if(o.kind==='satellite')satellite(o);else if(o.kind==='ship')ship(o);else if(o.kind==='coin')coin(o,t);else if(o.kind==='crate')crate(o,t);}
   if(game.state==='victory')station(t);
   drawRocket(game.rocket.x,game.rocket.y+Math.sin(t/155)*2,t,game.invincible,game.shield);
   if(game.state==='playing'&&game.invincible>1.4){ctx.fillStyle='#fa537716';ctx.fillRect(0,0,WIDTH,HEIGHT);}
 }else{drawRocket(190,330+Math.sin(t/400)*12,t);}
}
function loop(now){const dt=framePrevious?(now-framePrevious)/1000:0;framePrevious=now;if(game.state==='playing'){
    const old=game.state;game.update(dt);music();let dirty=false;
    for(const event of game.events){if(event==='Moeda coletada!'){dirty=true;sound('pickup');}else if(event==='Colisão!')sound('hit');else if(['Escudo ativado!','Coração recuperado!','Invencibilidade!'].includes(event)){sound('crate');toast(event);}else if(event==='Fase concluída!')sound('win');}
    if(dirty||old!==game.state)persist();updateHud();if(game.state==='gameover'||game.state==='victory')result();}
  if(toastTimeout>0){toastTimeout-=Math.min(dt,.06);if(toastTimeout<=0)$('toast').classList.remove('visible');}
  render(now);requestAnimationFrame(loop);}
menu();requestAnimationFrame(loop);
// Somente para testes de integração no navegador; não modifica a interface.
if(typeof window!=='undefined'&&new URLSearchParams(location.search).has('test'))window.__gameTest={get game(){return game},begin,menu};


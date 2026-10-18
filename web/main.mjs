import {GameState, WIDTH, HEIGHT, STAGE_SECONDS, REPAIR_COST, TOTAL_STAGES, STAGES, canPlayStage, normalizePointer, joystickVector, stationPose, sanitizeSave} from './core.mjs';
import {SpaceAudio} from './music-v2.mjs';
import {drawPlatformPlanet} from './platformer-render.mjs';
import {GALAXY_WIDTH,GALAXY_POINTS,getMapStatus,mapStartScroll,drawGalaxyRoute,drawPlanetPortrait} from './galaxy-map.mjs';
import {FLIGHT_PAD_X,canBoard} from './platformer.mjs';
import {ROCKETS,rocketById,sanitizeRockets} from './rockets.mjs';
import {drawRocketModel} from './rocket-render.mjs';
import {getPlanet} from './world.mjs';
import {drawSpaceEnvironment,drawPlanetEnvironment,drawPlanetApproach,drawHazard,drawGem} from './world-render.mjs';
const $=id=>document.getElementById(id);
const canvas=$('scene'),ctx=canvas.getContext('2d');
const KEY='aventura-na-galaxia-v1';
function loadSave(){try{return sanitizeSave(JSON.parse(localStorage.getItem(KEY)))}catch{return sanitizeSave(null)}}
let game=new GameState({save:loadSave()});
let selectedStage=Math.min(TOTAL_STAGES,game.save.completed+1);
let previewStage=selectedStage,previewOldStage=selectedStage,previewChangedAt=0;
function syncMenuPreview(){
 if(previewStage===selectedStage)return;
 previewOldStage=previewStage;previewStage=selectedStage;
 previewChangedAt=performance.now();
}
function configureStageSelect(){
 const sel=$('stage-select'),options=[];
 for(const stage of STAGES){
   const unlocked=canPlayStage(game.save,stage.number),crown=stage.number<=game.save.completed?' ✅':'';
   options.push(`<option value="${stage.number}" ${unlocked?'':'disabled'}>${stage.number}. ${stage.name}${crown}${unlocked?'':' 🔒'}</option>`);
 }
 sel.innerHTML=options.join('');
 selectedStage=canPlayStage(game.save,selectedStage)?selectedStage:Math.min(TOTAL_STAGES,game.save.completed+1);
 sel.value=String(selectedStage);
 syncMenuPreview();
 const p=getPlanet(selectedStage),name=game.save.planetNames[selectedStage]||p.name;
 $('stage-info').textContent=`${STAGES[selectedStage-1].icon} ${STAGES[selectedStage-1].name} • 🪐 ${name} ${game.save.exploredPlanets[selectedStage]?'✓ visitado':'por descobrir'}`;
 $('start').textContent=`🚀 JOGAR — FASE ${selectedStage}`;
}
$('stage-select').addEventListener('change',e=>{selectedStage=Number(e.target.value);configureStageSelect();});
let toastTimeout=0,framePrevious=0,displayMode='menu';
const audio=new SpaceAudio(window);
const volumeSetting={music:94,effects:72};
function bindVolume(id,type){
 const el=$(id);el.addEventListener('input',e=>{
   const v=Number(e.target.value)/100;volumeSetting[type]=Math.round(v*100);
   if(type==='music')audio.setVolume(v);else audio.setEffectsVolume(v);
 });
}
bindVolume('music-volume','music');bindVolume('effects-volume','effects');

let keys=new Set();
const flightStick=$('joystick');
const walkStick=$('walk-joystick');
function createVirtualStick(element,knob,mode){
 const state={element,knob,mode,pointerId:null,value:{x:0,y:0}};
 function update(event){
   const bounds=element.getBoundingClientRect();
   const radius=Math.max(1,Math.min(bounds.width,bounds.height)*.38);
   const dx=event.clientX-(bounds.left+bounds.width/2);
   const dy=event.clientY-(bounds.top+bounds.height/2);
   // Na caminhada só existe movimento horizontal. A zona morta é menor
   // para reconhecer imediatamente gestos curtos do polegar.
   const vector=mode==='walk'?joystickVector(dx,0,radius,.075):joystickVector(dx,dy,radius,.10);
   state.value=mode==='walk'?{x:vector.x,y:0}:vector;
   const mag=Math.hypot(dx,dy),ratio=mag>radius?radius/mag:1;
   const ox=mode==='walk'?Math.max(-radius,Math.min(radius,dx)):dx*ratio;
   const oy=mode==='walk'?0:dy*ratio;
   knob.style.transform=`translate(-50%,-50%) translate(${ox.toFixed(1)}px,${oy.toFixed(1)}px)`;
 }
 function clear(){
   const old=state.pointerId;state.pointerId=null;state.value={x:0,y:0};
   knob.style.transform='translate(-50%,-50%)';
   if(old!==null&&element.hasPointerCapture?.(old))element.releasePointerCapture(old);
   if(mode==='walk')game.walkAxis=0;
 }
 element.addEventListener('pointerdown',event=>{
   if(game.state!==(mode==='walk'?'walking':'playing')||state.pointerId!==null)return;
   event.preventDefault();state.pointerId=event.pointerId;
   element.setPointerCapture(event.pointerId);update(event);
 });
 element.addEventListener('pointermove',event=>{
   if(event.pointerId!==state.pointerId)return;
   event.preventDefault();update(event);
 });
 function finish(event){if(event.pointerId===state.pointerId)clear();}
 element.addEventListener('pointerup',finish);
 element.addEventListener('pointercancel',finish);
 element.addEventListener('lostpointercapture',finish);
 return {...state, get pointer(){return state.pointerId;},get direction(){return state.value;},clear};
}
const flightControl=createVirtualStick(flightStick,$('joystick-knob'),'flight');
const walkControl=createVirtualStick(walkStick,$('walk-joystick-knob'),'walk');
function resetSteering(){flightControl.clear();walkControl.clear();game.stopSteering();}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(game.save))}catch{/* armazenamento indisponível */}}
function panels(active){
  displayMode=active;
  for(const id of ['menu','pause-menu','result','planet-name','shop','galaxy-map'])$(id).classList.toggle('hidden',active!==id);
  $('hud').classList.toggle('hidden',active!=='playing');
  flightStick.classList.toggle('hidden',active!=='playing'||game.state!=='playing');
  walkStick.classList.toggle('hidden',active!=='playing'||game.state!=='walking');
  $('explore-btn').classList.toggle('hidden',active!=='playing'||!game.canExplorePlanet());
  $('leave-rocket').classList.toggle('hidden',active!=='playing'||game.state!=='landed');
  $('board-rocket').classList.toggle('hidden',active!=='playing'||game.state!=='walking'||!canBoard(game.astronaut));
  $('jump-btn').classList.toggle('hidden',active!=='playing'||game.state!=='walking');
}
function menu(){
 audio.pause();resetSteering();game.state='menu';panels('menu');configureStageSelect();
 $('menu-wallet').textContent=`🪙 ${game.save.wallet} moedas`;
 $('menu-best').textContent=`🏆 Recorde: ${game.save.best}`;
 $('menu-infinite').textContent=`♾️ ${game.save.bestInfinite||0}`;
 $('rocket-equipped').textContent=`🚀 Nave equipada: ${rocketById(game.save.selectedRocket).name}`;
 $('sound').textContent=game.save.sound?'🎵 Música e efeitos: ligados':'🔇 Música e efeitos: desligados';
}
function showShop(){
 audio.pause();resetSteering();game.state='menu';panels('shop');
 $('shop-wallet').textContent=`🪙 ${game.save.wallet} moedas disponíveis`;
 const unlocked=sanitizeRockets(game.save.unlockedRockets);
 $('rocket-list').innerHTML=ROCKETS.map(r=>{
   const owned=unlocked.includes(r.id),active=game.save.selectedRocket===r.id;
   return `<div class="rocket-entry" style="--rocket-color:${r.primary}">
      <div class="rocket-icon"><canvas class="rocket-preview" width="116" height="88" data-rocket-preview="${r.id}" aria-label="Ilustração do foguete ${r.name}"></canvas></div><div><div class="rocket-title">${r.name}</div><div class="rocket-sub">${r.description}</div></div>
      <button data-rocket="${r.id}" class="secondary" ${active||(!owned&&game.save.wallet<r.cost)?'disabled':''}>${active?'✓ EM USO':owned?'USAR':`🪙 ${r.cost}`}</button>
    </div>`;
 }).join('');
 for(const canvas of $('rocket-list').querySelectorAll('[data-rocket-preview]')){
   const g=canvas.getContext('2d');if(!g)continue;
   drawRocketModel(g,canvas.dataset.rocketPreview,{x:58,y:44,scale:1.03,rotation:-Math.PI/2,thrust:false});
 }
}
function begin(stage=selectedStage,mode='adventure'){
 audio.setEnabled(game.save.sound);audio.unlock();
 if(mode==='adventure'&&!canPlayStage(game.save,stage))return;
 if(mode==='adventure')selectedStage=stage;
 game=new GameState({difficulty:$('difficulty').value,save:game.save,stage:mode==='infinite'?1:stage,mode});
 game.start();resetSteering();panels('playing');updateHud();framePrevious=performance.now();
}
function result(){
 audio.pause();persist();const victory=game.state==='victory',stage=game.stage,infinite=game.mode==='infinite';
 panels('result');
 $('result-icon').textContent=infinite?'♾️':victory?(stage.number===TOTAL_STAGES?'🏆':'🛰️'):'💥';
 $('result-title').textContent=infinite?'FIM DO VOO INFINITO':victory?(stage.number===TOTAL_STAGES?'ESTAÇÃO LENDÁRIA!':`FASE ${stage.number} CONCLUÍDA!`):'FIM DE JOGO';
 $('result-desc').textContent=infinite?`Você voou ${Math.floor(game.elapsed)} segundos e coletou ${game.score} moedas! Recorde infinito: ${game.save.bestInfinite}.`:victory?`Você atravessou ${stage.name} e estacionou! ${game.planetVisited?'🪐 Planeta explorado.':'Ainda há um planeta para visitar nesta fase.'}`:`Você perdeu os três corações na fase ${stage.number}. Pode tentar novamente!`;
 $('result-score').textContent=game.score;$('result-wallet').textContent=game.save.wallet;
 $('repair-info').classList.toggle('hidden',!victory);$('repair').classList.toggle('hidden',!victory);
 $('next-stage').classList.toggle('hidden',infinite||!victory||stage.number===TOTAL_STAGES);
 $('retry').textContent=infinite?'♾️ JOGAR INFINITO NOVAMENTE':`🔄 REPETIR FASE ${stage.number}`;
 $('result-note').textContent=infinite?'Moedas e recorde do Modo Infinito salvos.':victory?(stage.number===TOTAL_STAGES?'🏆 Galáxia das Maravilhas desbloqueada! Sua exploração será ampliada em uma próxima atualização.':`🌟 ${STAGES[stage.number].name} desbloqueada!`):'Seu progresso, moedas e recordes estão salvos.';
 updateRepair();
}
function updateRepair(){$('repair').disabled=game.hearts>=3||game.save.wallet<REPAIR_COST;$('repair').textContent=game.hearts>=3?'❤️ FOGUETE TOTALMENTE CONSERTADO':`🔧 RECUPERAR 1 CORAÇÃO — ${REPAIR_COST} 🪙`;}
function updateHud(){
 $('hearts').textContent='❤️ '.repeat(game.hearts).trim()+' 🖤'.repeat(3-game.hearts);
 $('hearts').setAttribute('aria-label',`${game.hearts} vidas restantes`);
 $('score').textContent=`⭐ ${game.score} ${game.score===1?'PONTO':'PONTOS'}`;
 $('wallet').textContent=`🪙 ${game.save.wallet}`;
 $('shield').hidden=!game.shield;
 const magnet=$('magnet-status'),freeze=$('freeze-status');
 magnet.hidden=game.magnetTime<=0;freeze.hidden=game.freezeTime<=0;
 magnet.textContent='🧲 ÍMÃ '+Math.ceil(game.magnetTime)+'s';
 freeze.textContent='❄️ GELO '+Math.ceil(game.freezeTime)+'s';
 const groundStates=['landing','landed','disembarking','walking','boarding','takeoff'];
 const percent=groundStates.includes(game.state)?100:game.mode==='infinite'?(game.elapsed%30)/30*100:game.elapsed/game.duration*100;
 $('progress-fill').style.width=`${Math.min(100,percent).toFixed(1)}%`;
 $('stage-hud').textContent=groundStates.includes(game.state)?`${game.planet.icon} ${game.planet.name}`:game.mode==='infinite'?`♾️ ONDA ${game.infiniteLevel}`:`${game.stage.icon} FASE ${game.stage.number}`;
 $('explore-btn').classList.toggle('hidden',!game.canExplorePlanet());
 $('leave-rocket').classList.toggle('hidden',game.state!=='landed');
 $('board-rocket').classList.toggle('hidden',game.state!=='walking'||!canBoard(game.astronaut));
 flightStick.classList.toggle('hidden',game.state!=='playing');
 walkStick.classList.toggle('hidden',game.state!=='walking');
 $('jump-btn').classList.toggle('hidden',game.state!=='walking');
}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');toastTimeout=1.4;}
$('explore-btn').addEventListener('click',()=>{if(game.enterPlanet()){resetSteering();panels('playing');audio.sound('dock');toast('🌍 Aproximando para pousar no planeta!');updateHud();}});
$('leave-rocket').addEventListener('click',()=>{if(game.leaveRocket()){resetSteering();panels('playing');toast('👩‍🚀 Escotilha abrindo!');}});
$('board-rocket').addEventListener('click',()=>{if(game.boardRocket()){resetSteering();panels('playing');toast('🚀 Preparando decolagem!');}});

/** Tela adicional: não substitui a seleção de fases existente. */
let mapCardStage=0,mapCardTrigger=null;
function showGalaxyMap(){
 if(game.state!=='menu')return;
 panels('galaxy-map');
 $('galaxy-card').classList.add('hidden');
 const viewport=$('galaxy-viewport'),nodes=$('galaxy-nodes');
 nodes.replaceChildren();
 const surface=$('galaxy-route');
 drawGalaxyRoute(surface.getContext('2d'),game.save);
 for(const point of GALAXY_POINTS){
  const status=getMapStatus(game.save,point.stage);
  const btn=document.createElement('button');
  btn.type='button';btn.className='galaxy-planet'+(status.current?' is-current':'')+(!status.unlocked?' is-locked':'');
  btn.style.left=point.x+'px';btn.style.top=(point.y/540*100)+'%';
  btn.style.setProperty('--delay',(-point.stage*.23)+'s');
  const name=status.unlocked?(game.save.planetNames[point.stage]||point.planet.name):'???';
  btn.setAttribute('aria-label',status.unlocked?'Fase '+point.stage+', planeta '+name+(status.completed?', concluída':''): 'Fase '+point.stage+', planeta bloqueado');
  btn.dataset.stage=String(point.stage);
  const art=document.createElement('canvas');art.width=144;art.height=144;
  art.setAttribute('aria-hidden','true');
  drawPlanetPortrait(art.getContext('2d'),point.planet,{locked:!status.unlocked,size:144});
  const title=document.createElement('span');title.className='galaxy-planet-name';
  title.textContent=point.stage+' · '+name;
  const flags=document.createElement('span');flags.className='galaxy-flags';
  if(status.completed){const x=document.createElement('span');x.className='galaxy-flag complete';x.textContent='✓';x.title='Fase concluída';flags.appendChild(x);}
  if(status.explored){const x=document.createElement('span');x.className='galaxy-flag explored';x.textContent='👣';x.title='Planeta explorado';flags.appendChild(x);}
  if(status.current){const x=document.createElement('span');x.className='galaxy-flag current';x.textContent='🚀';x.title='Fase atual';flags.appendChild(x);}
  btn.appendChild(art);btn.appendChild(title);btn.appendChild(flags);
  btn.addEventListener('click',()=>showGalaxyCard(point.stage,btn));
  nodes.appendChild(btn);
 }
 const firstLocked=GALAXY_POINTS.find(p=>!getMapStatus(game.save,p.stage).unlocked);
 const mist=$('galaxy-mist');
 mist.classList.toggle('hidden',!firstLocked);
 if(firstLocked){mist.style.left=(firstLocked.x-110)+'px';mist.style.width=(GALAXY_WIDTH-firstLocked.x+140)+'px';}
 viewport.scrollLeft=mapStartScroll(game.save,viewport.clientWidth);
}
function showGalaxyCard(stage,trigger){
 const status=getMapStatus(game.save,stage),planet=getPlanet(stage);
 mapCardStage=stage;mapCardTrigger=trigger;
 const locked=!status.unlocked;
 $('galaxy-card-stage').textContent='FASE '+stage+' DE '+TOTAL_STAGES;
 $('galaxy-card-title').textContent=locked?'MUNDO DESCONHECIDO':game.save.planetNames[stage]||planet.name;
 $('galaxy-card-info').textContent=locked?
  'Conclua a fase '+(stage-1)+' para dissipar a névoa e revelar este planeta.':
  STAGES[stage-1].name+' · '+planet.landmark;
 $('galaxy-card-status').textContent=locked?'🔒 Fase bloqueada':status.completed?'✓ Fase concluída':'🚀 Fase disponível para jogar';
 $('galaxy-card-explored').textContent=locked?'☁️ A descoberta ainda está envolta em mistério':status.explored?'👣 Planeta explorado':'◌ Planeta ainda não explorado';
 $('galaxy-card-best').textContent=locked?'':('⭐ Melhor pontuação: '+status.best);
 $('galaxy-card-play').classList.toggle('hidden',locked);
 $('galaxy-card-portrait').setAttribute('aria-label',locked?'Silhueta de um planeta desconhecido':'Ilustração de '+(game.save.planetNames[stage]||planet.name));
 drawPlanetPortrait($('galaxy-card-portrait').getContext('2d'),planet,{locked,size:200});
 $('galaxy-card').classList.remove('hidden');
 $('galaxy-card-close').focus();
}
function closeGalaxyCard(){
 $('galaxy-card').classList.add('hidden');
 mapCardTrigger?.focus?.();
}
$('galaxy-open').addEventListener('click',showGalaxyMap);
$('galaxy-close').addEventListener('click',menu);
$('galaxy-card-close').addEventListener('click',closeGalaxyCard);
$('galaxy-card-return').addEventListener('click',closeGalaxyCard);
$('galaxy-card-play').addEventListener('click',()=>{
 if(!getMapStatus(game.save,mapCardStage).unlocked)return;
 begin(mapCardStage);
});

$('open-shop').addEventListener('click',showShop);$('shop-close').addEventListener('click',menu);
$('rocket-list').addEventListener('click',e=>{
 const button=e.target.closest('[data-rocket]');if(!button)return;
 const id=button.dataset.rocket;
 if(game.save.unlockedRockets.includes(id))game.equipRocket(id);
 else if(game.buyRocket(id)){game.equipRocket(id);audio.sound('crate');}
 persist();showShop();
});
$('name-planet').addEventListener('click',()=>{if(game.namePlanet($('planet-input').value)){persist();audio.unlock();panels('playing');toast('🪐 Planeta registrado!');framePrevious=performance.now();}});
$('planet-input').addEventListener('keydown',e=>{if(e.key==='Enter')$('name-planet').click();});
$('start').addEventListener('click',()=>begin(selectedStage));
$('infinite').addEventListener('click',()=>begin(1,'infinite'));
$('retry').addEventListener('click',()=>begin(game.stage.number,game.mode));$('next-stage').addEventListener('click',()=>begin(game.stage.number+1));$('home').addEventListener('click',menu);$('quit').addEventListener('click',menu);
$('pause').addEventListener('click',()=>{resetSteering();game.pause();audio.pause();panels('pause-menu');});
$('resume').addEventListener('click',()=>{audio.unlock();game.resume();panels('playing');framePrevious=performance.now();});
$('repair').addEventListener('click',()=>{if(game.repair()){persist();$('result-wallet').textContent=game.save.wallet;updateRepair();audio.sound('pickup');}});
$('sound').addEventListener('click',()=>{game.save.sound=!game.save.sound;persist();audio.setEnabled(game.save.sound);menu();});
function updatePointer(e){
 const p=normalizePointer(e.clientX,e.clientY,canvas.getBoundingClientRect());
 if(game.state==='playing')game.setTarget(p.x,p.y);
}
canvas.addEventListener('pointerdown',e=>{if(game.state!=='playing')return;canvas.setPointerCapture(e.pointerId);updatePointer(e);});
canvas.addEventListener('pointermove',e=>{if(game.state==='playing'&&(e.buttons||e.pointerType==='touch'))updatePointer(e);});
canvas.addEventListener('pointerup',e=>{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','exploring','walking','docking'].includes(game.state)){$('pause').click();}});
window.addEventListener('blur',()=>{if(['playing','exploring','walking','docking'].includes(game.state)){$('pause').click();}});
$('jump-btn').addEventListener('pointerdown',e=>{
 e.preventDefault();if(game.jump())audio.sound('jump');
});
document.addEventListener('keydown',e=>{
 if((e.key===' '||e.key==='ArrowUp')&&game.state==='walking'){e.preventDefault();if(game.jump())audio.sound('jump');}
  if(displayMode==='galaxy-map'){
   if(e.key==='Escape'){e.preventDefault();if(!$('galaxy-card').classList.contains('hidden'))closeGalaxyCard();else menu();}
   else if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();$('galaxy-viewport').scrollLeft+=e.key==='ArrowRight'?190:-190;}
   return;
  }
  if(e.key==='Escape'){if(['playing','exploring','walking','docking'].includes(game.state)){$('pause').click();}else if(game.state==='paused'){$('resume').click();}}
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){keys.add(e.key);e.preventDefault();}
});
document.addEventListener('keyup',e=>{keys.delete(e.key);});
window.addEventListener('blur',()=>{keys.clear();resetSteering();});
const seeded=(seed)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const rand=seeded(71926);
const stars=Array.from({length:125},(_,i)=>({x:rand()*WIDTH,y:rand()*HEIGHT,r:.6+rand()*1.6,speed:.08+rand()*.30,glow:rand(),phase:rand()*7}));
const planets=[{x:730,y:138,r:115,c1:'#b73fae',c2:'#3b3ca2',speed:.08},{x:150,y:460,r:82,c1:'#32b1b1',c2:'#18467b',speed:.12},{x:1120,y:390,r:58,c1:'#e98d60',c2:'#904071',speed:.1}];
function glow(x,y,r,color){const gr=ctx.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,color);gr.addColorStop(1,'transparent');ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2);}
function background(t){const theme=game.stage, bg=ctx.createLinearGradient(0,0,0,HEIGHT);bg.addColorStop(0,'#060b29');bg.addColorStop(.55,theme.nebula+'65');bg.addColorStop(1,'#0a1744');ctx.fillStyle=bg;ctx.fillRect(0,0,WIDTH,HEIGHT);
  glow(660,150,390,theme.nebula+'50');glow(170,470,315,theme.glow+'2c');glow(900,510,250,theme.accent+'23');
  planets.forEach((p,index)=>{let x=((p.x+theme.number*119-t*p.speed+290)%(WIDTH+450)+(WIDTH+450))%(WIDTH+450)-230;
    const light=ctx.createRadialGradient(x-p.r*.32,p.y-p.r*.4,3,x,p.y,p.r*1.06);light.addColorStop(0,index%2?theme.glow:theme.accent);light.addColorStop(.7,theme.nebula);light.addColorStop(1,'#0b0c30');
    ctx.fillStyle=light;ctx.beginPath();ctx.arc(x,p.y,p.r,0,7);ctx.fill();ctx.strokeStyle='#cda8ef66';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,p.y,p.r*1.36,p.r*.35,-.24,0,2*Math.PI);ctx.stroke();});
  drawSpaceEnvironment(ctx,game,t);
  for(const s of stars){const x=((s.x-t*s.speed)%WIDTH+WIDTH)%WIDTH;const alpha=.4+Math.sin(t*.002+s.phase)*.25;ctx.fillStyle=`rgba(218,246,255,${alpha})`;ctx.beginPath();ctx.arc(x,s.y,s.r,0,Math.PI*2);ctx.fill();if(s.glow>.95)glow(x,s.y,11,'#7de9fc44');}
}
function drawRocket(x,y,t,invincible=0,shield=false,docked=false){
 ctx.save();
 if(invincible>0&&Math.floor(t/95)%2===0)ctx.globalAlpha=.48;
 drawRocketModel(ctx,game.rocketModel.id,{x,y,scale:1,rotation:0,thrust:!docked,time:t});
 if(shield){ctx.strokeStyle='#70eeff';ctx.lineWidth=4;ctx.shadowBlur=19;ctx.shadowColor='#39def9';ctx.beginPath();ctx.arc(x,y,53,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}
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
function laserBolt(o,t){
 ctx.save();ctx.translate(o.x,o.y);ctx.shadowColor='#ff436f';ctx.shadowBlur=23;
 ctx.lineCap='round';ctx.strokeStyle='#fa316c';ctx.lineWidth=12;
 ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(16,0);ctx.stroke();
 ctx.strokeStyle='#fff2bd';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(17,0);ctx.stroke();
 ctx.fillStyle='#ffb2cf';ctx.beginPath();ctx.arc(-17,0,5,0,7);ctx.fill();ctx.restore();
}
function astronaut(x,y,t){
 ctx.save();ctx.translate(x,y);const bounce=Math.sin(t/145)*1.6;
 ctx.fillStyle='#001b3d66';ctx.beginPath();ctx.ellipse(0,14,19,6,0,0,7);ctx.fill();
 ctx.strokeStyle='#234574';ctx.lineWidth=6;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-7,6);ctx.lineTo(-10,16+bounce);ctx.moveTo(7,6);ctx.lineTo(10,16-bounce);ctx.stroke();
 ctx.fillStyle='#dceeff';ctx.strokeStyle='#7b9ec7';ctx.lineWidth=2;
 ctx.beginPath();ctx.roundRect(-11,-10,22,22,6);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ffb763';ctx.beginPath();ctx.arc(0,-17,15,0,7);ctx.fill();
 ctx.fillStyle='#ecf8ff';ctx.beginPath();ctx.arc(0,-17,16,Math.PI,Math.PI*2);ctx.lineTo(16,-17);ctx.arc(0,-17,16,0,Math.PI);ctx.fill();
 ctx.fillStyle='#174e8b';ctx.beginPath();ctx.ellipse(0,-17,12,9,0,0,7);ctx.fill();
 ctx.fillStyle='#7deaff';ctx.beginPath();ctx.ellipse(-4,-20,4,2,-.4,0,7);ctx.fill();
 ctx.strokeStyle='#d5ecff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-9,-4);ctx.lineTo(-19,6+Math.sin(t/300)*2);ctx.moveTo(9,-4);ctx.lineTo(19,3);ctx.stroke();
 ctx.fillStyle='#65f8dd';ctx.fillRect(-4,0,8,5);ctx.restore();
}

/** A tela principal usa exatamente o mesmo renderizador das paisagens jogáveis. */
function drawMenuPlanetPreview(stage,time,alpha=1){
 const planet=getPlanet(stage);
 const projection={
  planet,astronaut:{x:430,y:390},surface:{objects:[]},
  rocketModel:game.rocketModel,save:game.save,state:'landed',cameraX:0
 };
 ctx.save();ctx.globalAlpha=alpha;
 drawPlatformPlanet(ctx,projection,time);
 ctx.restore();
}
function drawMenuBackground(time){
 const elapsed=Math.max(0,time-previewChangedAt);
 const mix=previewOldStage===previewStage?1:Math.min(1,elapsed/430);
 if(mix<1)drawMenuPlanetPreview(previewOldStage,time,1);
 drawMenuPlanetPreview(previewStage,time,mix);
 if(mix===1)previewOldStage=previewStage;
}
function render(t){
 if(displayMode==='menu'&&game.state==='menu'){drawMenuBackground(t);return;}
 const planetStates=['landing','landed','disembarking','walking','boarding','takeoff'];
 const planet=planetStates.includes(game.state)||(game.state==='paused'&&planetStates.includes(game.pauseFrom))||game.state==='naming';
 const active=['playing','paused','docking','gameover','victory','exploring','naming',...planetStates].includes(game.state);
 const shift=active?game.distance:t*.04;
 if(planet){
   drawPlatformPlanet(ctx,game,t);
   if(['walking','disembarking','boarding'].includes(game.state)||
      (game.state==='paused'&&['walking','disembarking','boarding'].includes(game.pauseFrom))){
     const phase=game.state,progress=game.transitionProgress||0;
     const x=(phase==='disembarking'?FLIGHT_PAD_X+9+35*progress:phase==='boarding'?FLIGHT_PAD_X+42-35*progress:game.astronaut.x)-game.cameraX;
     const y=game.astronaut.y;
     drawAstronautPlatform(x,y,t,game.astronaut);
   }
   return;
 }
 if(game.state==='exploring')drawPlanetEnvironment(ctx,game,t);else background(shift);
 if(active){
   const fade=game.state==='docking'?Math.max(0,1-game.dockingProgress*2):1;
   ctx.save();ctx.globalAlpha=fade;
   for(const o of game.objects){
    if(o.kind==='asteroid')asteroid(o);else if(o.kind==='satellite')satellite(o);
    else if(o.kind==='ship')ship(o);else if(o.kind==='coin')coin(o,t);
    else if(o.kind==='crate')crate(o,t);else if(o.kind==='gem')drawGem(ctx,o,t);
    else if(o.kind==='laser')laserBolt(o,t);else drawHazard(ctx,o,t);
   }
   ctx.restore();
   if(game.state==='playing')drawPlanetApproach(ctx,game,t);
   if(game.dockingProgress>0||game.state==='victory')station(t);
   const docked=game.state==='victory';
   drawRocket(game.rocket.x,game.rocket.y+(docked?0:Math.sin(t/155)*2),t,docked?0:game.invincible,game.shield,docked);
   if(game.state==='playing')drawCratePowerEffects(t);
 }else drawRocket(190,330+Math.sin(t/400)*12,t);
}
/** Efeitos visuais suaves dos prêmios temporários, sem novos sprites externos. */
function drawCratePowerEffects(t){
 const x=game.rocket.x,y=game.rocket.y;
 if(game.magnetTime>0){
   ctx.save();ctx.strokeStyle='#ffdc77b0';ctx.lineWidth=2;ctx.shadowBlur=13;ctx.shadowColor='#ffdd61';
   ctx.beginPath();ctx.arc(x,y,54+4*Math.sin(t/260),0,Math.PI*2);ctx.stroke();
   ctx.restore();
 }
 if(game.freezeTime>0){
   ctx.save();ctx.strokeStyle='#a8f3ffb0';ctx.lineWidth=2.5;ctx.shadowColor='#86eaff';ctx.shadowBlur=13;
   ctx.beginPath();ctx.arc(x,y,68+3*Math.sin(t/350),0,Math.PI*2);ctx.stroke();
   ctx.restore();
 }
 if(game.cleanseFlash>0){
   const ratio=1-game.cleanseFlash/.55;
   ctx.save();ctx.globalAlpha=(1-ratio)*.85;ctx.lineWidth=8*(1-ratio)+2;
   ctx.shadowBlur=28;ctx.shadowColor='#ffed9c';ctx.strokeStyle='#ffeaa3';
   ctx.beginPath();ctx.arc(x,y,45+320*ratio,-.8,1.1);ctx.stroke();
   ctx.restore();
 }
}
function drawAstronautPlatform(x,y,t,person){
 ctx.save();ctx.translate(x,y);ctx.scale(person?.facing||1,1);
 const walking=person?.onGround&&Math.abs(person?.vx||0)>6;
 const gait=walking?Math.sin(person.step*1.9):0;
 // Corpo e capacete acompanham a corrida; pernas alternam de forma natural.
 ctx.translate(0,walking?Math.abs(gait)*-2:Math.sin(t/410)*1);
 ctx.strokeStyle='#253f70';ctx.lineWidth=5;ctx.lineCap='round';
 for(const side of [-1,1]){
   ctx.beginPath();ctx.moveTo(side*7,6);ctx.lineTo(side*7+gait*8*side,19-Math.max(0,gait*side)*6);ctx.stroke();
 }
 ctx.fillStyle='#e6f2fe';ctx.strokeStyle='#547baa';ctx.lineWidth=2;
 ctx.beginPath();ctx.roundRect(-11,-11,22,24,6);ctx.fill();ctx.stroke();
 ctx.strokeStyle='#d2e7fb';ctx.lineWidth=4;
 ctx.beginPath();ctx.moveTo(-10,-3);ctx.lineTo(-17,-1+gait*5);ctx.moveTo(10,-3);ctx.lineTo(17,-1-gait*5);ctx.stroke();
 ctx.fillStyle='#f6fbff';ctx.beginPath();ctx.arc(0,-21,16,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#28609b';ctx.beginPath();ctx.ellipse(0,-21,12,9,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#8ce9ff';ctx.beginPath();ctx.ellipse(-3,-24,4,2,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#58e9c7';ctx.fillRect(-4,2,8,5);
 ctx.restore();
}
function loop(now){
 const dt=framePrevious?Math.min(.05,(now-framePrevious)/1000):0;framePrevious=now;
 if(game.state==='playing'||game.state==='walking'){
   const keyboard={x:Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a')),
     y:Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'))};
   const active=game.state==='walking'?walkControl:flightControl;
   const input=active.pointer!==null?active.direction:keyboard;
   const magnitude=Math.hypot(input.x,input.y);
   // A intensidade do analógico regula a caminhada: um gesto pequeno
   // anda devagar e um gesto maior corre; é possível saltar ao mesmo tempo.
   if(magnitude>.0001)game.steer(input,dt);
   else if(game.state==='walking')game.walkAxis=0;
 }
 if(['playing','exploring','landing','landed','disembarking','walking','boarding','takeoff','docking'].includes(game.state)){
   const previous=game.state;game.update(dt);let dirty=false;
   for(const event of game.events){
     if(event==='Moeda coletada!'||event==='Cristal coletado!'){dirty=true;audio.sound('pickup');}
     else if(event==='Colisão!'||event==='Astronauta machucado!')audio.sound('hit');
     else if(event==='Pouso concluído!'){audio.sound('land');toast('🛬 Foguete pousou. Toque em SAIR!');}
     else if(event==='Ponto de salvamento ativado!'){audio.sound('checkpoint');toast('⭐ Ponto de salvamento!');}
     else if(event==='Reapareceu no ponto de salvamento!'){audio.sound('checkpoint');toast('❤️ Corações recuperados!');}
     else if(event==='Laser alienígena!')audio.sound('laser');
     else if(['Escudo ativado!','Coração recuperado!','Ímã de moedas ativado!','Congelamento espacial!'].includes(event)||event.startsWith('Tesouro espacial:')||event.startsWith('Raio de limpeza:')){
       if(event.startsWith('Tesouro espacial:'))dirty=true;
       audio.sound('crate');toast(event);
     }
     else if(event==='Aproximação à estação espacial!'){resetSteering();audio.sound('dock');toast('🛰️ Aproximando da estação!');panels('playing');}
     else if(event==='Planeta explorado!'){dirty=true;resetSteering();audio.sound('win');$('planet-input').value=game.save.planetNames[game.stage.number]||'';$('planet-input').placeholder=`Nome para ${game.planet.name} (opcional)`;panels('planet-name');}
     else if(event==='Fase concluída!')audio.sound('win');
   }
   if(dirty||previous!==game.state)persist();
   updateHud();
   if(game.state==='gameover'||game.state==='victory'){if(game.state==='victory')selectedStage=Math.min(TOTAL_STAGES,game.stage.number+1);resetSteering();audio.pause();result();}
 }
 audio.setScene(['landing','landed','disembarking','boarding','takeoff'].includes(game.state)?'landing':game.state==='walking'?'planet':'flight');
 audio.tick(['playing','landing','landed','disembarking','walking','boarding','takeoff','docking'].includes(game.state));
 if(toastTimeout>0){toastTimeout-=dt;if(toastTimeout<=0)$('toast').classList.remove('visible');}
 render(now);requestAnimationFrame(loop);
}
menu();requestAnimationFrame(loop);
// Somente para testes de integração no navegador; não modifica a interface.
if(typeof window!=='undefined'&&new URLSearchParams(location.search).has('test'))window.__gameTest={get selectedStage(){return selectedStage},get previewStage(){return previewStage},get displayMode(){return displayMode},
 get game(){return game}, get steering(){return flightControl.direction},
 get walkingSteering(){return walkControl.direction},
 get walkingPointer(){return walkControl.pointer},begin,menu
};


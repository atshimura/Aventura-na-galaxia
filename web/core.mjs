
/** Aventura na Galáxia: regras sem dependências de tela/Android. */
const WIDTH = 960;
const HEIGHT = 540;
const STAGE_SECONDS = 48;
const REPAIR_COST = 25;
const TOTAL_STAGES=20;
const STAGES=[
  ['Nebulosa Aurora','#5920a6','#057fba','#ff4280','🌌'],
  ['Cinturão das Estrelas','#1a76ac','#7942bc','#ffba3d','✨'],
  ['Luás de Safira','#254da5','#2585a3','#99c9f7','🌙'],
  ['Jardim de Cometas','#35654d','#6e349c','#f2aa64','☄️'],
  ['Portais de Violeta','#7140aa','#b52b72','#6bc1ff','🌀'],
  ['Planetas de Rubi','#982f62','#f46463','#e1aa38','🔴'],
  ['Névoa Esmeralda','#146f65','#2b9285','#96e1c7','💚'],
  ['Anéis de Âmbar','#c47b32','#66408e','#f0ce7c','🪐'],
  ['Marés Cósmicas','#1465a7','#14509f','#57d2ed','🌊'],
  ['Fortaleza dos Satélites','#30507a','#647aa2','#fd9076','🛰️'],
  ['Estrelas de Jade','#3d886b','#236b87','#d5e8a3','💎'],
  ['Labirinto Galáctico','#794da3','#9a477d','#aabbee','🔮'],
  ['Vale dos Meteoros','#7e4245','#bd7344','#ffc063','🌠'],
  ['Horizonte Turquesa','#209fa4','#4873b4','#a9f2e3','🩵'],
  ['Supernova Coral','#a44188','#fa8170','#f5c87e','🌟'],
  ['Órbita dos Gigantes','#69438c','#a98bb6','#96e0f3','🪐'],
  ['Campo de Antimatéria','#383b83','#ce4e9e','#54ccff','⚡'],
  ['Enigma das Luas','#315b8b','#6766a1','#c5b8ff','🌘'],
  ['Portal das Constelações','#45618a','#b67ec2','#f9b8e8','🌌'],
  ['Estação Lendária','#3d3a84','#c18e46','#ffe5a1','🏆'],
].map(([name,nebula,glow,accent,icon],index)=>Object.freeze({number:index+1,name,nebula,glow,accent,icon}));
Object.freeze(STAGES);
function getStage(stage){return STAGES[clamp(Math.floor(Number(stage)||1),1,TOTAL_STAGES)-1];}
function stageDuration(stage){return STAGE_SECONDS + Math.floor((getStage(stage).number-1)/4)*5;}
function obstacleMotion(stage){return stage<=2?'linear':stage<=4?'vertical':stage<=9?'wave':stage<=14?'drift':'complex';}
function canPlayStage(save,stage){return Number.isInteger(stage)&&stage>=1&&stage<=TOTAL_STAGES&&stage<=sanitizeSave(save).completed+1;}

const SETTINGS = Object.freeze({
  facil: {speed: 190, obstacleDelay: 1.34, coinDelay: 0.73},
  normal: {speed: 245, obstacleDelay: 1.06, coinDelay: 0.72},
  dificil: {speed: 305, obstacleDelay: 0.81, coinDelay: 0.70},
});
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function intersects(a,b) {const dx=a.x-b.x,dy=a.y-b.y;return dx*dx+dy*dy < (a.r+b.r)**2;}
function normalizePointer(clientX,clientY,rect) {return {
  x:clamp((clientX-rect.left)*WIDTH/rect.width,0,WIDTH),
  y:clamp((clientY-rect.top)*HEIGHT/rect.height,0,HEIGHT),
};}
/** Analógico com zona morta: qualquer direção, magnitude limitada. */
function joystickVector(x,y,radius=64,deadZone=.14){
  if(!Number.isFinite(x)||!Number.isFinite(y)||!(radius>0))return {x:0,y:0};
  const nx=x/radius,ny=y/radius,m=Math.hypot(nx,ny);
  if(m<=deadZone)return {x:0,y:0};
  const power=(Math.min(1,m)-deadZone)/(1-deadZone);
  return {x:nx/m*power,y:ny/m*power};
}
function smoothstep(t){const p=clamp(t,0,1);return p*p*(3-2*p);}
function stationPose(progress){
  const p=smoothstep(progress),x=WIDTH+100-400*p,y=HEIGHT/2;
  return {x,y,portX:x-112,portY:y+11,scale:.78+.22*p};
}
const DOCKING_SECONDS=8;
function freshSave(){return {wallet:0,best:0,completed:0,planetNames:{},sound:true,heartReserve:3,bestByStage:{},secretUnlocked:false};}
function sanitizeSave(value){const base=freshSave();if(!value||typeof value!== 'object')return base;
  return {wallet:clamp(Math.floor(Number(value.wallet)||0),0,99999999),
    best:clamp(Math.floor(Number(value.best)||0),0,99999999),
    completed:clamp(Math.floor(Number(value.completed)||0),0,TOTAL_STAGES),
    heartReserve:clamp(Math.floor(Number(value.heartReserve) || 3),1,3),
    bestByStage:Object.fromEntries(Object.entries(value.bestByStage||{}).filter(([key])=>/^(?:[1-9]|1[0-9]|20)$/.test(key)).map(([key,v])=>[key,clamp(Math.floor(Number(v)||0),0,99999999)])),
    secretUnlocked:value.secretUnlocked===true || Number(value.completed)>=TOTAL_STAGES,
    planetNames:value.planetNames&&typeof value.planetNames==='object'?value.planetNames:{},
    sound:value.sound!==false};
}
class GameState {
  constructor({difficulty='normal',rng=Math.random,save=freshSave(),stage=1}={}){
    if(!SETTINGS[difficulty])throw new Error('Dificuldade inválida');
    this.difficulty=difficulty;this.stage=getStage(stage);this.duration=stageDuration(this.stage.number);
    this.motion=obstacleMotion(this.stage.number);
    const base=SETTINGS[difficulty],increase=this.stage.number-1;
    this.config={speed:base.speed+increase*4,obstacleDelay:Math.max(.43,base.obstacleDelay-increase*.027),coinDelay:base.coinDelay};this.rng=rng;
    this.save=sanitizeSave(save);this.state='menu';this.elapsed=0;this.distance=0;
    this.rocket={x:153,y:HEIGHT/2,r:21};this.target={x:153,y:HEIGHT/2};
    this.objects=[];this.score=0;this.hearts=3;this.invincible=0;this.shield=0;
    this.obstacleTimer=0;this.coinTimer=0;this.crateTimer=0;this.events=[];this.dockingProgress=0;this.dockStart=null;this.pauseFrom='playing';
  }
  start(){this.state='playing';this.elapsed=0;this.distance=0;this.score=0;this.hearts=this.save.heartReserve;
    this.rocket={x:153,y:HEIGHT/2,r:21};this.target={x:153,y:HEIGHT/2};
    this.objects=[];this.invincible=1.6;this.shield=0;this.obstacleTimer=1.5;this.coinTimer=0.65;
    this.crateTimer=11;this.events=[];this.dockingProgress=0;this.dockStart=null;this.pauseFrom='playing';
  }
  setTarget(x,y){this.target.x=clamp(x,64,430);this.target.y=clamp(y,62,HEIGHT-60);}
  steer(direction,dt){
    if(this.state!=='playing')return;
    const seconds=clamp(dt,0,.05),speed=365;
    this.setTarget(this.target.x+direction.x*speed*seconds,this.target.y+direction.y*speed*seconds);
  }
  stopSteering(){if(this.state==='playing')this.setTarget(this.rocket.x,this.rocket.y);}
  pause(){if(this.state==='playing'||this.state==='docking'){this.pauseFrom=this.state;this.state='paused';}}
  resume(){if(this.state==='paused')this.state=this.pauseFrom;}
  startDocking(){
    this.state='docking';this.dockingProgress=0;
    this.dockStart={x:this.rocket.x,y:this.rocket.y};
    this.events.push('Aproximação à estação espacial!');
  }
  updateDocking(dt){
    this.elapsed=Math.min(this.duration,this.elapsed+dt);
    this.distance+=this.config.speed*dt*.35;
    this.dockingProgress=clamp((this.elapsed-(this.duration-DOCKING_SECONDS))/DOCKING_SECONDS,0,1);
    const p=smoothstep(this.dockingProgress),port=stationPose(1);
    this.rocket.x=this.dockStart.x+(port.portX-this.dockStart.x)*p;
    this.rocket.y=this.dockStart.y+(port.portY-this.dockStart.y)*p;
    if(this.dockingProgress>=1){
      this.state='victory';this.save.completed=Math.max(this.save.completed,this.stage.number);
      this.save.heartReserve=this.hearts;
      this.save.bestByStage[this.stage.number]=Math.max(this.score,this.save.bestByStage[this.stage.number]||0);
      if(this.stage.number===TOTAL_STAGES)this.save.secretUnlocked=true;
      this.objects=[];this.events.push('Fase concluída!');
    }
  }
  randomRange(min,max){return min+this.rng()*(max-min);}
  spawnObstacle(){const kinds=['asteroid','asteroid','satellite','ship'];const kind=kinds[Math.min(kinds.length-1,Math.floor(this.rng()*kinds.length))];
    const radius=kind==='asteroid'?this.randomRange(23,37):kind==='satellite'?35:30;
    this.objects.push({kind,x:WIDTH+60,y:this.randomRange(95,HEIGHT-95),r:radius,rot:this.randomRange(0,Math.PI*2),id:this.rng(),originY:0,phase:this.randomRange(0,Math.PI*2),age:0,drift:this.randomRange(-30,30)});
    const o=this.objects[this.objects.length-1];o.originY=o.y;
  }
  spawnCoin(){this.objects.push({kind:'coin',x:WIDTH+35,y:this.randomRange(72,HEIGHT-72),r:16,rot:0});}
  spawnCrate(){this.objects.push({kind:'crate',x:WIDTH+45,y:this.randomRange(90,HEIGHT-90),r:23,rot:0});}
  useCrate(){const chance=this.rng();if(chance<0.35){this.shield=1;this.events.push('Escudo ativado!');}
    else if(chance<0.70){this.hearts=clamp(this.hearts+1,0,3);this.events.push('Coração recuperado!');}
    else{this.invincible=Math.max(this.invincible,5);this.events.push('Invencibilidade!');}}
  update(delta){if(this.state!=='playing'&&this.state!=='docking')return;
    const dt=clamp(delta,0,0.05);this.events=[];
    if(this.state==='docking'){this.updateDocking(dt);return;}
    this.elapsed+=dt;this.distance+=this.config.speed*dt;
    const smoothing=Math.min(1,12*dt);this.rocket.x+=(this.target.x-this.rocket.x)*smoothing;
    this.rocket.y+=(this.target.y-this.rocket.y)*smoothing;
    if(this.elapsed>=this.duration-DOCKING_SECONDS){this.elapsed=this.duration-DOCKING_SECONDS;this.startDocking();return;}
    this.invincible=Math.max(0,this.invincible-dt);
    this.obstacleTimer-=dt;this.coinTimer-=dt;this.crateTimer-=dt;
    if(this.obstacleTimer<=0){this.spawnObstacle();this.obstacleTimer+=this.config.obstacleDelay;}
    if(this.coinTimer<=0){this.spawnCoin();this.coinTimer+=this.config.coinDelay;}
    if(this.crateTimer<=0){this.spawnCrate();this.crateTimer+=13;}
    for(const item of this.objects){
      item.x-=this.config.speed*dt;
      if(['asteroid','satellite','ship'].includes(item.kind)){
        item.age=(item.age||0)+dt;
        if(item.originY===undefined)item.originY=item.y;
        if(item.phase===undefined)item.phase=0;
        if(this.motion==='vertical')item.y=clamp(item.originY+Math.sin(item.age*1.45+item.phase)*22,66,HEIGHT-66);
        if(this.motion==='wave')item.y=clamp(item.originY+Math.sin(item.age*1.85+item.phase)*40,66,HEIGHT-66);
        if(this.motion==='drift'){item.y=clamp(item.originY+Math.sin(item.age*1.7+item.phase)*55,66,HEIGHT-66);item.x+=Math.sin(item.age*2+item.phase)*18*dt;}
        if(this.motion==='complex'){item.y=clamp(item.originY+Math.sin(item.age*2.4+item.phase)*60,66,HEIGHT-66);item.x+=Math.cos(item.age*2+item.phase)*32*dt;}
      }
      if(item.kind==='coin')item.rot+=3.5*dt;
      if(item.dead||!intersects(this.rocket,item))continue;
      if(item.kind==='coin'){item.dead=true;this.score++;this.save.wallet++;this.events.push('Moeda coletada!');}
      else if(item.kind==='crate'){item.dead=true;this.useCrate();}
      else if(this.invincible<=0){item.dead=true;if(this.shield){this.shield=0;this.invincible=1.0;this.events.push('Escudo protegeu!');}
        else{this.hearts--;this.invincible=1.8;this.events.push('Colisão!');if(this.hearts<=0){this.hearts=0;this.save.heartReserve=3;this.state='gameover';this.events.push('Fim de jogo');}}}
    }
    this.objects=this.objects.filter(i=>!i.dead&&i.x>-70);
    if(this.score>this.save.best)this.save.best=this.score;
    // A vitória é registrada somente quando o foguete acoplar à estação.
  }
  repair(){if(this.state!=='victory'||this.hearts>=3||this.save.wallet<REPAIR_COST)return false;
    this.hearts++;this.save.heartReserve=this.hearts;this.save.wallet-=REPAIR_COST;this.events.push('Foguete consertado!');return true;}
  snapshot(){return {state:this.state,elapsed:this.elapsed,score:this.score,hearts:this.hearts,wallet:this.save.wallet,best:this.save.best,completed:this.save.completed,stage:this.stage.number,duration:this.duration,shield:this.shield};}
}


export {WIDTH,HEIGHT,STAGE_SECONDS,DOCKING_SECONDS,REPAIR_COST,TOTAL_STAGES,STAGES,getStage,stageDuration,obstacleMotion,canPlayStage,normalizePointer,joystickVector,stationPose,sanitizeSave,GameState,freshSave,intersects};

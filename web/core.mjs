
/** Aventura na Galáxia: regras independentes do navegador. */
import {getPlanet,PLANET_SECONDS,planetVisible,chooseHazard,planetObstacleForBiome} from './world.mjs';
import {rocketById,sanitizeRockets,DEFAULT_ROCKET,purchase,equip} from './rockets.mjs';
import {WORLD_LENGTH,FLIGHT_PAD_X,groundAt,createPlanetLevel,newAstronaut,jumpAstronaut,moveAstronaut,collision,updatePlanetObjects,respawnAstronaut,canBoard} from './platformer.mjs';
const HAZARD_RADIUS={asteroid:29,satellite:35,ship:30,debris:24,comet:27,mine:28,plasma:31,drone:30,crystal:26,vortex:31};
// Pesos aprovados para sorteios entre prêmios úteis (renormalizados a cada caixinha).
const CRATE_REWARDS=Object.freeze([
 Object.freeze({id:'shield',weight:20}),
 Object.freeze({id:'heart',weight:18}),
 Object.freeze({id:'magnet',weight:19}),
 Object.freeze({id:'treasure',weight:20}),
 Object.freeze({id:'freeze',weight:13}),
 Object.freeze({id:'cleanse',weight:10})
]);
const MAGNET_SECONDS=8, FREEZE_SECONDS=6, FREEZE_MULTIPLIER=.3;
const MAGNET_RADIUS=225, MAGNET_PULL_SPEED=250, CLEANSE_AHEAD=380, CLEANSE_BEHIND=135, CLEANSE_VERTICAL=195;
function cleanseTarget(obj,rocket){
 return obj&&!obj.dead&&(obj.kind==='laser'||Object.hasOwn(HAZARD_RADIUS,obj.kind))
  &&Number.isFinite(obj.x)&&Number.isFinite(obj.y)
  &&obj.x>=rocket.x-CLEANSE_BEHIND&&obj.x<=rocket.x+CLEANSE_AHEAD
  &&Math.abs(obj.y-rocket.y)<=CLEANSE_VERTICAL;
}
function eligibleCrateRewards(game){
 return CRATE_REWARDS.filter(r=>{
  if(r.id==='shield')return !game.shield;
  if(r.id==='heart')return game.hearts<3;
  if(r.id==='cleanse')return game.objects.some(o=>cleanseTarget(o,game.rocket));
  return true; // ímã e congelamento renovam sua duração, tesouro sempre concede moedas
 });
}
function chooseCrateReward(game,rng=game.rng){
 const available=eligibleCrateRewards(game),total=available.reduce((sum,r)=>sum+r.weight,0);
 let roll=Math.max(0,Math.min(.999999999,Number(rng())||0))*total;
 for(const reward of available){roll-=reward.weight;if(roll<0)return reward.id;}
 return available.at(-1).id;
}
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
function freshSave(){return {wallet:0,best:0,completed:0,planetNames:{},exploredPlanets:{},sound:true,heartReserve:3,bestByStage:{},secretUnlocked:false,bestInfinite:0,unlockedRockets:[DEFAULT_ROCKET],selectedRocket:DEFAULT_ROCKET};}
function sanitizeSave(value){const base=freshSave();if(!value||typeof value!== 'object')return base;
  return {wallet:clamp(Math.floor(Number(value.wallet)||0),0,99999999),
    best:clamp(Math.floor(Number(value.best)||0),0,99999999),
    completed:clamp(Math.floor(Number(value.completed)||0),0,TOTAL_STAGES),
    heartReserve:clamp(Math.floor(Number(value.heartReserve) || 3),1,3),
    bestByStage:Object.fromEntries(Object.entries(value.bestByStage||{}).filter(([key])=>/^(?:[1-9]|1[0-9]|20)$/.test(key)).map(([key,v])=>[key,clamp(Math.floor(Number(v)||0),0,99999999)])),
    secretUnlocked:value.secretUnlocked===true || Number(value.completed)>=TOTAL_STAGES,
    bestInfinite:clamp(Math.floor(Number(value.bestInfinite)||0),0,99999999),
    unlockedRockets:sanitizeRockets(value.unlockedRockets),
    selectedRocket:sanitizeRockets(value.unlockedRockets).includes(value.selectedRocket)?value.selectedRocket:DEFAULT_ROCKET,
    planetNames:Object.fromEntries(Object.entries(value.planetNames&&typeof value.planetNames==='object'&&!Array.isArray(value.planetNames)?value.planetNames:{}).filter(([k,v])=>/^(?:[1-9]|1[0-9]|20)$/.test(k)&&typeof v==='string').map(([k,v])=>[k,v.trim().slice(0,32)]).filter(([,v])=>v)),
    exploredPlanets:Object.fromEntries(Object.entries(value.exploredPlanets&&typeof value.exploredPlanets==='object'&&!Array.isArray(value.exploredPlanets)?value.exploredPlanets:{}).filter(([k,v])=>/^(?:[1-9]|1[0-9]|20)$/.test(k)&&v===true)),
    sound:value.sound!==false};
}
class GameState {
  constructor({difficulty='normal',rng=Math.random,save=freshSave(),stage=1,mode='adventure'}={}){
    if(!SETTINGS[difficulty])throw new Error('Dificuldade inválida');
    if(!['adventure','infinite'].includes(mode))throw new Error('Modo inválido');
    this.mode=mode;this.difficulty=difficulty;this.stage=getStage(stage);this.planet=getPlanet(this.stage.number);this.duration=stageDuration(this.stage.number);
    this.motion=obstacleMotion(this.stage.number);
    const base=SETTINGS[difficulty],increase=this.stage.number-1;
    this.config={speed:base.speed+increase*4,obstacleDelay:Math.max(.43,base.obstacleDelay-increase*.027),coinDelay:base.coinDelay};this.rng=rng;
    this.save=sanitizeSave(save);this.rocketModel=rocketById(this.save.selectedRocket);this.state='menu';this.elapsed=0;this.distance=0;
    this.rocket={x:153,y:HEIGHT/2,r:21};this.target={x:153,y:HEIGHT/2};
    this.objects=[];this.score=0;this.hearts=3;this.invincible=0;this.shield=0;
    this.magnetTime=0;this.freezeTime=0;this.cleanseFlash=0;
    this.obstacleTimer=0;this.coinTimer=0;this.crateTimer=0;this.events=[];this.dockingProgress=0;this.dockStart=null;this.pauseFrom='playing';
    this.planetElapsed=0;this.planetDuration=PLANET_SECONDS;this.planetVisited=false;this.planetObstacleTimer=0;this.planetCoinTimer=0;
    this.astronaut={x:165,y:402,r:14};this.footTarget={x:165,y:402};this.walkingDistance=0;
    this.infiniteLevel=1;this.lasersFired=0;
    this.walkAxis=0;this.surface={objects:[]};this.cameraX=0;this.checkpointX=FLIGHT_PAD_X+38;
    this.transitionProgress=0;this.transitionElapsed=0;this.transitionDuration=0;
  }
  start(){this.state='playing';this.elapsed=0;this.distance=0;this.score=0;this.hearts=this.mode==='infinite'?3:this.save.heartReserve;
    this.rocket={x:153,y:HEIGHT/2,r:21};this.target={x:153,y:HEIGHT/2};
    this.objects=[];this.invincible=1.6;this.shield=this.rocketModel.shield;
    this.magnetTime=0;this.freezeTime=0;this.cleanseFlash=0;
    this.obstacleTimer=1.5;this.coinTimer=0.65;
    this.crateTimer=11;this.events=[];this.dockingProgress=0;this.dockStart=null;this.pauseFrom='playing';this.planetElapsed=0;this.planetVisited=false;this.planetObstacleTimer=1.5;this.planetCoinTimer=.6;
    this.astronaut={x:165,y:402,r:14};this.footTarget={x:165,y:402};this.walkingDistance=0;this.infiniteLevel=1;this.lasersFired=0;
    this.walkAxis=0;this.surface={objects:[]};this.cameraX=0;this.checkpointX=FLIGHT_PAD_X+38;
    this.transitionProgress=0;this.transitionElapsed=0;this.transitionDuration=0;
  }
  setTarget(x,y){this.target.x=clamp(x,64,430);this.target.y=clamp(y,62,HEIGHT-60);}
  steer(direction,dt){
    if(!['playing','exploring','walking'].includes(this.state))return;
    const seconds=clamp(dt,0,.05);
    if(this.state==='walking'){
      this.walkAxis=clamp(direction.x,-1,1);
      return;
    }
    // Joystick movimenta a nave no próprio quadro: sem perseguir um alvo atrasado.
    const speed=420*this.rocketModel.control;
    this.rocket.x=clamp(this.rocket.x+direction.x*speed*seconds,64,430);
    this.rocket.y=clamp(this.rocket.y+direction.y*speed*seconds,62,HEIGHT-60);
    this.target.x=this.rocket.x;this.target.y=this.rocket.y;
  }
  stopSteering(){
    this.walkAxis=0;
    if(this.state==='playing'||this.state==='exploring')
      this.setTarget(this.rocket.x,this.rocket.y);
  }
  pause(){
    if(['playing','exploring','landing','landed','disembarking','walking','boarding','takeoff','docking'].includes(this.state)){
      this.pauseFrom=this.state;this.state='paused';
    }
  }
  resume(){if(this.state==='paused')this.state=this.pauseFrom;}
  canExplorePlanet(){return this.mode==='adventure'&&this.state==='playing'&&!this.planetVisited&&planetVisible(this.elapsed,this.duration);}
  startTransition(state,duration){
    this.state=state;this.transitionElapsed=0;this.transitionProgress=0;this.transitionDuration=duration;
  }
  leaveRocket(){
    if(this.state!=='landed')return false;
    this.startTransition('disembarking',1.25);
    this.events.push('Escotilha aberta!');return true;
  }
  jump(){
    if(this.state!=='walking')return false;
    return jumpAstronaut(this.astronaut);
  }
  boardRocket(){
    if(this.state!=='walking'||!canBoard(this.astronaut))return false;
    this.walkAxis=0;this.startTransition('boarding',1);
    this.events.push('Voltando para o foguete!');return true;
  }
  buyRocket(id){return purchase(this.save,id);}
  equipRocket(id){if(!equip(this.save,id))return false;this.rocketModel=rocketById(id);return true;}
  enterPlanet(){
    if(!this.canExplorePlanet())return false;
    this.planetElapsed=0;this.objects=[];this.invincible=Math.max(1.8,this.invincible);
    this.surface={objects:createPlanetLevel(this.stage.number,this.planet.biome)};
    this.astronaut=newAstronaut(this.planet.biome,this.stage.number);
    this.checkpointX=this.astronaut.x;this.walkAxis=0;this.startTransition('landing',2.2);
    this.events.push('Iniciando pouso planetário!');return true;
  }
  finishPlanet(){
    this.state='naming';this.objects=[];this.planetVisited=true;
    this.save.exploredPlanets[this.stage.number]=true;
    this.events.push('Planeta explorado!');
  }
  namePlanet(name){
    if(this.state!=='naming')return false;
    const clean=String(name||'').trim().replace(/[<>\x00-\x1f]/g,'').slice(0,32);
    if(clean)this.save.planetNames[this.stage.number]=clean;
    this.state='playing';this.objects=[];this.obstacleTimer=1.8;this.coinTimer=.5;
    this.invincible=Math.max(2,this.invincible);this.events.push('Retorno ao espaço!');return true;
  }
  damageAstronaut(){
    if(this.invincible>0)return;
    if(this.shield){this.shield=0;this.invincible=1.1;this.events.push('Escudo protegeu!');return;}
    this.hearts--;this.events.push('Astronauta machucado!');
    if(this.hearts<=0){this.hearts=3;this.events.push('Reapareceu no ponto de salvamento!');}
    this.invincible=1.6;
    respawnAstronaut(this.astronaut,this.checkpointX,this.planet.biome,this.stage.number);
    this.walkAxis=0;
  }
  updateOnPlanet(dt){
    if(this.state==='landing'||this.state==='disembarking'||this.state==='boarding'||this.state==='takeoff'){
      this.transitionElapsed+=dt;
      this.transitionProgress=clamp(this.transitionElapsed/this.transitionDuration,0,1);
      if(this.transitionProgress>=1){
        if(this.state==='landing'){this.state='landed';this.events.push('Pouso concluído!');}
        else if(this.state==='disembarking'){this.state='walking';this.events.push('Astronauta desembarcou!');}
        else if(this.state==='boarding'){this.startTransition('takeoff',2);this.events.push('Iniciando decolagem!');}
        else {this.finishPlanet();}
      }
      return;
    }
    if(this.state==='landed')return;
    if(this.state!=='walking')return;
    this.planetElapsed+=dt;this.invincible=Math.max(0,this.invincible-dt);
    const moved=moveAstronaut(this.astronaut,this.walkAxis,dt,this.planet.biome,this.stage.number);
    this.walkingDistance+=Math.abs(this.astronaut.vx)*dt;
    updatePlanetObjects(this.surface.objects,this.planetElapsed,this.planet.biome,this.stage.number);
    if(moved.fell){
      if(this.invincible>0)respawnAstronaut(this.astronaut,this.checkpointX,this.planet.biome,this.stage.number);
      else this.damageAstronaut();
      return;
    }
    for(const obj of this.surface.objects){
      if(obj.kind==='gem'&&!obj.collected&&collision(this.astronaut,obj)){
        obj.collected=true;this.score+=3;this.save.wallet+=3;this.save.best=Math.max(this.save.best,this.score);
        this.events.push('Cristal coletado!');
      }else if(obj.kind==='checkpoint'&&collision(this.astronaut,obj)){
        if(!obj.active){this.surface.objects.filter(o=>o.kind==='checkpoint').forEach(o=>o.active=false);obj.active=true;
          this.checkpointX=obj.x;this.events.push('Ponto de salvamento ativado!');}
      }else if((obj.kind==='hazard'||obj.kind==='animal'&&!obj.friendly)&&collision(this.astronaut,obj)){
        this.damageAstronaut();break;
      }
    }
  }
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
  spawnObstacle(){const kind=chooseHazard(this.mode==='infinite'?this.infiniteLevel:this.stage.number,this.rng);
    const radius=kind==='asteroid'?this.randomRange(23,37):HAZARD_RADIUS[kind];
    this.objects.push({kind,x:WIDTH+60,y:this.randomRange(95,HEIGHT-95),r:radius,rot:this.randomRange(0,Math.PI*2),id:this.rng(),originY:0,phase:this.randomRange(0,Math.PI*2),age:0,drift:this.randomRange(-30,30)});
    const o=this.objects[this.objects.length-1];o.originY=o.y;o.shot=false;o.fireDelay=.5;
  }
  spawnLaser(source){
    if(!source||source.kind!=='ship'||source.shot)return false;
    source.shot=true;this.lasersFired++;
    this.objects.push({kind:'laser',x:source.x-35,y:source.y,r:10,velocity:390+this.infiniteLevel*6,age:0});
    this.events.push('Laser alienígena!');return true;
  }
  spawnCoin(kind='coin'){this.objects.push({kind,x:WIDTH+35,y:this.randomRange(72,HEIGHT-72),r:kind==='gem'?19:16,rot:0});}
  spawnCrate(){this.objects.push({kind:'crate',x:WIDTH+45,y:this.randomRange(90,HEIGHT-90),r:23,rot:0});}
  useCrate(){
    const prize=chooseCrateReward(this);
    if(prize==='shield'){
      this.shield=1;this.events.push('Escudo ativado!');
    }else if(prize==='heart'){
      this.hearts=clamp(this.hearts+1,0,3);this.events.push('Coração recuperado!');
    }else if(prize==='magnet'){
      this.magnetTime=MAGNET_SECONDS;this.events.push('Ímã de moedas ativado!');
    }else if(prize==='treasure'){
      const amount=8+Math.floor(Math.max(0,Math.min(.999999999,Number(this.rng())||0))*8);
      this.save.wallet+=amount;this.score+=amount;
      this.save.best=Math.max(this.save.best,this.score);
      if(this.mode==='infinite')this.save.bestInfinite=Math.max(this.save.bestInfinite,this.score);
      this.events.push('Tesouro espacial: +'+amount+' moedas!');
    }else if(prize==='freeze'){
      this.freezeTime=FREEZE_SECONDS;this.events.push('Congelamento espacial!');
    }else if(prize==='cleanse'){
      const targets=this.objects.filter(o=>cleanseTarget(o,this.rocket));
      targets.forEach(o=>o.dead=true);
      this.cleanseFlash=.55;
      this.events.push('Raio de limpeza: '+targets.length+' perigos eliminados!');
    }
    return prize;
  }
  moveObjects(dt,exploring){
    const newLasers=[];
    const frozen=!exploring&&this.freezeTime>0;
    for(const item of this.objects){
      if(item.dead)continue;
      // O congelamento reduz apenas a velocidade dos perigos, nunca da nave, moedas ou caixas.
      const hazard=item.kind==='laser'||Object.hasOwn(HAZARD_RADIUS,item.kind);
      const step=hazard&&frozen?dt*FREEZE_MULTIPLIER:dt;
      if(item.kind==='laser')item.x-=(item.velocity||390)*step;
      else item.x-=this.config.speed*(exploring?.83:1)*step;
      item.age=(item.age||0)+step;
      if(!exploring&&item.kind==='ship'&&!item.shot&&this.stage.number>=3&&item.x<860&&item.x>this.rocket.x+230){
        item.fireDelay=(item.fireDelay??.45)-step;
        if(item.fireDelay<=0){
          item.shot=true;this.lasersFired++;
          newLasers.push({kind:'laser',x:item.x-34,y:item.y,r:10,velocity:380+this.infiniteLevel*8,age:0});
          this.events.push('Laser alienígena!');
        }
      }
      if(!exploring&&HAZARD_RADIUS[item.kind]){
        const phase=item.phase||0,y=item.originY??item.y;
        if(this.motion==='vertical')item.y=clamp(y+Math.sin(item.age*1.45+phase)*22,66,HEIGHT-66);
        if(this.motion==='wave')item.y=clamp(y+Math.sin(item.age*1.85+phase)*40,66,HEIGHT-66);
        if(this.motion==='drift'){item.y=clamp(y+Math.sin(item.age*1.7+phase)*55,66,HEIGHT-66);item.x+=Math.sin(item.age*2+phase)*18*step;}
        if(this.motion==='complex'){item.y=clamp(y+Math.sin(item.age*2.4+phase)*60,66,HEIGHT-66);item.x+=Math.cos(item.age*2+phase)*32*step;}
        if(item.kind==='comet')item.y=clamp(y+Math.sin(item.age*2+phase)*32,64,HEIGHT-64);
        if(item.kind==='drone')item.y=clamp(y+Math.sin(item.age*2.8+phase)*47,64,HEIGHT-64);
        if(item.kind==='vortex')item.y=clamp(y+Math.sin(item.age*1.3+phase)*58,64,HEIGHT-64);
      }
      if(item.kind==='coin'||item.kind==='gem')item.rot=(item.rot||0)+3.5*dt;
      // O ímã puxa somente moedas do voo próximas à nave; os cristais permanecem iguais.
      if(item.kind==='coin'&&this.magnetTime>0&&!exploring){
        const dx=this.rocket.x-item.x,dy=this.rocket.y-item.y,d=Math.hypot(dx,dy);
        if(d>0&&d<MAGNET_RADIUS){
          const pull=Math.min(d,(MAGNET_PULL_SPEED+1.4*(MAGNET_RADIUS-d))*dt);
          item.x+=dx/d*pull;item.y+=dy/d*pull;
        }
      }
      const player=this.state==='walking'?this.astronaut:this.rocket;
      if(item.dead||!intersects(player,item))continue;
      if(item.kind==='coin'||item.kind==='gem'){
        const value=item.kind==='gem'?3:1;item.dead=true;this.score+=value;this.save.wallet+=value;
        this.events.push(item.kind==='gem'?'Cristal coletado!':'Moeda coletada!');
      }else if(item.kind==='crate'){item.dead=true;this.useCrate();}
      else if(this.invincible<=0){
        item.dead=true;
        if(this.shield){this.shield=0;this.invincible=1;this.events.push('Escudo protegeu!');}
        else{this.hearts--;this.invincible=1.8;this.events.push('Colisão!');
          if(this.hearts<=0){this.hearts=0;if(this.mode==='adventure')this.save.heartReserve=3;this.state='gameover';this.events.push('Fim de jogo');}}
      }
    }
    this.objects=this.objects.filter(o=>!o.dead&&o.x>-90).concat(newLasers);
    if(this.score>this.save.best)this.save.best=this.score;
    if(this.mode==='infinite'&&this.score>this.save.bestInfinite)this.save.bestInfinite=this.score;
  }
  update(delta){
    if(!['playing','exploring','landing','landed','disembarking','walking','boarding','takeoff','docking'].includes(this.state))return;
    const dt=clamp(delta,0,.05);this.events=[];
    if(this.state==='docking'){this.updateDocking(dt);return;}
    if(['landing','landed','disembarking','walking','boarding','takeoff'].includes(this.state)){
      this.updateOnPlanet(dt);return;
    }
    const k=Math.min(1,Math.max(.75,30*dt));
    this.rocket.x+=(this.target.x-this.rocket.x)*k;
    this.rocket.y+=(this.target.y-this.rocket.y)*k;
    this.invincible=Math.max(0,this.invincible-dt);
    // O relógio dos poderes avança apenas durante o voo, e não no menu ou pouso.
    if(this.state==='exploring')return;
    this.magnetTime=Math.max(0,this.magnetTime-dt);
    this.freezeTime=Math.max(0,this.freezeTime-dt);
    this.cleanseFlash=Math.max(0,this.cleanseFlash-dt);
    this.elapsed+=dt;this.distance+=this.config.speed*dt;
    if(this.mode==='infinite'){
      this.infiniteLevel=Math.min(TOTAL_STAGES,Math.floor(this.elapsed/30)+1);
      this.stage=getStage(this.infiniteLevel);this.planet=getPlanet(this.infiniteLevel);
      this.motion=obstacleMotion(this.infiniteLevel);
      const base=SETTINGS[this.difficulty];
      this.config.speed=base.speed+Math.min(220,Math.floor(this.elapsed/15)*7);
      this.config.obstacleDelay=Math.max(.41,base.obstacleDelay-Math.floor(this.elapsed/25)*.045);
    }
    if(this.mode==='adventure'&&this.elapsed>=this.duration-DOCKING_SECONDS){
      this.elapsed=this.duration-DOCKING_SECONDS;this.startDocking();return;
    }
    this.obstacleTimer-=dt;this.coinTimer-=dt;this.crateTimer-=dt;
    if(this.obstacleTimer<=0){this.spawnObstacle();this.obstacleTimer+=this.config.obstacleDelay;}
    if(this.coinTimer<=0){this.spawnCoin();this.coinTimer+=this.config.coinDelay;}
    if(this.crateTimer<=0){this.spawnCrate();this.crateTimer+=13;}
    this.moveObjects(dt,false);
  }
  repair(){if(this.state!=='victory'||this.hearts>=3||this.save.wallet<REPAIR_COST)return false;
    this.hearts++;this.save.heartReserve=this.hearts;this.save.wallet-=REPAIR_COST;this.events.push('Foguete consertado!');return true;}
  snapshot(){return {mode:this.mode,selectedRocket:this.rocketModel.id,bestInfinite:this.save.bestInfinite,state:this.state,elapsed:this.elapsed,planetElapsed:this.planetElapsed,score:this.score,hearts:this.hearts,wallet:this.save.wallet,best:this.save.best,completed:this.save.completed,stage:this.stage.number,duration:this.duration,shield:this.shield,magnetTime:this.magnetTime,freezeTime:this.freezeTime};}
}


export {WIDTH,HEIGHT,STAGE_SECONDS,DOCKING_SECONDS,REPAIR_COST,TOTAL_STAGES,STAGES,getStage,stageDuration,obstacleMotion,canPlayStage,normalizePointer,joystickVector,stationPose,sanitizeSave,GameState,freshSave,intersects,CRATE_REWARDS,eligibleCrateRewards,chooseCrateReward,MAGNET_SECONDS,FREEZE_SECONDS,FREEZE_MULTIPLIER};

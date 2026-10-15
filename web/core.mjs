
/** Aventura na Galáxia: regras sem dependências de tela/Android. */
const WIDTH = 960;
const HEIGHT = 540;
const STAGE_SECONDS = 48;
const REPAIR_COST = 25;
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
function freshSave(){return {wallet:0,best:0,completed:0,planetNames:{},sound:true};}
function sanitizeSave(value){const base=freshSave();if(!value||typeof value!== 'object')return base;
  return {wallet:clamp(Math.floor(Number(value.wallet)||0),0,99999999),
    best:clamp(Math.floor(Number(value.best)||0),0,99999999),
    completed:clamp(Math.floor(Number(value.completed)||0),0,20),
    planetNames:value.planetNames&&typeof value.planetNames==='object'?value.planetNames:{},
    sound:value.sound!==false};
}
class GameState {
  constructor({difficulty='normal',rng=Math.random,save=freshSave()}={}){
    if(!SETTINGS[difficulty])throw new Error('Dificuldade inválida');
    this.difficulty=difficulty;this.config=SETTINGS[difficulty];this.rng=rng;
    this.save=sanitizeSave(save);this.state='menu';this.elapsed=0;this.distance=0;
    this.rocket={x:153,y:HEIGHT/2,r:21};this.target={x:153,y:HEIGHT/2};
    this.objects=[];this.score=0;this.hearts=3;this.invincible=0;this.shield=0;
    this.obstacleTimer=0;this.coinTimer=0;this.crateTimer=0;this.events=[];
  }
  start(){this.state='playing';this.elapsed=0;this.distance=0;this.score=0;this.hearts=3;
    this.rocket={x:153,y:HEIGHT/2,r:21};this.target={x:153,y:HEIGHT/2};
    this.objects=[];this.invincible=1.6;this.shield=0;this.obstacleTimer=1.5;this.coinTimer=0.65;
    this.crateTimer=11;this.events=[];
  }
  setTarget(x,y){this.target.x=clamp(x,64,430);this.target.y=clamp(y,62,HEIGHT-60);}
  pause(){if(this.state==='playing')this.state='paused';}
  resume(){if(this.state==='paused')this.state='playing';}
  randomRange(min,max){return min+this.rng()*(max-min);}
  spawnObstacle(){const kinds=['asteroid','asteroid','satellite','ship'];const kind=kinds[Math.min(kinds.length-1,Math.floor(this.rng()*kinds.length))];
    const radius=kind==='asteroid'?this.randomRange(23,37):kind==='satellite'?30:27;
    this.objects.push({kind,x:WIDTH+60,y:this.randomRange(75,HEIGHT-75),r:radius,rot:this.randomRange(0,Math.PI*2),id:this.rng()});
  }
  spawnCoin(){this.objects.push({kind:'coin',x:WIDTH+35,y:this.randomRange(72,HEIGHT-72),r:16,rot:0});}
  spawnCrate(){this.objects.push({kind:'crate',x:WIDTH+45,y:this.randomRange(90,HEIGHT-90),r:23,rot:0});}
  useCrate(){const chance=this.rng();if(chance<0.35){this.shield=1;this.events.push('Escudo ativado!');}
    else if(chance<0.70){this.hearts=clamp(this.hearts+1,0,3);this.events.push('Coração recuperado!');}
    else{this.invincible=Math.max(this.invincible,5);this.events.push('Invencibilidade!');}}
  update(delta){if(this.state!=='playing')return;
    const dt=clamp(delta,0,0.05);this.events=[];this.elapsed+=dt;this.distance+=this.config.speed*dt;
    const smoothing=Math.min(1,12*dt);this.rocket.x+=(this.target.x-this.rocket.x)*smoothing;
    this.rocket.y+=(this.target.y-this.rocket.y)*smoothing;
    this.invincible=Math.max(0,this.invincible-dt);
    this.obstacleTimer-=dt;this.coinTimer-=dt;this.crateTimer-=dt;
    if(this.obstacleTimer<=0){this.spawnObstacle();this.obstacleTimer+=this.config.obstacleDelay;}
    if(this.coinTimer<=0){this.spawnCoin();this.coinTimer+=this.config.coinDelay;}
    if(this.crateTimer<=0){this.spawnCrate();this.crateTimer+=13;}
    for(const item of this.objects){item.x-=this.config.speed*dt;if(item.kind==='coin')item.rot+=3.5*dt;
      if(item.dead||!intersects(this.rocket,item))continue;
      if(item.kind==='coin'){item.dead=true;this.score++;this.save.wallet++;this.events.push('Moeda coletada!');}
      else if(item.kind==='crate'){item.dead=true;this.useCrate();}
      else if(this.invincible<=0){item.dead=true;if(this.shield){this.shield=0;this.invincible=1.0;this.events.push('Escudo protegeu!');}
        else{this.hearts--;this.invincible=1.8;this.events.push('Colisão!');if(this.hearts<=0){this.hearts=0;this.state='gameover';this.events.push('Fim de jogo');}}}
    }
    this.objects=this.objects.filter(i=>!i.dead&&i.x>-70);
    if(this.score>this.save.best)this.save.best=this.score;
    if(this.state==='playing'&&this.elapsed>=STAGE_SECONDS){this.state='victory';this.save.completed=Math.max(this.save.completed,1);this.events.push('Fase concluída!');}
  }
  repair(){if(this.state!=='victory'||this.hearts>=3||this.save.wallet<REPAIR_COST)return false;
    this.hearts++;this.save.wallet-=REPAIR_COST;this.events.push('Foguete consertado!');return true;}
  snapshot(){return {state:this.state,elapsed:this.elapsed,score:this.score,hearts:this.hearts,wallet:this.save.wallet,best:this.save.best,completed:this.save.completed,shield:this.shield};}
}


export {WIDTH,HEIGHT,STAGE_SECONDS,REPAIR_COST,normalizePointer,sanitizeSave,GameState,freshSave,intersects};

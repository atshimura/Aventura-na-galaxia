import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GameState} from '../web/core.mjs';
import {WORLD_LENGTH,GRAVITY,JUMP_SPEED,FLIGHT_PAD_X,groundAt,isPit,
 newAstronaut,createPlanetLevel,jumpAstronaut,moveAstronaut,respawnAstronaut,canBoard} from '../web/platformer.mjs';
import {arrangement,SpaceAudio} from '../web/music-v2.mjs';
import {readFileSync} from 'node:fs';
function fresh(stage=1){
 const g=new GameState({stage,difficulty:'facil',rng:()=>.5});
 g.start();g.elapsed=g.duration*.4;assert.equal(g.enterPlanet(),true);
 return g;
}
function step(g,seconds){const times=Math.ceil(seconds/.05);for(let i=0;i<times;i++)g.update(Math.min(.05,seconds-i*.05));}
function walk(){const g=fresh();step(g,2.25);assert.equal(g.state,'landed');g.leaveRocket();step(g,1.3);assert.equal(g.state,'walking');return g;}
test('mundo tem terreno sólido, inclinações e precipícios',()=>{
 assert.ok(WORLD_LENGTH>2000);assert.equal(groundAt(550),null);
 assert.equal(isPit(200),false);assert.equal(isPit(1060),true);
 assert.ok(groundAt(200,'ice')<groundAt(200,'lava'));
});
test('pouso só termina depois da animação e jogador continua sem cronômetro',()=>{
 const g=fresh();assert.equal(g.state,'landing');
 step(g,1);assert.equal(g.state,'landing');assert.ok(g.transitionProgress>0);
 step(g,1.3);assert.equal(g.state,'landed');
 step(g,40);assert.equal(g.state,'landed');assert.equal(g.save.exploredPlanets[1],undefined);
});
test('escotilha e desembarque são estados separados',()=>{
 const g=fresh();assert.equal(g.leaveRocket(),false);
 step(g,2.3);assert.equal(g.leaveRocket(),true);assert.equal(g.state,'disembarking');
 step(g,1.3);assert.equal(g.state,'walking');assert.equal(g.planetVisited,false);
});
test('joystick desloca nave diretamente, sem perseguir alvo lento',()=>{
 const g=new GameState({difficulty:'facil'});g.start();
 const x=g.rocket.x;g.steer({x:1,y:0},.05);
 assert.ok(g.rocket.x>x+15);assert.equal(g.rocket.x,g.target.x);
 g.stopSteering();assert.equal(g.target.x,g.rocket.x);
});
test('astronauta caminha lateralmente e não levita',()=>{
 const g=walk(),y=g.astronaut.y,first=g.astronaut.x;
 g.steer({x:1,y:1},.05);step(g,.1);
 assert.ok(g.astronaut.x>first);assert.equal(g.astronaut.onGround,true);
 assert.ok(Math.abs(g.astronaut.y-y)<3);
 g.stopSteering();const x=g.astronaut.x;step(g,.1);assert.equal(g.astronaut.x,x);
});
test('salto aplica gravidade e somente pode repetir quando pousar',()=>{
 const g=walk();assert.equal(g.jump(),true);assert.equal(g.jump(),false);
 step(g,.1);assert.ok(g.astronaut.vy<0);assert.ok(g.astronaut.y<400);
 step(g,1.3);assert.equal(g.astronaut.onGround,true);assert.equal(g.jump(),true);
});
test('os quatro precipícios precisam ser atravessados saltando',()=>{
 const g=walk();g.astronaut.x=520;
 g.astronaut.y=groundAt(520,g.planet.biome)-21;
 g.astronaut.onGround=true;assert.equal(g.jump(),true);
 g.steer({x:1,y:0},.05);
 for(let i=0;i<18;i++)g.update(.05);
 assert.ok(g.astronaut.x>615);assert.ok(g.astronaut.y<500);
});
test('fazer exploração por mais de um minuto não termina o planeta',()=>{
 const g=walk();
 // Desliga hazards para medir apenas ausência de cronômetro.
 g.surface.objects=[];step(g,61);
 assert.equal(g.state,'walking');assert.ok(g.planetElapsed>=60);
});
test('cristais, checkpoint e habitantes nascem em cada bioma',()=>{
 for(const biome of ['forest','ice','desert','lava','city']){
   const objs=createPlanetLevel(4,biome);
   assert.equal(objs.filter(o=>o.kind==='checkpoint').length,3);
   assert.ok(objs.some(o=>o.kind==='animal'));assert.ok(objs.some(o=>o.kind==='gem'));
 }
});
test('checkpoint protege progresso mesmo após perda de três corações',()=>{
 const g=walk();g.surface.objects=[];
 g.checkpointX=745;const oldProgress=g.save.completed;
 for(let i=0;i<3;i++){
   g.invincible=0;g.surface.objects=[{kind:'hazard',x:g.astronaut.x,y:g.astronaut.y,r:27,style:'spikes'}];
   g.update(.01);
 }
 assert.equal(g.state,'walking');assert.equal(g.hearts,3);
 assert.equal(g.astronaut.x,745);assert.equal(g.save.completed,oldProgress);
});
test('é necessário voltar fisicamente à nave para decolar',()=>{
 const g=walk();g.astronaut.x=1300;g.astronaut.onGround=true;
 assert.equal(g.boardRocket(),false);
 respawnAstronaut(g.astronaut,FLIGHT_PAD_X+38,g.planet.biome,g.stage.number);
 assert.equal(canBoard(g.astronaut),true);assert.equal(g.boardRocket(),true);
 step(g,1.05);assert.equal(g.state,'takeoff');
 step(g,2.05);assert.equal(g.state,'naming');assert.equal(g.save.exploredPlanets[1],true);
});
test('música tem contraponto, arpejos, pulso e cenas distintas',()=>{
 const a=arrangement(7,'flight'),b=arrangement(7,'planet');
 for(const key of ['lead','bass','harmony','arp','counter','pulse'])assert.ok(a[key]>0,key);
 assert.equal(a.scene,'flight');assert.equal(b.scene,'planet');
 assert.notEqual(a.hat,b.hat);
});
test('controle de volume é limitado e mantém áudio opcional',()=>{
 const a=new SpaceAudio({});
 assert.equal(a.ctx,null);a.unlock();a.setVolume(8);assert.equal(a.volume,1);
 a.setVolume(-4);assert.equal(a.volume,0);
 a.setEffectsVolume(.7);assert.equal(a.effectsVolume,.7);
 a.setScene('planet');assert.equal(a.scene,'planet');a.setEnabled(false);assert.equal(a.enabled,false);
});
test('interface contém salto, joystick, controles de volume e cena planetária',()=>{
 const base=new URL('../web/',import.meta.url);
 const html=readFileSync(new URL('index.html',base),'utf8');
 const main=readFileSync(new URL('main.mjs',base),'utf8');
 for(const id of ['joystick','jump-btn','music-volume','effects-volume'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(main,/drawPlatformPlanet/);assert.match(main,/game\.jump\(\)/);
 assert.match(main,/\['playing','walking'\]\.includes\(game\.state\)/);
});

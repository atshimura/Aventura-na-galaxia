import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GameState,STAGES,TOTAL_STAGES,STAGE_SECONDS,DOCKING_SECONDS,canPlayStage,stageDuration,obstacleMotion,sanitizeSave} from '../web/core.mjs';
function advance(g,t){const iterations=Math.ceil(t/.05);for(let i=0;i<iterations;i++)g.update(.05)}
const disableSpawns=g=>{g.spawnObstacle=()=>{};g.spawnCoin=()=>{};g.spawnCrate=()=>{};};
test('existem exatamente 20 fases nomeadas de forma única',()=>{
 assert.equal(TOTAL_STAGES,20);assert.equal(STAGES.length,20);assert.equal(new Set(STAGES.map(s=>s.name)).size,20);
 for(let i=0;i<20;i++){assert.equal(STAGES[i].number,i+1);assert.match(STAGES[i].nebula,/^#[0-9a-f]{6}$/i)}
});
test('progressão só libera a próxima fase e não permite pulos',()=>{
 let save=sanitizeSave({completed:0});assert.ok(canPlayStage(save,1));assert.ok(!canPlayStage(save,2));
 save.completed=6;assert.ok(canPlayStage(save,7));assert.ok(!canPlayStage(save,8));
 for(const n of [0,21,1.4,NaN])assert.equal(canPlayStage(save,n),false);
});
test('fase 1 preserva duração e física inicial',()=>{
 const g=new GameState({stage:1});assert.equal(g.duration,STAGE_SECONDS);assert.equal(g.motion,'linear');
 assert.equal(obstacleMotion(2),'linear');assert.equal(obstacleMotion(3),'vertical');
 assert.equal(obstacleMotion(5),'wave');assert.equal(obstacleMotion(12),'drift');assert.equal(obstacleMotion(20),'complex');
});
test('duração e ritmo progridem sem redução',()=>{
 let prev=0;
 for(let n=1;n<=TOTAL_STAGES;n++){
  const d=stageDuration(n);assert.ok(d>=prev);assert.ok(d>DOCKING_SECONDS);prev=d;
  const g=new GameState({stage:n,difficulty:'normal'});
  assert.equal(g.duration,d);assert.ok(g.config.obstacleDelay>0);assert.ok(g.config.speed>0);
 }
});
test('fase 2 completa desbloqueia a 3 sem apagar conclusão da 1',()=>{
 const g=new GameState({stage:2,save:{completed:1,heartReserve:3,wallet:37,best:5}});
 g.start();disableSpawns(g);advance(g,g.duration+.1);
 assert.equal(g.state,'victory');assert.equal(g.save.completed,2);
 assert.equal(g.save.wallet,37);assert.equal(g.save.bestByStage['2'],0);
 assert.equal(canPlayStage(g.save,3),true);
});
test('fase fracassada não avança desbloqueios e reinicia corações',()=>{
 const g=new GameState({stage:4,save:{completed:3,heartReserve:3}});g.start();
 for(let i=0;i<3;i++){
  g.invincible=0;g.objects=[{kind:'asteroid',x:g.rocket.x,y:g.rocket.y,r:32}];g.update(.01);
 }
 assert.equal(g.state,'gameover');assert.equal(g.save.completed,3);assert.equal(g.save.heartReserve,3);
});
test('vidas remanescentes ficam na próxima fase e podem ser reparadas',()=>{
 const g=new GameState({stage:3,save:{completed:2,heartReserve:2,wallet:50}});g.start();
 assert.equal(g.hearts,2);disableSpawns(g);advance(g,g.duration+.2);assert.equal(g.state,'victory');
 assert.equal(g.save.heartReserve,2);assert.equal(g.repair(),true);assert.equal(g.save.heartReserve,3);
 const next=new GameState({stage:4,save:g.save});next.start();assert.equal(next.hearts,3);
});
test('fase 20 conclui aventura e libera marcador da galáxia secreta',()=>{
 const g=new GameState({stage:20,save:{completed:19,heartReserve:3}});g.start();disableSpawns(g);
 advance(g,g.duration+.1);assert.equal(g.state,'victory');assert.equal(g.save.completed,20);
 assert.equal(g.save.secretUnlocked,true);assert.equal(canPlayStage(g.save,21),false);
});
test('salvamento antigo carrega e evita registros inválidos',()=>{
 const s=sanitizeSave({completed:1,wallet:12,best:4,bestByStage:{'2':-44,'abc':99,'21':100,'1':12}});
 assert.equal(s.heartReserve,3);assert.equal(s.wallet,12);assert.equal(s.bestByStage[1],12);
 assert.equal(s.bestByStage[2],0);assert.equal(s.bestByStage.abc,undefined);
 assert.equal(s.secretUnlocked,false);
});
test('obstáculos nas primeiras fases são lineares e depois se movem',()=>{
 const make=(stage)=>{const g=new GameState({stage,rng:()=>.25});g.start();g.objects=[];g.spawnObstacle();g.obstacleTimer=999;g.coinTimer=999;g.crateTimer=999;return g};
 const early=make(1),late=make(8),wave=late.objects[0];
 const y=wave.y;late.update(.05);assert.notEqual(wave.y,y);
 const first=early.objects[0],origin=first.y;early.update(.05);assert.equal(first.y,origin);
});

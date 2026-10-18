import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState,CRATE_REWARDS,chooseCrateReward,eligibleCrateRewards,MAGNET_SECONDS,FREEZE_SECONDS,FREEZE_MULTIPLIER} from '../web/core.mjs';

const make=(random=()=>.5,save={})=>{
 const g=new GameState({difficulty:'facil',rng:random,save});g.start();
 g.obstacleTimer=g.coinTimer=g.crateTimer=1000;
 return g;
};
const rngSequence=(...sequence)=>{let i=0;return()=>sequence[Math.min(i++,sequence.length-1)];};
const danger=(kind,x,y)=>({kind,x,y,r:22,age:0,phase:0,originY:y});
const crateIds=['shield','heart','magnet','treasure','freeze','cleanse'];

test('catálogo completo contém seis prêmios, pesos 20/18/19/20/13/10',()=>{
 assert.deepEqual(CRATE_REWARDS.map(x=>x.id),crateIds);
 assert.deepEqual(CRATE_REWARDS.map(x=>x.weight),[20,18,19,20,13,10]);
 assert.equal(CRATE_REWARDS.reduce((n,x)=>n+x.weight,0),100);
 assert.ok(CRATE_REWARDS.every(x=>x.weight>0));
});
test('não existe invencibilidade como resultado da caixinha',()=>{
 const g=make();g.invincible=0;
 for(const reward of CRATE_REWARDS)assert.notEqual(reward.id,'invincible');
 for(let n=0;n<100;n++){g.rng=()=>n/100;g.objects=[];assert.notEqual(g.useCrate(),'invincible');}
 assert.equal(g.invincible,0,'não concede imunidade longa como prêmio');
});
test('só entram prêmios úteis, e coração e escudo são excluídos quando completos',()=>{
 const g=make();g.hearts=3;g.shield=1;g.objects=[];
 assert.deepEqual(eligibleCrateRewards(g).map(p=>p.id),['magnet','treasure','freeze']);
 for(let i=0;i<=100;i++){
  const id=chooseCrateReward(g,()=>i/100);
  assert.ok(['magnet','treasure','freeze'].includes(id));
 }
});
test('escudo continua protegendo uma colisão, sem prêmio redundante',()=>{
 const g=make(()=>0);
 g.hearts=3;
 assert.equal(g.useCrate(),'shield');assert.equal(g.shield,1);
 assert.notEqual(g.useCrate(),'shield');
 g.invincible=0;g.objects=[danger('asteroid',g.rocket.x,g.rocket.y)];
 g.update(.01);assert.equal(g.hearts,3);assert.equal(g.shield,0);
});
test('coração só sorteia com vida faltando e respeita três vidas',()=>{
 const g=make(()=>.24);g.hearts=2;
 assert.equal(g.useCrate(),'heart');assert.equal(g.hearts,3);
 assert.notEqual(g.useCrate(),'heart');assert.equal(g.hearts,3);
});
test('probabilidade renormalizada preserva proporcionalidade dos pesos restantes',()=>{
 const g=make();g.hearts=3;g.shield=1;g.objects=[];
 const counts=new Map(crateIds.map(id=>[id,0]));
 for(let i=0;i<520;i++){const id=chooseCrateReward(g,()=>(i+.5)/520);counts.set(id,counts.get(id)+1);}
 assert.equal(counts.get('magnet'),190);
 assert.equal(counts.get('treasure'),200);
 assert.equal(counts.get('freeze'),130);
 assert.equal(counts.get('shield'),0);
 assert.equal(counts.get('heart'),0);
 assert.equal(counts.get('cleanse'),0);
});
test('ímã dura oito segundos, renova sem acumular e vence somente durante o voo',()=>{
 const g=make(()=>0);g.shield=1;
 assert.equal(g.useCrate(),'magnet');assert.equal(g.magnetTime,MAGNET_SECONDS);
 g.update(.05);assert.equal(g.magnetTime,MAGNET_SECONDS-.05);
 g.pause();g.update(5);assert.equal(g.magnetTime,MAGNET_SECONDS-.05);
 g.resume();g.magnetTime=2;assert.equal(g.useCrate(),'magnet');
 assert.equal(g.magnetTime,8);
});
test('ímã atrai moedas próximas sem alterar moedas distantes nem cristais',()=>{
 const g=make(()=>0);g.shield=1;g.useCrate();
 const close={kind:'coin',x:g.rocket.x+152,y:g.rocket.y+17,r:16,age:0};
 const far={kind:'coin',x:g.rocket.x+480,y:g.rocket.y+60,r:16,age:0};
 const gem={kind:'gem',x:g.rocket.x+152,y:g.rocket.y+17,r:19,age:0};
 g.objects=[close,far,gem];const initial=[close.x,far.x,gem.x];
 g.update(.05);
 assert.ok(close.x<initial[0]-10,'ímã acelera moeda próxima');
 assert.ok(Math.abs(far.x-(initial[1]-190*.05))<1e-6,'não atrai moeda fora do raio');
 assert.ok(Math.abs(gem.x-(initial[2]-190*.05))<1e-6,'não atrai cristal');
 for(let i=0;i<20;i++)g.update(.05);
 assert.ok(g.score>=1);
});
test('tesouro entre 8 e 15 moedas credita carteira, pontos e recorde',()=>{
 for(const [random,amount] of [[0,8],[.999,15]]){
  const g=make(rngSequence(.5,random));g.shield=1;
  assert.equal(g.useCrate(),'treasure');assert.equal(g.save.wallet,amount);
  assert.equal(g.score,amount);assert.equal(g.save.best,amount);
  assert.ok(g.events.includes('Tesouro espacial: +'+amount+' moedas!'));
 }
});
test('tesouro atualiza recorde do modo infinito',()=>{
 const g=new GameState({mode:'infinite',difficulty:'facil',rng:rngSequence(.5,.5)});
 g.start();g.shield=1;g.useCrate();
 assert.equal(g.save.bestInfinite,12);
});
test('congelamento dura seis segundos e renovação reinicia o relógio',()=>{
 const g=make(()=>.9999);g.shield=1;
 assert.equal(g.useCrate(),'freeze');assert.equal(g.freezeTime,FREEZE_SECONDS);
 g.update(.05);assert.equal(g.freezeTime,FREEZE_SECONDS-.05);
 g.freezeTime=2;assert.equal(g.useCrate(),'freeze');
 assert.equal(g.freezeTime,6);
});
test('congelamento desacelera asteroides e laser 70% sem reduzir a nave',()=>{
 const normal=make(),frozen=make();
 const setup=g=>{g.objects=[danger('asteroid',760,420),{kind:'laser',x:780,y:420,r:10,velocity:390}];g.setTarget(220,250);};
 setup(normal);setup(frozen);frozen.freezeTime=6;
 normal.update(.05);frozen.update(.05);
 const nx=normal.objects[0].x,fx=frozen.objects[0].x;
 assert.ok(Math.abs((760-fx)/(760-nx)-FREEZE_MULTIPLIER)<.0001);
 assert.ok(Math.abs((780-frozen.objects[1].x)/(780-normal.objects[1].x)-FREEZE_MULTIPLIER)<.0001);
 assert.equal(frozen.rocket.x,normal.rocket.x,'foguete não fica lento');
 assert.equal(frozen.rocket.y,normal.rocket.y);
});
test('limpeza só entra no sorteio se há perigos próximos e à frente',()=>{
 const g=make();g.shield=1;g.hearts=3;
 assert.equal(eligibleCrateRewards(g).some(x=>x.id==='cleanse'),false);
 g.objects=[danger('asteroid',g.rocket.x+200,g.rocket.y)];
 assert.equal(eligibleCrateRewards(g).some(x=>x.id==='cleanse'),true);
 g.objects=[danger('asteroid',g.rocket.x+600,g.rocket.y)];
 assert.equal(eligibleCrateRewards(g).some(x=>x.id==='cleanse'),false);
});
test('raio limpa perigos e projéteis próximos, preservando moedas, caixas e perigos distantes',()=>{
 const g=make(()=>.9999);g.shield=1;
 const near=danger('asteroid',g.rocket.x+220,g.rocket.y);
 const projectile=danger('laser',g.rocket.x+80,g.rocket.y+60);
 const ship=danger('ship',g.rocket.x+250,g.rocket.y-50);
 const far=danger('asteroid',g.rocket.x+620,g.rocket.y);
 const above=danger('mine',g.rocket.x+130,g.rocket.y-210);
 const coin={kind:'coin',x:g.rocket.x+200,y:g.rocket.y,r:16};
 const crate={kind:'crate',x:g.rocket.x+110,y:g.rocket.y,r:23};
 g.objects=[near,projectile,ship,far,above,coin,crate];
 assert.equal(g.useCrate(),'cleanse');
 assert.ok(near.dead&&projectile.dead&&ship.dead);
 assert.equal(far.dead,undefined);assert.equal(above.dead,undefined);
 assert.equal(coin.dead,undefined);assert.equal(crate.dead,undefined);
 assert.equal(g.cleanseFlash,.55);
 assert.ok(g.events.includes('Raio de limpeza: 3 perigos eliminados!'));
});
test('caixinha limpa perigos antes de uma colisão no mesmo quadro',()=>{
 const g=make(()=>.9999);g.shield=1;
 const crate={kind:'crate',x:g.rocket.x,y:g.rocket.y,r:23};
 const asteroid=danger('asteroid',g.rocket.x,g.rocket.y);
 g.objects=[crate,asteroid];g.invincible=0;
 g.update(.01);
 assert.equal(g.hearts,3);assert.equal(g.shield,1);
 assert.ok(!g.objects.includes(asteroid));
});
test('progresso mantém timers fora da fase, sem persistir no salvamento',()=>{
 const g=make(()=>0);g.shield=1;g.useCrate();
 const before=g.magnetTime;
 g.state='landed';g.update(.05);assert.equal(g.magnetTime,before);
 g.start();assert.equal(g.magnetTime,0);
 assert.equal(g.freezeTime,0);assert.equal(g.cleanseFlash,0);
 assert.equal(Object.hasOwn(g.save,'magnetTime'),false);
});
test('interface mostra HUD temporizado e feedback visual e remove texto do prêmio antigo',()=>{
 const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const main=readFileSync(new URL('../web/main.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
 const core=readFileSync(new URL('../web/core.mjs',import.meta.url),'utf8');
 for(const id of ['magnet-status','freeze-status'])assert.match(html,new RegExp('id="'+id+'"'));
 for(const t of ['magnetTime','freezeTime','drawCratePowerEffects','Raio de limpeza:','Tesouro espacial:'])assert.ok(main.includes(t));
 assert.ok(css.includes('power-timers'));
 assert.doesNotMatch(core,/events\.push\('Invencibilidade!'\)/);
});
test('Android 0.6.6 atualiza o número da versão',()=>{
 const gradle=readFileSync(new URL('../android/app/build.gradle',import.meta.url),'utf8');
 assert.match(gradle,/versionCode 12/);
 assert.match(gradle,/versionName '0.6.6'/);
});

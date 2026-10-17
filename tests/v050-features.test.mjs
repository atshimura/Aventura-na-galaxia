import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState,sanitizeSave} from '../web/core.mjs';
import {ROCKETS,DEFAULT_ROCKET,rocketById,sanitizeRockets,purchase,equip} from '../web/rockets.mjs';
function make(stage=1,mode='adventure',save={}){return new GameState({stage,mode,save,rng:()=>.5,difficulty:'facil'});}
test('garagem contém quatro foguetes com preço crescente',()=>{
 assert.equal(ROCKETS.length,4);
 assert.deepEqual(ROCKETS.map(r=>r.cost),[0,60,120,200]);
 assert.equal(DEFAULT_ROCKET,'aurora');assert.equal(rocketById('desconhecido').id,'aurora');
});
test('salvamento antigo recebe nave inicial e recorde infinito',()=>{
 const s=sanitizeSave({wallet:82,completed:3,best:9});
 assert.deepEqual(s.unlockedRockets,['aurora']);assert.equal(s.selectedRocket,'aurora');assert.equal(s.bestInfinite,0);
 assert.equal(s.wallet,82);assert.equal(s.completed,3);
});
test('catálogo ignora ids adulterados e permite só naves disponíveis',()=>{
 assert.deepEqual(sanitizeRockets(['guardiao','cometa','inventado','cometa']),['aurora','cometa','guardiao']);
 assert.equal(sanitizeSave({selectedRocket:'guardiao',unlockedRockets:['cometa']}).selectedRocket,'aurora');
});
test('compra desconta moedas exatas e impede repetição',()=>{
 const g=make(1,'adventure',{wallet:80});
 assert.equal(g.buyRocket('cometa'),true);assert.equal(g.save.wallet,20);
 assert.equal(g.buyRocket('cometa'),false);assert.equal(g.save.wallet,20);
 assert.equal(g.buyRocket('guardiao'),false);assert.equal(g.buyRocket('unknown'),false);
});
test('não equipa nave bloqueada, equipa e salva quando comprada',()=>{
 const g=make(1,'adventure',{wallet:230});
 assert.equal(g.equipRocket('guardiao'),false);
 assert.equal(g.buyRocket('guardiao'),true);assert.equal(g.equipRocket('guardiao'),true);
 assert.equal(g.save.wallet,30);assert.equal(g.save.selectedRocket,'guardiao');
 const next=make(1,'adventure',g.save);next.start();assert.equal(next.shield,1);assert.equal(next.rocketModel.id,'guardiao');
});
test('foguete Cometa controla 18 por cento mais rápido',()=>{
 const first=make(),second=make(1,'adventure',{unlockedRockets:['cometa'],selectedRocket:'cometa'});
 first.start();second.start();first.steer({x:1,y:0},.05);second.steer({x:1,y:0},.05);
 assert.ok(second.target.x>first.target.x);
});
test('nave inicial continua gratuita e equipada',()=>{
 const g=make();g.start();assert.equal(g.rocketModel.id,'aurora');assert.equal(g.shield,0);
});
test('Modo Infinito começa com três corações mesmo após campanha machucada',()=>{
 const g=make(1,'infinite',{heartReserve:1,completed:5});g.start();
 assert.equal(g.hearts,3);assert.equal(g.mode,'infinite');assert.equal(g.save.completed,5);
});
test('Modo Infinito não acopla nem termina por tempo',()=>{
 const g=make(1,'infinite');g.start();
 g.spawnObstacle=()=>{};g.spawnCoin=()=>{};g.spawnCrate=()=>{};g.moveObjects=()=>{};
 for(let i=0;i<1250;i++)g.update(.05);
 assert.equal(g.state,'playing');assert.ok(g.elapsed>60);
 assert.ok(g.infiniteLevel>=3);assert.ok(g.config.speed>190);
});
test('recorde infinito é separado do recorde de aventura',()=>{
 const g=make(1,'infinite',{best:300,bestInfinite:2});g.start();
 g.objects=[{kind:'coin',x:153,y:270,r:15}];g.update(.01);
 assert.equal(g.save.best,300);assert.equal(g.save.bestInfinite,2);
 for(let i=0;i<3;i++){g.objects=[{kind:'coin',x:g.rocket.x,y:g.rocket.y,r:15}];g.update(.01);}
 assert.ok(g.save.bestInfinite>=4);assert.equal(g.save.best,300);
});
test('fim no infinito não reduz a reserva de corações na aventura',()=>{
 const g=make(1,'infinite',{heartReserve:2});g.start();
 for(let i=0;i<3;i++){g.invincible=0;g.objects=[{kind:'asteroid',x:g.rocket.x,y:g.rocket.y,r:40,id:0,rot:0}];g.update(.01);}
 assert.equal(g.state,'gameover');assert.equal(g.save.heartReserve,2);
});
test('laser pode ser disparado apenas por uma nave',()=>{
 const g=make(3);g.start();const ship={kind:'ship',x:600,y:270,r:30,shot:false};
 assert.equal(g.spawnLaser(ship),true);assert.equal(g.spawnLaser(ship),false);
 assert.equal(g.lasersFired,1);assert.equal(g.objects.at(-1).kind,'laser');
 assert.equal(g.spawnLaser({kind:'asteroid'}),false);
});
test('nave atira automaticamente a partir da fase 3',()=>{
 const g=make(3);g.start();g.invincible=4;
 g.obstacleTimer=100;g.coinTimer=100;g.crateTimer=100;
 g.objects=[{kind:'ship',x:800,y:450,r:30,shot:false,fireDelay:.1,age:0,phase:0,originY:450}];
 for(let i=0;i<5;i++)g.update(.04);
 assert.ok(g.lasersFired>=1);
});
test('antes da fase 3 nave não tem projétil',()=>{
 const g=make(2);g.start();g.obstacleTimer=100;g.coinTimer=100;g.crateTimer=100;
 g.objects=[{kind:'ship',x:800,y:450,r:30,shot:false,fireDelay:.1,age:0,phase:0,originY:450}];
 for(let i=0;i<7;i++)g.update(.04);assert.equal(g.lasersFired,0);
});
test('laser acerta a nave e consome apenas uma vida',()=>{
 const g=make(3);g.start();g.invincible=0;
 g.obstacleTimer=100;g.coinTimer=100;g.crateTimer=100;
 g.objects=[{kind:'laser',x:158,y:270,r:10,velocity:390}];g.update(.01);
 assert.equal(g.hearts,2);assert.ok(g.invincible>0);
});
test('escudo bloqueia um disparo laser',()=>{
 const g=make(3,'adventure',{selectedRocket:'guardiao',unlockedRockets:['guardiao']});
 g.start();g.invincible=0;g.objects=[{kind:'laser',x:158,y:270,r:10,velocity:390}];g.update(.01);
 assert.equal(g.hearts,3);assert.equal(g.shield,0);
});
test('modo infinito não permite visitar planetas',()=>{
 const g=make(1,'infinite');g.start();g.elapsed=g.duration*.5;
 assert.equal(g.canExplorePlanet(),false);assert.equal(g.enterPlanet(),false);
});
test('astronauta só desembarca durante a exploração',()=>{

 const g=make();g.start();assert.equal(g.leaveRocket(),false);
 g.elapsed=g.duration*.4;assert.equal(g.enterPlanet(),true);
 assert.equal(g.leaveRocket(),false);for(let i=0;i<45;i++)g.update(.05);
 assert.equal(g.state,'landed');assert.equal(g.leaveRocket(),true);
 assert.equal(g.state,'disembarking');for(let i=0;i<26;i++)g.update(.05);
 assert.equal(g.state,'walking');
});

test('astronauta move-se com joystick e respeita limites',()=>{

 const g=make();g.start();g.elapsed=g.duration*.4;g.enterPlanet();
 for(let i=0;i<45;i++)g.update(.05);g.leaveRocket();for(let i=0;i<26;i++)g.update(.05);
 const x=g.astronaut.x;g.steer({x:1,y:0},.05);g.update(.05);
 assert.ok(g.astronaut.x>x);assert.ok(g.astronaut.x<2520);
 assert.equal(g.footTarget.x,165);
});

test('astronauta volta ao foguete sem reiniciar planeta',()=>{

 const g=make();g.start();g.elapsed=g.duration*.4;g.enterPlanet();
 for(let i=0;i<45;i++)g.update(.05);g.leaveRocket();for(let i=0;i<26;i++)g.update(.05);
 const elapsed=g.planetElapsed;assert.equal(g.boardRocket(),true);
 assert.equal(g.state,'boarding');for(let i=0;i<21;i++)g.update(.05);
 assert.equal(g.state,'takeoff');assert.equal(g.planetElapsed,elapsed);
});

test('caminhada também termina com nomeação do planeta',()=>{

 const g=make();g.start();g.elapsed=g.duration*.4;g.enterPlanet();
 for(let i=0;i<45;i++)g.update(.05);g.leaveRocket();for(let i=0;i<26;i++)g.update(.05);
 for(let i=0;i<350;i++)g.update(.05);assert.equal(g.state,'walking');
 assert.equal(g.boardRocket(),true);
 for(let i=0;i<64;i++)g.update(.05);
 assert.equal(g.state,'naming');assert.equal(g.save.exploredPlanets[1],true);
});

test('pausa e retomada durante caminhada',()=>{

 const g=make();g.start();g.elapsed=g.duration*.4;g.enterPlanet();
 for(let i=0;i<45;i++)g.update(.05);g.leaveRocket();for(let i=0;i<26;i++)g.update(.05);
 g.pause();assert.equal(g.state,'paused');g.resume();assert.equal(g.state,'walking');
});

const web=new URL('../web/',import.meta.url);
const file=n=>readFileSync(new URL(n,web),'utf8');
test('interface inclui loja, infinito, saída e embarque',()=>{
 const html=file('index.html');
 for(const id of ['open-shop','infinite','shop','rocket-list','leave-rocket','board-rocket'])assert.ok(html.includes('id="'+id+'"'),id);
});
test('gráficos incluem astronauta e projétil com efeito visual',()=>{
 const main=file('main.mjs');
 assert.match(main,/function astronaut\(/);assert.match(main,/function laserBolt\(/);
 assert.match(main,/game\.state==='walking'/);assert.match(main,/rocketById\(game\.rocketModel\.id\)/);
});
test('biomas têm formas de vida e diferentes vegetações',()=>{
 const visual=file('world-render.mjs');
 assert.match(visual,/drawBiomeLife/);
 for(const id of ['forest','desert','ice','lava','ocean','coral','city'])assert.ok(visual.includes("'"+id+"'"),id);
});
test('áudio inclui efeito de laser e versão Android foi atualizada',()=>{

 assert.match(file('music-v2.mjs'),/kind==='laser'/);
 const build=readFileSync(new URL('../android/app/build.gradle',import.meta.url),'utf8');
 assert.match(build,/versionCode 8/);assert.match(build,/versionName '0.6.2'/);
});

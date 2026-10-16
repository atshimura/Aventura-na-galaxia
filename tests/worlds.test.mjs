import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PLANETS,PLANET_SECONDS,getPlanet,planetVisible,chooseHazard,hazardsForStage,planetObstacleForBiome} from '../web/world.mjs';
import {GameState,sanitizeSave,STAGES,TOTAL_STAGES} from '../web/core.mjs';
import {readFileSync} from 'node:fs';
const g=(stage=1,save)=>new GameState({stage,difficulty:'facil',rng:()=>.45,save});
function run(game,seconds){for(let i=0;i<seconds-.001;i+=.05)game.update(Math.min(.05,seconds-i));}
test('20 planetas, biomas visualmente distintos e conteúdo identificável',()=>{
 assert.equal(PLANETS.length,20);assert.equal(new Set(PLANETS.map(x=>x.name)).size,20);
 assert.ok(new Set(PLANETS.map(x=>x.biome)).size>=10);assert.equal(STAGES.length,TOTAL_STAGES);
 for(let i=1;i<=20;i++){const p=getPlanet(i);assert.equal(p.stage,i);assert.ok(p.landmark);assert.match(p.sky,/^#[0-9a-f]{6}$/i);}
});
test('obstáculos são cumulativos e liberados gradualmente',()=>{
 assert.deepEqual(hazardsForStage(1),['asteroid']);
 let old=[];for(let i=1;i<=20;i++){const hazards=hazardsForStage(i);for(const item of old)assert.ok(hazards.includes(item));old=hazards;}
 for(const [stage,kind] of [[2,'satellite'],[3,'ship'],[4,'debris'],[5,'comet'],[7,'mine'],[9,'plasma'],[12,'drone'],[15,'crystal'],[18,'vortex']])assert.ok(hazardsForStage(stage).includes(kind));
});
test('gerador utiliza tipos que já foram desbloqueados',()=>{
 for(let i=1;i<=20;i++)for(const n of [0,.5,.999,1])assert.ok(hazardsForStage(i).includes(chooseHazard(i,()=>n)));
});
test('cada bioma recebe elementos visuais e perigos próprios',()=>{
 for(const planet of PLANETS)assert.match(planetObstacleForBiome(planet.biome),/^[a-z-]+$/);
 assert.notEqual(planetObstacleForBiome('ice'),planetObstacleForBiome('lava'));
});
test('exploração só pode ser iniciada na janela de aproximação',()=>{
 const game=g();game.start();assert.equal(game.enterPlanet(),false);
 game.elapsed=game.duration*.40;assert.equal(planetVisible(game.elapsed,game.duration),true);
 assert.equal(game.enterPlanet(),true);assert.equal(game.state,'exploring');assert.equal(game.enterPlanet(),false);
});
test('relógio orbital fica congelado durante a visita e joystick continua funcionando',()=>{
 const game=g();game.start();game.elapsed=game.duration*.4;game.enterPlanet();
 const time=game.elapsed,old=game.target.x;game.steer({x:1,y:0},.05);assert.ok(game.target.x>old);
 game.spawnPlanetObstacle=()=>{};game.spawnCoin=()=>{};run(game,2);
 assert.equal(game.elapsed,time);assert.ok(game.planetElapsed>1.9);
});
test('cristais dão três moedas e ficam na carteira',()=>{
 const game=g();game.start();game.elapsed=game.duration*.4;game.enterPlanet();
 game.planetObstacleTimer=99;game.planetCoinTimer=99;
 game.objects=[{kind:'gem',x:game.rocket.x,y:game.rocket.y,r:16}];game.update(.01);
 assert.equal(game.score,3);assert.equal(game.save.wallet,3);assert.ok(game.events.includes('Cristal coletado!'));
});
test('após 16 segundos oferece nome de planeta e volta ao espaço',()=>{
 const game=g();game.start();game.elapsed=game.duration*.4;game.enterPlanet();
 game.spawnPlanetObstacle=()=>{};game.spawnCoin=()=>{};
 run(game,PLANET_SECONDS+.1);assert.equal(game.state,'naming');
 assert.equal(game.save.exploredPlanets[1],true);assert.ok(game.planetVisited);
 assert.equal(game.namePlanet('  Azul do Sol  '),true);assert.equal(game.save.planetNames[1],'Azul do Sol');
 assert.equal(game.state,'playing');assert.equal(game.canExplorePlanet(),false);
});
test('nome é limitado e sanitizado; dados persistem entre execuções',()=>{
 const game=g();game.start();game.elapsed=game.duration*.4;game.enterPlanet();game.finishPlanet();game.namePlanet('<i>Novo Mundo</i>');
 assert.ok(!game.save.planetNames[1].includes('<'));
 const restored=sanitizeSave(JSON.parse(JSON.stringify(game.save)));
 assert.equal(restored.exploredPlanets[1],true);assert.equal(restored.planetNames[1],game.save.planetNames[1]);
});
test('é possível não dar nome sem perder a descoberta',()=>{
 const game=g();game.start();game.elapsed=game.duration*.4;game.enterPlanet();game.finishPlanet();
 assert.equal(game.namePlanet(''),true);assert.equal(game.save.exploredPlanets[1],true);
});
test('pausa, retorno e encerramento continuam seguros',()=>{
 const game=g();game.start();game.elapsed=game.duration*.4;game.enterPlanet();game.planetElapsed=2;
 game.pause();game.update(3);assert.equal(game.planetElapsed,2);game.resume();assert.equal(game.state,'exploring');
 game.finishPlanet();game.namePlanet('Mundo');game.spawnObstacle=()=>{};game.spawnCoin=()=>{};game.spawnCrate=()=>{};
 run(game,game.duration);assert.equal(game.state,'victory');assert.equal(game.save.completed,1);
});
test('colisões planetárias podem causar fim de jogo sem registrar descoberta',()=>{
 const game=g();game.start();game.elapsed=game.duration*.4;game.enterPlanet();
 for(let i=0;i<3;i++){game.invincible=0;game.objects=[{kind:'planet-hazard',x:game.rocket.x,y:game.rocket.y,r:33}];game.update(.01);}
 assert.equal(game.state,'gameover');assert.equal(game.save.exploredPlanets[1],undefined);
});
test('UI: explorar, nomear, novos cenários e controle analógico estão conectados',()=>{
 const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../web/main.mjs',import.meta.url),'utf8');
 for(const id of ['explore-btn','planet-name','planet-input','name-planet','joystick'])assert.ok(html.includes('id="'+id+'"'),id);
 for(const target of ['game.enterPlanet()','game.namePlanet(','drawPlanetEnvironment','drawSpaceEnvironment','drawHazard'])assert.ok(js.includes(target),target);
});

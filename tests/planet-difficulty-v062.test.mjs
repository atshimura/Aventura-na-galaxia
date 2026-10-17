import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState} from '../web/core.mjs';
import {getPlanet,PLANETS} from '../web/world.mjs';
import {groundAt,pitsForStage,isPit,difficultyForStage,
 createPlanetLevel,terrainFeatureForBiome,jumpAstronaut,
 newAstronaut,moveAstronaut} from '../web/platformer.mjs';
import {planetSceneSignature,drawPlatformPlanet} from '../web/platformer-render.mjs';

test('fase 1 tem chão plano, contínuo e zero buracos',()=>{
 assert.equal(pitsForStage(1).length,0);
 const heights=new Set();
 for(let x=40;x<=2470;x+=5){
  const y=groundAt(x,'aurora',1);
  assert.notEqual(y,null,'solo interrompido em '+x);
  heights.add(y);
 }
 assert.equal(heights.size,1);
 assert.equal(difficultyForStage(1).hazardCount,0);
 assert.equal(difficultyForStage(1).hostileAnimals,0);
});
test('fase 1 permite caminhar todo o caminho com vidas intactas',()=>{
 const g=new GameState({stage:1,difficulty:'facil',rng:()=>.5});g.start();g.elapsed=g.duration*.4;
 assert.equal(g.enterPlanet(),true);
 for(let i=0;i<46;i++)g.update(.05);assert.equal(g.state,'landed');
 g.leaveRocket();for(let i=0;i<26;i++)g.update(.05);
 assert.equal(g.state,'walking');
 g.invincible=0;
 for(let i=0;i<212;i++){g.steer({x:1,y:0},.05);g.update(.05);}
 assert.equal(g.hearts,3);assert.equal(g.state,'walking');
 assert.ok(g.astronaut.x>2400);
});
test('ameaças terrestres crescem por fase, sem regressão de dificuldade',()=>{
 let prev=-1;
 for(let stage=1;stage<=20;stage++){
  const d=difficultyForStage(stage);
  assert.ok(d.hazardCount>=prev,'fase '+stage);
  prev=d.hazardCount;
 }
 assert.equal(difficultyForStage(1).hazardCount,0);
 assert.equal(difficultyForStage(2).hazardCount,1);
 assert.ok(difficultyForStage(8).hazardCount>difficultyForStage(3).hazardCount);
 assert.ok(difficultyForStage(18).hostileAnimals>difficultyForStage(4).hostileAnimals);
});
test('buracos são introduzidos apenas nas fases 3, 5, 7 e 9',()=>{
 const expected={1:0,2:0,3:1,4:1,5:2,6:2,7:3,8:3,9:4,20:4};
 for(const [stage,n] of Object.entries(expected))assert.equal(pitsForStage(Number(stage)).length,n);
 assert.equal(isPit(552,2),false);
 assert.equal(isPit(552,3),true);
 assert.equal(isPit(1080,4),false);
 assert.equal(isPit(1080,5),true);
});
test('todos os saltos podem superar as larguras máximas dos buracos',()=>{
 const player=newAstronaut('forest',20);
 const takeoff=-505,g=1080,maxTravel=235*((-2*takeoff)/g);
 for(let stage=3;stage<=20;stage++)for(const pit of pitsForStage(stage)){
  assert.ok(pit.width<maxTravel*.68,'fase '+stage+' impossível: '+pit.width);
 }
 assert.ok(player.onGround);
});
test('a primeira fase não tem obstáculos nocivos ou fauna hostil',()=>{
 const all=createPlanetLevel(1,'aurora');
 assert.equal(all.filter(o=>o.kind==='hazard').length,0);
 assert.equal(all.filter(o=>o.kind==='animal'&&!o.friendly).length,0);
 assert.ok(all.filter(o=>o.kind==='gem').length>=12);
 assert.equal(all.filter(o=>o.kind==='checkpoint').length,3);
});
test('biomas têm obstáculos próprios e distribuição cumulativa',()=>{
 const names=['ice','forest','lava','desert','city','ocean','crystals','storm'];
 assert.equal(new Set(names.map(terrainFeatureForBiome)).size,names.length);
 for(let stage=2;stage<=20;stage++){
  const p=getPlanet(stage),objects=createPlanetLevel(stage,p.biome);
  assert.ok(objects.filter(o=>o.kind==='hazard').length<=difficultyForStage(stage).hazardCount);
  for(const o of objects)assert.ok(!isPit(o.x,stage),'objeto dentro de um precipício');
 }
});
test('20 mundos recebem motivos visuais exclusivos, inclusive biomas repetidos',()=>{
 assert.equal(PLANETS.length,20);
 const scenes=PLANETS.map(p=>planetSceneSignature(p.stage));
 assert.equal(new Set(scenes).size,20);
 assert.notEqual(planetSceneSignature(4),planetSceneSignature(11));
 assert.notEqual(planetSceneSignature(9),planetSceneSignature(14));
 assert.notEqual(planetSceneSignature(10),planetSceneSignature(20));
});
test('desenho de todos os planetas não lança exceções e usa tela inteira',()=>{
 let rectangles=0,arcs=0;
 const gradients=()=>({addColorStop(){}});
 const ctx=new Proxy({}, {get(_t,k){
  if(k==='createLinearGradient'||k==='createRadialGradient')return gradients;
  if(k==='fillRect')return()=>rectangles++;
  if(k==='arc')return()=>arcs++;
  return()=>{};
 },set(){return true;}});
 for(let stage=1;stage<=20;stage++){
  const planet=getPlanet(stage);
  const game={planet,astronaut:newAstronaut(planet.biome,stage),surface:{objects:createPlanetLevel(stage,planet.biome)},
   rocketModel:{primary:'#abcabc',accent:'#fffaaa'},state:'walking',transitionProgress:0,save:{planetNames:{}}};
  drawPlatformPlanet(ctx,game,5123);
  assert.ok(Number.isFinite(game.cameraX));
 }
 assert.ok(rectangles>500);
 assert.ok(arcs>100);
});
test('arquivos visuais realmente trazem motivos únicos para vinte planetas',()=>{
 const v=readFileSync(new URL('../web/platformer-render.mjs',import.meta.url),'utf8');
 for(let stage=1;stage<=20;stage++)assert.ok(v.includes('case '+stage+':'));
 assert.match(v,/drawGroundDecoration/);
});
test('versão Android identificada como 0.6.2',()=>{
 const s=readFileSync(new URL('../android/app/build.gradle',import.meta.url),'utf8');
 assert.match(s,/versionCode 9/);assert.match(s,/versionName '0.6.2'/);
});

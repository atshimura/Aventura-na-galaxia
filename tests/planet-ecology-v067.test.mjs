import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PLANETS,getPlanet} from '../web/world.mjs';
import {PLANET_ECOLOGIES,speciesForStage,hazardsForPlanet} from '../web/planet-ecology.mjs';
import {createPlanetLevel,difficultyForStage,groundAt,isPit,updatePlanetObjects} from '../web/platformer.mjs';
import {drawPlanetCreature,drawPlanetObstacle} from '../web/planet-ecology-render.mjs';
import {GameState} from '../web/core.mjs';

test('60 espécies únicas, três por planeta, com gêneros e movimentos definidos',()=>{
 assert.equal(PLANET_ECOLOGIES.length,20);
 const species=PLANET_ECOLOGIES.flatMap(p=>p.species);
 assert.equal(species.length,60);
 assert.equal(new Set(species.map(s=>s.id)).size,60);
 assert.equal(new Set(species.map(s=>s.name)).size,60);
 assert.ok(new Set(species.map(s=>s.shape)).size>=30);
 assert.ok(new Set(species.map(s=>s.behavior)).size>=8);
 for(let stage=1;stage<=20;stage++){
  assert.equal(speciesForStage(stage).length,3);
  const hostile=speciesForStage(stage).filter(x=>x.hostile).length;
  assert.equal(hostile,stage<=2?0:stage<=10?1:2);
  assert.ok(speciesForStage(stage).every(s=>s.stage===stage));
 }
});
test('obstáculos pertencem aos seus planetas e a Auréola continua inofensiva',()=>{
 const all=PLANET_ECOLOGIES.flatMap(p=>p.hazards);
 assert.equal(all.length,58);
 assert.equal(new Set(all.map(h=>h.id)).size,58);
 for(let stage=1;stage<=20;stage++){
  const biome=getPlanet(stage).biome;
  const hazards=hazardsForPlanet(stage);
  assert.equal(hazards.length,stage<3?2:3);
  assert.ok(hazards.every(h=>h.stage===stage));
  const objects=createPlanetLevel(stage,biome);
  for(const s of speciesForStage(stage))assert.ok(objects.some(o=>o.kind==='animal'&&o.speciesId===s.id),s.id);
  for(const o of objects)assert.ok(!isPit(o.x,stage),'objeto em precipício: '+stage+'/'+o.x);
  const monsters=objects.filter(o=>o.kind==='animal'&&!o.friendly);
  assert.ok(monsters.length<=Math.max(1,difficultyForStage(stage).hostileAnimals));
  if(stage===1){
   assert.equal(monsters.length,0);
   assert.equal(objects.filter(o=>o.kind==='hazard').length,0);
   assert.equal(objects.filter(o=>o.kind==='scenery').length,2);
  }else{
   assert.ok(objects.some(o=>o.kind==='hazard'));
   assert.ok(objects.filter(o=>o.kind==='hazard').every(o=>o.hazardId.startsWith('p'+stage+'-')));
  }
 }
 assert.notDeepEqual(hazardsForPlanet(3).map(o=>o.id),hazardsForPlanet(18).map(o=>o.id));
 assert.notDeepEqual(hazardsForPlanet(4).map(o=>o.shape),hazardsForPlanet(11).map(o=>o.shape));
});
test('grupos pacíficos têm 2–3 membros e reagem à proximidade do astronauta',()=>{
 const objects=createPlanetLevel(1,'aurora'),animals=objects.filter(o=>o.kind==='animal');
 assert.ok(animals.length>=6&&animals.length<=12);
 const groups=new Map();for(const a of animals)groups.set(a.group,(groups.get(a.group)||0)+1);
 assert.ok([...groups.values()].some(x=>x===3));
 const neb=animals.find(o=>o.speciesName==='Nebulins');
 assert.ok(neb);
 const close={x:neb.x+10,vx:190,vy:0};
 updatePlanetObjects(objects,.5,'aurora',1,close,.05);
 assert.equal(neb.visible,false);
 assert.equal(neb.reaction,'hidden');
 updatePlanetObjects(objects,2,'aurora',1,{x:200,vx:0,vy:0},.05);
 assert.equal(neb.visible,true);
 const sal=animals.find(o=>o.speciesName==='Saltelins');
 updatePlanetObjects(objects,2.2,'aurora',1,{x:sal.x+6,vx:180,vy:0},.05);
 assert.equal(sal.reaction,'startled');
});
test('alienígenas hostis só atacam por contato e respeitam o território',()=>{
 const p=getPlanet(10),o=createPlanetLevel(10,p.biome).find(x=>x.kind==='animal'&&!x.friendly);
 assert.ok(o);const start=o.baseX;
 for(let t=.1;t<7;t+=.05){
  updatePlanetObjects([o],t,p.biome,10,{x:Math.min(2500,start+130),vx:100,vy:0},.05);
  assert.ok(Math.abs(o.x-start)<=o.range+.01);
  assert.ok(groundAt(o.x,p.biome,10)!==null);
 }
 assert.ok(!('projectile' in o));
 const g=new GameState({stage:10,difficulty:'facil',rng:()=>.5});g.start();g.elapsed=g.duration*.4;g.enterPlanet();
 for(let i=0;i<45;i++)g.update(.05);g.leaveRocket();for(let i=0;i<26;i++)g.update(.05);
 assert.equal(g.state,'walking');
 const x=g.astronaut.x;
 g.surface.objects=[{kind:'animal',friendly:true,hostile:false,behavior:'patrol',x,baseX:x,
  y:g.astronaut.y,r:17,range:0,phase:0,flight:false}];
 g.invincible=0;g.update(.05);assert.equal(g.hearts,3);
 g.surface.objects=[{kind:'animal',friendly:false,hostile:true,behavior:'patrol',x,baseX:x,
  y:g.astronaut.y,r:17,range:0,phase:0,flight:false}];
 g.invincible=0;g.update(.05);assert.equal(g.hearts,2);
});
test('camuflagem hostil permite reação antes de causar dano',()=>{
 const p=getPlanet(11),o=createPlanetLevel(11,p.biome).find(x=>x.speciesName==='Ramos-perna');
 assert.ok(o&&o.hostile);
 const player={x:o.x,vx:0,vy:0};
 updatePlanetObjects([o],.1,p.biome,11,player,.05);
 assert.equal(o.dangerous,false);
 for(let i=0;i<14;i++)updatePlanetObjects([o],.2+i*.05,p.biome,11,player,.05);
 assert.equal(o.dangerous,true);
 updatePlanetObjects([o],2,p.biome,11,{x:200,vx:0,vy:0},.05);
 assert.equal(o.dangerous,false);
});
test('obstáculos ativos, temporizados e úteis têm estados diferenciados',()=>{
 const p=getPlanet(9),objects=createPlanetLevel(9,p.biome);
 const boost=objects.find(o=>o.effect==='boost');
 assert.ok(boost&&boost.harmful===false);
 const timed=objects.find(o=>o.effect==='pulse');assert.ok(timed);
 const states=[];
 for(let t=0;t<9;t+=.15){updatePlanetObjects(objects,t,p.biome,9,null,.05);states.push(timed.active);}
 assert.ok(states.includes(true)&&states.includes(false));
});
test('todos os desenhos vetoriais rodam sem dependências de imagens ou DOM',()=>{
 let shapes=0;
 const c=new Proxy({}, {get(target,key){
  if(key==='ellipse'||key==='lineTo'||key==='fill')return (...v)=>{shapes++;};
  return target[key]??(()=>{});
 },set(target,key,v){target[key]=v;return true;}});
 for(let stage=1;stage<=20;stage++){
  const p=getPlanet(stage),objects=createPlanetLevel(stage,p.biome);
  for(const o of objects.filter(o=>o.kind==='animal'))drawPlanetCreature(c,o,5000);
  for(const o of objects.filter(o=>o.kind==='hazard'||o.kind==='scenery'))drawPlanetObstacle(c,o,5000);
 }
 assert.ok(shapes>1000);
});

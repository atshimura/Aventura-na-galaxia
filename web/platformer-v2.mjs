/** Física de plataforma 2D: tutorial seguro e desafios cumulativos por fase. */
export const WORLD_LENGTH=2520;
export const GRAVITY=1080;
export const JUMP_SPEED=-505;
export const PLAYER_RADIUS=15;
export const FLIGHT_PAD_X=184;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PIT_LAYOUT=Object.freeze([
 {x:535,width:50,first:3},
 {x:1060,width:66,first:5},
 {x:1630,width:75,first:7},
 {x:2070,width:88,first:9}
]);
/** Cada buraco só aparece na fase de estreia e aumenta muito gradualmente. */
export function pitsForStage(stage=1){
 const level=clamp(Math.floor(Number(stage)||1),1,20);
 return PIT_LAYOUT.filter(p=>level>=p.first).map(p=>{
  const growth=Math.min(36,Math.floor((level-p.first)/3)*8);
  return {start:p.x,end:p.x+p.width+growth,width:p.width+growth};
 });
}
export const isPit=(x,stage=1)=>pitsForStage(stage).some(p=>x>=p.start&&x<=p.end);
const PROFILES=Object.freeze({
 aurora:{base:441,wave:0,period:460,phase:0},asteroids:{base:444,wave:8,period:230,phase:.1},
 ice:{base:435,wave:3,period:410,phase:.5},forest:{base:445,wave:5,period:380,phase:.9},
 portals:{base:431,wave:8,period:340,phase:2},lava:{base:457,wave:9,period:260,phase:2},
 crystals:{base:438,wave:5,period:370,phase:1},desert:{base:448,wave:11,period:480,phase:1},
 ocean:{base:454,wave:4,period:580,phase:1},city:{base:427,wave:0,period:400,phase:0},
 ruins:{base:444,wave:4,period:440,phase:2},coral:{base:450,wave:5,period:440,phase:1},
 rings:{base:435,wave:7,period:330,phase:1},storm:{base:443,wave:8,period:340,phase:1}
});
export function groundAt(x,biome='forest',stage=1){
 if(x<0||x>WORLD_LENGTH||isPit(x,stage))return null;
 const p=PROFILES[biome]||PROFILES.forest;
 if(stage===1)return 442; // Solo contínuo e plano, sem surpresas na primeira visita.
 const flatLanding=x>=125&&x<300;
 const shape=flatLanding?0:Math.sin(x/p.period+p.phase)*p.wave;
 const landscape=stage<4?shape*.45:shape;
 return Math.round(p.base+landscape);
}
/** Conteúdo de cada planeta muda em quantidade e tipo, não só na cor. */
export function difficultyForStage(stage=1){
 const level=clamp(Math.floor(Number(stage)||1),1,20);
 return Object.freeze({
  stage:level,pits:pitsForStage(level).length,
  hazardCount:level===1?0:Math.min(7,1+Math.floor(level/3)),
  hostileAnimals:level===1?0:Math.min(4,Math.floor((level+1)/4)),
  gemCount:level<=2?15:level<=8?13:11
 });
}
export const terrainFeatureForBiome=biome=>({
 aurora:'light-flowers',asteroids:'meteor-shards',ice:'frozen-spikes',
 forest:'roots',portals:'energy-crystals',lava:'steam-vent',
 crystals:'crystal-spikes',desert:'cactus',ocean:'tidal-pools',
 city:'electric',ruins:'crumbling-stones',coral:'stinging-corals',
 rings:'gravity-orbs',storm:'electric'
})[biome]||'spikes';
const safeSurface=(x,biome,stage)=>groundAt(x,biome,stage)??440;
export function createPlanetLevel(stage=1,biome='forest'){
 const d=difficultyForStage(stage),surface=x=>safeSurface(x,biome,stage);
 const objects=[];
 for(const x of [730,1460,2240]){
  objects.push({kind:'checkpoint',x,y:surface(x)-32,r:19,active:false});
 }
 const gems=[340,425,505,655,760,915,1000,1190,1350,1470,1560,1775,1930,2260,2410];
 for(const x of gems.slice(0,d.gemCount)){
  if(isPit(x,stage))continue;
  objects.push({kind:'gem',x,y:surface(x)-48-(x%3)*9,r:16,collected:false});
 }
 const hazardPositions=[830,1235,1565,1875,2310,390,1975];
 for(let i=0;i<d.hazardCount;i++){
  const x=hazardPositions[i];if(isPit(x,stage))continue;
  objects.push({
   kind:'hazard',style:terrainFeatureForBiome(biome),x,y:surface(x)-17,
   r:17,phase:(i+stage)*.49
  });
 }
 const animalPositions=[305,945,1390,1835,2380];
 for(let i=0;i<animalPositions.length;i++){
  const x=animalPositions[i];if(isPit(x,stage))continue;
  const hostile=i>=animalPositions.length-d.hostileAnimals;
  objects.push({kind:'animal',x,y:surface(x)-20,r:18,
   friendly:!hostile,baseX:x,phase:(stage+i)*.7,
   range:hostile?17:12,creature:(i+stage)%4});
 }
 return objects;
}
export function newAstronaut(biome='forest',stage=1){
 const startY=groundAt(FLIGHT_PAD_X,biome,stage)-21;
 return {x:FLIGHT_PAD_X+38,y:startY,vx:0,vy:0,onGround:true,facing:1,step:0,r:PLAYER_RADIUS};
}
export function jumpAstronaut(person){
 if(!person?.onGround)return false;
 person.vy=JUMP_SPEED;person.onGround=false;return true;
}
export function moveAstronaut(person,axis,dt,biome,stage){
 const d=clamp(dt,0,.05),horizontal=clamp(Number(axis)||0,-1,1);
 person.vx=horizontal*235*Math.abs(horizontal);
 const previousY=person.y;
 person.x=clamp(person.x+person.vx*d,42,WORLD_LENGTH-40);
 if(Math.abs(horizontal)>.05)person.facing=Math.sign(horizontal);
 person.vy=clamp(person.vy+GRAVITY*d,-700,920);
 person.y+=person.vy*d;
 const ground=groundAt(person.x,biome,stage),feet=person.y+21,prevFeet=previousY+21;
 if(ground!==null&&person.vy>=0&&feet>=ground&&prevFeet<=ground+12){
  person.y=ground-21;person.vy=0;person.onGround=true;
 }else person.onGround=false;
 if(person.onGround&&Math.abs(person.vx)>8)person.step+=d*11*Math.abs(person.vx)/235;
 return {fell:person.y>580,ground};
}
export function collision(person,obj){
 const dx=person.x-obj.x,dy=person.y-obj.y;
 return dx*dx+dy*dy<(person.r+obj.r)**2;
}
export function updatePlanetObjects(objects,time,biome,stage){
 for(const obj of objects){
  if(obj.kind==='animal'){
   obj.x=obj.baseX+Math.sin(time*.9+obj.phase)*obj.range;
   obj.y=safeSurface(obj.x,biome,stage)-20;
  }else if(obj.kind==='hazard'&&['moving-plant','roots','steam-vent','electric','gravity-orbs','stinging-corals'].includes(obj.style)){
   obj.y=safeSurface(obj.x,biome,stage)-18+Math.sin(time*2.1+obj.phase)*6;
  }
 }
}
export function respawnAstronaut(person,checkpoint,biome,stage){
 person.x=checkpoint;person.y=safeSurface(checkpoint,biome,stage)-21;
 person.vx=0;person.vy=0;person.onGround=true;
}
export const canBoard=person=>Math.abs(person.x-FLIGHT_PAD_X)<85&&person.onGround;

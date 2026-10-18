import {speciesForStage,hazardsForPlanet} from './planet-ecology.mjs';
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
 rings:'gravity-orbs',storm:'thunder-rods'
})[biome]||'spikes';
const safeSurface=(x,biome,stage)=>groundAt(x,biome,stage)??440;
/** Posições seguras e determinísticas; não gerar ameaças na pista de pouso nem sobre buracos. */
export function createPlanetLevel(stage=1,biome='forest'){
 const d=difficultyForStage(stage),surface=x=>safeSurface(x,biome,stage),objects=[];
 for(const x of [730,1460,2240])objects.push({kind:'checkpoint',x,y:surface(x)-32,r:19,active:false});
 const gems=[340,425,505,655,760,915,1000,1190,1350,1470,1560,1775,1930,2260,2410];
 for(const x of gems.slice(0,d.gemCount)){
  if(!isPit(x,stage))objects.push({kind:'gem',x,y:surface(x)-48-(x%3)*9,r:16,collected:false});
 }
 const hazards=hazardsForPlanet(stage),hazardPositions=[830,1235,1565,1875,2310,390,1975];
 if(stage===1){
  // Jardins e arcos são apenas paisagismo, jamais entram na detecção de colisões.
  for(let i=0;i<hazards.length;i++){
   const x=690+i*840;objects.push({kind:'scenery',hazardId:hazards[i].id,
    shape:hazards[i].shape,primary:hazards[i].primary,accent:hazards[i].accent,
    x,y:surface(x)-19,r:18,active:false,phase:i});
  }
 }else for(let i=0;i<d.hazardCount;i++){
  const x=hazardPositions[i];if(isPit(x,stage))continue;
  const h=hazards[i%hazards.length];
  objects.push({kind:'hazard',hazardId:h.id,style:h.name,shape:h.shape,effect:h.effect,
   harmful:h.harmful,primary:h.primary,accent:h.accent,
   x,baseX:x,y:surface(x)-18,baseY:surface(x)-18,
   r:17,phase:(i+stage)*.67,active:true});
 }
 // A população fica reduzida e distribuída pelo mapa. Grupos 2–3, sem criar
 // dezenas de agentes por frame. Os predadores são majoritariamente solitários.
 const species=speciesForStage(stage);
 const groups=[
  {slot:0,center:440,count:3},
  {slot:1,center:1320,count:species[1].hostile?1:2},
  {slot:2,center:1840,count:species[2].hostile?1:2},
  {slot:2,center:2400,count:stage>=8?1:0}
 ];
 for(let group=0;group<groups.length;group++){
  const {slot,center,count}=groups[group],s=species[slot];
  for(let i=0;i<count;i++){
   const x=center+(i-(count-1)/2)*32;
   if(isPit(x,stage)||groundAt(x-23,biome,stage)===null||groundAt(x+23,biome,stage)===null)continue;
   const phase=(stage*13+group*5+i*2)*.41;
   objects.push({kind:'animal',speciesId:s.id,speciesName:s.name,behavior:s.behavior,shape:s.shape,
    primary:s.primary,accent:s.accent,variant:s.variant,flight:s.flight,
    friendly:!s.hostile,hostile:s.hostile,group,member:i,
    x,baseX:x,y:surface(x)-(s.flight?40:20),baseY:surface(x)-20,
    r:s.shape==='titan'?22:16,phase,range:s.hostile?62:32,visible:true,
    reaction:'idle',attention:0});
  }
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
/** Estado visual e físico dos habitantes; toda IA trabalha dentro do território.
 * astronaut é opcional para manter compatibilidade com testes antigos.
 */
export function updatePlanetObjects(objects,time,biome,stage,astronaut=null,dt=.05){
 const step=clamp(Number(dt)||0,0,.05);
 for(const obj of objects){
  if(obj.kind==='animal'){
   const distance=astronaut?Math.abs(astronaut.x-obj.x):Infinity;
   const near=distance<105,rapid=near&&(Math.abs(astronaut?.vx||0)>145||Math.abs(astronaut?.vy||0)>140);
   const type=obj.behavior,ground=safeSurface(obj.x,biome,stage);
   const wave=Math.sin(time*(type==='zigzag'?2.8:1.15)+obj.phase);
   let target=obj.baseX;
   obj.reaction='idle';obj.attention=near?1:0;obj.visible=true;
   if(type==='hide'||type==='burrow'){
    obj.reaction=near?(obj.hostile?'alert':'hidden'):'idle';
    // Hostis camuflados avisam ao emergir; pacíficos simplesmente se escondem.
    if(!obj.hostile&&near)obj.visible=false;
    if(obj.hostile&&near)obj.attention=Math.min(1,(obj.attentionElapsed=(obj.attentionElapsed||0)+step)/.55);
    else obj.attentionElapsed=0;
   }else if(type==='blink'){
    const cycle=((time*.65+obj.phase)%4+4)%4;
    obj.visible=cycle>=.9;
    obj.reaction=obj.visible?'patrol':'vanished';
    obj.attention=obj.visible?Math.min(1,(cycle-.9)/.4):0;
   }else if(obj.hostile&&near&&distance<120){
    obj.reaction='chasing';
   }else if(near&&(['hop','float','glide','zigzag','circle','roll'].includes(type))){
    obj.reaction=rapid?'startled':'watching';
   }else if(near&&(['slide','crawl','patrol'].includes(type))&&!obj.hostile){
    obj.reaction='fleeing';
   }
   if(obj.hostile&&['chase','hop','patrol','crawl','slide','zigzag','blink','circle'].includes(type)&&near){
    const homeMin=obj.baseX-obj.range,homeMax=obj.baseX+obj.range;
    target=clamp(astronaut.x,homeMin,homeMax);
    const dx=clamp(target-obj.x,-1,1)*step*(type==='chase'?57:38);
    const candidate=clamp(obj.x+dx,homeMin,homeMax);
    if(groundAt(candidate,biome,stage)!==null)obj.x=candidate;
   }else if(!obj.hostile&&obj.reaction==='fleeing'&&astronaut){
    const direction=Math.sign(obj.baseX-astronaut.x)||1;
    target=clamp(obj.x+direction*step*43,obj.baseX-obj.range,obj.baseX+obj.range);
    if(groundAt(target,biome,stage)!==null)obj.x=target;
   }else{
    target=obj.baseX+wave*obj.range*(type==='roll'?.6:.38);
    if(groundAt(target,biome,stage)!==null)obj.x+=(target-obj.x)*Math.min(1,step*5);
   }
   const y=safeSurface(obj.x,biome,stage);
   const flight=obj.flight?(27+9*Math.sin(time*1.8+obj.phase)):0;
   const hop=['hop','zigzag'].includes(type)?Math.max(0,Math.sin(time*3.2+obj.phase))*21:0;
   const hover=type==='circle'?11*Math.cos(time*1.7+obj.phase):0;
   obj.y=y-20-flight-hop-hover;
   // Criaturas invisíveis ou ainda emergindo não causam contato surpresa.
   obj.dangerous=obj.hostile&&obj.visible!==false&&obj.attention>=.99;
   if(obj.hostile&&!['hide','burrow','blink'].includes(type))obj.dangerous=true;
  }else if(obj.kind==='hazard'){
   const effect=obj.effect||'solid',wave=Math.sin(time*2.2+obj.phase);
   const timed=['pulse','swing','fall'].includes(effect);
   const period=effect==='fall'?3.8:3.3;
   const portion=((time+obj.phase)%period+period)%period/period;
   obj.active=!timed||portion>.35;
   obj.warning=timed&&portion>.23&&!obj.active;
   const center=obj.baseX??obj.x;
   if(effect==='roll'||effect==='slide'){
    const nx=center+wave*(effect==='roll'?15:23);
    if(groundAt(nx,biome,stage)!==null)obj.x=nx;
    obj.active=true;
   }
   const y=safeSurface(obj.x,biome,stage);
   obj.y=y-18+(effect==='fall'?-Math.abs(wave)*24:effect==='swing'?wave*11:0);
  }
 }
}
export function respawnAstronaut(person,checkpoint,biome,stage){
 person.x=checkpoint;person.y=safeSurface(checkpoint,biome,stage)-21;
 person.vx=0;person.vy=0;person.onGround=true;
}
export const canBoard=person=>Math.abs(person.x-FLIGHT_PAD_X)<85&&person.onGround;

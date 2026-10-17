/** Terreno contínuo de plataforma lateral, sem cronômetro e sem dependências do navegador. */
export const WORLD_LENGTH=2520;
export const GRAVITY=1080;
export const JUMP_SPEED=-505;
export const PLAYER_RADIUS=15;
export const FLIGHT_PAD_X=184;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pitRanges=[[535,616],[1035,1133],[1640,1736],[2080,2175]];
export const isPit=x=>pitRanges.some(([a,b])=>x>=a&&x<=b);
export function groundAt(x,biome='forest',stage=1){
  if(x<0||x>WORLD_LENGTH||isPit(x))return null;
  const height=x<616?440:x<1133?427:x<1736?438:x<2175?418:440;
  const slight={ice:-9,lava:10,desert:6,ocean:0,forest:-2,city:-8}[biome]||0;
  return height+slight;
}
export function createPlanetLevel(stage=1,biome='forest'){
  const surface=x=>groundAt(x,biome,stage)??440;
  const objects=[];
  for(const x of [745,1505,2240])objects.push({kind:'checkpoint',x,y:surface(x)-32,r:19,active:false});
  for(const x of [340,480,690,865,955,1210,1340,1510,1830,1970,2280,2390]){
    objects.push({kind:'gem',x,y:surface(x)-47-(x%3)*12,r:16,collected:false});
  }
  const hazards=[420,800,1260,1580,1930,2340];
  for(let i=0;i<hazards.length;i++){
    const x=hazards[i],kind=i%3===0?'spikes':i%3===1?'moving-plant':'electric';
    objects.push({kind:'hazard',style:kind,x,y:surface(x)-17,r:18,phase:(i+stage)*.47});
  }
  const animals=[300,920,1410,1890,2300];
  for(let i=0;i<animals.length;i++){
    const x=animals[i];
    objects.push({kind:'animal',x,y:surface(x)-20,r:19,friendly:i%3===0,baseX:x,phase:(stage+i)*.7,range:22+i*3});
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
  const speed=Math.abs(horizontal)>.72?235:155;
  const previousY=person.y;
  person.vx=horizontal*speed;
  person.x=clamp(person.x+person.vx*d,42,WORLD_LENGTH-40);
  if(Math.abs(horizontal)>.05)person.facing=Math.sign(horizontal);
  person.vy=clamp(person.vy+GRAVITY*d,-700,920);
  person.y+=person.vy*d;
  const ground=groundAt(person.x,biome,stage);
  const feet=person.y+21,prevFeet=previousY+21;
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
      obj.y=(groundAt(obj.x,biome,stage)??440)-20;
    }else if(obj.kind==='hazard'&&obj.style==='moving-plant'){
      obj.y=(groundAt(obj.x,biome,stage)??440)-18+Math.sin(time*2.1+obj.phase)*10;
    }
  }
}
export function respawnAstronaut(person,checkpoint,biome,stage){
  person.x=checkpoint;
  person.y=(groundAt(checkpoint,biome,stage)??440)-21;
  person.vx=0;person.vy=0;person.onGround=true;
}
export const canBoard=person=>Math.abs(person.x-FLIGHT_PAD_X)<85 && person.onGround;

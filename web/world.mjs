/** Catálogo dos vinte mundos e desbloqueio cumulativo de obstáculos. */
const DATA=[
['Auréola','aurora','#462f96','#ed7ad1','#5dc4f5','Véus luminosos','🌈'],
['Pedraluz','asteroids','#3d587d','#d7a48e','#8acaff','Cânions de meteoritos','☄️'],
['Safira','ice','#215c97','#c4f4ff','#77ace0','Geleiras azuis','❄️'],
['Florália','forest','#18715f','#d8ff98','#54cf91','Florestas bioluminescentes','🌿'],
['Espirália','portals','#613c93','#ee9cff','#bdb5ff','Arcos gravitacionais','🌀'],
['Rubion','lava','#872d46','#ff8b4a','#ffcc66','Vulcões e lava','🌋'],
['Esmeraldia','crystals','#167567','#a6ffdb','#44e5c6','Cristais gigantes','💎'],
['Aureon','desert','#936335','#ffe0a2','#cf9955','Dunas com anéis','🏜️'],
['Nereida','ocean','#135e9a','#7cecf1','#4fc2ec','Oceanos suspensos','🌊'],
['Orbitalis','city','#324c70','#cde8ff','#729bcc','Cidades mecânicas','🏙️'],
['Jadéria','forest','#28735a','#d3f5a1','#a1d2b1','Jardins flutuantes','🌱'],
['Enigmia','ruins','#563f86','#cb9eff','#8678c9','Ruínas ancestrais','🏛️'],
['Meteoris','asteroids','#814c3b','#ffb07a','#ed8055','Gargantas rochosas','🪨'],
['Turquesia','ocean','#0f889c','#a4eff8','#72d7dd','Mares de turquesa','🐚'],
['Coraluna','coral','#964074','#ffb6bf','#ff8f92','Recifes extraterrestres','🪸'],
['Gigantia','rings','#49417d','#d7b6fc','#aaa5d9','Anéis colossais','🪐'],
['Voltara','storm','#333d83','#8de6ff','#7067c8','Tempestades elétricas','⚡'],
['Lunaris','ice','#354f92','#eeebff','#abc5fb','Crateras de duas luas','🌘'],
['Constelar','portals','#4d4684','#ffdaef','#e7aee9','Pontes de estrelas','✨'],
['Legendária','city','#775534','#ffecb0','#e3b36b','Templos celestiais','🏆']
];
export const PLANETS=Object.freeze(DATA.map(([name,biome,sky,highlight,ground,landmark,icon],i)=>Object.freeze({stage:i+1,name,biome,sky,highlight,ground,landmark,icon})));
export const PLANET_SECONDS=16;
export const PLANET_WINDOW_START=.27,PLANET_WINDOW_END=.62;
export function getPlanet(stage){return PLANETS[Math.max(0,Math.min(19,Math.floor(Number(stage)||1)-1))];}
export function planetVisible(elapsed,duration){const p=elapsed/duration;return p>=PLANET_WINDOW_START&&p<=PLANET_WINDOW_END;}
const HAZARDS=Object.freeze([['asteroid',1],['satellite',2],['ship',3],['debris',4],['comet',5],['mine',7],['plasma',9],['drone',12],['crystal',15],['vortex',18]]);
export function hazardsForStage(stage){return HAZARDS.filter(([,first])=>first<=stage).map(([kind])=>kind);}
export function chooseHazard(stage,rng=Math.random){const list=hazardsForStage(stage);return list[Math.max(0,Math.min(list.length-1,Math.floor(rng()*list.length)))];}
export function planetObstacleForBiome(biome){return({ice:'ice-spire',forest:'plant',lava:'lava-spire',desert:'dune-rock',ocean:'coral-spire',city:'tower',crystals:'crystal-spire',ruins:'column',portals:'portal-rock',asteroids:'rock-spire',coral:'coral-spire',rings:'ring-rock',storm:'electric-spire',aurora:'aurora-spire'})[biome]||'rock-spire';}

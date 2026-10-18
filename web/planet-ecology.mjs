/** Biologia e perigos definidos POR PLANETA (v0.6.7).
 * Cada espécie tem nome/identidade próprios; o comportamento e a forma informam a simulação e o desenho.
 * A primeira fase é um jardim seguro; a segunda não possui predadores.
 */
const ENTRIES=[
 // espécies: [nome, comportamento, silhueta]; obstáculos: [id, desenho, mecanismo]
 {species:[['Lumilins','float','jelly'],['Saltelins','hop','bunny'],['Nebulins','hide','puff']],
  hazards:[['flores-luminosas','flower','decor'],['arcos-de-luz','arch','decor']]},
 {species:[['Pedrins','hide','pebble'],['Rolobichos','roll','shell'],['Craterinos','burrow','mole']],
  hazards:[['rochas-instaveis','rock','roll'],['fragmentos-de-meteoritos','shard','solid']]},
 {species:[['Glacilins','slide','skater'],['Prismapipas','float','kite'],['Dente-gelos','patrol','fang']],
  hazards:[['espinhos-de-gelo','spike','solid'],['blocos-deslizantes','block','slide'],['neve-cortante','crystal','pulse']]},
 {species:[['Folhópteros','glide','leaf'],['Florubis','hide','flower'],['Ciponídeos','chase','vine']],
  hazards:[['raizes-moveis','root','pulse'],['plantas-espinhosas','thorn','solid'],['flores-de-esporos','flower','pulse']]},
 {species:[['Anelins','circle','ring'],['Orbigritos','hop','spring'],['Vigias de Dobra','patrol','eye']],
  hazards:[['cristais-pulsantes','crystal','pulse'],['campos-gravitacionais','orb','gravity'],['portais-instaveis','portal','pulse']]},
 {species:[['Magmalagartos','crawl','lizard'],['Basaltucos','patrol','shell'],['Faíscaros','hop','spark']],
  hazards:[['jatos-de-vapor','vent','pulse'],['fissuras-quentes','fissure','pulse'],['rochas-vulcanicas','boulder','roll']]},
 {species:[['Cristalumes','float','prism'],['Prismatins','hop','hopper'],['Lasquídeos','patrol','shard']],
  hazards:[['cristais-crescentes','crystal','pulse'],['espinhos-minerais','spike','solid'],['lascas-em-queda','shard','fall']]},
 {species:[['Dunelinos','burrow','mole'],['Vespartes','zigzag','wasp'],['Cascarrastos','chase','stilt']],
  hazards:[['pedras-rolantes','rock','roll'],['cactos-alienigenas','cactus','solid'],['turbilhoes-de-areia','tornado','pulse']]},
 {species:[['Nudibranques','slide','slug'],['Bolharins','hop','bubble'],['Raptouros','chase','crab']],
  hazards:[['geiseres','geyser','pulse'],['pocas-impulsionadoras','pool','boost'],['jatos-de-agua','jet','pulse']]},
 {species:[['Minibots','patrol','robot'],['Zumbidrones','float','drone'],['Guardiôides','chase','guard']],
  hazards:[['pistoes-moveis','piston','pulse'],['pisos-eletrificados','electric','pulse'],['barreiras-energeticas','barrier','pulse']]},
 {species:[['Petalídeos','glide','petal'],['Ramos-perna','hide','branch'],['Esporoides','hop','spore']],
  hazards:[['cipos-pendulares','vine','swing'],['sementes-instaveis','seed','pulse'],['flores-que-fecham','flower','pulse']]},
 {species:[['Runídeos','patrol','rune'],['Vitrídeos','hide','shadow'],['Escaravelhos Guardiões','patrol','beetle']],
  hazards:[['blocos-que-caem','block','fall'],['placas-de-pressao','plate','pulse'],['feixes-luminosos','beam','pulse']]},
 {species:[['Carrancudos','patrol','giant'],['Cristabotins','hop','crystal'],['Aranhas de Fissura','crawl','spider']],
  hazards:[['pedras-rolantes-gigantes','boulder','roll'],['fragmentos-em-queda','shard','fall'],['rachaduras-profundas','fissure','solid']]},
 {species:[['Mantas Saltantes','glide','manta'],['Sirípedes','patrol','crab'],['Aguavores','chase','ray']],
  hazards:[['correntes-de-agua','current','current'],['jatos-inclinados','jet','pulse'],['rochas-escorregadias','rock','slide']]},
 {species:[['Plumas-Coral','hide','coral'],['Conchídeos','patrol','conch'],['Coralicentes','chase','dart']],
  hazards:[['corais-urticantes','coral','solid'],['ouricos-moveis','urchin','roll'],['bolhas-pulsantes','bubble','pulse']]},
 {species:[['Gravolumes','circle','orb'],['Rodídeos','roll','roller'],['Titãs dos Anéis','patrol','titan']],
  hazards:[['esferas-gravitacionais','orb','gravity'],['fragmentos-de-aneis','shard','fall'],['campos-magneticos','ring','pulse']]},
 {species:[['Faíscalins','zigzag','electric'],['Terraulcos','patrol','crawler'],['Eletropredadores','chase','predator']],
  hazards:[['raios-sinalizados','lightning','pulse'],['arcos-eletricos','electric','pulse'],['torres-condutoras','tower','pulse']]},
 {species:[['Duolumes','hop','moon'],['Toupeiras de Gelo','burrow','mole'],['Caçadores Lunares','hop','wolf']],
  hazards:[['gelo-desprendivel','ice','fall'],['blocos-congelados','block','slide'],['fendas-congeladas','fissure','solid']]},
 {species:[['Astralmantas','glide','manta'],['Ponteirins','blink','star'],['Guardiões Estelares','patrol','guardian']],
  hazards:[['pontes-luminosas','bridge','pulse'],['portais-pulsantes','portal','pulse'],['feixes-rotativos','beam','swing']]},
 {species:[['Cerimoniobots','patrol','ceremony'],['Sentinelas Prismáticas','circle','prism'],['Guardiões Dourados','chase','gold']],
  hazards:[['barreiras-celestiais','barrier','pulse'],['blocos-moveis','block','slide'],['mecanismos-luminosos','gear','pulse']]}
];
const palettes=[
 ['#a6ffff','#e4b4ff'],['#b8adb9','#ffd5a1'],['#c0faff','#7bbcff'],['#b4ff8d','#ffbce8'],
 ['#dab4ff','#66eaff'],['#fb956a','#ffd48a'],['#86ffe3','#b6ecff'],['#f9d084','#bc85e6'],
 ['#74edec','#edffff'],['#9cdaf5','#ffdb8a'],['#afffa0','#ffadd8'],['#dbbef7','#c8e2fd'],
 ['#f5ad78','#b1adca'],['#84eefa','#fee5cb'],['#ffaed5','#b8ecff'],['#c5b3ff','#83eeff'],
 ['#95d3ff','#f5ceff'],['#b5d7ff','#e2eeff'],['#cdbaff','#fcbbef'],['#ffe0a0','#b7fcff']
];
const flightKinds=new Set(['float','glide','zigzag','circle','blink']);
export const PLANET_ECOLOGIES=Object.freeze(ENTRIES.map((entry,index)=>{
 const stage=index+1,[primary,accent]=palettes[index];
 const species=Object.freeze(entry.species.map(([name,behavior,shape],slot)=>{
  const hostile=stage>=11?slot>0:stage>=3&&slot===2;
  return Object.freeze({id:`p${stage}-s${slot+1}`,stage,name,behavior,shape,hostile,
   flight:flightKinds.has(behavior),primary,accent,variant:(stage*7+slot*11)%17});
 }));
 const hazards=Object.freeze(entry.hazards.map(([name,shape,effect],slot)=>Object.freeze({
  id:`p${stage}-h${slot+1}`,stage,name,shape,effect,
  harmful:effect!=='decor'&&effect!=='boost'&&effect!=='current',
  primary,accent
 })));
 return Object.freeze({stage,species,hazards});
}));
export function ecologyForStage(stage){
 const n=Math.max(1,Math.min(20,Math.floor(Number(stage)||1)));
 return PLANET_ECOLOGIES[n-1];
}
export function speciesForStage(stage){return ecologyForStage(stage).species;}
export function hazardsForPlanet(stage){return ecologyForStage(stage).hazards;}

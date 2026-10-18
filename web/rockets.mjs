/** Catálogo balanceado de foguetes desbloqueáveis com moedas; dados offline. */
export const ROCKETS=Object.freeze([
 Object.freeze({id:'aurora',name:'Aurora',cost:0,primary:'#f6fbff',accent:'#e73551',engine:'#ffb04c',control:1,shield:0,description:'Clássico arredondado, janela circular e pequenas aletas'}),
 Object.freeze({id:'cometa',name:'Cometa Azul',cost:60,primary:'#178bd8',accent:'#0b4b94',engine:'#67e6ff',control:1,shield:0,description:'Esportivo, asas triangulares e dois motores'}),
 Object.freeze({id:'flor',name:'Flor Estelar',cost:120,primary:'#2ac8db',accent:'#15b4a1',engine:'#ffdb62',control:1,shield:0,description:'Explorador, três janelas e asas em forma de folhas'}),
 Object.freeze({id:'guardiao',name:'Guardião Solar',cost:200,primary:'#ffcc3b',accent:'#a9630f',engine:'#ffc35a',control:1,shield:0,description:'Blindagem dourada, cabine hexagonal e asas robustas'}),
 Object.freeze({id:'falcao',name:'Falcão Turbo',cost:300,primary:'#ff942a',accent:'#e86b1c',engine:'#ffb04b',control:1,shield:0,description:'Aerodinâmico, asas inclinadas e três motores'}),
 Object.freeze({id:'nebulon',name:'Nebulon',cost:450,primary:'#ac3ceb',accent:'#7736bd',engine:'#df73ff',control:1,shield:0,description:'Alienígena orgânico, luzes e propulsão violeta'})
]);
export const DEFAULT_ROCKET='aurora';
export function rocketById(id){return ROCKETS.find(r=>r.id===id)||ROCKETS[0];}
export function sanitizeRockets(ids){
  const valid=new Set(Array.isArray(ids)?ids:[]);
  return ROCKETS.filter(r=>r.cost===0||valid.has(r.id)).map(r=>r.id);
}
export function purchase(save,id){
  const rocket=ROCKETS.find(r=>r.id===id);
  if(!rocket)return false;
  const unlocked=sanitizeRockets(save.unlockedRockets);
  if(unlocked.includes(id)||save.wallet<rocket.cost)return false;
  save.wallet-=rocket.cost;
  save.unlockedRockets=[...unlocked,id];
  return true;
}
export function equip(save,id){
  if(!sanitizeRockets(save.unlockedRockets).includes(id))return false;
  save.selectedRocket=id;return true;
}

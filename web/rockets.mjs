/** Catálogo balanceado de foguetes desbloqueáveis com moedas; dados offline. */
export const ROCKETS=Object.freeze([
  Object.freeze({id:'aurora',name:'Aurora',cost:0,primary:'#e7f6ff',accent:'#f95f94',engine:'#ffb04c',control:1,shield:0,description:'Foguete inicial, equilibrado'}),
  Object.freeze({id:'cometa',name:'Cometa Azul',cost:60,primary:'#77deff',accent:'#1873d7',engine:'#b4f5ff',control:1.18,shield:0,description:'Manobras 18% mais rápidas'}),
  Object.freeze({id:'flor',name:'Flor Estelar',cost:120,primary:'#d5ffa8',accent:'#aa66e5',engine:'#66ffcb',control:1.10,shield:0,description:'Controle mais ágil e cores da floresta'}),
  Object.freeze({id:'guardiao',name:'Guardião Solar',cost:200,primary:'#ffe89b',accent:'#ed843a',engine:'#fff3b5',control:1.05,shield:1,description:'Começa cada tentativa com um escudo'})
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

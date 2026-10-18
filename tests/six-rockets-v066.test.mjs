import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROCKETS,rocketById,sanitizeRockets,purchase,equip} from '../web/rockets.mjs';
import {drawRocketModel} from '../web/rocket-render.mjs';
import {GameState,sanitizeSave} from '../web/core.mjs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('seis foguetes aprovados com nomes, IDs, preços e desempenho idêntico',()=>{
 assert.deepEqual(ROCKETS.map(r=>r.name),['Aurora','Cometa Azul','Flor Estelar','Guardião Solar','Falcão Turbo','Nebulon']);
 assert.deepEqual(ROCKETS.map(r=>r.cost),[0,60,120,200,300,450]);
 assert.equal(new Set(ROCKETS.map(r=>r.id)).size,6);
 assert.ok(ROCKETS.every(r=>r.control===1&&r.shield===0));
});
test('compras antigas, moedas, seleção e progresso são mantidos',()=>{
 const s=sanitizeSave({wallet:800,completed:12,selectedRocket:'guardiao',unlockedRockets:['aurora','cometa','flor','guardiao']});
 assert.equal(s.wallet,800);assert.equal(s.completed,12);assert.equal(s.selectedRocket,'guardiao');
 assert.deepEqual(s.unlockedRockets,['aurora','cometa','flor','guardiao']);
 assert.equal(purchase(s,'falcao'),true);assert.equal(s.wallet,500);
 assert.equal(purchase(s,'nebulon'),true);assert.equal(s.wallet,50);
 assert.equal(equip(s,'nebulon'),true);
 assert.equal(sanitizeSave(s).selectedRocket,'nebulon');
});
test('voo e pouso usam o mesmo renderizador da garagem',()=>{
 const main=source('web/main.mjs'),planet=source('web/platformer-render.mjs');
 assert.match(main,/drawRocketModel\(ctx,game\.rocketModel\.id/);
 assert.match(main,/drawRocketModel\(g,canvas\.dataset\.rocketPreview/);
 assert.match(planet,/drawRocketModel\(c,game\.rocketModel\.id/);
 assert.ok(!planet.includes('game.rocketModel.primary'));
 assert.ok(!main.includes('<div class="rocket-icon">🚀</div>'));
});
test('seis modelos com geometria e motores próprios são desenháveis',()=>{
 for(const r of ROCKETS){
  const calls=[];const ctx=new Proxy({}, {get:(o,k)=>{
   if(k==='save'||k==='restore'||k==='beginPath'||k==='closePath'||k==='fill'||k==='stroke'||k==='translate'||k==='rotate'||k==='scale'||k==='moveTo'||k==='lineTo'||k==='quadraticCurveTo'||k==='ellipse')return (...args)=>calls.push([k,...args]);
   return o[k];
  },set:(o,k,v)=>(o[k]=v,true)});
  drawRocketModel(ctx,r.id,{x:15,y:23,time:99});
  assert.ok(calls.filter(x=>x[0]==='lineTo').length>9,r.id);
  assert.ok(calls.some(x=>x[0]==='restore'),r.id);
 }
});
test('a nave comprada é usada pelo jogo sem vantagens exclusivas',()=>{
 for(const r of ROCKETS){
  const g=new GameState({save:{selectedRocket:r.id,unlockedRockets:[r.id]},difficulty:'facil'});
  g.start();assert.equal(g.rocketModel.id,r.id);assert.equal(g.shield,0);
 }
});

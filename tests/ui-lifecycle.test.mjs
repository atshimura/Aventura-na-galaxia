import {test} from 'node:test';
import assert from 'node:assert/strict';

test('interface completa: voo, visita, nomeação, retorno e estacionamento',async()=>{
 const nodes=new Map(),events=new Map();let frame=()=>{};
 const ctx=new Proxy({}, {get(_t,k){if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});return()=>{};},set(){return true;}});
 function node(id){if(nodes.has(id))return nodes.get(id);
  const el={id,value:id==='difficulty'?'facil':'',style:{},hidden:false,textContent:'',innerHTML:'',
   classList:{toggle(){},add(){},remove(){}},
   addEventListener(name,fn){events.set(id+':'+name,fn);},
   getContext(){return ctx;},getBoundingClientRect(){return{left:0,top:0,width:960,height:540};},
   setAttribute(){},setPointerCapture(){},releasePointerCapture(){},hasPointerCapture(){return false;}};
  nodes.set(id,el);return el;
 }
 globalThis.document={getElementById:node,addEventListener(name,fn){events.set('doc:'+name,fn);},hidden:false};
 globalThis.window={addEventListener(name,fn){events.set('win:'+name,fn);}};
 globalThis.location={search:'?test'};
 globalThis.localStorage={getItem(){return null;},setItem(){}};
 globalThis.requestAnimationFrame=cb=>{frame=cb;};
 await import('../web/main.mjs');
 const app=globalThis.window.__gameTest;assert.ok(app);
 events.get('start:click')();const game=app.game;assert.equal(game.state,'playing');
 frame(100);frame(155);
 game.spawnObstacle=()=>{};game.spawnCoin=()=>{};game.spawnCrate=()=>{};
 game.elapsed=game.duration*.4;frame(205);assert.equal(game.canExplorePlanet(),true);
 events.get('explore-btn:click')();assert.equal(game.state,'exploring');
 game.spawnPlanetObstacle=()=>{};game.spawnCoin=()=>{};
 game.planetElapsed=game.planetDuration-.02;frame(255);assert.equal(game.state,'naming');
 node('planet-input').value='Cometa Azul';events.get('name-planet:click')();
 assert.equal(game.state,'playing');assert.equal(game.save.planetNames[1],'Cometa Azul');
 game.elapsed=game.duration-8-.02;frame(305);assert.equal(game.state,'docking');
 game.elapsed=game.duration-.01;frame(355);assert.equal(game.state,'victory');
 assert.equal(game.save.completed,1);assert.equal(game.save.exploredPlanets[1],true);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GALAXY_WIDTH,GALAXY_HEIGHT,GALAXY_POINTS,getMapStatus,mapStartScroll,drawGalaxyRoute,drawPlanetPortrait} from '../web/galaxy-map.mjs';
import {PLANETS} from '../web/world.mjs';

const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const main=readFileSync(new URL('../web/main.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../web/style.css',import.meta.url),'utf8');

test('mapa adicional tem vinte planetas em trilha horizontal, irregular e contínua',()=>{
 assert.equal(GALAXY_POINTS.length,20);
 assert.ok(GALAXY_WIDTH>4000);
 assert.equal(GALAXY_HEIGHT,540);
 assert.deepEqual(GALAXY_POINTS.map(p=>p.stage),Array.from({length:20},(_,i)=>i+1));
 assert.ok(GALAXY_POINTS.every((p,i)=>i===0||p.x>GALAXY_POINTS[i-1].x));
 assert.ok(new Set(GALAXY_POINTS.map(p=>p.y)).size>15);
 const jumps=GALAXY_POINTS.slice(1).map((p,i)=>p.y-GALAXY_POINTS[i].y);
 assert.ok(jumps.some(x=>x>0)&&jumps.some(x=>x<0));
});
test('fase concluída e exploração têm indicadores independentes',()=>{
 const save={completed:3,exploredPlanets:{2:true},bestByStage:{2:85,3:31}};
 assert.deepEqual(getMapStatus(save,2),{stage:2,unlocked:true,completed:true,explored:true,current:false,best:85});
 assert.deepEqual(getMapStatus(save,3),{stage:3,unlocked:true,completed:true,explored:false,current:false,best:31});
 assert.deepEqual(getMapStatus(save,4),{stage:4,unlocked:true,completed:false,explored:false,current:true,best:0});
 assert.equal(getMapStatus(save,5).unlocked,false);
 assert.equal(getMapStatus({completed:20},20).current,true);
});
test('o mapa abre junto à fase mais avançada desbloqueada',()=>{
 assert.equal(mapStartScroll({completed:0},960),0);
 assert.equal(mapStartScroll({completed:3},960),GALAXY_POINTS[3].x-480);
 assert.ok(mapStartScroll({completed:19},960)<=GALAXY_WIDTH-960);
});
test('todas as ilustrações têm renderização Canvas e todos os destinos aparecem na rota',()=>{
 const operations={arcs:0,curves:0,rects:0};
 const dummy=()=>({addColorStop(){}});
 const ctx=new Proxy({}, {get(_t,k){
  if(k==='createRadialGradient'||k==='createLinearGradient')return dummy;
  if(k==='arc')return()=>{operations.arcs++;};
  if(k==='bezierCurveTo')return()=>{operations.curves++;};
  if(k==='fillRect')return()=>{operations.rects++;};
  return()=>{};
 },set(){return true;}});
 drawGalaxyRoute(ctx,{completed:4});
 assert.ok(operations.rects>=1);
 assert.ok(operations.curves>=19);
 for(const planet of PLANETS){
  drawPlanetPortrait(ctx,planet,{size:144});
  drawPlanetPortrait(ctx,planet,{size:200,locked:true});
 }
 assert.ok(operations.arcs>40);
});
test('menu mantém seletor existente com fundo que acompanha a fase escolhida',()=>{
 assert.match(html,/id="stage-select"/);assert.match(html,/id="galaxy-open"/);
 assert.match(main,/syncMenuPreview\(\)/);
 assert.match(main,/drawMenuPlanetPreview\(previewStage,time,mix\)/);
 assert.match(main,/getPlanet\(stage\)/);
 assert.match(css,/#menu\.overlay/);
});
test('interface contém ficha e névoa separada de fases exploradas',()=>{
 for(const id of ['galaxy-map','galaxy-viewport','galaxy-route','galaxy-nodes','galaxy-mist','galaxy-card','galaxy-card-play','galaxy-card-return','galaxy-card-portrait']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(main,/status\.unlocked\?'Fase/);
 assert.match(main,/status\.explored/);
 assert.match(main,/status\.completed/);
 assert.match(main,/status\.unlocked\?\(game\.save\.planetNames/);
 assert.match(main,/mapStartScroll/);
});
test('Android usa versão 0.6.6',()=>{
 const gradle=readFileSync(new URL('../android/app/build.gradle',import.meta.url),'utf8');
 assert.match(gradle,/versionCode 12/);assert.match(gradle,/versionName '0.6.6'/);
});
test('fluxo real do mapa: abrir, consultar fase bloqueada, explorar ficha, iniciar fase',async()=>{
 const byId=new Map(),events=new Map();
 let frame=()=>{},drawCount=0;
 const ctx=new Proxy({}, {get(_t,k){
  if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});
  if(k==='fillRect')return()=>{drawCount++};
  return()=>{};
 },set(){return true;}});
 function element(id=''){
  const classes=new Set(['menu','galaxy-card'].includes(id)?id==='galaxy-card'?['hidden']:[]:['hidden']);
  const kids=[];
  const listeners=new Map();
  const style={setProperty(k,v){this[k]=v}};
  return {id,style,children:kids,listeners,clientWidth:960,scrollLeft:0,dataset:{},
   value:id==='difficulty'?'facil':'',textContent:'',innerHTML:'',hidden:false,
   classList:{add(c){classes.add(c)},remove(c){classes.delete(c)},contains(c){return classes.has(c)},toggle(c,force){if(force===undefined?classes.has(c):!force)classes.delete(c);else classes.add(c);}},
   addEventListener(type,fn){listeners.set(type,fn);if(id)events.set(id+':'+type,fn);},
   setAttribute(k,v){this[k]=v;},
   focus(){this.focused=true;},
   appendChild(c){kids.push(c);},
   replaceChildren(){kids.length=0;},
   getContext(){return ctx;},
   getBoundingClientRect(){return {left:0,top:0,width:960,height:540};},
   setPointerCapture(){},releasePointerCapture(){},hasPointerCapture(){return false;}
  };
 }
 const node=id=>{if(!byId.has(id))byId.set(id,element(id));return byId.get(id);};
 globalThis.document={getElementById:node,createElement:element,addEventListener(type,fn){events.set('doc:'+type,fn);},hidden:false};
 globalThis.window={addEventListener(type,fn){events.set('win:'+type,fn);}};
 globalThis.location={search:'?test'};
 globalThis.localStorage={getItem(){return null;},setItem(){}};
 globalThis.requestAnimationFrame=fn=>{frame=fn;};
 await import('../web/main.mjs');
 const app=globalThis.window.__gameTest;
 assert.equal(app.displayMode,'menu');
 const save=app.game.save;
 save.completed=3;save.exploredPlanets[2]=true;save.planetNames[2]='Mundo do Teste';save.bestByStage[2]=92;
 events.get('stage-select:change')({target:{value:'3'}});
 assert.equal(app.selectedStage,3);
 assert.equal(app.previewStage,3);
 frame(performance.now()+50);
 assert.ok(drawCount>0,'cenário foi desenhado no menu');
 events.get('galaxy-open:click')();
 assert.equal(app.displayMode,'galaxy-map');
 const points=node('galaxy-nodes').children;
 assert.equal(points.length,20);
 assert.equal(node('galaxy-viewport').scrollLeft,mapStartScroll(save,960));
 const future=points[4],known=points[1];
 assert.ok(future.className.includes('is-locked'))
 future.listeners.get('click')();
 assert.equal(node('galaxy-card-title').textContent,'MUNDO DESCONHECIDO');
 assert.equal(node('galaxy-card-play').classList.contains('hidden'),true);
 assert.ok(!future['aria-label'].includes('Espirália'),'nome não aparece em atributo acessível');
 const at=node('galaxy-viewport').scrollLeft;
 events.get('galaxy-card-close:click')();
 assert.equal(node('galaxy-viewport').scrollLeft,at,'fechar mantém posição do mapa');
 known.listeners.get('click')();
 assert.equal(node('galaxy-card-title').textContent,'Mundo do Teste');
 assert.equal(node('galaxy-card-best').textContent,'⭐ Melhor pontuação: 92');
 assert.match(node('galaxy-card-explored').textContent,/explorado/);
 assert.equal(node('galaxy-card-play').classList.contains('hidden'),false);
 events.get('galaxy-card-play:click')();
 assert.equal(app.game.state,'playing');
 assert.equal(app.game.stage.number,2);
 assert.equal(app.selectedStage,2);
});

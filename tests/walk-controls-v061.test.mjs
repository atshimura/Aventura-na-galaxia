import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState} from '../web/core.mjs';
import {moveAstronaut,newAstronaut} from '../web/platformer.mjs';
const web=new URL('../web/',import.meta.url);
const source=name=>readFileSync(new URL(name,web),'utf8');

test('interface terrestre possui joystick próprio à esquerda e botão pular à direita',()=>{
 const html=source('index.html'),css=source('style.css');
 assert.match(html,/id="walk-joystick"/);
 assert.match(html,/id="walk-joystick-knob"/);
 assert.match(html,/id="jump-btn"/);
 assert.match(css,/\.walk-joystick\s*\{[^}]*left:/);
 assert.match(css,/\.jump-btn\s*\{[^}]*left:auto;right:/);
});
test('joystick terrestre aceita eixo horizontal e não move verticalmente',()=>{
 const main=source('main.mjs');
 assert.match(main,/mode==='walk'\?joystickVector\(dx,0,radius/);
 assert.match(main,/state\.value=mode==='walk'\?\{x:vector\.x,y:0\}/);
 assert.match(main,/walkStick\.classList\.toggle\('hidden',game\.state!=='walking'\)/);
});
test('movimento analógico apresenta progressão de velocidade natural',()=>{
 const a=newAstronaut('forest',1),b=newAstronaut('forest',1);
 const x=a.x;moveAstronaut(a,.28,.05,'forest',1);moveAstronaut(b,1,.05,'forest',1);
 assert.ok(a.x>x);assert.ok(b.x>a.x);
 assert.ok(b.vx>a.vx);
 moveAstronaut(a,0,.05,'forest',1);assert.equal(a.vx,0);
});
test('voo continua com controle à direita',()=>{
 const main=source('main.mjs');
 assert.match(main,/const flightStick=\$\('joystick'\)/);
 assert.match(main,/flightStick\.classList\.toggle\('hidden',game\.state!=='playing'\)/);
});
test('Android 0.6.1 é compatível com a versão atual',()=>{
 const build=readFileSync(new URL('../android/app/build.gradle',import.meta.url),'utf8');
 assert.match(build,/versionCode 10/);
 assert.match(build,/versionName '0.6.4'/);
});

test('simula os dois dedos no Android: astronauta anda, salta e para ao soltar',async()=>{
 const nodes=new Map(),events=new Map();
 let frame=()=>{};
 const ctx=new Proxy({}, {get(_t,key){
   if(key==='createLinearGradient'||key==='createRadialGradient')return()=>({addColorStop(){}});
   return()=>{};
 },set(){return true;}});
 function node(id){
  if(nodes.has(id))return nodes.get(id);
  const captures=new Set();
  const el={id,value:id==='difficulty'?'facil':'',style:{},hidden:false,innerHTML:'',textContent:'',
    classList:{toggle(){},add(){},remove(){}},
    addEventListener(type,fn){events.set(id+':'+type,fn);},
    getContext(){return ctx;},
    getBoundingClientRect(){return id==='walk-joystick'?{left:18,top:380,width:144,height:144}:id==='joystick'?{left:790,top:380,width:144,height:144}:{left:0,top:0,width:960,height:540};},
    setAttribute(){},setPointerCapture(id){captures.add(id);},releasePointerCapture(id){captures.delete(id);},
    hasPointerCapture(id){return captures.has(id);}};
  nodes.set(id,el);return el;
 }
 globalThis.document={getElementById:node,addEventListener(type,fn){events.set('doc:'+type,fn);},hidden:false};
 globalThis.window={addEventListener(type,fn){events.set('win:'+type,fn);}};
 globalThis.location={search:'?test'};
 globalThis.localStorage={getItem(){return null;},setItem(){}};
 globalThis.requestAnimationFrame=fn=>{frame=fn;};
 await import('../web/main.mjs');
 const app=globalThis.window.__gameTest;
 assert.ok(app,'test harness');
 events.get('start:click')();
 const game=app.game;
 const base=performance.now()+2000;
 frame(base);
 game.spawnObstacle=()=>{};game.spawnCoin=()=>{};game.spawnCrate=()=>{};
 game.elapsed=game.duration*.4;
 events.get('explore-btn:click')();
 assert.equal(game.state,'landing');
 for(let i=1;i<=46;i++)frame(base+50*i);
 assert.equal(game.state,'landed');
 events.get('leave-rocket:click')();
 for(let i=47;i<=74;i++)frame(base+50*i);
 assert.equal(game.state,'walking');
 const at=game.astronaut.x;

 const touch={pointerId:23,clientX:155,clientY:451,preventDefault(){}};
 events.get('walk-joystick:pointerdown')(touch);
 assert.equal(app.walkingPointer,23);
 for(let i=75;i<=80;i++)frame(base+50*i);
 assert.ok(game.astronaut.x>at+15,'andou usando o joystick virtual');
 assert.ok(app.walkingSteering.x>.5,'controle está acelerando');

 const movingX=game.astronaut.x;
 events.get('jump-btn:pointerdown')({pointerId:36,preventDefault(){}});
 assert.ok(game.astronaut.vy<0,'salto com outro dedo');
 for(let i=81;i<=83;i++)frame(base+50*i);
 assert.ok(game.astronaut.x>movingX,'continua caminhando enquanto pula');
 assert.equal(app.walkingPointer,23,'salto não interrompe joystick');

 events.get('walk-joystick:pointerup')(touch);
 const releasedX=game.astronaut.x;
 for(let i=84;i<=88;i++)frame(base+50*i);
 assert.equal(app.walkingPointer,null);
 assert.equal(game.astronaut.x,releasedX,'para imediatamente ao soltar');

 // Ao voltar a pressionar para a esquerda, muda de direção sem atraso.
 const left={pointerId:24,clientX:23,clientY:450,preventDefault(){}};
 events.get('walk-joystick:pointerdown')(left);
 for(let i=89;i<=91;i++)frame(base+50*i);
 assert.ok(game.astronaut.x<releasedX,'anda para a esquerda');
 events.get('walk-joystick:pointercancel')(left);
 assert.equal(app.walkingPointer,null);
});

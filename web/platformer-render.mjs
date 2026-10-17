/** Visual 2D de plataforma: solo sólido, buracos, cristais, fauna e câmera lateral. */
import {WORLD_LENGTH,groundAt,FLIGHT_PAD_X} from './platformer.mjs';
const TAU=Math.PI*2;
const circ=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();};
function drawTree(c,x,y,i,biome,time){
  const height=85+(i%4)*18;
  if(biome==='desert'){
    c.strokeStyle='#5eab73';c.lineWidth=13;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-height);c.stroke();
    for(const dir of [-1,1]){c.beginPath();c.moveTo(x,y-38);c.lineTo(x+dir*26,y-40);c.lineTo(x+dir*26,y-70);c.stroke();}
  }else if(biome==='ice'){
    circ(c,x,y-height*.7,30,'#b2ebfa');
    c.fillStyle='#f7feff';c.beginPath();c.moveTo(x,y-height-28);c.lineTo(x-39,y);c.lineTo(x+39,y);c.fill();
  }else if(biome==='lava'){
    c.fillStyle='#29283e';c.beginPath();c.moveTo(x-15,y);c.lineTo(x,y-height);c.lineTo(x+24,y);c.fill();
    circ(c,x,y-height-8,11,'#ffac55');
  }else if(biome==='city'||biome==='ruins'){
    c.fillStyle='#6d8ea9';c.fillRect(x-24,y-height,48,height);
    c.fillStyle='#70edfd';for(let k=0;k<4;k++)c.fillRect(x-12,y-height+12+k*19,23,7);
  }else{
    c.strokeStyle='#6d5371';c.lineWidth=12;c.beginPath();c.moveTo(x,y);c.lineTo(x-9,y-height*.85);c.stroke();
    for(const off of [-30,6,32])circ(c,x+off,y-height+Math.sin(time/800+i+off)*3,29,biome==='forest'?'#4bcca5':'#86a5f1');
  }
}
export function drawPlatformPlanet(c,game,time){
  const p=game.planet,world=game.surface||{objects:[]};
  const astronaut=game.astronaut;
  const camera=Math.max(0,Math.min(WORLD_LENGTH-960,(astronaut?.x||200)-310));
  game.cameraX=camera;
  const sky=c.createLinearGradient(0,0,0,540);
  sky.addColorStop(0,p.sky);sky.addColorStop(.58,p.ground);sky.addColorStop(1,'#13233d');
  c.fillStyle=sky;c.fillRect(0,0,960,540);
  c.fillStyle=p.highlight+'6b';c.beginPath();c.arc(795-camera*.03,112,66,0,TAU);c.fill();
  // Montanhas mais distantes se movem devagar: parallax.
  for(let i=0;i<12;i++){
    const x=i*177-camera*.24-90;
    c.fillStyle=i%2?p.ground+'7f':p.sky+'a0';
    c.beginPath();c.moveTo(x-130,452);c.lineTo(x,237+i%4*19);c.lineTo(x+160,452);c.fill();
  }
  c.save();c.translate(-camera,0);
  for(let i=0;i<19;i++){
    const x=i*145+145;
    if(x<camera-120||x>camera+1100)continue;
    const y=groundAt(x,p.biome,p.stage)??440;
    drawTree(c,x,y,i,p.biome,time);
  }
  // Terreno tem colisão correspondente à superfície usada pela física.
  const groundFill=c.createLinearGradient(0,405,0,540);
  groundFill.addColorStop(0,p.highlight);groundFill.addColorStop(.07,p.ground);groundFill.addColorStop(1,'#142238');
  for(let x=Math.floor(camera/8)*8;x<camera+980;x+=8){
    const y=groundAt(x,p.biome,p.stage);
    if(y===null)continue;
    c.fillStyle=groundFill;c.fillRect(x,y,9,540-y);
    c.fillStyle='#f3ffff6a';c.fillRect(x,y,9,2);
  }
  for(const o of world.objects||[]){
    if(o.x<camera-80||o.x>camera+1040||o.collected)continue;
    if(o.kind==='gem'){
      c.save();c.translate(o.x,o.y);c.rotate(Math.sin(time/300+o.x)*.12);
      c.fillStyle='#8af9ff';c.beginPath();c.moveTo(0,-19);c.lineTo(14,0);c.lineTo(0,18);c.lineTo(-14,0);c.closePath();c.fill();
      circ(c,-3,-5,4,'#ffffff');c.restore();
    }else if(o.kind==='checkpoint'){
      c.strokeStyle=o.active?'#9affa8':'#cce9ff';c.lineWidth=4;
      c.beginPath();c.moveTo(o.x,o.y+28);c.lineTo(o.x,o.y-31);c.stroke();
      circ(c,o.x,o.y-38,11,o.active?'#65ffac':'#b0cdf7');
      c.font='11px system-ui';c.fillStyle='#ffffff';c.fillText('SALVAR',o.x-22,o.y-55);
    }else if(o.kind==='animal'){
      const body=o.friendly?'#8de6b6':'#eb8b77',bob=Math.sin(time/220+o.phase)*2;
      circ(c,o.x,o.y+bob,18,body);
      for(const ear of [-11,11]){
        c.fillStyle=body;c.beginPath();c.moveTo(o.x+ear,o.y-12+bob);c.lineTo(o.x+ear*1.3,o.y-30+bob);c.lineTo(o.x+ear*.35,o.y-19+bob);c.fill();
      }
      circ(c,o.x+8,o.y-4+bob,3,'#18264d');
      if(!o.friendly){c.fillStyle='#ffd887';c.fillRect(o.x-17,o.y+13+bob,34,4);}
    }else if(o.kind==='hazard'){
      c.fillStyle=o.style==='electric'?'#bc98ff':o.style==='moving-plant'?'#ee7da2':'#feac72';
      c.beginPath();c.moveTo(o.x-21,o.y+15);
      for(let j=0;j<4;j++){c.lineTo(o.x-18+j*12,o.y-15-(j%2)*7);c.lineTo(o.x-12+j*12,o.y+15);}
      c.fill();
    }
  }
  // Foguete de pouso, desenhado junto ao solo e não flutuando com personagem.
  const landY=(groundAt(FLIGHT_PAD_X,p.biome,p.stage)||440)-28;
  const stage=game.state;
  let y=landY;
  if(stage==='landing')y-=Math.pow(1-game.transitionProgress,2)*245;
  if(stage==='takeoff')y-=Math.pow(game.transitionProgress,2)*330;
  c.save();c.translate(FLIGHT_PAD_X,y);
  c.strokeStyle='#d1eaff';c.lineWidth=4;c.beginPath();c.moveTo(-20,2);c.lineTo(-29,29);c.moveTo(21,2);c.lineTo(30,29);c.stroke();
  c.fillStyle=game.rocketModel.accent;c.beginPath();c.moveTo(0,-55);c.lineTo(24,-11);c.lineTo(17,20);c.lineTo(-17,20);c.lineTo(-24,-11);c.closePath();c.fill();
  c.fillStyle=game.rocketModel.primary;c.fillRect(-13,-19,26,27);
  circ(c,0,-18,10,'#53d5ef');
  if(stage==='landing'||stage==='takeoff'){c.fillStyle='#ffdd7a';c.beginPath();c.moveTo(-8,22);c.lineTo(0,45+Math.sin(time/100)*12);c.lineTo(8,22);c.fill();}
  if(stage==='disembarking'||stage==='walking'||stage==='boarding'||stage==='landed'){
    c.strokeStyle='#f5cf99';c.lineWidth=3;c.beginPath();c.moveTo(16,11);c.lineTo(46,27);c.stroke();
  }
  c.restore();
  c.restore();
  c.font='bold 16px system-ui';c.fillStyle='#ffffff';c.shadowColor='#000';c.shadowBlur=6;
  c.fillText(p.icon+' '+(game.save.planetNames[p.stage]||p.name)+' — EXPLORAÇÃO LIVRE',24,92);
  c.shadowBlur=0;
}

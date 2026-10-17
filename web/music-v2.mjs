/** Trilha original em múltiplas vozes, volumes reforçados com limitação de picos. */
export {musicNotesAt,TEMPO_SECONDS} from './music.mjs';
import {musicNotesAt,TEMPO_SECONDS} from './music.mjs';
const chord=[[220,261.63,329.63,392],[174.61,220,261.63,349.23],[196,261.63,329.63,392],[196,246.94,293.66,392]];
export function arrangement(step,scene='flight'){
 const i=Math.max(0,Math.floor(step)),c=chord[Math.floor(i/8)%4],quiet=scene==='planet';
 const melody=musicNotesAt(i);
 return {...melody,arp:c[[0,2,3,1,2,0,1,3][i%8]]*2,
  counter:c[[3,1,2,0][Math.floor(i/2)%4]]*(Math.floor(i/16)%2?1:2),
  pulse:c[1]/2,drum:!quiet&&i%4===0,hat:!quiet&&i%2!==0,scene};
}
export class SpaceAudio{
 constructor(win=globalThis){this.win=win;this.ctx=null;this.master=null;this.enabled=true;
  this.step=0;this.next=0;this.scene='flight';this.volume=.94;this.effectsVolume=.72;this.noise=null;}
 unlock(){
  if(!this.enabled)return;
  try{
   const C=this.win.AudioContext||this.win.webkitAudioContext;if(!C)return;
   if(!this.ctx){
    this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=this.volume;
    const comp=this.ctx.createDynamicsCompressor?.();
    if(comp){comp.threshold.value=-17;comp.ratio.value=3.4;comp.attack.value=.008;comp.release.value=.19;this.master.connect(comp);comp.connect(this.ctx.destination);}
    else this.master.connect(this.ctx.destination);
   }
   if(this.ctx.state!=='running')void this.ctx.resume().catch(()=>{});
  }catch{this.ctx=null;this.master=null;}
 }
 setEnabled(v){this.enabled=!!v;this.next=0;
  if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.ctx.currentTime,.02);
  if(this.enabled)this.unlock();}
 setVolume(v){this.volume=Math.max(0,Math.min(1,Number(v)||0));
  if(this.ctx&&this.master)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.02);}
 setEffectsVolume(v){this.effectsVolume=Math.max(0,Math.min(1,Number(v)||0));}
 setScene(v){this.scene=['flight','landing','planet','danger'].includes(v)?v:'flight';}
 pause(){this.next=0;}
 tone(f,t,d,v=.1,type='triangle'){
  if(!this.ctx||!this.master)return;
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+.023);
  g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+d+.02);
 }
 beat(t){
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.setValueAtTime(130,t);
  o.frequency.exponentialRampToValueAtTime(46,t+.16);g.gain.setValueAtTime(.10,t);
  g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.21);
 }
 tick(active){
  if(!active||!this.enabled||!this.ctx||this.ctx.state!=='running'){this.next=0;return;}
  const now=this.ctx.currentTime;if(!this.next||this.next<now-.35)this.next=now+.025;
  for(let k=0;this.next<now+.15&&k<4;k++){
   const t=this.next,n=arrangement(this.step,this.scene),quiet=n.scene==='planet';
   this.tone(n.lead,t,.32,quiet?.13:.19,'triangle');
   this.tone(n.lead*2,t,.15,quiet?.018:.035,'sine');
   this.tone(n.arp,t,.22,quiet?.025:.059,'sine');
   if(this.step%2===0)this.tone(n.counter,t,.4,quiet?.021:.055,'triangle');
   if(this.step%4===0){this.tone(n.bass,t,.92,quiet?.055:.12,'sine');this.tone(n.pulse,t,.85,.028,'sawtooth');}
   if(n.drum)this.beat(t);
   if(n.hat)this.tone(1700,t,.07,.018,'square');
   this.next+=TEMPO_SECONDS;this.step++;
  }
 }
 sound(kind){
  if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
  const t=this.ctx.currentTime+.01,v=this.effectsVolume;
  if(kind==='pickup'){this.tone(740,t,.16,.16*v);this.tone(1110,t+.08,.2,.09*v,'sine');}
  else if(kind==='hit'){this.tone(145,t,.35,.16*v,'sawtooth');}
  else if(kind==='laser'){this.tone(880,t,.12,.08*v,'sawtooth');}
  else if(kind==='jump'){this.tone(500,t,.15,.085*v,'sine');}
  else if(kind==='checkpoint'){this.tone(610,t,.2,.13*v);this.tone(920,t+.11,.27,.11*v);}
  else if(kind==='dock'||kind==='land'){this.tone(340,t,.42,.11*v);this.tone(500,t+.18,.48,.12*v);}
  else if(kind==='crate'){this.tone(530,t,.21,.10*v);this.tone(770,t+.1,.32,.095*v);}
  else if(kind==='win'){[392,520,659,784,1046].forEach((f,i)=>this.tone(f,t+i*.16,.5,.11*v));}
 }
}

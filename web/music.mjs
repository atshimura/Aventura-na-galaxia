/** Trilha instrumental original sintetizada localmente via Web Audio, sem downloads. */
export const TEMPO_SECONDS = 60 / 104 / 2;
const CHORDS = [
  [220, 261.63, 329.63, 392],    // Lá menor: viagem
  [174.61, 220, 261.63, 349.23], // Fá: horizonte
  [196, 261.63, 329.63, 392],    // Dó: descoberta
  [196, 246.94, 293.66, 392],    // Sol: mistério
];
const SEQUENCE = [0,2,1,3, 2,1,3,1];
export function musicNotesAt(step){
  const i=Math.max(0,Math.floor(step));
  const chord=CHORDS[Math.floor(i/8)%CHORDS.length];
  return {lead:chord[SEQUENCE[i%8]]* (i%16===15?2:1),
    bass:chord[0]/2, harmony:chord[1], accent:i%8===0};
}
export class SpaceAudio {
  constructor(win=globalThis){this.win=win;this.ctx=null;this.master=null;this.enabled=true;this.step=0;this.next=0;}
  unlock(){
    if(!this.enabled)return;
    try{
      const Ctx=this.win.AudioContext||this.win.webkitAudioContext;
      if(!Ctx)return;
      if(!this.ctx){
        this.ctx=new Ctx();this.master=this.ctx.createGain();
        this.master.gain.value=.72;
        this.master.connect(this.ctx.destination);
      }
      // Resumir no gesto de toque para funcionar no WebView do Android.
      if(this.ctx.state!=='running')void this.ctx.resume().catch(()=>{});
    }catch{this.ctx=null;this.master=null;}
  }
  setEnabled(enabled){
    this.enabled=Boolean(enabled);this.next=0;
    if(this.master&&this.ctx){this.master.gain.setTargetAtTime(this.enabled?.72:0,this.ctx.currentTime,.025);}
    if(this.enabled)this.unlock();
  }
  pause(){this.next=0;}
  tone(hz,start,duration,volume=.1,type='triangle',attack=.035){
    if(!this.ctx||!this.master)return;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(hz,start);
    g.gain.setValueAtTime(.0001,start);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+attack);
    g.gain.exponentialRampToValueAtTime(.0001,start+duration);
    o.connect(g);g.connect(this.master);o.start(start);o.stop(start+duration+.03);
  }
  tick(isPlaying){
    if(!isPlaying||!this.enabled||!this.ctx||this.ctx.state!=='running'){this.next=0;return;}
    const now=this.ctx.currentTime;
    if(!this.next||this.next<now-.4)this.next=now+.025;
    let iterations=0;
    while(this.next<now+.18&&iterations++<4){
      const n=musicNotesAt(this.step);
      this.tone(n.lead,this.next,.26,.095,'triangle');
      this.tone(n.lead*2,this.next,.13,.013,'sine',.02);
      if(this.step%2===0)this.tone(n.harmony,this.next,.54,.028,'sine');
      if(n.accent){
        this.tone(n.bass,this.next,1.2,.085,'sine',.09);
        this.tone(n.bass*2,this.next,1.05,.026,'triangle',.09);
      }
      this.next+=TEMPO_SECONDS;this.step++;
    }
  }
  sound(kind){
    if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
    const now=this.ctx.currentTime+.01;
    if(kind==='pickup'){this.tone(740,now,.12,.13);this.tone(1108,now+.07,.24,.08,'sine');}
    else if(kind==='hit'){this.tone(145,now,.37,.14,'sawtooth');}
    else if(kind==='crate'){this.tone(523,now,.23,.10);this.tone(784,now+.12,.35,.09);}
    else if(kind==='laser'){this.tone(860,now,.1,.055,'sawtooth',.015);this.tone(450,now+.055,.15,.04,'triangle',.015);}
    else if(kind==='dock'){this.tone(329.63,now,.48,.1);this.tone(392,now+.24,.55,.08);}
    else if(kind==='win'){[392,523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,now+i*.18,.54,.11));}
  }
}

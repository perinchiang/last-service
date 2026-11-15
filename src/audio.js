export class Sound {
 constructor(){this.ctx=null;this.muted=false;try{this.muted=localStorage.getItem('last-service-muted')==='1';}catch{}}
 start(){if(this.ctx){this.ctx.resume().catch(()=>{});return;}try{const A=window.AudioContext||window.webkitAudioContext;this.ctx=new A();const c=this.ctx;this.master=c.createGain();this.master.gain.value=this.muted?0:.45;const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=5;comp.connect(c.destination);this.master.connect(comp);this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);let d=this.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.amb=c.createGain();this.amb.gain.value=.018;this.amb.connect(this.master);for(const f of [48,72.1,144.3]){const o=c.createOscillator();o.type='sine';o.frequency.value=f;o.connect(this.amb);o.start();}const src=c.createBufferSource();src.buffer=this.noise;src.loop=true;const low=c.createBiquadFilter();low.type='lowpass';low.frequency.value=180;src.connect(low);low.connect(this.amb);src.start();}catch{this.ctx=null;}}
 toggle(){this.muted=!this.muted;if(this.ctx)this.master.gain.setTargetAtTime(this.muted?0:.45,this.ctx.currentTime,.05);try{localStorage.setItem('last-service-muted',this.muted?'1':'0');}catch{}return this.muted;}
 tone(from,to,duration=.15,gain=.1,type='sine',delay=0){if(!this.ctx)return;const c=this.ctx,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(Math.max(15,to),t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(gain,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);}
 hiss(dur=.12,gain=.18,cut=1800,delay=0){if(!this.ctx)return;const c=this.ctx,t=c.currentTime+delay,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noise;f.type='lowpass';f.frequency.value=cut;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t,Math.random());s.stop(t+dur);}
 shot(){this.hiss(.13,.38,3600);this.tone(130,45,.2,.32,'triangle');this.tone(1150,340,.055,.05,'sawtooth');this.hiss(.23,.055,900,.07);}
 hit(){this.tone(1450,650,.055,.07,'triangle');this.hiss(.055,.08,5500);}
 hurt(){this.tone(85,30,.32,.22);this.hiss(.2,.15,600);}
 reload(){this.hiss(.12,.15,2800);this.tone(170,90,.11,.1,'triangle');this.hiss(.12,.17,3700,.65);this.tone(210,500,.12,.08,'triangle',1.12);}
 boom(){this.hiss(.65,.45,1200);this.tone(100,24,.6,.36,'triangle');this.hiss(.2,.18,4800);}
 step(){this.hiss(.09,.065,460);this.tone(90,48,.06,.045,'triangle');}
 wake(){this.tone(110,560,1.2,.05);this.tone(330,660,.3,.04,'sine',1.5);this.hiss(1.6,.05,850);}
 alarm(){this.tone(580,420,.35,.08,'triangle');this.tone(580,420,.35,.08,'triangle',.5);}
 gate(){this.hiss(3,.18,420);this.tone(45,29,3,.13,'triangle');for(let i=0;i<4;i++)this.hiss(.13,.17,1600,i*.24);}
 success(){for(let i=0;i<4;i++)this.tone([220,277,330,440][i],[220,277,330,440][i],1.5,.055,'sine',i*.2);}
}

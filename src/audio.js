export class Sound {
 constructor(){this.ctx=null;this.muted=false;this.listener={x:0,y:1.72,z:0,yaw:0};this.distantIn=4;try{this.muted=localStorage.getItem('last-service-muted')==='1';}catch{}}
 start(context){
  if(this.ctx){if(this.ctx.resume)this.ctx.resume().catch(()=>{});return;}
  try{
   const A=window.AudioContext||window.webkitAudioContext,c=context||new A();this.ctx=c;
   this.master=c.createGain();this.master.gain.value=this.muted?0:.42;
   const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=8;comp.ratio.value=6;comp.attack.value=.004;comp.release.value=.18;this.master.connect(comp);comp.connect(c.destination);
   this.noise=c.createBuffer(1,c.sampleRate*3,c.sampleRate);
   const d=this.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
   // A short, dark room impulse: dry attacks remain distinct from their tails.
   this.reverb=c.createConvolver();const duration=2.15,impulse=c.createBuffer(2,Math.ceil(c.sampleRate*duration),c.sampleRate);
   for(let ch=0;ch<2;ch++){
    const data=impulse.getChannelData(ch);let smooth=0;
    for(let i=0;i<data.length;i++){const t=i/c.sampleRate;smooth=smooth*.65+(Math.random()*2-1)*.35;data[i]=t<.024?0:smooth*Math.pow(1-t/duration,2.8);}
    for(const [sec,amp] of [[.047,.32],[.091,.22],[.153,.12]])data[Math.floor((sec+ch*.009)*c.sampleRate)]+=amp;
   }
   this.reverb.buffer=impulse;const tail=c.createBiquadFilter();tail.type='lowpass';tail.frequency.value=2100;this.reverb.connect(tail);tail.connect(this.master);
   this.amb=c.createGain();this.amb.gain.value=1;this.amb.connect(this.master);
   for(const [f,gain] of [[41.2,.013],[61.8,.006],[82.4,.003]]){
    const o=c.createOscillator(),g=c.createGain(),lfo=c.createOscillator(),depth=c.createGain();o.type='sine';o.frequency.value=f;g.gain.value=gain;lfo.frequency.value=.07+f*.0003;depth.gain.value=gain*.14;lfo.connect(depth);depth.connect(g.gain);o.connect(g);g.connect(this.amb);o.start();lfo.start();
   }
   for(const [hz,gain,pan] of [[280,.022,-.5],[760,.008,.5]]){
    const src=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain(),p=c.createStereoPanner();src.buffer=this.noise;src.loop=true;filter.type='bandpass';filter.frequency.value=hz;filter.Q.value=.55;g.gain.value=gain;p.pan.value=pan;src.connect(filter);filter.connect(g);g.connect(p);p.connect(this.amb);src.start(0,pan<0?0:1.3);
   }
  }catch{this.ctx=null;}
 }
 toggle(){this.muted=!this.muted;if(this.ctx)this.master.gain.setTargetAtTime(this.muted?0:.42,this.ctx.currentTime,.05);try{localStorage.setItem('last-service-muted',this.muted?'1':'0');}catch{}return this.muted;}
 update(dt,position,yaw){
  Object.assign(this.listener,position,{yaw});if(!this.ctx)return;this.distantIn-=dt;
  if(this.distantIn<=0){this.distantIn=7+Math.random()*5;const side=Math.random()>.5?1:-1,p={x:side*9,y:5,z:position.z-8};this.tone(94,81,1.8,.018,'sine',0,p,.32);this.hiss(1.35,.012,640,.12,p,.3);}
 }
 route(node,position,wet){
  const c=this.ctx,panner=c.createStereoPanner(),gain=c.createGain(),send=c.createGain(),l=this.listener;
  let pan=.08,volume=1;
  if(position){const dx=position.x-l.x,dz=position.z-l.z,dist=Math.hypot(dx,dz,position.y-l.y);pan=(dx*Math.cos(l.yaw)-dz*Math.sin(l.yaw))/Math.max(2,dist);volume=1/(1+Math.max(0,dist-2)*.07);}
  panner.pan.value=Math.max(-.85,Math.min(.85,pan));gain.gain.value=volume;send.gain.value=wet;
  node.connect(gain);gain.connect(panner);panner.connect(this.master);gain.connect(send);send.connect(this.reverb);
  return ()=>{node.disconnect();gain.disconnect();panner.disconnect();send.disconnect();};
 }
 tone(from,to,duration=.15,gain=.1,type='sine',delay=0,position=null,wet=.14){
  if(!this.ctx)return;const c=this.ctx,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(Math.max(15,to),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain,t+Math.min(.012,duration*.1));g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);const release=this.route(g,position,wet);o.onended=()=>{o.disconnect();release();};o.start(t);o.stop(t+duration+.02);
 }
 hiss(dur=.12,gain=.18,cut=1800,delay=0,position=null,wet=.14){
  if(!this.ctx)return;const c=this.ctx,t=c.currentTime+delay,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noise;f.type='lowpass';f.frequency.value=cut;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);const release=this.route(g,position,wet);s.onended=()=>{s.disconnect();f.disconnect();release();};s.start(t,Math.random());s.stop(t+dur+.01);
 }
 shot(){this.hiss(.055,.32,5200,0,null,.2);this.tone(158,43,.19,.3,'triangle',0,null,.22);this.tone(78,39,.16,.16,'sine');this.hiss(.035,.11,2500,.045,null,.08);this.tone(860,420,.03,.035,'triangle',.055);}
 hit(position){this.tone(1480,670,.065,.07,'triangle',0,position,.18);this.hiss(.06,.08,5000,0,position,.2);}
 hurt(){this.tone(85,30,.32,.22);this.hiss(.2,.15,600);}
 reload(){this.hiss(.07,.11,3200,0,null,.05);this.tone(240,120,.07,.06,'triangle');this.hiss(.09,.13,2300,.98,null,.06);this.tone(165,90,.1,.09,'triangle',1.0);this.hiss(.045,.15,3900,1.2,null,.08);}
 boom(position){this.hiss(.65,.4,1200,0,position,.32);this.tone(105,24,.6,.32,'triangle',0,position,.3);this.hiss(.18,.15,4500,0,position,.22);}
 step(){this.hiss(.06,.052,650,0,null,.07);this.tone(92,49,.075,.05,'triangle',0,null,.08);}
 wake(){this.tone(110,560,1.2,.045);this.tone(330,660,.3,.03,'sine',1.5);this.hiss(1.6,.035,850);}
 alarm(){this.tone(580,420,.35,.055,'triangle');this.tone(580,420,.35,.055,'triangle',.5);}
 gate(position){this.hiss(3,.21,500,0,position,.32);this.tone(46,29,3,.17,'triangle',0,position,.25);for(let i=0;i<4;i++)this.hiss(.13,.16,1800,i*.24,position,.25);}
 success(){for(let i=0;i<4;i++)this.tone([220,277,330,440][i],[220,277,330,440][i],1.5,.045,'sine',i*.2,null,.25);}
}

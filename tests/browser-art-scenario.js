async () => {
 const g=window.__game,checks=[],check=(name,pass,details)=>checks.push({name,pass:!!pass,...(details?{details}:{})});
 g.stop();g.begin(true);const T=g.world.layout.terminal;
 check('The service-deck view has a clear long axis to the lock',g.snapshot.player.x===0&&g.snapshot.player.z-g.world.layout.gate.z>28);
 // Reach the relocated terminal by walking, not teleporting through the new props.
 g.input.keys.add('KeyW');for(let i=0;i<340&&g.snapshot.player.z>T.z+2.2;i++)g.step(.025,false);g.input.reset();
 g.input.keys.add('KeyA');for(let i=0;i<90&&g.snapshot.player.x>T.x;i++)g.step(.025,false);g.input.reset();g.interact();
 check('The terminal is reachable on foot through the rebuilt hall',g.snapshot.inspected,g.snapshot.player);
 g.begin(true);g.step(.016,false);g.fire();g.reload();g.step(.55,false);
 check('Reload visibly separates the magazine from its well',g.weapon.magazine.position.y<-.3);
 g.begin(true);g.step(.016,false);
 check('Restart cancels the reload and reseats moving weapon parts',Math.abs(g.weapon.magazine.position.y+.12)<.001&&Math.abs(g.weapon.bolt.position.z-.04)<.001);
 const q=document.getElementById('quality'),saved=q.value;
 try{
  q.value='low';q.dispatchEvent(new Event('change'));g.step(.016);
  check('Low quality disables the planar reflection and expensive passes',!g.world.sheen.visible&&!g.engine.bloom.enabled);
  q.value='high';q.dispatchEvent(new Event('change'));g.step(.016);
  check('High quality restores reflection with no failed shaders',g.world.sheen.visible&&g.engine.renderer.info.programs.every(p=>p.diagnostics?.runnable!==false));
 }finally{q.value=saved;q.dispatchEvent(new Event('change'));}
 // Offline synthesis verifies actual output, including panning and the room tail.
 const context=new OfflineAudioContext(2,44100*2,44100),sound=new g.sound.constructor();sound.start(context);sound.muted=false;sound.master.gain.value=.42;sound.amb.gain.value=0;
 sound.update(0,{x:0,y:1.72,z:0},0);sound.tone(190,80,.08,.2,'triangle',.05,{x:-4,y:1.72,z:-2},.4);
 const buffer=await context.startRendering(),left=buffer.getChannelData(0),right=buffer.getChannelData(1);
 const rms=(data,a,b)=>{let sum=0;for(let i=Math.floor(a*44100);i<Math.floor(b*44100);i++)sum+=data[i]*data[i];return Math.sqrt(sum/((b-a)*44100));};
 let peak=0,finite=true;for(let i=0;i<left.length;i++){peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));finite&&=Number.isFinite(left[i])&&Number.isFinite(right[i]);}
 const dryL=rms(left,.05,.16),dryR=rms(right,.05,.16),tail=rms(left,.35,.8);
 check('Procedural sound produces finite, unclipped output',finite&&peak>.001&&peak<.95,{peak});
 check('A source to the left sounds stronger in the left channel',dryL>dryR*1.2,{dryL,dryR});
 check('Room reverberation remains after the dry source stops',tail>.000005,{tail});
 check('Art and audio flows report no uncaught browser errors',window.__bootErrors.length===0,window.__bootErrors);
 g.begin(true);g.step(.016);return {passed:checks.filter(c=>c.pass).length,total:checks.length,checks};
}

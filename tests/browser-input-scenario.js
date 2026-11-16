async () => {
 const g=window.__game,checks=[],check=(name,pass)=>checks.push({name,pass:!!pass});
 g.stop();g.begin(true);const spawn={...g.snapshot.player};
 check('Restart places the player on the central service deck',Math.abs(g.snapshot.player.x)<.001&&g.snapshot.player.z>0&&Math.abs(g.snapshot.player.y-2.33)<.001);
 const c=document.querySelector('#world');
 c.dispatchEvent(new MouseEvent('mousedown',{button:2,buttons:2,bubbles:true}));
 c.dispatchEvent(new MouseEvent('mousedown',{button:0,buttons:3,bubbles:true}));
 for(let i=0;i<50;i++)g.step(.02,false);g.step(.016);
 check('Holding right and left fires repeatedly while aimed',g.input.aim&&g.input.fire&&g.snapshot.shots>=3);
 const centre=g.weapon.group.localToWorld(g.weapon.sight.clone()).project(g.camera);
 check('Desktop sight aligns with the centre firing ray',Math.abs(centre.x)<.0001&&Math.abs(centre.y)<.0001);
 window.dispatchEvent(new MouseEvent('mouseup',{button:0,buttons:2}));
 check('Releasing left preserves right-button aim',g.input.aim&&!g.input.fire);
 window.dispatchEvent(new MouseEvent('mouseup',{button:2,buttons:0}));
 g.begin(true);g.input.keys.add('KeyW');for(let i=0;i<70;i++)g.step(.025,false);g.input.reset();
 check('The player walks off the deck without getting stuck',g.snapshot.player.z<spawn.z-4.8&&Math.abs(g.snapshot.player.y-1.72)<.03);
 g.begin(false);g.step(.3,false);check('Awakening uses the same central position',g.camera.position.x===spawn.x&&g.camera.position.z===spawn.z);
 for(let i=0;i<70;i++)g.step(.1,false);
 check('Awakening lowers the lift and enters play',g.state==='play'&&Math.abs(g.world.serviceLift.position.y+1.78)<.001);
 const tips=g.world.arms.map(a=>a.tip.getWorldPosition(a.tip.position.clone()));
 check('Service claws retract clear of the player',tips[0].x<spawn.x-2&&tips[1].x>spawn.x+2);
 const f=document.createElement('iframe');f.id='phone-regression';f.style.cssText='position:fixed;inset:0;width:390px;height:844px;border:0;z-index:100';
 f.src=location.pathname+'?qa=1&touch=1&v='+Date.now();
 await new Promise(resolve=>{f.onload=resolve;document.body.appendChild(f);});
 const w=f.contentWindow,d=w.document,p=w.__game;
 try{
  p.stop();p.begin(true);p.step(.016);
  const emit=(id,type,pointerId=9,x=0,y=0)=>d.getElementById(id).dispatchEvent(new w.PointerEvent(type,{pointerId,pointerType:'touch',clientX:x,clientY:y,buttons:type==='pointerup'?0:1,bubbles:true,cancelable:true}));
  emit('fireTouch','pointerdown');emit('fireTouch','pointerup');
  check('Phone tap fires one shot without aiming',p.snapshot.shots===1&&!p.input.aim);
  p.step(.2,false);emit('fireTouch','pointerdown');
  await new Promise(resolve=>setTimeout(resolve,270));
  for(let i=0;i<50;i++)p.step(.02,false);p.step(.016);
  check('Phone hold combines aim and automatic fire',p.input.aim&&p.input.fire&&p.snapshot.shots>=4&&p.camera.fov<70);
  const q=p.weapon.group.localToWorld(p.weapon.sight.clone()).project(p.camera);
  check('Phone sight also aligns in portrait',Math.abs(q.x)<.0001&&Math.abs(q.y)<.0001);
  const stick=d.getElementById('stick').getBoundingClientRect();emit('stick','pointerdown',10,stick.x+75,stick.y+35);
  emit('lookzone','pointerdown',11,230,250);emit('lookzone','pointermove',11,245,255);
  check('Phone can move and look while holding aimed fire',p.input.moveX>0&&p.input.lookX>0&&p.input.aim&&p.input.fire);
  emit('stick','pointerup',10);emit('lookzone','pointerup',11);emit('fireTouch','pointerup');
  const shots=p.snapshot.shots;for(let i=0;i<40;i++)p.step(.025,false);
  check('Releasing phone fire exits aim and stops shooting',!p.input.aim&&!p.input.fire&&p.snapshot.shots===shots&&p.camera.fov>78);
  emit('fireTouch','pointerdown');emit('fireTouch','pointercancel');
  check('Cancelling a touch does not fire a stray shot',p.snapshot.shots===shots);
  check('Phone layout stays within the viewport',d.documentElement.scrollWidth<=390&&['fireTouch','stick','reloadTouch','useTouch'].every(id=>{const r=d.getElementById(id).getBoundingClientRect();return r.left>=0&&r.right<=390&&r.top>=0&&r.bottom<=844;}));
  check('No browser errors in desktop or touch flows',window.__bootErrors.length===0&&w.__bootErrors.length===0);
 }finally{p.stop();f.remove();}
 g.begin(true);g.step(.016);return {passed:checks.filter(c=>c.pass).length,total:checks.length,checks};
}

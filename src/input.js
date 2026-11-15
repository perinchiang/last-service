export function makeInput(canvas,callbacks){
 const doc=canvas.ownerDocument,win=doc.defaultView;
 const touch=win.matchMedia('(pointer:coarse)').matches||new URLSearchParams(win.location.search).has('touch');
 const keys=new Set(),state={touch,keys,moveX:0,moveZ:0,lookX:0,lookY:0,fire:false,aim:false,enabled:false};
 let dragging=false,lastX=0,lastY=0,wasLocked=false,lockPending=false,skipRelative=false,rawSupported=true,stickId=null,lookId=null,fireId=null,fireStart=0,lx=0,ly=0;
 const knob=doc.querySelector('#stickKnob');
 function reset(){keys.clear();state.moveX=state.moveZ=state.lookX=state.lookY=0;state.fire=state.aim=false;dragging=false;stickId=lookId=fireId=null;knob.style.transform='';}
 state.reset=reset;
 state.lock=async()=>{
  if(touch||lockPending||doc.pointerLockElement===canvas||!canvas.requestPointerLock)return;
  lockPending=true;
  try{await canvas.requestPointerLock(rawSupported?{unadjustedMovement:true}:undefined);}
  catch(error){if(rawSupported&&error?.name==='NotSupportedError'){rawSupported=false;try{await canvas.requestPointerLock();}catch{}}}
  finally{lockPending=false;}
 };
 function mouseButtons(buttons){state.fire=(buttons&1)!==0;state.aim=(buttons&2)!==0;dragging=(buttons&3)!==0;}
 function addMouseLook(x,y){
  // Reject coordinate discontinuities instead of snapping to a pitch limit.
  if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>500||Math.abs(y)>500)return;
  state.lookX+=x;state.lookY+=y;
 }
 state.takeLook=dt=>{
  const x=state.lookX,y=state.lookY;state.lookX=state.lookY=0;
  if(touch)return {x,y};
  // Bound bursts accumulated during stalls; normal small movements stay linear.
  const limit=Math.max(80,Math.min(dt,.04)*9000),scale=Math.min(1,limit/Math.max(1,Math.hypot(x,y)));
  return {x:x*scale,y:y*scale};
 };
 state.update=()=>{if(touch&&fireId!==null&&win.performance.now()-fireStart>=240){state.aim=true;state.fire=true;}};
 win.addEventListener('keydown',e=>{if(['SELECT','INPUT','TEXTAREA'].includes(e.target?.tagName))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='Escape')callbacks.pause();if(!state.enabled)return;if(e.code==='KeyE')callbacks.use();if(e.code==='KeyR')callbacks.reload();if(e.code==='KeyM')callbacks.mute();});
 win.addEventListener('keyup',e=>keys.delete(e.code));
 // Mouse events report every button in a chord; pointerdown only reports its first.
 canvas.addEventListener('mousedown',e=>{if(!state.enabled||touch)return;e.preventDefault();lastX=e.clientX;lastY=e.clientY;mouseButtons(e.buttons);state.lock();});
 win.addEventListener('mouseup',e=>{if(!touch)mouseButtons(state.enabled?e.buttons:0);});
 win.addEventListener('mousemove',e=>{
  if(!state.enabled||touch)return;
  if(doc.pointerLockElement===canvas){mouseButtons(e.buttons);if(skipRelative){skipRelative=false;return;}addMouseLook(e.movementX,e.movementY);}
  else if(dragging){mouseButtons(e.buttons);addMouseLook(e.clientX-lastX,e.clientY-lastY);lastX=e.clientX;lastY=e.clientY;}
 });
 canvas.addEventListener('contextmenu',e=>e.preventDefault());
 doc.addEventListener('pointerlockchange',()=>{const locked=doc.pointerLockElement===canvas;state.lookX=state.lookY=0;skipRelative=locked;if(wasLocked&&!locked&&state.enabled)callbacks.pause();wasLocked=locked;});
 win.addEventListener('blur',()=>{reset();if(state.enabled)callbacks.pause();});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){reset();if(state.enabled)callbacks.pause();}});
 const capture=(node,id)=>{try{node.setPointerCapture(id);}catch{}};
 const stick=doc.querySelector('#stick');
 function moveStick(e){const r=stick.getBoundingClientRect(),x=e.clientX-r.x-r.width/2,y=e.clientY-r.y-r.height/2,n=Math.max(1,Math.hypot(x,y)/35);state.moveX=x/n/35;state.moveZ=y/n/35;knob.style.transform='translate('+x/n+'px,'+y/n+'px)';}
 stick.addEventListener('pointerdown',e=>{if(!state.enabled||stickId!==null)return;stickId=e.pointerId;capture(stick,e.pointerId);moveStick(e);e.preventDefault();});
 stick.addEventListener('pointermove',e=>{if(e.pointerId===stickId)moveStick(e);});
 function stopStick(e){if(e.pointerId!==stickId)return;stickId=null;state.moveX=state.moveZ=0;knob.style.transform='';}
 for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,stopStick);
 const look=doc.querySelector('#lookzone');
 look.addEventListener('pointerdown',e=>{if(!state.enabled||lookId!==null)return;lookId=e.pointerId;lx=e.clientX;ly=e.clientY;capture(look,e.pointerId);});
 look.addEventListener('pointermove',e=>{if(e.pointerId!==lookId||!state.enabled)return;state.lookX+=(e.clientX-lx)*1.8;state.lookY+=(e.clientY-ly)*1.8;lx=e.clientX;ly=e.clientY;});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(type,e=>{if(e.pointerId===lookId)lookId=null;});
 const fire=doc.querySelector('#fireTouch');
 fire.addEventListener('pointerdown',e=>{if(!state.enabled||fireId!==null)return;fireId=e.pointerId;fireStart=win.performance.now();capture(fire,e.pointerId);e.preventDefault();});
 function stopFire(e){if(e.pointerId!==fireId)return;const tap=e.type==='pointerup'&&state.enabled&&win.performance.now()-fireStart<240;fireId=null;state.fire=state.aim=false;if(tap)callbacks.fire();}
 for(const type of ['pointerup','pointercancel','lostpointercapture'])fire.addEventListener(type,stopFire);
 doc.querySelector('#useTouch').addEventListener('pointerdown',e=>{e.preventDefault();if(state.enabled)callbacks.use();});
 doc.querySelector('#reloadTouch').addEventListener('pointerdown',e=>{e.preventDefault();if(state.enabled)callbacks.reload();});
 return state;
}

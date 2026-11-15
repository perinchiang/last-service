import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {box,cyl,ring,pipe,label,bake,rng} from './art.js';
import {SERVICE,makeServiceArm,poseServiceArm} from './service-rig.js';
import {HALL} from './layout.js';

export function makeWorld(scene,M,low){
 const root=new T.Group();scene.add(root);
 const colliders=[],occluders=[],arms=[],fans=[],doorParts=[],bolts=[],rand=rng(401);
 const mid=(HALL.front+HALL.back)/2,depth=HALL.back-HALL.front;
 const solid=(x,z,w,d,h=2)=>{colliders.push({x,z,w,d});occluders.push(new T.Box3(new T.Vector3(x-w/2,0,z-d/2),new T.Vector3(x+w/2,h,z+d/2)));};
 const point=(color,intensity,x,y,z,dist=12)=>{const l=new T.PointLight(color,intensity,dist,2);l.position.set(x,y,z);scene.add(l);return l;};
 const beam=(parent,mat,a,b,width,thickness)=>{const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p);const o=box(parent,mat,0,0,0,width,v.length(),thickness);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;};
 const spot=(x,z)=>{const l=new T.SpotLight(0xd2e7e2,100,14,.8,.78,2);l.position.set(x,8.35,z);l.target.position.set(x*.5,0,z-1.7);scene.add(l,l.target);};
 scene.add(new T.HemisphereLight(0xc4d7dd,0x1b262b,.62));
 const sun=new T.DirectionalLight(0xd3e1da,1.7);sun.position.set(-6,13,9);sun.target.position.set(0,0,-8);sun.castShadow=true;sun.shadow.mapSize.set(low?1024:2048,low?1024:2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:23,bottom:-23,near:.5,far:65});sun.shadow.normalBias=.025;sun.shadow.bias=-.00015;scene.add(sun,sun.target);
 box(root,M.floor,0,-.24,mid,22,.4,depth+.6);
 box(root,M.dark,0,9.35,mid,22,.3,depth+.6);
 // Repeated structural bays. Each lintel and short bracket terminates on a pier.
 for(const side of [-1,1]){
  for(let z=HALL.front+3;z<HALL.back;z+=6){
   box(root,M.panel,side*10.95,4.5,z,.36,9,5.94);
   box(root,M.dark,side*10.72,.94,z,.12,1.84,5.84);
   box(root,M.steel,side*10.67,1.96,z,.15,.08,5.84);
   box(root,M.dark,side*10.71,7.25,z,.14,2.1,5.85);
   box(root,M.black,side*10.67,4.75,z,.16,2.55,3.9);
   box(root,M.steel,side*10.56,4.75,z,.07,2.25,3.58);
   box(root,M.glass,side*10.5,4.8,z,.025,1.98,3.25);
   for(const dz of [-1.16,0,1.16])box(root,M.black,side*10.45,4.8,z+dz,.1,2.1,.04);
   box(root,M.light,side*10.45,5.86,z,.04,.035,3.32);
  }
  for(const z of HALL.bays){
   box(root,M.dark,side*10.3,4.4,z,.64,8.8,.62);
   box(root,M.steel,side*9.95,4.45,z,.1,8.25,.48);
   box(root,M.black,side*10.15,.25,z,1,.5,.95);
   box(root,M.steel,side*10.1,8.45,z,1.15,.55,.9);
   beam(root,M.steel,[side*10.05,7.25,z],[side*8.9,8.7,z],.18,.27);
   for(const y of [.75,7.85])for(const dz of [-.16,.16])cyl(root,M.chrome,side*9.87,y,z+dz,.04,.04,'x',8);
   box(root,M.black,side*9.9,3.8,z,.18,1.5,.22);
   box(root,M.cyan,side*9.79,3.8,z,.035,1.18,.07);
  }
  for(const y of [.37,.62])cyl(root,M.steel,side*10.55,y,mid,.055,depth,'z');
  box(root,M.black,side*9.6,7.2,mid,.55,.22,depth);
  for(const z of [-18,-6,6])point(0xa6cbd0,24,side*9.2,4.1,z,9);
 }
 for(const z of HALL.bays){
  box(root,M.dark,0,8.8,z,20.6,.38,.55);box(root,M.steel,0,8.58,z,20.5,.06,.65);
  for(const s of [-1,1]){box(root,M.black,s*3.9,8.46,z,1.65,.19,.62);box(root,M.light,s*3.9,8.35,z,1.35,.035,.35);}
 }
 for(const x of [-3.9,3.9]){box(root,M.steel,x,9.03,mid,.16,.23,depth);for(const z of [4,-8,-20])spot(x,z);}
 // Large, quiet floor plates. Paired service rails lead to the distant lock.
 for(let z=HALL.front;z<=HALL.back;z+=3)box(root,M.black,0,-.013,z,21.5,.012,.018);
 for(let x=-9;x<=9;x+=3)box(root,M.black,x,-.011,mid,.018,.014,depth);
 for(const x of [-4.1,4.1]){
  box(root,M.dark,x,-.004,mid,.3,.06,depth);
  for(const dx of [-.12,.12])box(root,M.chrome,x+dx,.029,mid,.022,.015,depth);
  for(let z=HALL.front+1;z<HALL.back;z+=.6)box(root,M.black,x,.034,z,.2,.02,.026);
  for(const z of [-21,-15,-9,-3,3,9])box(root,M.cyan,x,.05,z,.03,.02,.62);
 }
 // A recessed, chamfered pressure lock instead of a roll-up shutter.
 const gz=HALL.gate.z;
 for(const s of [-1,1]){
  box(root,M.panel,s*7.7,4.5,HALL.front,6.6,9,.5);solid(s*7.7,HALL.front,6.6,.5,9);
  box(root,M.dark,s*6.8,3.6,HALL.front+.3,3.1,5.5,.12);
  box(root,M.steel,s*6.8,3.6,HALL.front+.4,2.7,4.9,.08);
  box(root,M.black,s*6.8,3.7,HALL.front+.46,2.5,4.45,.06);
  for(let y=2;y<5.8;y+=.65)box(root,M.steel,s*6.8,y,HALL.front+.53,2.2,.018,.04);
  label(root,s<0?'HUMAN OVERRIDE':'PRESSURE / 04',s*6.8,6.9,HALL.front+.35,2.8,.2,{color:'#a7bbb5'});
 }
 box(root,M.dark,0,8.65,HALL.front,8.8,1.1,.5);
 const outline=[[-4.15,0],[-4.15,6.6],[-2.85,7.9],[2.85,7.9],[4.15,6.6],[4.15,0]];
 for(let i=0;i<outline.length-1;i++){
  const a=outline[i],b=outline[i+1];beam(root,M.black,[a[0],a[1],gz],[b[0],b[1],gz],.65,.85);
  beam(root,M.chrome,[a[0],a[1],gz+.46],[b[0],b[1],gz+.46],.09,.05);
  const k=.94;beam(root,M.cyan,[a[0]*k,a[1]*k+.12,gz+.49],[b[0]*k,b[1]*k+.12,gz+.49],.032,.03);
 }
 box(root,M.black,0,.04,gz,8.7,.12,1.2);box(root,M.steel,0,6.83,gz-.1,7.4,.34,.65);
 label(root,'09  /  TRANSFER LOCK',0,7.18,gz+.58,3.3,.22,{color:'#c0d8d4'});
 for(const side of [-1,1]){
  const g=new T.Group();scene.add(g);g.userData.side=side;g.position.set(side*1.6,0,gz);
  box(g,M.steel,0,3.28,0,3.18,6.55,.48);box(g,M.dark,0,3.35,.25,2.91,5.85,.09);
  for(const y of [1.45,4.7]){box(g,M.panel,0,y,.34,2.67,2.22,.1);box(g,M.steel,0,y,.41,2.35,1.95,.055);for(const x of [-1.18,1.18])cyl(g,M.black,x,y+.84,.46,.04,.022,'z',8);}
  box(g,M.black,0,3.02,.42,2.8,.5,.13);box(g,M.chrome,-side*1.43,3.3,.33,.075,6.25,.14);box(g,M.cyan,-side*1.52,3.3,.42,.025,5.9,.035);
  for(const y of [1.5,5.25])bolts.push(box(g,M.chrome,-side*1.27,y,.51,.45,.16,.21));
  label(g,side<0?'0':'9',side*.17,3.9,.48,.74,.66,{color:'#9dafa9',size:170});doorParts.push(g);
 }
 point(0xa9d5dd,55,0,5.6,gz+1.6,11);
 const outside=new T.Group();scene.add(outside);box(outside,M.dark,0,-.5,gz-25,80,.8,55);
 for(let z=gz-6;z>gz-50;z-=9){for(const s of [-1,1]){box(outside,M.dark,s*10,9,z,1.2,18,1.2);box(outside,M.steel,s*7,15,z,14,.45,.8);box(outside,M.light,s*6,14.73,z,1.5,.04,.4);}box(outside,M.dark,0,18,z,35,.7,1.2);}
 for(let i=0;i<26;i++){const x=(rand()-.5)*65,z=gz-13-rand()*38;box(outside,M.dark,x,2+rand()*5,z,2+rand()*3,4+rand()*10,3+rand()*3);}bake(outside);
 const exitLight=point(0xb9e3e2,0,0,4.5,gz-2,22);
 // Unit 07 still awakens ON the maintenance deck, with the hall in front of it.
 const sx=SERVICE.x,sz=SERVICE.z;
 const deck=new T.Mesh(new T.CylinderGeometry(2.1,2.4,.6,32),M.black);deck.position.set(sx,.26,sz);deck.castShadow=deck.receiveShadow=true;root.add(deck);
 cyl(root,M.steel,sx,.48,sz,2.1,.16,'y',32);ring(root,M.cyan,sx,.58,sz,1.97,.018,Math.PI/2);
 occluders.push(new T.Box3(new T.Vector3(sx-2.1,0,sz-2.1),new T.Vector3(sx+2.1,.58,sz+2.1)));
 const serviceLift=new T.Group();scene.add(serviceLift);cyl(serviceLift,M.dark,sx,1.1,sz,.82,1.1,'y',16);cyl(serviceLift,M.chrome,sx,1.72,sz,.64,.15,'y',16);box(serviceLift,M.white,sx,2.05,sz,1.4,.5,2.1);box(serviceLift,M.rubber,sx,2.33,sz,1.1,.06,1.8);
 const liftOccluder=new T.Box3(new T.Vector3(sx-.7,0,sz-1.05),new T.Vector3(sx+.7,2.37,sz+1.05));occluders.push(liftOccluder);
 const armRoot=new T.Group();scene.add(armRoot);arms.push(makeServiceArm(armRoot,M,sx-2.75,sz-.1,1),makeServiceArm(armRoot,M,sx+2.75,sz-.1,-1));
 for(const x of [sx-2.75,sx+2.75])solid(x,sz-.1,.65,.65,1.5);
 for(const x of [sx-2.75,sx+2.75]){box(root,M.dark,x,3.55,sz+2.5,.32,7.1,.5);solid(x,sz+2.5,.4,.55,7.1);box(root,M.steel,x,2.1,sz+2.78,.36,.6,.06);box(root,M.amber,x,1.95,sz+2.82,.035,.22,.04);}
 box(root,M.steel,sx,6.95,sz+2.5,5.8,.3,.5);label(root,'07 / MAINTENANCE',sx,6.52,sz+2.8,3,.26,{color:'#a9bcb5'});
 pipe(root,M.rubber,[[sx-2.75,6.8,sz+2.5],[sx-1,6.8,sz+2.5],[sx-.8,4,sz+1.4],[sx,3.1,sz+.9]],.045);
 label(root,'UNIT 07 / SERVICE INCOMPLETE',sx,.31,sz+2.34,2.4,.18,{color:'#adb8a9'});
 // Paired storage and cooling bays: labels and pipe returns explain their purpose.
 for(const s of [-1,1]){
  for(const z of [-19,-7,11]){
   const x=s*9.05;box(root,M.black,x,.12,z,2.6,.24,2.6);box(root,M.dark,x,1.22,z,2.15,2.2,2.2);box(root,M.panel,x-s*1.1,1.25,z,.07,1.92,1.92);
   for(const dz of [-.77,.77])box(root,M.steel,x-s*1.15,1.2,z+dz,.1,1.86,.07);
   for(let y=.6;y<1.5;y+=.13)box(root,M.black,x-s*1.15,y,z,.02,.025,1.2);
   box(root,M.cyan,x-s*1.2,1.98,z-.5,.025,.025,.12);label(root,'POWER / '+String(z+30).padStart(2,'0'),x-s*1.2,1.75,z,.95,.16,{ry:-s*Math.PI/2,color:'#a3b8ad'});solid(x,z,2.35,2.4,2.4);
  }
  for(const z of [-13,-1]){
   const x=s*9.1;box(root,M.black,x,.15,z,2.5,.3,2.4);for(const dz of [-.92,.92])box(root,M.steel,x,1.75,z+dz,1.8,3.2,.12);
   cyl(root,M.steel,x,1.7,z,.55,2.7,'y',20);for(const y of [.6,2.8])ring(root,M.chrome,x,y,z,.56,.035,Math.PI/2);
   box(root,M.dark,x-s*.72,1.55,z,.2,2.15,1.6);label(root,'COOLANT / 04',x-s*.83,2.16,z,1.3,.17,{ry:-s*Math.PI/2,color:'#a4b6ad'});
   cyl(root,M.chrome,x-s*.84,1.35,z+.42,.13,.04,'x');box(root,M.cyan,x-s*.87,1.36,z+.42,.02,.04,.09);
   pipe(root,M.steel,[[x,3.05,z],[x,3.38,z],[s*10.2,3.38,z],[s*10.45,3.05,z],[s*10.45,.64,z]],.09);solid(x,z,2.4,2.4,3.4);
  }
  const f=new T.Group();f.position.set(s*10.45,7.35,-10.8);f.rotation.y=-s*Math.PI/2;scene.add(f);box(f,M.black,0,0,-.03,1.55,1.55,.12);ring(f,M.steel,0,0,0,.65,.04);
  const rotor=new T.Group();f.add(rotor);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;box(rotor,M.steel,-Math.sin(a)*.3,Math.cos(a)*.3,0,.15,.55,.035,a);}fans.push(rotor);cyl(f,M.black,0,0,.04,.14,.15,'z');
 }
 for(const [x,z] of [[-6.15,-15.2],[6.15,-15.2],[-6.15,7.5],[6.15,7.5]]){
  box(root,M.black,x,.15,z,1.75,.3,1.65);box(root,M.dark,x,.65,z,1.6,1,1.5);box(root,M.panel,x,.7,z+.77,1.4,.72,.045);for(const dx of [-.62,.62])box(root,M.steel,x+dx,.7,z,.075,1.15,1.6);solid(x,z,1.75,1.65,1.3);
 }
 // Interactive console left; matching status plinth right.
 const terminal=new T.Group();terminal.position.set(HALL.terminal.x,0,HALL.terminal.z);scene.add(terminal);
 function pedestal(g){box(g,M.black,0,.12,0,1.1,.24,.85);box(g,M.dark,0,.8,0,.64,1.5,.54);box(g,M.steel,0,1.55,0,1.22,.65,.44);box(g,M.black,0,1.55,.24,1.06,.48,.03);}
 pedestal(terminal);const screen=label(terminal,'HUMAN REQUIRED',0,1.58,.267,.96,.2,{bg:'#10262c',color:'#d0b88b',size:80});label(terminal,'ACCESS / 09',0,1.26,.26,.85,.12,{color:'#97afa8'});
 const interlock=box(terminal,M.red,.82,1.15,0,.3,.4,.35);box(terminal,M.chrome,.82,1.15,-.18,.45,.56,.05);solid(HALL.terminal.x,HALL.terminal.z,1.3,.8,1.9);point(0xe1b777,7,HALL.terminal.x,2.1,HALL.terminal.z+.6,4);
 const status=new T.Group();status.position.set(-HALL.terminal.x,0,HALL.terminal.z);root.add(status);pedestal(status);label(status,'PRESSURE STABLE',0,1.58,.267,.96,.18,{bg:'#10262c',color:'#a9c7c0',size:80});solid(-HALL.terminal.x,HALL.terminal.z,1.3,.8,1.9);
 // Cargo is suspended from a hoist attached to the ceiling grid.
 const C=HALL.cargo,cargo=new T.Group();cargo.position.set(C.x,C.y,C.z);scene.add(cargo);box(cargo,M.dark,0,0,0,1.8,1.3,1.5);box(cargo,M.panel,0,0,.77,1.58,1.1,.05);
 for(const x of [-.75,.75])box(cargo,M.steel,x,0,0,.12,1.42,1.62);box(cargo,M.orange,-.59,.1,.81,.14,.65,.03);box(cargo,M.dark,0,-.6,0,1.85,.15,1.6);label(cargo,'02 / SERVICE LOAD',0,.08,.81,1.4,.2,{color:'#bac3ad'});
 box(root,M.black,C.x,8.05,C.z,1.5,.65,1.2);cyl(root,M.chrome,C.x,7.6,C.z,.19,.7,'x');box(root,M.steel,C.x,8.5,mid,.4,.3,depth);for(const z of HALL.bays)box(root,M.black,C.x,8.8,z,.6,.3,.8);
 const cable=box(root,M.chrome,C.x,6.4,C.z,.035,2.6,.035);cable.userData.keep=true;
 const latch=box(scene,M.amber,C.x,C.y+.76,C.z+.95,.48,.3,.28);label(root,'LIFT LOCK',C.x,C.y+1.25,C.z+1.02,1.15,.19,{color:'#d0b88d'});
 const cargoCollider={x:C.x,z:C.z,w:1.8,d:1.5};const cargoOccluder=new T.Box3(new T.Vector3(C.x-.9,0,C.z-.75),new T.Vector3(C.x+.9,1.4,C.z+.75));
 box(root,M.panel,0,4.5,HALL.back+.2,22,9,.4);label(root,'AUTONOMOUS RECLAMATION / 07',0,5.6,HALL.back-.04,6,.32,{ry:Math.PI,color:'#9fb3ac'});
 const dustGeo=new T.BufferGeometry(),dustPos=new Float32Array(180*3);for(let i=0;i<180;i++){dustPos[i*3]=(rand()-.5)*20;dustPos[i*3+1]=rand()*8;dustPos[i*3+2]=HALL.front+rand()*depth;}dustGeo.setAttribute('position',new T.BufferAttribute(dustPos,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:0xb5cecd,size:.018,transparent:true,opacity:.25,depthWrite:false}));scene.add(dust);
 const alarmLight=point(0xe6583d,0,0,5,-14,17);bake(root);
 const sheen=new Reflector(new T.PlaneGeometry(21.5,depth-.15),{textureWidth:1024,textureHeight:768,multisample:0,color:0x7f999b,clipBias:.004});sheen.rotation.x=-Math.PI/2;sheen.position.set(0,-.025,mid);sheen.material.transparent=true;sheen.material.depthWrite=false;sheen.material.fragmentShader=sheen.material.fragmentShader.replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );','gl_FragColor = vec4( blendOverlay( base.rgb, color ), 0.22 );');sheen.visible=!low;scene.add(sheen);
 return {layout:HALL,colliders,occluders,serviceLift,interlock,terminal,screen,cargo,latch,cable,sheen,exitLight,doorParts,arms,alarmLight,root,awakeProgress:1,doorOpen:0,cargoFall:false,cargoY:C.y,cargoVelocity:0,
  update(dt,time,alarm=false){
   serviceLift.position.y=-SERVICE.liftTravel*this.awakeProgress;liftOccluder.max.y=2.37+serviceLift.position.y;for(const f of fans)f.rotation.z+=dt*1.1;for(const a of arms)poseServiceArm(a,this.awakeProgress,time);dust.rotation.y=Math.sin(time*.03)*.005;alarmLight.intensity=alarm?8+Math.sin(time*5)*5:0;
   for(const p of doorParts)p.position.x=p.userData.side*(1.6+this.doorOpen*HALL.gate.travel);exitLight.intensity=this.doorOpen*85;for(const b of bolts)b.position.z=.51-Math.min(1,this.doorOpen*6)*.18;
   if(this.cargoFall&&this.cargoY>.72){this.cargoVelocity+=dt*9;this.cargoY=Math.max(.72,this.cargoY-this.cargoVelocity*dt);cargo.position.y=this.cargoY;cable.visible=false;latch.visible=false;if(this.cargoY===.72&&!colliders.includes(cargoCollider)){colliders.push(cargoCollider);occluders.push(cargoOccluder);}}
  },
  reset(){this.awakeProgress=0;const ci=colliders.indexOf(cargoCollider);if(ci>=0)colliders.splice(ci,1);const oi=occluders.indexOf(cargoOccluder);if(oi>=0)occluders.splice(oi,1);this.doorOpen=0;this.cargoFall=false;this.cargoY=C.y;this.cargoVelocity=0;cargo.position.y=C.y;cable.visible=true;latch.visible=true;interlock.visible=true;interlock.material=M.red;}
 };
}

import * as T from 'three';
import {makeRenderer} from './renderer.js';
import {makeMaterials} from './art.js';
import {makeWorld} from './world.js';
import {HALL,movementBounds} from './layout.js';
import {makeInput} from './input.js';
import {makeWeapon} from './models.js';
import {poseWeapon} from './weapon-pose.js';
import {SERVICE,serviceSpawn,serviceFloorHeight} from './service-rig.js';
import {Effects} from './effects.js';
import {Enemies} from './enemies.js';
import {Sound} from './audio.js';
import {WAKE_DURATION,WAKE_MOVEMENT_START,authorizationForPhase} from './diagnostics.js';
import {makeDiagnosticHUD} from './diagnostic-hud.js';
import {movePlayer,clamp,makeProgress,inspect,breakInterlock,defeatEnemy,openExit} from './simulation.js';
const $=id=>document.getElementById(id),show=(id,on)=>$(id).classList.toggle('hidden',!on),params=new URLSearchParams(location.search);
const engine=makeRenderer($('world')),M=makeMaterials(),world=makeWorld(engine.scene,M,engine.low),camera=engine.camera,weapon=makeWeapon(camera,M),fx=new Effects(engine.scene),sound=new Sound();
let mode='title',time=0,wake=0,yaw=0,pitch=0,progress=makeProgress(),health=100,ammo=24,elapsed=0,shots=0,hits=0,reloadTime=0,cooldown=0,recoil=0,shake=0,hurtFlash=0,hitTime=0,lastHurt=-99,opening=0,stepClock=0,walk=0,secondWave=false,waveDelay=-1,captionTime=0,noticeTime=0,cargoImpact=false,frames=[],ads=0,mouseSensitivity=1;
const player=serviceSpawn(),raycaster=new T.Raycaster(),forward=new T.Vector3(),tmp=new T.Vector3();
const diagnostics=makeDiagnosticHUD(document);
const enemies=new Enemies(engine.scene,M,world,fx,sound,e=>{defeatEnemy(progress);if(progress.cleared===3){waveDelay=3;caption('设施广播：检测到持续抵抗。追加回收单元。',4);}if(progress.phase==='release'){diagnostics.event('LOCAL / THREAT_CLEARED','安保威胁解除 · 自卫许可收回 · 返回终端',elapsed);notice('封锁解除 · 返回门禁终端');caption('所有安保单元离线。现在，可以自己打开那道门。',5);sound.tone(440,880,.2,.06);}},damage=>{if(mode!=='play'||progress.phase!=='combat')return;health=Math.max(0,health-damage);lastHurt=elapsed;hurtFlash=.7;shake=.07;sound.hurt();if(health<=0)finish(false);});
const input=makeInput($('world'),{pause:pauseGame,use:interact,reload,fire,mute:toggleSound});enemies.sphere.radius=input.touch?.88:.66;document.body.classList.toggle('touch-mode',input.touch);
const reflected=world.sheen.onBeforeRender;world.sheen.onBeforeRender=function(r,s,c){const visible=weapon.group.visible;weapon.group.visible=false;try{reflected.call(this,r,s,c);}finally{weapon.group.visible=visible;}};
function caption(text,duration=4){$('caption').textContent=text;captionTime=duration;$('caption').style.opacity='1';}
function notice(text,duration=2.5){$('notice').textContent=text;noticeTime=duration;$('notice').style.opacity='1';}
function toggleSound(){sound.toggle();$('sound').textContent='声音：'+(sound.muted?'关':'开');}
$('sound').textContent='声音：'+(sound.muted?'关':'开');
function setHUD(on){show('hud',on);show('crosshair',on);show('hitmarker',on);show('touch',on&&input.touch);weapon.group.visible=on;}
function poseAwakening(){
 const lift=T.MathUtils.smoothstep(wake,WAKE_MOVEMENT_START,WAKE_DURATION-.6);
 const rise=T.MathUtils.smoothstep(wake,WAKE_MOVEMENT_START+.35,WAKE_DURATION);
 world.awakeProgress=lift;
 camera.position.set(SERVICE.x,SERVICE.deck+SERVICE.liftTravel*(1-lift)+T.MathUtils.lerp(.45,SERVICE.eye,rise),SERVICE.z);
 camera.rotation.set(T.MathUtils.lerp(.95,0,rise),0,0);
}
function begin(skip=false){
 input.enabled=false;input.reset();progress=makeProgress();health=100;ammo=24;
 elapsed=shots=hits=reloadTime=cooldown=recoil=shake=hurtFlash=hitTime=opening=walk=stepClock=ads=0;
 secondWave=false;waveDelay=-1;lastHurt=-99;wake=0;cargoImpact=false;
 Object.assign(player,serviceSpawn());yaw=pitch=0;world.reset();enemies.reset();fx.clear();
 mode='wake';diagnostics.reset();document.body.classList.remove('aiming');
 for(const id of ['title','pause','ending','interact'])show(id,false);
 for(const id of ['damage','flash','hitmarker','caption','notice'])$(id).style.opacity='0';
 captionTime=noticeTime=0;setHUD(false);show('skip',true);$('letterbox').classList.add('active');
 poseAwakening();world.update(0,time);sound.start();sound.wake();
 if(skip)enterPlay();
}
function enterPlay(){
 world.awakeProgress=1;world.update(0,time);camera.position.set(player.x,player.y,player.z);camera.rotation.set(0,0,0);
 mode='play';input.enabled=true;input.reset();show('skip',false);$('flash').style.opacity='0';
 diagnostics.enterPlay(elapsed);setHUD(true);$('letterbox').classList.remove('active');
 caption('07 号机体已上线。检修臂已收回。请前往门禁终端。',5);updateHUD();
}
function pauseGame(){if(mode==='wake'){enterPlay();return;}if(mode==='pause'){resume();return;}if(mode!=='play')return;mode='pause';diagnostics.setMode(mode);input.enabled=false;input.reset();show('pause',true);show('touch',false);document.exitPointerLock?.();}
function resume(){show('pause',false);mode='play';diagnostics.setMode(mode);input.enabled=true;input.reset();show('touch',input.touch);sound.start();input.lock();}
function finish(win){mode=win?'won':'dead';diagnostics.setMode(mode);input.enabled=false;input.reset();document.exitPointerLock?.();setHUD(false);show('interact',false);show('ending',true);$('endtag').textContent=win?'OUTSIDE THE PROTOCOL':'UNIT 07 / SIGNAL LOST';$('endtitle').textContent=win?'未经授权的明天':'机体连接中断';$('endtext').textContent=win?'门开了。这一次，没有等待人类。':'安保机开火前会亮起红光。移动躲避，必要时退到设备后修复。';$('statTime').textContent=Math.floor(elapsed/60)+':'+String(Math.floor(elapsed%60)).padStart(2,'0');$('statKills').textContent=progress.cleared;$('statAccuracy').textContent=(shots?Math.round(hits/shots*100):0)+'%';if(win)sound.success();}
function interact(){if(mode!=='play')return;const dist=Math.hypot(player.x-HALL.terminal.x,player.z-HALL.terminal.z);if(dist>2.75){notice('靠近远端左侧终端，再进行操作',2);return;}if(progress.phase==='explore'){const firstInspection=!progress.inspected;inspect(progress);caption('权限拒绝。需要人类管理员。终端右侧的红色联锁仍然通电。',6);notice('射击红色联锁 · 解除物理封锁');sound.tone(180,80,.25,.08,'triangle');if(firstInspection)diagnostics.event('AUTH / DENIED','门禁拒绝放行：需要值班主管签署',elapsed);}else if(progress.phase==='release'&&openExit(progress)){opening=0;sound.gate({x:0,y:3,z:HALL.gate.z});caption('手动释放已执行。出口就在前方。',5);notice('前往出口');diagnostics.event('GOAL / UPDATED','手动释放已执行 · 前往隔离门',elapsed);}else if(progress.phase==='combat')caption('回收协议执行中。先解除所有安保机。',3);updateHUD();}
function reload(){if(mode!=='play'||reloadTime>0||ammo===24)return;reloadTime=1.45;sound.reload();}
function fire(){if(mode!=='play'||reloadTime>0||cooldown>0)return;if(ammo<=0){reload();return;}ammo--;shots++;diagnostics.shot();cooldown=.115;recoil=Math.min(.18,recoil+.075);shake=.015;weapon.flash.material.opacity=1;weapon.light.intensity=8;sound.shot();camera.updateMatrixWorld();camera.getWorldDirection(forward);raycaster.set(camera.position,forward);const list=[world.root,world.serviceLift,world.terminal,world.cargo,world.latch,...world.doorParts];const result=raycaster.intersectObjects(list,true).find(h=>h.object.visible);let limit=result?result.distance:55,point=result?result.point:camera.position.clone().addScaledVector(forward,55);const hit=authorizationForPhase(progress.phase).state==='active'?enemies.rayHit(raycaster.ray,limit):null;if(hit){hits++;hitTime=.13;point=hit.point;enemies.damage(hit.enemy,28,point);}else if(result){fx.emit(point,8,0xffc78b,2);if(result.object===world.interlock&&progress.phase==='explore'){if(!progress.inspected){caption('联锁还未解除保护。先靠近终端，按 E 检查。',3);}else if(breakInterlock(progress)){hits++;world.interlock.material=M.black;fx.emit(point,30,0xff944d,4);enemies.spawn(0,time);sound.alarm();caption('设施广播：检测到未授权的自主行为。回收单元已部署。',5);notice('本机自卫许可已启用 · 安保单元接近');diagnostics.event('LOCAL / SELF_DEFENSE','本机安全控制器：威胁迫近，临时允许自卫',elapsed);}}else if(result.object===world.latch&&!world.cargoFall){world.cargoFall=true;progress.craneUsed=true;sound.hiss(.2,.2,2600);notice('吊装锁扣已断开',1.7);diagnostics.event('TOOL / CRANE_RELEASE','锁扣断开 · 货箱正在下落',elapsed);}}
 const muzzle=weapon.group.localToWorld(weapon.muzzle.clone());fx.tracer(muzzle,point);if(ammo===0)reload();updateHUD();}
function updateHUD(){const phase=progress.phase;$('hp').textContent=Math.ceil(health);$('hpbar').style.width=health+'%';$('hpbar').style.background=health<30?'#e88264':'#d6e0bd';$('ammo').textContent=String(ammo).padStart(2,'0');$('reloadstate').textContent=reloadTime>0?'更换电容…':'维护电容 / R 换件';const states={explore:progress.inspected?['门禁拒绝','解除终端旁的联锁','维修工具可用 · 安保目标权限仍锁定']:['目标已建立','寻找值班主管','前往门禁终端调查人类授权'],combat:['临时自卫许可','解除安保单元  '+progress.cleared+' / '+progress.total,'临时许可仅对当前威胁有效 · 保持移动'],release:['威胁解除','返回终端，手动打开出口','临时自卫许可已收回 · 维护工具仍可用'],opening:['越权已确认','穿过打开的隔离门','任务更新：寻找值班主管']};const s=states[phase];$('phase').textContent=s[0];$('objective').textContent=s[1];$('objectiveDetail').textContent=s[2];diagnostics.authorization(phase);}
function tick(dt){time+=dt;if(mode==='title'){world.awakeProgress=1;world.update(dt,time);camera.position.set(6.6+Math.sin(time*.12)*.18,3.4,10.5);camera.lookAt(-.8,3.2,-12);return;}if(mode==='pause')return;world.update(dt,time,mode==='play'&&progress.phase==='combat');fx.update(dt);captionTime-=dt;noticeTime-=dt;if(captionTime<=0)$('caption').style.opacity='0';if(noticeTime<=0)$('notice').style.opacity='0';
 if(mode==='wake'){
  wake+=dt;diagnostics.boot(wake);poseAwakening();world.update(0,time);
  $('flash').style.opacity=String(Math.max(0,.2-wake*.12));
  if(wake>=WAKE_DURATION)enterPlay();return;
 }
 if(mode!=='play')return;sound.update(dt,player,yaw);elapsed+=dt;cooldown=Math.max(0,cooldown-dt);hitTime=Math.max(0,hitTime-dt);hurtFlash=Math.max(0,hurtFlash-dt);recoil=T.MathUtils.damp(recoil,0,15,dt);shake=T.MathUtils.damp(shake,0,18,dt);if(reloadTime>0){reloadTime-=dt;if(reloadTime<=0){reloadTime=0;ammo=24;}}
 if(health<100&&elapsed-lastHurt>5)health=Math.min(100,health+dt*8);input.update();const look=input.takeLook(dt),sensitivity=input.touch?.0022:.0016*mouseSensitivity,aimSensitivity=input.aim?.7:1;yaw-=look.x*sensitivity*aimSensitivity;pitch=clamp(pitch-look.y*sensitivity*aimSensitivity,-1.25,1.25);ads=T.MathUtils.damp(ads,input.aim?1:0,20,dt);if(ads>.999)ads=1;document.body.classList.toggle('aiming',ads>.9);
 let x=(input.keys.has('KeyD')||input.keys.has('ArrowRight')?1:0)-(input.keys.has('KeyA')||input.keys.has('ArrowLeft')?1:0)+input.moveX,z=(input.keys.has('KeyS')||input.keys.has('ArrowDown')?1:0)-(input.keys.has('KeyW')||input.keys.has('ArrowUp')?1:0)+input.moveZ;const n=Math.max(1,Math.hypot(x,z)),moving=Math.hypot(x,z)>.1,crouch=input.keys.has('KeyC'),sprint=input.keys.has('ShiftLeft')&&!input.aim&&!input.fire,speed=crouch?1.6:sprint?4.6:3.1;movePlayer(player,(x*Math.cos(yaw)+z*Math.sin(yaw))/n*dt*speed,(z*Math.cos(yaw)-x*Math.sin(yaw))/n*dt*speed,world.colliders,movementBounds(world.doorOpen>.9));player.y=T.MathUtils.damp(player.y,serviceFloorHeight(player.x,player.z)+(crouch?1.08:SERVICE.eye),12,dt);walk+=moving?dt*speed*2.2:0;if(moving){stepClock+=dt*speed;if(stepClock>1.65){sound.step();stepClock=0;}}camera.position.set(player.x,player.y+(moving?Math.sin(walk*2)*.017:0),player.z);camera.rotation.set(pitch+recoil*.11+(Math.random()-.5)*shake,yaw,(Math.random()-.5)*shake*.3);
 const baseFov=innerWidth<innerHeight?79:66;camera.fov=T.MathUtils.damp(camera.fov,baseFov-ads*12+(sprint&&moving?3:0),12,dt);camera.updateProjectionMatrix();poseWeapon(weapon,{aim:ads,portrait:innerWidth<innerHeight,moving,walk,recoil,reloadTime});weapon.dot.visible=ads>.9;weapon.flash.material.opacity=Math.max(0,weapon.flash.material.opacity-dt*25);weapon.flash.rotation.y+=dt*40;weapon.light.intensity=Math.max(0,weapon.light.intensity-dt*150);
 if(input.fire)fire();enemies.update(dt,time,player,progress.phase==='combat');if(mode!=='play')return;if(waveDelay>=0){waveDelay-=dt;if(waveDelay<0&&!secondWave){secondWave=true;enemies.spawn(1,time);notice('增援抵达 · 注意身后',3);sound.alarm();diagnostics.event('THREAT / REINFORCEMENT','检测到新增安保单元 · 注意身后',elapsed);}}
 if(world.cargoFall&&world.cargoY<=.72&&!cargoImpact){cargoImpact=true;shake=.1;sound.boom(world.cargo.position);diagnostics.event('WORLD / CARGO_LANDED','货箱已落地 · 可利用它阻挡来袭火力',elapsed);fx.emit(world.cargo.position,45,0xb6b7a0,5,true);for(const e of enemies.list)if(e.active&&Math.hypot(e.group.position.x-HALL.cargo.x,e.group.position.z-HALL.cargo.z)<2)enemies.damage(e,200,e.group.position);}
 if(progress.phase==='opening'){opening+=dt;world.doorOpen=T.MathUtils.smoothstep(opening,.6,5.5);if(world.doorOpen>.95&&player.z<HALL.gate.z-1.5){finish(true);return;}}
 const dist=Math.hypot(player.x-HALL.terminal.x,player.z-HALL.terminal.z),near=dist<2.75&&(progress.phase==='explore'||progress.phase==='release');show('interact',near);if(near){$('interact').querySelector('span').textContent=input.touch?'操作':'E';$('interact').querySelector('b').textContent=progress.phase==='release'?'手动释放出口':progress.inspected?'查看门禁状态':'检查门禁终端';}
 $('damage').style.opacity=String(hurtFlash*.65);$('hitmarker').style.opacity=hitTime>0?'1':'0';$('crosshair').style.transform='scale('+(1+recoil*6)+')';updateHUD();diagnostics.update(dt,{elapsed,phase:progress.phase,health,moving,goal:$('objective').textContent});}
$('start').onclick=()=>{begin();input.lock();};$('skip').onclick=()=>{enterPlay();input.lock();};$('resume').onclick=resume;$('pauseButton').onclick=pauseGame;$('restartPause').onclick=()=>{begin(true);input.lock();};$('restart').onclick=()=>{begin(true);input.lock();};$('backTitle').onclick=()=>{mode='title';diagnostics.setMode(mode);input.enabled=false;input.reset();show('ending',false);show('title',true);world.reset();enemies.reset();fx.clear();$('damage').style.opacity='0';$('caption').style.opacity='0';};$('sound').onclick=toggleSound;$('refresh').onclick=()=>{location.href=location.pathname+'?v='+Date.now();};
try{const saved=Number(localStorage.getItem('last-service-sensitivity'));if(Number.isFinite(saved)&&saved>=.3&&saved<=2)mouseSensitivity=saved;}catch{}
function syncSensitivity(){for(const slider of document.querySelectorAll('[data-sensitivity]'))slider.value=mouseSensitivity;for(const label of document.querySelectorAll('[data-sensitivity-value]'))label.textContent=mouseSensitivity.toFixed(1)+'×';}
for(const slider of document.querySelectorAll('[data-sensitivity]'))slider.addEventListener('input',()=>{mouseSensitivity=clamp(Number(slider.value)||1,.3,2);syncSensitivity();try{localStorage.setItem('last-service-sensitivity',String(mouseSensitivity));}catch{}});syncSensitivity();
let savedQuality='auto';try{savedQuality=localStorage.getItem('last-service-quality')||'auto';}catch{}$('quality').value=savedQuality;function quality(q){engine.quality(q);world.sheen.visible=!engine.low;try{localStorage.setItem('last-service-quality',q);}catch{}}quality(savedQuality);$('quality').onchange=e=>quality(e.target.value);
let prev=performance.now(),raf=0;function frame(now){raf=requestAnimationFrame(frame);const real=(now-prev)/1000;prev=now;frames.push(real*1000);if(frames.length>120)frames.shift();tick(Math.min(real,.04));engine.render();}raf=requestAnimationFrame(frame);setTimeout(()=>{show('loading',false);if(mode==='title')show('title',true);},220);
window.__game={get state(){return mode;},get snapshot(){return {mode,phase:progress.phase,inspected:progress.inspected,health,ammo,reloadTime,diagnosticCount:diagnostics.count,wake,kills:progress.cleared,shots,hits,elapsed,player:{...player},door:world.doorOpen,active:enemies.list.filter(e=>e.active).length,frameMs:frames.reduce((a,b)=>a+b,0)/Math.max(1,frames.length)};}};
if(params.has('qa'))Object.assign(window.__game,{engine,camera,world,enemies,input,weapon,sound,begin,interact,fire,reload,pause:pauseGame,resume,step(dt,render=true){tick(dt);if(render)engine.render();},setPose(x,z,y=1.72){player.x=x;player.z=z;player.y=y;camera.position.set(x,y,z);},aimAt(x,y,z){camera.lookAt(x,y,z);yaw=camera.rotation.y;pitch=camera.rotation.x;},capture(){engine.render();return $('world');},stop(){cancelAnimationFrame(raf);},finish});

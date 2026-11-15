import * as T from 'three';
import {makeRenderer} from './renderer.js';
import {makeMaterials} from './art.js';
import {makeWorld} from './world.js';
import {makeInput} from './input.js';
import {movePlayer,clamp} from './simulation.js';
const $=id=>document.getElementById(id),show=(id,on)=>$(id).classList.toggle('hidden',!on);const engine=makeRenderer($('world')),M=makeMaterials(),world=makeWorld(engine.scene,M,engine.low),camera=engine.camera;
let mode='title',t=0,wake=0,yaw=0,pitch=0;const player={x:0,z:10.2};
const input=makeInput($('world'),{pause(){if(mode==='play'){mode='pause';input.enabled=false;show('pause',true);document.exitPointerLock?.();}},use(){},reload(){},mute(){}});
function begin(){player.x=0;player.z=10.2;yaw=pitch=0;wake=0;mode='wake';show('title',false);show('pause',false);show('skip',true);$('letterbox').classList.add('active');world.reset();}
function play(){mode='play';input.enabled=true;show('skip',false);show('hud',true);show('crosshair',true);show('touch',input.touch);$('letterbox').classList.remove('active');}
$('start').onclick=()=>{begin();input.lock();};$('skip').onclick=()=>{play();input.lock();};$('resume').onclick=()=>{show('pause',false);play();input.lock();};$('restartPause').onclick=begin;$('quality').onchange=e=>{engine.quality(e.target.value);world.sheen.visible=!engine.low;};
let prev=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-prev)/1000,.04);prev=now;t+=dt;world.update(dt,t);if(mode==='title'){camera.position.set(6.8+Math.sin(t*.12)*.18,3.3,10.5);camera.lookAt(-.3,2.8,-4);}if(mode==='wake'){wake+=dt;const u=T.MathUtils.smoothstep(wake,1.2,6);camera.position.set(0,T.MathUtils.lerp(.7,1.72,u),10.2);camera.rotation.set(T.MathUtils.lerp(.8,0,u),0,0);if(wake>6.2)play();}if(mode==='play'){yaw-=input.lookX*.0022;pitch=clamp(pitch-input.lookY*.0022,-1.3,1.25);input.lookX=input.lookY=0;let x=(input.keys.has('KeyD')?1:0)-(input.keys.has('KeyA')?1:0)+input.moveX,z=(input.keys.has('KeyS')?1:0)-(input.keys.has('KeyW')?1:0)+input.moveZ;const n=Math.max(1,Math.hypot(x,z)),speed=input.keys.has('ShiftLeft')?5:3.1;movePlayer(player,(x*Math.cos(yaw)+z*Math.sin(yaw))/n*dt*speed,(z*Math.cos(yaw)-x*Math.sin(yaw))/n*dt*speed,world.colliders);camera.position.set(player.x,1.72,player.z);camera.rotation.set(pitch,yaw,0);}engine.render();}requestAnimationFrame(frame);setTimeout(()=>{show('loading',false);show('title',true);},200);window.__game={get state(){return mode;},get camera(){return camera;},world,engine,begin,play};

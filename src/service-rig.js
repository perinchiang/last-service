import * as T from 'three';
import {box,cyl} from './art.js';
export const SERVICE={x:0,z:4.2,deck:.61,radius:2.1,outerRadius:2.4,eye:1.72,liftTravel:1.78};
export function serviceFloorHeight(x,z){const r=Math.hypot(x-SERVICE.x,z-SERVICE.z);return SERVICE.deck*T.MathUtils.clamp((SERVICE.outerRadius-r)/(SERVICE.outerRadius-SERVICE.radius),0,1);}
export function serviceSpawn(){return {x:SERVICE.x,y:SERVICE.deck+SERVICE.eye,z:SERVICE.z};}
export function makeServiceArm(parent,M,x,z,side){
 const root=new T.Group();root.position.set(x,.65,z);parent.add(root);
 cyl(root,M.black,0,.12,0,.38,.3);cyl(root,M.chrome,0,.55,0,.2,.6);
 const shoulder=new T.Group();shoulder.position.y=.8;root.add(shoulder);
 cyl(shoulder,M.dark,0,0,0,.33,.45,'z');cyl(shoulder,M.chrome,0,0,.24,.17,.04,'z');box(shoulder,M.white,side*.58,.7,0,.35,1.8,.4,-side*.65);
 const fore=new T.Group();fore.position.set(side*1.12,1.4,0);shoulder.add(fore);
 cyl(fore,M.dark,0,0,0,.24,.5,'z');
 box(fore,M.white,side*.5,.1,0,1.2,.25,.32,side*.18);
 const tip=new T.Group();tip.position.set(side*1.05,.04,0);fore.add(tip);
 box(tip,M.dark,0,0,0,.22,.4,.38);
 for(const dz of [-.25,.25])box(tip,M.chrome,side*.07,-.2,dz,.07,.45,.07,side*.2);
 const arm={root,shoulder,fore,tip,side};poseServiceArm(arm,0,0);return arm;
}
export function poseServiceArm(arm,progress,time){
 const p=T.MathUtils.clamp(progress,0,1);
 arm.shoulder.rotation.z=arm.side*(p*.65+Math.sin(time*.65)*.025*p);
 arm.fore.rotation.z=arm.side*(p*.45+Math.sin(time*.8)*.025*p);
}

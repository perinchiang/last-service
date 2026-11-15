import * as T from 'three';
const offset=new T.Vector3();
export function poseWeapon(weapon,{aim=0,portrait=false,moving=false,walk=0,recoil=0,reloadTime=0}){
 const g=weapon.group,scale=portrait?.74:.82,reload=Math.sin(reloadTime/1.45*Math.PI);
 g.scale.setScalar(scale);
 const p=reloadTime>0?1-reloadTime/1.45:0;
 const out=T.MathUtils.smoothstep(p,.08,.24)*(1-T.MathUtils.smoothstep(p,.56,.8));
 if(weapon.magazine){weapon.magazine.position.set(-out*.11,-.12-out*.21,-.1-out*.08);weapon.magazine.rotation.z=-out*.18;}
 if(weapon.bolt)weapon.bolt.position.z=.04+recoil*.28+Math.sin(T.MathUtils.smoothstep(p,.82,.95)*Math.PI)*.09;
 if(weapon.support){weapon.support.position.set(-.02-out*.11,-.13-out*.21,-.38+out*.2);weapon.support.rotation.z=-out*.18;}
 g.rotation.set(recoil+.06*reload,-.08*reload,-.34*reload);
 offset.copy(weapon.sight).multiplyScalar(scale).applyEuler(g.rotation);
 const hipX=(portrait?.16:.265)+(moving?Math.sin(walk)*.002:0);
 const hipY=-.255+(moving?Math.abs(Math.sin(walk))*.008:0)+reload*.18;
 // Place the sight's optical centre on the camera ray, including recoil and scale.
 g.position.set(T.MathUtils.lerp(hipX,-offset.x,aim),T.MathUtils.lerp(hipY,-offset.y,aim),-.6+recoil*.45);
}

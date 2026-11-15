import * as T from 'three';
const offset=new T.Vector3();
export function poseWeapon(weapon,{aim=0,portrait=false,moving=false,walk=0,recoil=0,reloadTime=0}){
 const g=weapon.group,scale=portrait?.8:1,reload=Math.sin(reloadTime/1.45*Math.PI);
 g.scale.setScalar(scale);
 g.rotation.set(recoil+.04*reload,0,-.38*reload);
 offset.copy(weapon.sight).multiplyScalar(scale).applyEuler(g.rotation);
 const hipX=(portrait?.17:.31)+(moving?Math.sin(walk)*.002:0);
 const hipY=-.31+(moving?Math.abs(Math.sin(walk))*.008:0)-reload*.19;
 // Place the sight's optical centre on the camera ray, including recoil and scale.
 g.position.set(T.MathUtils.lerp(hipX,-offset.x,aim),T.MathUtils.lerp(hipY,-offset.y,aim),-.6+recoil*.45);
}

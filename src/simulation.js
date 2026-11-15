export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function blocked(x,z,boxes,r=.32){return boxes.some(b=>x>b.x-b.w/2-r&&x<b.x+b.w/2+r&&z>b.z-b.d/2-r&&z<b.z+b.d/2+r);}
export function movePlayer(pos,dx,dz,boxes,bounds={x:8.45,zMin:-11.9,zMax:12.4}){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));
 for(let i=0;i<steps;i++){const x=clamp(pos.x+dx/steps,-bounds.x,bounds.x);if(!blocked(x,pos.z,boxes))pos.x=x;const z=clamp(pos.z+dz/steps,bounds.zMin,bounds.zMax);if(!blocked(pos.x,z,boxes))pos.z=z;}
 return pos;
}
export function makeProgress(){return {phase:'explore',inspected:false,cleared:0,total:6,craneUsed:false};}
export function inspect(p){if(p.phase==='explore')p.inspected=true;}
export function breakInterlock(p){if(!p.inspected||p.phase!=='explore')return false;p.phase='combat';return true;}
export function defeatEnemy(p){if(p.phase!=='combat')return false;p.cleared=Math.min(p.total,p.cleared+1);if(p.cleared===p.total)p.phase='release';return true;}
export function openExit(p){if(p.phase!=='release')return false;p.phase='opening';return true;}

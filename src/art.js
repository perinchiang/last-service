import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export function rng(seed=73){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const rand=rng();
export function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function surface(base,type){return canvasTexture(512,512,(c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);for(let i=0;i<14000;i++){const light=rand()>.5;c.fillStyle=light?'rgba(240,245,225,.035)':'rgba(5,18,20,.05)';const x=rand()*w,y=rand()*h;c.fillRect(x,y,type==='steel'?rand()*35+2:rand()*2+1,1);}c.strokeStyle='rgba(8,18,20,.4)';c.lineWidth=3;c.strokeRect(1,1,510,510);c.strokeStyle='rgba(230,239,218,.18)';c.lineWidth=1;c.strokeRect(5,5,502,502);if(type==='panel'){for(const x of [18,494])for(const y of [18,494]){c.fillStyle='#203235';c.beginPath();c.arc(x,y,3,0,7);c.fill();}for(let i=0;i<25;i++){const x=rand()*512;c.fillStyle='rgba(7,25,24,.07)';c.fillRect(x,0,rand()*5+1,rand()*170);}}if(type==='floor'){c.fillStyle='#18292a';for(let y=32;y<512;y+=32)for(let x=25;x<512;x+=32)c.fillRect(x+(y%64?10:0),y,9,2);}});}
export function makeMaterials(){
 const standard=(color,rough=.65,metal=.2)=>new T.MeshStandardMaterial({color,roughness:rough,metalness:metal});
 const tex=(color,type,rough=.7,metal=.2)=>{const m=standard(0xffffff,rough,metal);m.map=surface(color,type);m.bumpMap=m.map;m.bumpScale=type==='steel'?.012:.025;return m;};
 const M={
  panel:tex('#707d79','panel',.78,.16),dark:tex('#28383b','panel',.66,.42),
  steel:tex('#4e5e5e','steel',.4,.72),floor:tex('#384c50','steel',.3,.58),
  black:standard(0x101b20,.64,.36),white:tex('#9fa8a0','panel',.58,.3),
  orange:tex('#976840','steel',.65,.24),yellow:standard(0xb09c69,.55,.3),
  rubber:standard(0x131b20,.96,0),chrome:standard(0x899994,.27,.8),
  gun:tex('#34464b','steel',.34,.72),gunlight:tex('#657774','steel',.4,.62),
  amber:new T.MeshStandardMaterial({color:0xcfb68b,emissive:0xe5ae60,emissiveIntensity:1.8,roughness:.4}),
  cyan:new T.MeshStandardMaterial({color:0xaac9c8,emissive:0x7fc1ca,emissiveIntensity:2.1,roughness:.4}),
  red:new T.MeshStandardMaterial({color:0xb74432,emissive:0xef351b,emissiveIntensity:1.8}),
  light:new T.MeshStandardMaterial({color:0xcfdad1,emissive:0xd5e2d4,emissiveIntensity:2.2}),
  glass:new T.MeshStandardMaterial({color:0x203d44,transparent:true,opacity:.48,metalness:.7,roughness:.16,side:T.DoubleSide,depthWrite:false})
 };
 M.floor.map.wrapS=M.floor.map.wrapT=T.RepeatWrapping;M.floor.map.repeat.set(7,13);
 return M;
}
const unit=new T.BoxGeometry(1,1,1);export function box(parent,mat,x,y,z,w,h,d,rot=0){const m=new T.Mesh(unit,mat);m.position.set(x,y,z);m.scale.set(w,h,d);m.rotation.z=rot;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function cyl(parent,mat,x,y,z,r,h,axis='y',segments=12){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),mat);m.position.set(x,y,z);if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function ring(parent,mat,x,y,z,r,t,rot=0){const m=new T.Mesh(new T.TorusGeometry(r,t,8,48),mat);m.position.set(x,y,z);m.rotation.x=rot;parent.add(m);return m;}
export function pipe(parent,mat,points,r=.06){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(curve,Math.max(10,points.length*5),r,7,false),mat);m.castShadow=true;parent.add(m);return m;}
export function label(parent,text,x,y,z,w,h,opts={}){const map=canvasTexture(1024,256,(c,W,H)=>{if(opts.bg){c.fillStyle=opts.bg;c.fillRect(0,0,W,H);}c.fillStyle=opts.color||'#d9d9ba';c.font='700 '+(opts.size||92)+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(text,W/2,H/2,W-35);});const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:!opts.bg,side:T.DoubleSide,depthWrite:!!opts.bg,toneMapped:false}));m.position.set(x,y,z);if(opts.ry)m.rotation.y=opts.ry;if(opts.rx)m.rotation.x=opts.rx;parent.add(m);return m;}
export function bake(root){root.updateMatrixWorld(true);const sets=new Map(),remove=[];root.traverse(o=>{if(!o.isMesh||o.material.transparent||o.userData.keep)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));let arr=sets.get(o.material);if(!arr){arr=[];sets.set(o.material,arr);}arr.push(g.index?g.toNonIndexed():g);remove.push(o);});for(const o of remove)o.removeFromParent();for(const [mat,geos] of sets){const geo=mergeGeometries(geos,false);const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;root.add(m);for(const g of geos)g.dispose();}return root;}

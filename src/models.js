import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {box,cyl,ring,label} from './art.js';
function bevel(g,m,x,y,z,w,h,d,r=.04){const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,r),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
export function makeWeapon(camera,M){
 const g=new T.Group();camera.add(g);
 // Narrow receiver, separate barrel assembly, rail and serviceable capacitor pack.
 bevel(g,M.gun,0,.015,-.02,.145,.16,.51,.015);
 bevel(g,M.gunlight,0,.106,-.15,.128,.045,.62,.009);
 bevel(g,M.black,0,-.064,.08,.12,.065,.32,.009);
 bevel(g,M.gun,0,.015,-.46,.13,.13,.31,.012);
 for(const x of [-.071,.071])for(let z=-.56;z<-.29;z+=.055){box(g,M.black,x,.018,z,.012,.045,.031);box(g,M.chrome,x,.061,z,.009,.009,.027);}
 for(let z=-.4;z<.21;z+=.042)box(g,M.black,0,.137,z,.14,.017,.018);
 cyl(g,M.chrome,0,.025,-.699,.025,.23,'z',16);
 cyl(g,M.black,0,.025,-.845,.043,.11,'z',12);cyl(g,M.gunlight,0,.025,-.792,.037,.035,'z',12);
 cyl(g,M.rubber,0,.025,-.902,.027,.008,'z',16);
 for(const x of [-.04,.04])box(g,M.black,x,.024,-.852,.009,.026,.07);
 const grip=bevel(g,M.rubber,0,-.174,.13,.09,.23,.13,.015);grip.rotation.x=-.18;
 for(let y=-.24;y<-.1;y+=.04)box(g,M.gun,0,y,.201,.095,.014,.01);
 bevel(g,M.black,0,-.015,.26,.115,.1,.13,.012);bevel(g,M.gun,0,-.04,.32,.12,.09,.14,.014);bevel(g,M.rubber,0,-.075,.39,.125,.16,.035,.01);
 const magazine=new T.Group();magazine.position.set(0,-.12,-.1);g.add(magazine);
 bevel(magazine,M.gunlight,0,-.105,0,.105,.26,.16,.012);box(magazine,M.black,0,-.24,0,.125,.025,.18);
 for(const x of [-.055,.055])for(const z of [-.045,.045])box(magazine,M.dark,x,-.1,z,.008,.19,.018);
 box(magazine,M.black,0,-.07,.083,.07,.08,.004);
 const bolt=new T.Group();bolt.position.set(.08,.035,.04);g.add(bolt);
 box(g,M.black,.076,.035,.012,.01,.06,.22);box(bolt,M.chrome,0,0,0,.012,.037,.13);cyl(bolt,M.gunlight,.025,0,.055,.012,.05,'x',10);
 for(const x of [-.077,.077])for(const z of [-.22,.16]){cyl(g,M.chrome,x,.035,z,.012,.012,'x',10);cyl(g,M.black,x*1.08,.035,z,.005,.014,'x',6);}
 // Open reflex sight: the red dot is the optical centre of the firing ray.
 box(g,M.black,0,.163,-.065,.145,.035,.12);
 for(const x of [-.059,.059])bevel(g,M.gunlight,x,.225,-.065,.014,.115,.052,.004);
 bevel(g,M.gunlight,0,.284,-.065,.132,.016,.054,.004);
 for(const x of [-.08,.08])cyl(g,M.black,x,.19,-.065,.018,.024,'x',12);
 const lensMaterial=M.glass.clone();lensMaterial.opacity=.1;const lens=box(g,lensMaterial,0,.225,-.074,.103,.1,.002);lens.castShadow=false;
 const sight=new T.Vector3(0,.225,-.062);
 const dot=new T.Mesh(new T.SphereGeometry(.0018,8,6),new T.MeshBasicMaterial({color:0xff6952,toneMapped:false}));dot.position.copy(sight);dot.position.z+=.003;dot.visible=false;g.add(dot);
 const readout=label(g,'MK.04 / 07',-.079,.02,.04,.21,.037,{ry:-Math.PI/2,color:'#a6b7b4'});
 box(g,M.cyan,-.079,.062,.165,.003,.01,.02);
 // Rigid grippers with exposed joints, not a bright humanoid arm shell.
 const hand=new T.Group();g.add(hand);bevel(hand,M.dark,.045,-.18,.14,.13,.12,.17,.012);
 for(let i=0;i<3;i++){bevel(hand,M.gunlight,.065,-.2+i*.032,.063,.1,.024,.047,.005);cyl(hand,M.chrome,.114,-.2+i*.032,.08,.009,.022,'z',8);}
 bevel(hand,M.dark,.075,-.245,.34,.125,.12,.29,.016);box(hand,M.chrome,.142,-.245,.34,.008,.05,.21);
 const support=new T.Group();support.position.set(-.02,-.13,-.38);g.add(support);bevel(support,M.dark,0,0,0,.12,.07,.17,.01);
 for(let i=0;i<3;i++)bevel(support,M.gunlight,-.065,.02,-.06+i*.045,.022,.07,.03,.005);
 const flash=new T.Mesh(new T.ConeGeometry(.057,.23,5),new T.MeshBasicMaterial({color:0xffdfaa,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));flash.rotation.x=-Math.PI/2;flash.position.set(0,.025,-1.02);g.add(flash);
 const light=new T.PointLight(0xffc992,0,4,2);light.position.set(0,.1,-1);g.add(light);
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.frustumCulled=false;}});g.visible=false;
 return {group:g,flash,light,readout,sight,dot,magazine,bolt,support,muzzle:new T.Vector3(0,.025,-.91)};
}
export function makeDrone(scene,M,index){const g=new T.Group();scene.add(g);bevel(g,M.white,0,0,0,.68,.3,.62,.08);bevel(g,M.dark,0,-.14,0,.52,.16,.52,.04);box(g,M.steel,0,.16,0,.2,.018,.56);const eye=new T.Mesh(new T.SphereGeometry(.11,14,10),M.red.clone());eye.position.set(0,-.04,.34);g.add(eye);ring(g,M.black,0,-.04,.36,.13,.035);const rotors=[];for(const sx of [-1,1])for(const sz of [-1,1]){box(g,M.chrome,sx*.46,0,sz*.3,.44,.07,.08);cyl(g,M.black,sx*.64,.06,sz*.34,.21,.085);ring(g,M.steel,sx*.64,.1,sz*.34,.23,.025,Math.PI/2);const r=new T.Group();r.position.set(sx*.64,.12,sz*.34);g.add(r);box(r,M.black,0,0,0,.36,.015,.04);box(r,M.black,0,0,0,.04,.015,.36);rotors.push(r);}for(const s of [-1,1]){box(g,M.chrome,s*.24,-.35,0,.035,.3,.04);box(g,M.rubber,s*.24,-.48,0,.06,.045,.4);}cyl(g,M.dark,0,-.25,.28,.055,.3,'z');label(g,'S-'+String(index+1).padStart(2,'0'),0,.02,-.32,.32,.1,{ry:Math.PI,color:'#354d48'});g.visible=false;return {group:g,eye,rotors};}

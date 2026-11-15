import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';

// Static coating variation, grazing-angle reflectance and a roughness-dependent
// blur. A sealed industrial floor, with no time-driven water distortion.
export function makeFloorReflection(width,depth,mid,low){
 const shader={
  uniforms:{tDiffuse:{value:null},textureMatrix:{value:null},color:{value:new T.Color(0xc0d3d4)}},
  vertexShader:/* glsl */`
   uniform mat4 textureMatrix;
   varying vec4 vMirror;
   varying vec3 vSurface;
   #include <common>
   #include <logdepthbuf_pars_vertex>
   void main(){
    vMirror=textureMatrix*vec4(position,1.0);
    vSurface=(modelMatrix*vec4(position,1.0)).xyz;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    #include <logdepthbuf_vertex>
   }
  `,
  fragmentShader:/* glsl */`
   uniform sampler2D tDiffuse;
   uniform vec3 color;
   varying vec4 vMirror;
   varying vec3 vSurface;
   #include <logdepthbuf_pars_fragment>
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float grain(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);}
   void main(){
    #include <logdepthbuf_fragment>
    vec2 p=vSurface.xz;
    float polish=.45+.55*grain(p*.48);
    float fresnel=pow(1.0-clamp(normalize(cameraPosition-vSurface).y,0.0,1.0),2.0);
    vec2 uv=vMirror.xy/vMirror.w;
    vec2 blur=vec2(1.0/1024.0,1.0/768.0)*mix(2.2,.65,polish);
    uv.x+=(grain(p*22.0)-.5)*.00012;
    vec3 reflection=texture2D(tDiffuse,uv).rgb*.36;
    reflection+=texture2D(tDiffuse,uv+vec2(blur.x,0)).rgb*.16;
    reflection+=texture2D(tDiffuse,uv-vec2(blur.x,0)).rgb*.16;
    reflection+=texture2D(tDiffuse,uv+vec2(0,blur.y)).rgb*.16;
    reflection+=texture2D(tDiffuse,uv-vec2(0,blur.y)).rgb*.16;
    float strength=(.07+.39*fresnel)*polish;
    gl_FragColor=vec4(reflection*mix(vec3(1.0),color,.35),strength);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }
  `
 };
 const floor=new Reflector(new T.PlaneGeometry(width,depth),{textureWidth:1024,textureHeight:768,multisample:0,color:0xc0d3d4,clipBias:.004,shader});
 floor.rotation.x=-Math.PI/2;floor.position.set(0,-.025,mid);floor.material.transparent=true;floor.material.depthWrite=false;floor.visible=!low;
 return floor;
}

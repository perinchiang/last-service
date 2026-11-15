import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {poseWeapon} from '../src/weapon-pose.js';
test('aimed optical centre projects onto the firing ray in desktop and portrait poses',()=>{
 const camera=new T.PerspectiveCamera(66,16/9,.06,100);const weapon={group:new T.Group(),sight:new T.Vector3(0,.25,-.04)};camera.add(weapon.group);
 for(const portrait of [false,true])for(const recoil of [0,.18])for(const reloadTime of [0,.7]){
  poseWeapon(weapon,{aim:1,portrait,recoil,reloadTime,moving:true,walk:1.2});camera.updateMatrixWorld(true);
  const centre=weapon.group.localToWorld(weapon.sight.clone()).project(camera);assert.ok(Math.abs(centre.x)<1e-9);assert.ok(Math.abs(centre.y)<1e-9);
 }
});

test('reload removes and reseats the magazine independently of the receiver',()=>{
 const weapon={group:new T.Group(),sight:new T.Vector3(0,.225,-.062),magazine:new T.Group(),bolt:new T.Group(),support:new T.Group()};
 poseWeapon(weapon,{});const seated=weapon.magazine.position.clone();
 poseWeapon(weapon,{reloadTime:.9});assert.ok(weapon.magazine.position.y<seated.y-.2);
 poseWeapon(weapon,{reloadTime:.16});assert.ok(weapon.magazine.position.distanceTo(seated)<.001);assert.ok(weapon.bolt.position.z>.05);
 poseWeapon(weapon,{reloadTime:0});assert.ok(weapon.magazine.position.distanceTo(seated)<.001);assert.equal(weapon.bolt.position.z,.04);
});

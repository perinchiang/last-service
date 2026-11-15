import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {SERVICE,serviceSpawn,serviceFloorHeight,makeServiceArm,poseServiceArm} from '../src/service-rig.js';
test('spawn is centred above the service deck and its perimeter slopes to the floor',()=>{
 const spawn=serviceSpawn();assert.equal(spawn.x,SERVICE.x);assert.equal(spawn.z,SERVICE.z);assert.equal(spawn.y,serviceFloorHeight(spawn.x,spawn.z)+SERVICE.eye);
 assert.equal(serviceFloorHeight(SERVICE.x+3,SERVICE.z),0);
 const edge=serviceFloorHeight(SERVICE.x+2.25,SERVICE.z);assert.ok(edge>0&&edge<SERVICE.deck);
});
test('both service claws reach inward and retract away from the robot symmetrically',()=>{
 const root=new T.Group(),material=new T.MeshBasicMaterial(),M=Object.fromEntries(['black','chrome','orange','white','dark'].map(k=>[k,material]));
 const arms=[makeServiceArm(root,M,-1.65,-2.3,1),makeServiceArm(root,M,3.85,-2.3,-1)];
 root.updateMatrixWorld(true);const before=arms.map(a=>a.tip.getWorldPosition(new T.Vector3()));
 assert.ok(before[0].x>arms[0].root.position.x+2);assert.ok(before[1].x<arms[1].root.position.x-2);
 assert.ok(Math.abs((before[0].x+before[1].x)/2-SERVICE.x)<1e-8);
 for(const a of arms)poseServiceArm(a,1,0);root.updateMatrixWorld(true);
 for(let i=0;i<2;i++){const p=arms[i].tip.getWorldPosition(new T.Vector3());assert.ok(Math.abs(p.x-SERVICE.x)>2);assert.ok(p.y>before[i].y);}
});

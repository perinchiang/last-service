import {test} from 'node:test';
import assert from 'node:assert/strict';
import {movePlayer,makeProgress,inspect,breakInterlock,defeatEnemy,openExit} from '../src/simulation.js';
test('player cannot tunnel through a crate on a long frame',()=>{const p={x:0,z:3};movePlayer(p,0,-6,[{x:0,z:0,w:2,d:1}]);assert.ok(p.z>=.8);});
test('player slides along cover instead of getting stuck',()=>{const p={x:1.34,z:0};movePlayer(p,-1,2,[{x:0,z:0,w:2,d:2}]);assert.ok(p.z>1.8);});
test('gate opens only after inspection, override and every enemy',()=>{const p=makeProgress();assert.equal(openExit(p),false);assert.equal(breakInterlock(p),false);inspect(p);assert.equal(breakInterlock(p),true);for(let i=0;i<5;i++)defeatEnemy(p);assert.equal(openExit(p),false);defeatEnemy(p);assert.equal(openExit(p),true);assert.equal(p.phase,'opening');});
test('new run does not inherit the prior alarm or kills',()=>{const a=makeProgress();inspect(a);breakInterlock(a);defeatEnemy(a);const b=makeProgress();assert.deepEqual(b,{phase:'explore',inspected:false,cleared:0,total:6,craneUsed:false});});

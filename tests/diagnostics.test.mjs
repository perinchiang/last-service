import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BOOT_LOG,BOOT_TELEMETRY,WAKE_DURATION,entriesAt,authorizationForPhase,mayRecordEvent} from '../src/diagnostics.js';

test('boot diagnostics reveal observations before the robot takes control',()=>{
 assert.deepEqual(entriesAt(BOOT_LOG,0),[]);
 assert.ok(entriesAt(BOOT_LOG,2).some(entry=>entry.code==='RESULT / ENVIRONMENT'));
 assert.ok(entriesAt(BOOT_LOG,2).every(entry=>entry.at<=2));
 assert.equal(entriesAt(BOOT_LOG,WAKE_DURATION).length,BOOT_LOG.length);
 assert.ok(BOOT_LOG.every((entry,index)=>index===0||entry.at>BOOT_LOG[index-1].at));
});

test('telemetry arrives with its matching scan result',()=>{
 assert.ok(BOOT_TELEMETRY.some(entry=>entry.label==='设施时钟'&&entry.state==='warning'));
 assert.ok(BOOT_TELEMETRY.every(entry=>entry.at<=WAKE_DURATION));
});

test('weapon authorization follows the mission state',()=>{
 assert.equal(authorizationForPhase('explore').state,'locked');
 assert.equal(authorizationForPhase('combat').state,'active');
 assert.equal(authorizationForPhase('release').state,'standby');
 assert.equal(authorizationForPhase('opening').state,'standby');
});

test('routine logs are rate-limited while story-critical changes stay immediate',()=>{
 assert.equal(mayRecordEvent(10,25),false);
 assert.equal(mayRecordEvent(10,40),true);
 assert.equal(mayRecordEvent(10,11,true),true);
});

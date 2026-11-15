() => {
 const g=window.__game,checks=[];
 if(!g?.begin)throw new Error('Open the game with ?qa=1 before running this scenario.');
 const check=(name,pass,details)=>checks.push({name,pass:!!pass,...(details?{details}:{})});
 g.stop();g.begin(true);g.interact();check('Distant terminal cannot be operated',!g.snapshot.inspected);
 const startZ=g.snapshot.player.z;g.input.keys.add('KeyW');for(let i=0;i<70;i++)g.step(.025,false);g.input.reset();check('Keyboard movement changes world position',g.snapshot.player.z<startZ-4.8);
 g.setPose(-4.6,-6.35);g.interact();g.aimAt(-3.78,1.15,-8.7);g.fire();check('Actual raycast breaks the interlock and spawns wave one',g.snapshot.phase==='combat'&&g.snapshot.active===3);
 for(let wave=0;wave<2;wave++){
  for(const e of g.enemies.list.slice(wave*3,wave*3+3))for(let i=0;i<4&&e.active;i++){
   g.step(.13,false);const p=e.group.position;g.setPose(p.x,p.z+2.6);g.aimAt(p.x,p.y,p.z);g.fire();
  }
  if(wave===0){for(let i=0;i<8;i++)g.step(.45,false);check('Wave two follows the first three kills',g.snapshot.active===3&&g.snapshot.kills===3);}
 }
 check('All six enemies die through the normal shooting handler',g.snapshot.kills===6&&g.snapshot.phase==='release',g.snapshot);
 g.setPose(-4.6,-6.35);g.interact();for(let i=0;i<14;i++)g.step(.45,false);check('Mechanical exit fully opens',g.snapshot.door===1);
 g.setPose(0,-14.5);g.step(.016,false);check('Crossing the exit completes the run',g.state==='won');
 g.begin(true);check('Restart clears damage, enemies and door state',g.snapshot.kills===0&&g.snapshot.health===100&&g.snapshot.ammo===24&&g.snapshot.door===0);
 g.step(.15,false);g.aimAt(1,4,-12);g.fire();g.reload();check('Reload has a real delay',g.snapshot.ammo===23&&g.snapshot.reloadTime>0);for(let i=0;i<65;i++)g.step(.025,false);check('Reload completes',g.snapshot.ammo===24&&g.snapshot.reloadTime===0);
 g.setPose(-3.3,1.4);g.aimAt(g.world.latch.position.x,g.world.latch.position.y,g.world.latch.position.z);g.fire();for(let i=0;i<90;i++)g.step(.025,false);check('Shooting the lift latch drops solid cargo',g.world.cargoFall&&g.world.cargoY===.72&&g.world.colliders.some(b=>b.x===-3.3&&b.z===-1.1));
 g.begin(true);check('Restart restores suspended cargo',!g.world.cargoFall&&g.world.cable.visible&&!g.world.colliders.some(b=>b.x===-3.3&&b.z===-1.1));
 g.pause();const paused=g.snapshot.elapsed;g.step(.5,false);g.fire();check('Pause freezes simulation and rejects shooting',g.snapshot.elapsed===paused&&g.snapshot.shots===0);
 g.begin(true);g.setPose(-4.6,-6.35);g.interact();g.aimAt(-3.78,1.15,-8.7);g.fire();g.enemies.onHurt(200);check('Lethal damage shows a defeat state',g.state==='dead'&&g.snapshot.health===0);
 g.begin(true);g.step(.016);check('Restart after defeat remains playable',g.state==='play'&&g.snapshot.health===100);check('No uncaught browser errors',window.__bootErrors.length===0,window.__bootErrors);
 return {passed:checks.filter(c=>c.pass).length,total:checks.length,checks};
}

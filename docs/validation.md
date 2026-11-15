# First playable validation — 2026-11-16

## Automated checks

- Release candidate: v0.1.0, BUILD `34f1d8fb`. Node checks: 5/5 passed. Browser scenario: 16/16 passed.
- Node tests cover collision tunnelling, sliding along cover, mission gating, clean restart state and a self-contained versioned HTML build.
- The real Three.js browser game was exercised with tests/browser-scenario.js using its ?qa=1 interface: inspection distance, keyboard movement, actual interlock raycasts, both enemy waves, six kills through the shooting handler, gate movement, win trigger, restart, timed reload, falling cargo and restored collision, pause, death and restart after death.
- The browser scenario uses explicit player positioning and simulation stepping to make combat checks reproducible. It is a correctness check, not a substitute for human judgement of difficulty or gun feel. Debug controls are not exposed without ?qa=1.
- Basic touch input was dispatched through actual pointer handlers in a same-origin 390 × 844 iframe in the managed Chrome session: movement and release, drag-to-look, firing, reload and terminal interaction all passed. Touch controls remained within the viewport. This does not constitute an iPhone Safari device certification.
- The scene and in-game interface were visually inspected in the browser. No uncaught JavaScript errors were reported during the tested flow.

## Fixes found during verification

- The cargo latch was occluded by its own container from ground level. Its release module now sits on the visible front edge.
- Fallen cargo now becomes an obstacle; restart removes that obstacle and restores the suspension cable.
- Rear walls retain collision when the gate opens. The central service apparatus blocks enemy projectiles as well as player shots.
- Portrait framing reduces the first-person weapon footprint. Touch cancellation resets held actions.
- Build identity includes JavaScript, HTML and CSS; the title screen can request a cache-busted refresh.

## Lighting refinement — BUILD `04c5e372`

Removed the three translucent cone meshes from the left aisle after visual feedback. Compared the same camera position before and after in Chrome: the conspicuous cone silhouettes are gone, the actual lights and floor reflection remain, and no uncaught browser errors occurred. All 5 Node checks passed on the rebuilt single-file distribution.

## Delivery

## Input and service rig refinement — BUILD `ed6911ca`

- 19 Node checks passed: mouse-button chords in both orders, independent release, raw-input fallback and duplicate lock prevention, transition/jump filtering, bounded accumulated motion, focus loss, touch tap/hold/cancel/multitouch, sight alignment through recoil and portrait scaling, central-deck height and mirrored inward service claws.
- The original browser mission scenario passed 16/16 checks on this build. The new `tests/browser-input-scenario.js` passed another 16/16 checks against the actual event handlers and renderer: held aim plus fire, projected sight centre, central restart, walking off the platform, awakening/lift/arm sequence, and phone tap/hold/release with simultaneous movement and looking.
- Touch checks used a 390 × 844 same-origin iframe in managed Chrome. Desktop checks ran in Chrome on the Mac; Windows relative-motion discontinuities were reproduced as injected event sequences in the Node checks. Physical Windows mouse behaviour and physical iPhone Safari were not tested.
- Inspected the actual rendered sight and inward-facing service rig. No uncaught browser errors were reported.

## Distribution

The distributable is a single index.html including Three.js, generated geometry, shaders, textures and procedural Web Audio. There are no external game assets, fonts, runtime libraries or backend requirements. Development dependencies are locked in package-lock.json.

GitHub Pages publishes the main branch after the approved pull-request merge. Desktop is the main target. Mobile provides simple playtesting controls and defaults to a lighter rendering path. Four-legged enemies are outside this first release.

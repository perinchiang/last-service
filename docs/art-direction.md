# Maintenance hall art pass

This pass studies the composition and rendering methods of Astra FPS (https://lab.ytdeepsea.com/games/fps/play/astra.html). Our geometry, floor shader, weapon and sound implementation are authored for LAST SERVICE; no downloaded art or audio assets are added.

## Visual intent

Keep the identity of an abandoned robot maintenance facility. Establish one clear axis from the service platform to a distant pressure lock. The architectural skeleton is symmetrical; functional exceptions, such as the interactive left console and suspended cargo, stay subordinate to it. Cool grey metal, desaturated painted surfaces and restrained warm warning indicators replace pervasive orange.

The player still wakes on the service deck, with the lift lowering and both claws retracting. The distance to the gate increases from approximately 10.5 to 29.7 world units. Structural bays repeat every six units, with supported lintels, attached cable trays and pipework returning to named cooling units. The far door uses a recessed chamfered frame rather than repeated shutter ribs.

## Scope

- Reorganize the existing hall and its landmarks, collision, interactions, enemy spawn positions and exit threshold together.
- Tune lighting and coated-floor reflections for readable depth, without decorative volumetric cones or water ripples.
- Replace the oversized bright weapon shell with a slimmer mechanical receiver, open sight and independently animated magazine/bolt.
- Layer quiet ventilation, low mechanical tones and room reverberation in procedural Web Audio.
- Keep the existing mission and desktop/mobile controls. No new chapter, hound, hacking, vehicle or narrative sequence is included.

Low quality keeps the textured floor and ordinary lights while disabling the planar reflection and costly postprocessing. All assets remain code-generated and the published game remains one self-contained HTML file.

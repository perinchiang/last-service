# LAST SERVICE · 最后一次检修

A small first-person journey through an automated facility that has outlived its makers. Explore, break the lock, survive security and find a way out.

All scene geometry, surface textures, animation and sound are generated in code with Three.js and Web Audio. No external art assets or runtime network dependencies.

## Development

```sh
npm ci
npm run build
npm run dev
```

The build produces a self-contained `index.html`. Desktop keyboard and mouse are the primary controls; basic touch controls support mobile playtesting.

## Checkpoints

Major development stages are committed individually. The first playable is developed on `feat/first-playable`; the Pages preview will follow that branch while its pull request remains open.

## Credits

Original level, game code and procedural art. Three.js is MIT licensed; the distribution includes its license notice. Astra / PELAGIC and Saltline informed the technical research into procedural environments and reflective surfaces. Their game code and assets are not included.

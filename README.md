# LAST SERVICE · 最后一次检修

[**在线试玩 v0.1.1**](https://perinchiang.github.io/last-service/) · [版本说明与操作](docs/release-v0.1.1.md) · [验证记录](docs/validation.md)

人类已经消失，自动设施仍在执行回收命令。作为一台刚刚苏醒的机器人，检查门禁、击毁封锁装置、抵挡两波安保无人机，再亲手打开出口。场景、机械动画、枪械和音效均由代码生成。

电脑：WASD 移动，鼠标转向，右键瞄准时可同时按左键射击，E 交互，R 换弹，Esc 暂停。鼠标灵敏度可在主菜单和暂停菜单调整。手机：左侧摇杆移动、右侧拖动视角；单点射击键直接射一枪，长按约 0.24 秒开镜连射，松手退出；建议横屏。主菜单的“检查更新”可刷新到最新部署，底部 BUILD 标识用于核对版本。

出生、复活和苏醒演出都位于中央检修台。左右检修臂向台内工作，苏醒时收回，平台下降后可直接走下。

A small first-person journey through an automated facility that has outlived its makers. Explore, break the lock, survive security and find a way out.

All scene geometry, surface textures, animation and sound are generated in code with Three.js and Web Audio. No external art assets or runtime network dependencies.

## Development

```sh
npm ci
npm test
npm run build
npm run dev
```

The build produces a self-contained `index.html`. Desktop keyboard and mouse are the primary controls; basic touch controls support mobile playtesting.

## Checkpoints

Major development stages are committed individually on feature branches, then merged by pull request after their checks pass. Published releases on GitHub Pages follow the repository's default branch, `main`.

## Credits

Original level, game code and procedural art. Three.js is MIT licensed; the distribution includes its license notice. Astra / PELAGIC and Saltline informed the technical research into procedural environments and reflective surfaces. Their game code and assets are not included.

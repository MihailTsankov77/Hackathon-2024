import Phaser from "phaser";
import MainScene from "../Scenes/MainScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: window.innerHeight * 2,
  height: window.innerHeight,
  scene: [MainScene],
};

export default new Phaser.Game(config);

import Phaser from "phaser";
import MainScene from "../Scenes/MainScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: window.innerHeight * 2,
  height: window.innerHeight,
  scene: [MainScene],
  physics: {
    default: "arcade", //the physics engine the game will use
    arcade: {
      debug: false,
    },
  },
};

export default new Phaser.Game(config);

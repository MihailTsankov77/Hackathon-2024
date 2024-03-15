import Phaser from "phaser";
import MainScene from "../Scenes/MainScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  scene: [MainScene],
  physics: {
    default: "arcade", //the physics engine the game will use
    arcade: {
      debug: false,
    },
  },
};

export default new Phaser.Game(config);

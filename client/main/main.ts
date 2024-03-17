import Phaser from "phaser";
import MainScene from "../Scenes/MainScene";
import GameOver from "../Scenes/GameOverScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [MainScene, GameOver],
  physics: {
    default: "arcade", //the physics engine the game will use
    arcade: {
      debug: false,
    },
  },
};

export default new Phaser.Game(config);

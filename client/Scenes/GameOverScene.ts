import { Scene } from "phaser";
import { preloadImages } from "../utils/images";

export default class GameOver extends Phaser.Scene {
  keyEnter: Phaser.Input.Keyboard.Key = {} as Phaser.Input.Keyboard.Key;
  launchScene: Scene = {} as Scene;
  constructor() {
    super("GameOver");
  }

  init(data: { launchScene: Scene }) {
    this.launchScene = data.launchScene;
  }

  preload() {
    preloadImages(this);
  }

  create() {
    this.cameras.main.backgroundColor.setTo(255, 0, 0);
    this.cameras.main.setZoom(1);
    const background = this.add.image(
      window.innerWidth / 1.2,
      window.innerHeight,
      "game-over"
    );
    background.setOrigin(1, 1);
  }

  update(time: number) {}
}

import Phaser from "phaser";
import { preloadImages } from "../utils/images";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init() {}

  preload() {
    console.log("HI");
    this.load.image("player", "player.png");
  }

  create() {
    this.add.image(window.innerWidth / 2, window.innerHeight / 2, "player");
  }

  update() {}
}

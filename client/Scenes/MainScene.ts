import Phaser from "phaser";
import { preloadImages } from "../utils/images";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init() {}

  preload() {
    preloadImages(this);
  }

  create() {
    this.add.image(window.innerWidth / 2, window.innerHeight / 2, "player");
  }

  update() {}
}

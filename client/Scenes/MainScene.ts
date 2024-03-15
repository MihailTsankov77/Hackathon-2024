import Phaser from "phaser";
import { preloadImages } from "../utils/images";
import { Player } from "../player/Player";

export default class MainScene extends Phaser.Scene {
  player: Player;
  constructor() {
    super("MainScene");
  }

  init() {}

  preload() {
    preloadImages(this);
  }

  create() {
    this.player = new Player(500, 500, this);
  }

  update() {
    this.player.update();
  }
}

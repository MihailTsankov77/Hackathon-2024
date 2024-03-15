import Phaser from "phaser";
import { preloadImages } from "../utils/images";
import { Player } from "../players/player/Player";
import { Unit } from "../players/units/Unit";

export default class MainScene extends Phaser.Scene {
  player: Player;
  unit: Unit;
  constructor() {
    super("MainScene");
  }

  init() {}

  preload() {
    preloadImages(this);
  }

  create() {
    const gameWidth = this.sys.game.config.width as number;
    const gameHeight = this.sys.game.config.height as number;
    const background = this.add.tileSprite(
      0,
      0,
      gameWidth * 2,
      gameHeight * 2,
      "background"
    );
    background.setOrigin(0, 0);
    background.setPosition(
      (gameWidth - background.width) / 2,
      (gameHeight - background.height) / 2
    );

    this.player = new Player(500, 500, this);
    this.unit = new Unit(0, 0, this, {
      name: "slavi",
      scale: 0.7,
    });

    this.unit.goto(window.innerWidth, window.innerHeight);
  }

  update() {}
}

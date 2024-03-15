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

  setUpCameraAndBackground() {
    const gameWidth = 2000;
    const gameHeight = 2000;

    this.cameras.main.setBounds(0, 0, gameWidth, gameHeight);

    const background = this.add.tileSprite(
      0,
      0,
      gameWidth,
      gameHeight,
      "background"
    );
    background.setOrigin(0, 0);

    this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
  }

  create() {
    this.setUpCameraAndBackground();

    this.player = new Player(500, 500, this);
    this.unit = new Unit(200, 200, this, {
      name: "slavi",
      scale: 0.7,
    });

    this.unit.goto(window.innerWidth, window.innerHeight);
  }

  update() {
    this.player.update();
  }
}

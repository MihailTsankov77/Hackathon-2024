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
    // background.setPosition(
    //   (gameWidth - background.width) / 2,
    //   (gameHeight - background.height) / 2
    // );

    this.physics.world.setBounds(0, 0, gameWidth / 2, gameHeight / 2); // TODO move the borders in the center of the map with offset in every dir
  }

  create() {
    this.setUpCameraAndBackground();

    this.player = new Player(500, 500, this);
    this.unit = new Unit(0, 0, this, {
      name: "slavi",
      scale: 0.7,
    });

    this.unit.goto({ x: window.innerWidth, y: window.innerHeight });
  }

  update() {}
}

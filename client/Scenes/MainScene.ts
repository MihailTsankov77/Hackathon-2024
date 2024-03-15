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
    this.player = new Player(500, 500, this);
    this.unit = new Unit(1000, 700, this);

    this.unit.goto(2000, 700);
  }

  update() {
    this.player.update();
  }
}

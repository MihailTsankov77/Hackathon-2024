import { Key } from "../../utils/types";
import { Unit } from "../units/Unit";

export class Player {
  SPEED = 200;
  keyA: Key = {} as Key;
  keyS: Key = {} as Key;
  keyD: Key = {} as Key;
  keyW: Key = {} as Key;

  unit: Unit;
  game: Phaser.Scene = {} as Phaser.Scene;

  constructor(x: number, y: number, game: Phaser.Scene) {
    this.game = game;

    this.unit = new Unit(x, y, game, {
      name: "player",
      scale: 0.2,
    });

    this.game.input.on(
      "pointermove",
      (pointer) => {
        // if (pointer.isDown) { // TODO
        this.unit.goto(this.game.input);
      },
      this
    );

    this.game.cameras.main.startFollow(this.unit.sprite);
  }
}

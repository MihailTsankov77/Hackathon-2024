import { Sprite } from "../../utils/types";
import { Unit } from "./Unit";

export class Pair {
  game: Phaser.Scene;

  unit1: Unit;
  unit2: Unit;
  hand: Sprite;

  constructor(unit1: Unit, unit2: Unit, game: Phaser.Scene) {
    this.game = game;

    this.unit1 = unit1;
    this.unit2 = unit2;

    this.hand = this.game.physics.add.sprite(
      ...this.getCenterBetweenUnits(),
      "hand"
    );
  }

  getCenterBetweenUnits(): [number, number] {
    const x = (this.unit1.sprite.x + this.unit2.sprite.x) / 2;
    const y = (this.unit1.sprite.y + this.unit2.sprite.y) / 2;
    return [x, y];
  }

  getDistance(): number {
    return Math.sqrt(
      (this.unit1.sprite.x - this.unit2.sprite.x) ** 2 +
        (this.unit1.sprite.y - this.unit2.sprite.y) ** 2
    );
  }

  getScale(): [number, number] {
    const scaleX = this.getDistance() / this.hand.width;
    return [scaleX, Math.min(1 - scaleX, 0.5)]; // TODO
  }

  update() {
    const coords = this.getCenterBetweenUnits();
    this.hand.x = coords[0];
    this.hand.y = coords[1];
    this.hand.setScale(...this.getScale());

    const angle = Phaser.Math.Angle.Between(
      this.unit1.sprite.x,
      this.unit1.sprite.y,
      this.unit2.sprite.x,
      this.unit2.sprite.y
    );

    this.hand.setRotation(angle);
  }
}

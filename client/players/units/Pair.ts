import Phaser from "phaser";
import { Sprite } from "../../utils/types";
import { Unit } from "./Unit";
import { PlayerGroup } from "../player/PlayerGroup";
import { Bot } from "./Bot";
import { SocketConnection } from "../../connection/connectionMain";

type Point = {
  x: number;
  y: number;
};

function isPointBetween(
  point: Point,
  point1: Point,
  point2: Point,
  offset: number
) {
  const distance1 = Math.sqrt(
    Math.pow(point.x - point1.x, 2) + Math.pow(point.y - point1.y, 2)
  );
  const distance2 = Math.sqrt(
    Math.pow(point.x - point2.x, 2) + Math.pow(point.y - point2.y, 2)
  );

  const distanceBetweenPoints = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );

  return Math.abs(distance1 + distance2 - distanceBetweenPoints) <= offset;
}

export class Pair {
  game: Phaser.Scene;

  unit1: Unit;
  unit2: Unit;
  hand: Sprite;

  MaxDistance = 500;

  constructor(unit1: Unit, unit2: Unit, game: Phaser.Scene) {
    this.game = game;

    this.unit1 = unit1;
    this.unit2 = unit2;

    this.hand = this.game.physics.add.sprite(
      ...this.getCenterBetweenUnits(),
      "hand"
    );

    this.hand.setDepth(-5);
  }

  getCenterBetweenUnits(): [number, number] {
    const x = (this.unit1.sprite.x + this.unit2.sprite.x) / 2;
    const y = (this.unit1.sprite.y + this.unit2.sprite.y) / 2;
    return [x, y];
  }

  getDistance = (): number => {
    return Math.sqrt(
      (this.unit1.sprite.x - this.unit2.sprite.x) ** 2 +
        (this.unit1.sprite.y - this.unit2.sprite.y) ** 2
    );
  };

  getScale(): [number, number] {
    const scaleX = this.getDistance() / this.hand.width;
    return [scaleX, Math.min(1 - scaleX, 0.5)]; // TODO
  }

  renderHand() {
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

  update() {
    this.renderHand();
  }

  playSplitAnimation = () => {
    // TODO Marinkov
    this.destroyHand();
  };

  destroyHand = (): void => {
    this.hand.destroy();
  };

  offset = 40;

  checkCollision(collide: () => void, playerGroup: PlayerGroup) {
    if (
      isPointBetween(
        playerGroup.player.unit.sprite,
        this.unit1.sprite,
        this.unit2.sprite,
        this.offset
      )
    ) {
      collide();

      return;
    }

    if (
      playerGroup.unit2 &&
      isPointBetween(
        playerGroup.unit2.sprite,
        this.unit1.sprite,
        this.unit2.sprite,
        this.offset
      )
    ) {
      collide();

      return;
    }
  }

  checkCollision2(collide: () => void, bot: Bot) {
    if (
      isPointBetween(
        bot.unit1.sprite,
        this.unit1.sprite,
        this.unit2.sprite,
        this.offset
      )
    ) {
      collide();

      return;
    }

    if (
      bot.unit2 &&
      isPointBetween(
        bot.unit2.sprite,
        this.unit1.sprite,
        this.unit2.sprite,
        this.offset
      )
    ) {
      collide();

      return;
    }
  }

  split(): [number, number] {
    this.playSplitAnimation();

    this.unit1.destroy();
    this.unit2.destroy();

    return [this.unit1.id, this.unit2.id];
  }

  splitForPlayer() {
    this.playSplitAnimation();

    this.unit2.destroy();
  }

  maybeSplitHand = (socket: SocketConnection) => {
    if (this.getDistance() < this.MaxDistance) {
      return;
    }

    this.playSplitAnimation();
    // this.unit1.SPEED += 10;

    if (this.unit1.id > this.unit2.id) {
      socket.sendDisconnect(this.unit1.id, this.unit2.id, true);
    }

    return;
  };
}

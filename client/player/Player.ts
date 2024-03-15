import { Key, Sprite } from "../utils/types";

export class Player {
  SPEED = 200;
  keyA: Key = {} as Key;
  keyS: Key = {} as Key;
  keyD: Key = {} as Key;
  keyW: Key = {} as Key;

  sprite: Sprite = {} as Sprite;
  game: Phaser.Scene = {} as Phaser.Scene;

  constructor(x: number, y: number, game: Phaser.Scene) {
    this.game = game;

    this.sprite = game.physics.add.sprite(x, y, "player");
    this.sprite.scale = 0.2; // TODO
    this.sprite.setCollideWorldBounds(true);

    if (game.input.keyboard) {
      this.keyA = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    }
  }

  update(): void {
    this.move();
  }

  move(): void {
    if (this.keyA.isDown) {
      this.sprite.setVelocityX(-this.SPEED);
    }

    if (this.keyD.isDown) {
      this.sprite.setVelocityX(this.SPEED);
    }

    if (this.keyW.isDown) {
      this.sprite.setVelocityY(-this.SPEED);
    }

    if (this.keyS.isDown) {
      this.sprite.setVelocityY(this.SPEED);
    }
  }
}

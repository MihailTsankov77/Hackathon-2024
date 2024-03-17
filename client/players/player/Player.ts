import { Unit } from "../units/Unit";
import { SocketConnection } from "../../connection/connectionMain";

export class Player {
  unit: Unit;
  game: Phaser.Scene;
  pointer: Phaser.Input.Pointer;

  constructor(id: number, x: number, y: number, game: Phaser.Scene) {
    this.game = game;

    this.unit = new Unit(id, x, y, game, {
      name: "player",
      scale: 0.1,
    });

    this.game.cameras.main.startFollow(this.unit.sprite, true);
    this.pointer = this.game.input.activePointer;
  }

  dead() {
    this.game.scene.launch("GameOver", { launchScene: this.game });
    this.game.scene.stop();
  }

  setId(id: number) {
    this.unit.id = id;
  }

  sendLocation(socket: SocketConnection) {
    socket.sendLocation(this.unit.sprite.x, this.unit.sprite.y);
  }

  update(socket: SocketConnection, newScore: number, newTimer: number) {
    this.unit.goto(
      this.pointer.worldX,
      this.pointer.worldY,
      newScore,
      newTimer
    );
    //function to send location to the BE
    this.sendLocation(socket);
  }
}

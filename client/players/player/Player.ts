import { Unit } from "../units/Unit";
import { SocketConnection } from "../../connection/connectionMain";

export class Player {
  SPEED = 200;

  unit: Unit;
  game: Phaser.Scene;
  pointer: Phaser.Input.Pointer;

  constructor(x: number, y: number, game: Phaser.Scene) {
    this.game = game;

    this.unit = new Unit(x, y, game, {
      name: "player",
      scale: 1,
    });

    this.game.cameras.main.startFollow(this.unit.sprite);
    this.pointer = this.game.input.activePointer;
  }

  sendLocation(socket:SocketConnection){
    socket.sendLocation(this.unit.sprite.x, this.unit.sprite.y);
  }
  update(socket: SocketConnection) {
    // TODO: bug when the mouse is not moved for long time
    this.unit.goto(this.pointer.worldX, this.pointer.worldY);
    
    //function to send location to the BE
    this.sendLocation(socket);


    // TODO:
    // const angle = Phaser.Math.Angle.Between(
    //   this.unit.sprite.x,
    //   this.unit.sprite.y,
    //   this.pointer.worldX,
    //   this.pointer.worldY
    // );

    // this.unit.sprite.setRotation(angle);
  }
}

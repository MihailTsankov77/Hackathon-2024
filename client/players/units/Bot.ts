import Phaser from "phaser";
import { Unit } from "./Unit";
import { PlayerData } from "../../Scenes/MainScene";
import { Pair } from "./Pair";

export class Bot {
  game: Phaser.Scene;

  dataPlayer1: PlayerData;
  dataPlayer2: PlayerData | undefined;

  unit1: Unit;
  unit2: Unit | undefined;

  pair: Pair | undefined;

  constructor(
    dataPlayer1: PlayerData,
    dataPlayer2: PlayerData | undefined,
    game: Phaser.Scene
  ) {
    this.game = game;

    this.dataPlayer1 = dataPlayer1;
    this.dataPlayer2 = dataPlayer2;
    this.createUnits();
  }

  createUnits() {
    this.unit1 = new Unit(
      this.dataPlayer1.id,
      this.dataPlayer1.x,
      this.dataPlayer1.y,
      this.game,
      {
        name: "slavi",
        scale: 0.5,
      }
    );

    if (!this.dataPlayer2) {
      return;
    }

    this.unit2 = new Unit(
      this.dataPlayer2.id,
      this.dataPlayer2.x,
      this.dataPlayer2.y,
      this.game,
      {
        name: "slavi",
        scale: 0.5,
      }
    );

    this.pair = new Pair(this.unit1, this.unit2, this.game);
  }

  updateData = (dataPlayer1: PlayerData, dataPlayer2?: PlayerData) => { 
    this.dataPlayer1 = dataPlayer1;
    this.dataPlayer2 = dataPlayer2;
    //console.log(dataPlayer1.points);
    this.unit1.goto(dataPlayer1.x, dataPlayer1.y,dataPlayer1.points);
    
//Marti

    if (this.unit2 && dataPlayer2) {
      //console.log(dataPlayer2.points);
      this.unit2.goto(dataPlayer2.x, dataPlayer2.y,dataPlayer2.points);
    }
  };

  onKill = (): number[] => {
    if (this.pair) {
      return this.pair.split();
    }

    this.unit1.dead();
    return [];
  };
  update() {
    if (this.pair) {
      this.pair.update();
    }
  }
}

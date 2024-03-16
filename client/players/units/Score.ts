import Phaser from "phaser";

export class Score {
  digits: number;
  //digitsSprite : Sprite= {} as Sprite;
  digitsText;

  constructor(x: number, y: number, game: Phaser.Scene) {
    this.digits = 0;
    //this.digitsSprite = game.physics.add.sprite(x,y,"score");
    this.digitsText = game.add.text(x, y, "123", {
      color: "#000000",
      fontSize: 22,
      fontStyle: "bold",
    });
  }

  update(newScore: number) {
    if (newScore) {
      this.digits = newScore;
      //console.log(this.digits);

      this.digitsText.setText(this.digits.toString());
      //console.log("KUR");
    }
  }

  destroy() {
    this.digitsText.destroy();
  }
}

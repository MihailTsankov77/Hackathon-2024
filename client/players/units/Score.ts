import Phaser from "phaser";
import { Sprite } from "../../utils/types"


export class Score{
    digits:number
    //digitsSprite : Sprite= {} as Sprite;
    digitsText ;

    constructor(x:number,y:number,game: Phaser.Scene){
        this.digits=0;
        //this.digitsSprite = game.physics.add.sprite(x,y,"score");
        this.digitsText= game.add.text(x,y,"123",{color: '#000000',fontSize: 22, fontStyle:'bold'});
    }
}
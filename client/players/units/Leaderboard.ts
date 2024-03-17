import Phaser from "phaser";
import { Player } from "../player/Player";
export class LeaderboardEntry {
    id: number;
    score: number;
}
export class Leaderboard {
    leaderBoard: Array<LeaderboardEntry> = [];
    leaderboardText: Phaser.GameObjects.Text;


    constructor(x : number, y : number, game : Phaser.Scene){
        this.leaderboardText = game.add.text(x,y,"player1",{
        color: "#000000",
        fontSize: 34,
        fontStyle: "bold",
      });
    }

    leaderboardS(id: number, score: number) {
        this.leaderBoard = [];
        this.leaderBoard.push({id, score});
        console.log("Getting leaderboard with length", this.leaderBoard.length);
        
    }

    getAsStr(): string {
        let str = ""
        this.leaderBoard.forEach(el => {
            str += `${el.id}-${el.score}\n`
        })
        return str;
    }
    

    
   // getString(leaderBoard : Leaderboard []){
   //     this.leaderboardText.setText(this.leaderBoard.toString());
   // }
}
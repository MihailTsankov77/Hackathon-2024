import Phaser from "phaser";

export class Timer{
    time:number
    
    timeText: Phaser.GameObjects.Text;

    constructor(x:number,y:number,game: Phaser.Scene){
        this.time=0;
        
        this.timeText= game.add.text(x,y,"10",{color: '#000000',fontSize: 72, fontStyle:'bold'});
        //this.timeText.setActive(true);
    }

    update(newTime:number){
        if(newTime){
            this.time=newTime;
            this.timeText.setText(this.time.toString());
            
        }
    }

    destroy(){
        this.timeText.destroy();
    }

}
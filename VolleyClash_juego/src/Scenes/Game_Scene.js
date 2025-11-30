//Pantalla de Juego
import Phaser from 'phaser';

export class Game_Scene extends Phaser.Scene {
    constructor() {
        super('Game_Scene');
    }

    create() { 
        
         this.input.keyboard.on("keydown-ESC", () => {
        this.scene.pause();               // detiene el game loop
        this.scene.launch("Pause_Scene"); // muestra la escena de pausa
    });

    }
}
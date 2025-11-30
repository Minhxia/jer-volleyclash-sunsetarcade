//Pantalla de Pausa
import Phaser from 'phaser';

export class Pause_Scene extends Phaser.Scene {
    constructor() {
        super('Pause_Scene');
    }

    create() { 
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        this.add.text(400, 200, 'Pausado', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
}
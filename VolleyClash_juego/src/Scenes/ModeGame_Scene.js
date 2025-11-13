//Pantalla de Modo de Juego
import Phaser from 'phaser';

export class ModeGame_Scene extends Phaser.Scene {
    constructor() {
        super('ModeGame_Scene');
    }

    preload() {
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
    }

    create() {
        this.add.text(300, 100, 'Modo de Juego', { fontSize: '32px'});

        // Boton Local
        const localButton = this.add.sprite(250, 200, 'botonSinSeleccionar').setInteractive();
        const localText = this.add.text(0, 0, 'Local', { fontSize: '20px', color: '#000' });
        Phaser.Display.Align.In.Center(localText, localButton);

        localButton.on('pointerover', () => localButton.setTexture('botonSeleccionado'));
        localButton.on('pointerout', () => localButton.setTexture('botonSinSeleccionar'));
        localButton.on('pointerdown', () => this.scene.start('SelecPlayer_Scene'));

        // Boton Red
        const networkButton = this.add.sprite(450, 200, 'botonSinSeleccionar').setInteractive();
        const networkText = this.add.text(0, 0, 'Red', { fontSize: '20px', color: '#000' });
        Phaser.Display.Align.In.Center(networkText, networkButton);

        networkButton.on('pointerover', () => networkButton.setTexture('botonSeleccionado'));
        networkButton.on('pointerout', () => networkButton.setTexture('botonSinSeleccionar'));
        networkButton.on('pointerdown', () => this.scene.start('SelecPlayer_Scene'));

        // Boton Volver
        const backButton = this.add.sprite(50, 550, 'botonVolver').setInteractive();
        backButton.setScale(0.5);

        backButton.on('pointerdown', () => this.scene.start('SelecPlayer_Scene'));
    }
}
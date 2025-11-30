// Pantalla de Modo de Juego
import Phaser from 'phaser';

export class ModeGame_Scene extends Phaser.Scene {
    constructor() {
        super('ModeGame_Scene');
    }

    preload() {
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
    }

    create() {
        const { width, height } = this.scale;
        const style = this.game.globals.defaultTextStyle;

        const background = this.add.image(0, 0, 'fondo')
        .setOrigin(0)
        .setDepth(-1);

        // Título centrado
        this.add.text(width / 2, 100, 'Modo de Juego', {
            ...style,
            fontSize: '40px',
            color: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Posiciones horizontales de los botones
        const spacing = 250;
        const startX = width / 2 - spacing / 2;
        
        // Boton Local
        const localButton = this.add.sprite(startX, 250, 'botonSinSeleccionar')
            .setInteractive({ useHandCursor: true })
            .setScale(2);

        const localText = this.add.text(0, 0, 'Local', { fontSize: '24px', color: '#000' });
        Phaser.Display.Align.In.Center(localText, localButton);

        localButton.on('pointerover', () => localButton.setTexture('botonSeleccionado'));
        localButton.on('pointerout', () => localButton.setTexture('botonSinSeleccionar'));
        localButton.on('pointerdown', () => localButton.setTexture('botonSeleccionado'));
        localButton.on('pointerup', () => this.scene.start('SelecPlayer_Scene'));

        // Boton Red
        const networkButton = this.add.sprite(startX + spacing, 250, 'botonSinSeleccionar')
            .setInteractive({ useHandCursor: true })
            .setScale(2);

        const networkText = this.add.text(0, 0, 'Red', { fontSize: '24px', color: '#000' });
        Phaser.Display.Align.In.Center(networkText, networkButton);

        networkButton.on('pointerover', () => networkButton.setTexture('botonSeleccionado'));
        networkButton.on('pointerout', () => networkButton.setTexture('botonSinSeleccionar'));
        networkButton.on('pointerdown', () => localButton.setTexture('botonSeleccionado'));
        networkButton.on('pointerup', () => this.scene.start('SelecPlayer_Scene'));

        // Boton Volver
        const backX = width * 0.06;
        const backY = height * 0.08;

        const backButton = this.add
            .sprite(backX, backY, 'botonVolver')
            .setScale(1)
            .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('Menu_Scene');
        });
    }
}
// Pantalla de Modo de Juego
import Phaser from 'phaser';

export class ModeGame_Scene extends Phaser.Scene {
    constructor() {
        super('ModeGame_Scene');
    }

    preload() {
        // BORRAR COMENTARIO
        // ahora se utilizan las imágenes de los botones recortados para evitar problemas
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO_prueba.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR_prueba.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
    }

    create() {
        this.add.text(280, 100, 'Modo de Juego', { fontSize: '32px'});

        // Boton Local
        const localButton = this.add.sprite(250, 200, 'botonSinSeleccionar').setInteractive({ useHandCursor: true }).setScale(0.7);

        const localText = this.add.text(0, 0, 'Local', { fontSize: '20px', color: '#000' });
        Phaser.Display.Align.In.Center(localText, localButton);

        localButton.on('pointerover', () => localButton.setTexture('botonSeleccionado'));
        localButton.on('pointerout', () => localButton.setTexture('botonSinSeleccionar'));
        localButton.on('pointerdown', () => localButton.setTexture('botonSeleccionado'));
        localButton.on('pointerup', () => this.scene.start('SelecPlayer_Scene'));

        // Boton Red
        const networkButton = this.add.sprite(550, 200, 'botonSinSeleccionar').setInteractive({ useHandCursor: true }).setScale(0.7);

        const networkText = this.add.text(0, 0, 'Red', { fontSize: '20px', color: '#000' });
        Phaser.Display.Align.In.Center(networkText, networkButton);

        networkButton.on('pointerover', () => networkButton.setTexture('botonSeleccionado'));
        networkButton.on('pointerout', () => networkButton.setTexture('botonSinSeleccionar'));
        networkButton.on('pointerdown', () => localButton.setTexture('botonSeleccionado'));
        networkButton.on('pointerup', () => this.scene.start('SelecPlayer_Scene'));

        //// BOTÓN VOLVER ////
        // arriba a la izquierda
        const { width, height } = this.scale;
        const backX = width * 0.06;
        const backY = height * 0.08;

        const backButton = this.add
            .sprite(backX, backY, 'botonVolver')
            .setScale(0.1)
            .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            // vuelve al menú principal
            this.scene.start('Menu_Scene');
        });
    }
}
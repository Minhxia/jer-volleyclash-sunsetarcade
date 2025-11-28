// Pantalla del Menú Principal
import Phaser from 'phaser';

export class Menu_Scene extends Phaser.Scene {
    constructor() {
        super('Menu_Scene');
    }

    preload() {
        // se cargan las imágenes de los botones
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO_prueba.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR_prueba.png');
    }

    create() {        
        // posiciones base para los botones del menú
        // (así se puede cambiar el tamaño sin problemas)
        const { width, height } = this.scale;
        const centerX = width / 2;
        const firstButtonY = height / 2 - 60;
        const buttonSpacing = 70;

        // TODO: cambiar por una imagen?
        // título del juego
        this.add.text(width / 2, 100, 'Volley Clash', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        //// BOTÓN JUGAR ////
        const playButton = this.add
            .sprite(centerX, firstButtonY, 'botonSinSeleccionar')
            .setScale(0.7)
            .setInteractive({ useHandCursor: true });

        const playText = this.add.text(0, 0, 'Jugar', {
            fontSize: '20px',
            color: '#000000'
        });
        Phaser.Display.Align.In.Center(playText, playButton);

        playButton.on('pointerover', () => {
            playButton.setTexture('botonSeleccionado');
        });
        playButton.on('pointerout', () => {
            playButton.setTexture('botonSinSeleccionar');
        });

        playButton.on('pointerdown', () => {
            playButton.setTexture('botonSeleccionado');
        });
        playButton.on('pointerup', () => {
            // al soltar el click se pasa a la escena de selección de modo de juego
            // (local o en red)
            this.scene.start('ModeGame_Scene');
        });
        ////////

        //// BOTÓN CONFIGURACIÓN ////
        const configButton = this.add
            .sprite(centerX, firstButtonY + buttonSpacing, 'botonSinSeleccionar')
            .setScale(0.7)
            .setInteractive({ useHandCursor: true });

        const configText = this.add.text(0, 0, 'Configuración', {
            fontSize: '20px',
            color: '#000000'
        });
        Phaser.Display.Align.In.Center(configText, configButton);

        configButton.on('pointerover', () => {
            configButton.setTexture('botonSeleccionado');
        });
        configButton.on('pointerout', () => {
            configButton.setTexture('botonSinSeleccionar');
        });

        configButton.on('pointerdown', () => {
            configButton.setTexture('botonSeleccionado');
        });
        configButton.on('pointerup', () => {
            // se pasa a la escena de configuración
            this.scene.start('Configuration_Scene');
        });
        ////////

        //// BOTÓN CRÉDITOS ////
        const creditsButton = this.add
            .sprite(centerX, firstButtonY + buttonSpacing * 2, 'botonSinSeleccionar')
            .setScale(0.7)
            .setInteractive({ useHandCursor: true });

        const creditsText = this.add.text(0, 0, 'Créditos', {
            fontSize: '20px',
            color: '#000000'
        });
        Phaser.Display.Align.In.Center(creditsText, creditsButton);

        creditsButton.on('pointerover', () => {
            creditsButton.setTexture('botonSeleccionado');
        });
        creditsButton.on('pointerout', () => {
            creditsButton.setTexture('botonSinSeleccionar');
        });

        creditsButton.on('pointerdown', () => {
            creditsButton.setTexture('botonSeleccionado');
        });

        creditsButton.on('pointerup', () => {
            // se pasa a la escena de créditos
            this.scene.start('Credits_Scene');
        });
        ////////
    }
}

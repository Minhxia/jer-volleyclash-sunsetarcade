// Pantalla del Menú Principal
import Phaser from 'phaser';

export class Menu_Scene extends Phaser.Scene {
    constructor() {
        super('Menu_Scene');
    }

    preload() {
        // se cargan las imágenes de los botones
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE_G_SELECCIONADO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_G.png');
        this.load.image('fondoMenuPrincipal', 'ASSETS/FONDOS/MENU_PRINCIPAL.png');

        // Logo
        this.load.image('logoEmpresa', 'ASSETS/LOGO/logo_empresa.png');

        // Audio
        this.load.audio('sonidoGeneral', 'ASSETS/SONIDO/SONIDO1.mp3');
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {        
        const style = this.game.globals.defaultTextStyle;
        const volume = parseFloat(localStorage.getItem('volume')) || 1;
        if (!this.game.globals.music) {
            // Solo crearla la primera vez
            this.game.globals.music = this.sound.add('sonidoGeneral', { loop: true, volume });
            this.game.globals.music.play();
        } else {
            // Si ya existe, solo actualizar volumen
            this.game.globals.music.setVolume(volume);
        }
        // posiciones base para los botones del menú
        // (así se puede cambiar el tamaño sin problemas)
        const { width, height } = this.scale;
        const centerX = width / 2;
        const firstButtonY = height / 2 - 60;
        const buttonSpacing = 70;
        const mitadDerechaX = centerX + (centerX / 2);
        const background = this.add.image(0, 0, 'fondoMenuPrincipal')
        .setOrigin(0)
        .setDepth(-1);
        // TODO: cambiar por una imagen?
        // título del juego
        this.add.text(mitadDerechaX, 100, 'Volley Clash', {
            ...style,
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        //// BOTÓN JUGAR ////
        const playButton = this.add
            .sprite(mitadDerechaX, firstButtonY, 'botonSinSeleccionar')
            .setScale(2)
            .setInteractive({ useHandCursor: true });

        const playText = this.add.text(0, 0, 'Jugar', {
            ...style,
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
            .sprite(mitadDerechaX, firstButtonY + buttonSpacing, 'botonSinSeleccionar')
            .setScale(2)
            .setInteractive({ useHandCursor: true });

        const configText = this.add.text(0, 0, 'Configuración', {
            ...style,
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
            .sprite(mitadDerechaX, firstButtonY + buttonSpacing * 2, 'botonSinSeleccionar')
            .setScale(2)
            .setInteractive({ useHandCursor: true });

        const creditsText = this.add.text(0, 0, 'Créditos', {
            ...style,
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

        // Logo de Empresa
        this.add.image(this.scale.width - 20, this.scale.height - 20, 'logoEmpresa')
            .setScale(0.5)
            .setOrigin(1, 1) // Para que el punto de referencia sea la esquina inferior derecha

        // Función para añadir sonido de clic con volumen global
        const addClickSound = (button) => {
            button.on('pointerdown', () => {
                const volume = parseFloat(localStorage.getItem('volume')) || 1;
                this.sound.play('sonidoClick', { volume });
            });
        };

        addClickSound(playButton);
        addClickSound(configButton);
        addClickSound(creditsButton);
    }
}

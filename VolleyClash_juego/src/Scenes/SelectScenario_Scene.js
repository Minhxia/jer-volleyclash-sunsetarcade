//Pantalla de Seleccion de escenario
import Phaser from 'phaser';

export class SelectScenario_Scene extends Phaser.Scene {
    constructor() {
        super('SelectScenario_Scene');
    }

    preload() {
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
        this.load.image('botonSimple', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonSimpleSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');

        this.load.image('Gym', 'ASSETS/FONDOS/GIMNASIO.png');
        this.load.image('Playa', 'ASSETS/FONDOS/PLAYA.png');
        this.load.image('Jardin', 'ASSETS/FONDOS/JARDIN.png');

        // Sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    init(data) {
        this.player1 = data.player1;
        this.player2 = data.player2;
    }

    create() {
        const { width, height } = this.scale;
        const style = this.game.globals.defaultTextStyle;

        const background = this.add.image(0, 0, 'fondo')
        .setOrigin(0)
        .setDepth(-1);

        // Titulo
        this.add.text(width/2, 50, 'Selecciona Escenario', {
            ...style,
            fontSize: '40px',
            color: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Imagen del escenario seleccionado
        this.selectedScenario = 'Gym'; // Gym por defecto
        this.selectedImage = this.add.image(width/2, 240, this.selectedScenario).setScale(0.5);

        // Escenarios
        const escenarios = ['Gym', 'Playa', 'Jardin'];
        const spacing = 200; // espacio entre botones
        const startX = width / 2 - spacing;

        escenarios.forEach((nombre, i) => {
            const boton = this.add.image(startX + i * spacing, 440, 'botonSinSeleccionar')
                .setInteractive()
                .setScale(1.75);

            // Texto con el nombre del escenario
            const texto = this.add.text(0, 0, nombre, { ...style, fontSize: '24px', color: '#000' });
            Phaser.Display.Align.In.Center(texto, boton);

            this.addClickSound(boton);

            boton.on('pointerover', () => boton.setTexture('botonSeleccionado'));
            boton.on('pointerout', () => {
                if (this.selectedScenario !== nombre) {
                    boton.setTexture('botonSinSeleccionar');
                }
            });
            boton.on('pointerdown', () => {
                this.selectedScenario = nombre;
                this.selectedImage.setTexture(nombre).setScale(0.5);
            });
            boton.on('pointerup', () => boton.setTexture('botonSinSeleccionar'));
        });

        // Boton Siguiente
        const nextButton = this.add.image(width/2, 500, 'botonSimple')
            .setInteractive()
            .setScale(1.5);
        const nextText = this.add.text(0, 0, 'Siguiente', { ...style, fontSize: '12px', color: '#000' });
        Phaser.Display.Align.In.Center(nextText, nextButton);

        nextButton.on('pointerover', () => nextButton.setTexture('botonSimpleSeleccionado'));
        nextButton.on('pointerout', () => nextButton.setTexture('botonSimple'));
        nextButton.on('pointerdown', () => nextButton.setTexture('botonSimpleSeleccionado'));
        nextButton.on('pointerup', () => {
            // Pasar todos los datos a la siguiente escena
            this.scene.start('Game_Scene', {
                player1: this.player1,
                player2: this.player2,
                selectedScenario: this.selectedScenario
            });
        });
        
        // Boton Volver
        const backX = width * 0.06;
        const backY = height * 0.08;

        const backButton = this.add
            .sprite(backX, backY, 'botonVolver')
            .setScale(1)
            .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('SelecPlayer_Scene');
        });

        this.addClickSound(nextButton);
        this.addClickSound(backButton);
    }

    addClickSound(button) {
        button.on('pointerdown', () => {
            const volume = parseFloat(localStorage.getItem('volume')) || 1;
            this.sound.play('sonidoClick', { volume });
        });
    }
}
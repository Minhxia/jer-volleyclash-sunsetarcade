//Pantalla de Seleccion de jugador
import Phaser from 'phaser';

export class SelectPlayer_Scene extends Phaser.Scene {
    constructor() {
        super('SelecPlayer_Scene');
    }

    preload() {
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');

        this.load.image('personajeA', '/ASSETS/PERSONAJES/personajes_a.png');
        this.load.image('personajeB', '/ASSETS/PERSONAJES/personajes_b.png');
        this.load.image('personajeC', 'ASSETS/PERSONAJES/personaje_c.png');
    }

    create() {
        this.add.text(100, 50, 'Personaje', { fontSize: '24px', color: '#ffffff' });

        // Imagen del personaje
        this.selectedCharacter = 'personajeA';
        this.characterImage = this.add.image(400, 100, this.selectedCharacter).setScale(1.5);

        // Entrada de nombre
        this.add.text(100, 120, 'Intruduce tu Nombre de Usuario:', { fontSize: '18px', color: '#ffffff' });
        const nameInput = this.add.dom(100, 150).createFromHTML('<input type="text" name="nombre" placeholder="Nombre jugador" style="font-size:16px; padding:5px;">');

        // Seleccion de personaje pequeño
        this.add.text(100, 250, 'Selecciona Personaje:', { fontSize: '16px', color: '#ffffff' });

        const personajes = ['personajeA', 'personajeB', 'personajeC'];
        personajes.forEach((nombre, i) => {
            const boton = this.add.sprite(150 + i * 150, 300, nombre).setInteractive().setScale(0.5);

            boton.on('pointerdown', () => {
                this.selectedCharacter = nombre;
                this.characterImage.setTexture(nombre);
            });
        });

        // Boton Siguiente
        const nextButton = this.add.sprite(600, 400, 'botonSinSeleccionar').setInteractive().setScale(0.8);
        const nextText = this.add.text(0, 0, 'Siguiente', { fontSize: '20px', color: '#000' });
        Phaser.Display.Align.In.Center(nextText, nextButton);

        nextButton.on('pointerover', () => nextButton.setTexture('botonSeleccionado'));
        nextButton.on('pointerout', () => nextButton.setTexture('botonSinSeleccionar'));
        nextButton.on('pointerdown', () => this.scene.start('SelectScenario_Scene'));

        // Boton Volver
        const backButton = this.add.sprite(50, 550, 'botonVolver').setInteractive().setScale(0.5);
        backButton.on('pointerdown', () => this.scene.start('ModeGame_Scene'));
    }
}
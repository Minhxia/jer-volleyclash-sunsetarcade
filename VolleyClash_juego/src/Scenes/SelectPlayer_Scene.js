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
        // Texto del personaje
        this.add.text(160, 60, 'Personaje', { fontSize: '24px'});

        // Imagen del personaje
        this.selectedCharacter = 'personajeA';
        this.characterImage = this.add.image(220, 240, this.selectedCharacter).setScale(1.2);

        // Seleccion de personaje pequeño
        this.add.text(480, 210, 'Selecciona Personaje:', { fontSize: '16px', color: '#ffffff' });

        const personajes = ['personajeA', 'personajeB', 'personajeC'];
        personajes.forEach((nombre, i) => {
            const boton = this.add.image(480 + i * 100, 310, nombre).setInteractive().setScale(0.5);

            boton.on('pointerdown', () => {
                this.selectedCharacter = nombre;
                this.characterImage.setTexture(nombre);
            });
        });

        // Texto de usuario
        this.add.text(480, 60, 'Introduce tu Nombre:', { fontSize: '16px'});

        // Nombre de usuario
        this.nameInput = this.add.dom(575, 120).createFromHTML(`
            <input type="text" id="playerName" 
                placeholder="Introduce tu nombre" 
                style="width: 180px; padding: 5px; font-size: 16px; border-radius: 5px;">
        `);

        // Boton Siguiente
        const nextButton = this.add.image(700, 420, 'botonSinSeleccionar').setInteractive().setScale(0.4);
        const nextText = this.add.text(0, 0, 'Siguiente', { fontSize: '10px', color: '#000' });
        Phaser.Display.Align.In.Center(nextText, nextButton);

        nextButton.on('pointerover', () => nextButton.setTexture('botonSeleccionado'));
        nextButton.on('pointerout', () => nextButton.setTexture('botonSinSeleccionar'));
        nextButton.on('pointerdown', () => nextButton.setTexture('botonSeleccionado'));
        nextButton.on('pointerup', () => {
            const nombre = this.nameInput.node.querySelector('input').value;
            console.log("Nombre de usuario:", nombre);

            this.scene.start('SelectScenario_Scene', { 
                playerName: nombre,
                character: this.selectedCharacter
            });
        });

        // Boton Volver
        const backButton = this.add.image(30, 420, 'botonVolver').setInteractive().setScale(0.1);
        backButton.on('pointerdown', () => this.scene.start('ModeGame_Scene'));
    }
}
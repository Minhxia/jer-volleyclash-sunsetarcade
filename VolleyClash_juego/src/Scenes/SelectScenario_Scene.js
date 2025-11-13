//Pantalla de Seleccion de escenario
import Phaser from 'phaser';

export class SelectScenario_Scene extends Phaser.Scene {
    constructor() {
        super('SelectScenario_Scene');
    }

    preload() {
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');

        this.load.image('gym', 'ASSETS/FONDOS/GIMNASIO.png');
        this.load.image('playa', 'ASSETS/FONDOS/PLAYA.png')
        this.load.image('jardin', 'ASSETS/FONDOS/JARDIN.png')
    }

    create() {
        this.add.text(250, 50, 'Selecciona Escenario', { fontSize: '28px'});

        // Imagen del escenario seleccionado
        this.selectedImage = this.add.image(300, 120, 'gym').setScale(0.5);

        // Escenarios
        const escenarios = ['gym', 'playa', 'jardin'];
        this.selectedScenario = 'gym';

        escenarios.forEach((nombre, i) => {
            const boton = this.add.sprite(150 + i * 150, 250, 'botonSinSeleccionar').setInteractive().setScale(0.8);
            const texto = this.add.text(0, 0, `Escenario ${i + 1}`, { fontSize: '16px', color: '#000' });
            Phaser.Display.Align.In.Center(texto, boton);

            boton.on('pointerover', () => boton.setTexture('botonSeleccionado'));
            boton.on('pointerout', () => {
                if (this.selectedScenario !== nombre) {
                    boton.setTexture('botonSinSeleccionar');
                }
            });

            boton.on('pointerdown', () => {
                this.selectedScenario = nombre;
                this.selectedImage.setTexture(nombre);
            });

            boton.setName(`boton${i}`);
        });

        // Boton Siguiente
        const nextButton = this.add.sprite(300, 400, 'botonSinSeleccionar').setInteractive().setScale(0.8);
        const nextText = this.add.text(0, 0, 'Siguiente', { fontSize: '20px', color: '#000' });
        Phaser.Display.Align.In.Center(nextText, nextButton);

        nextButton.on('pointerover', () => nextButton.setTexture('botonSeleccionado'));
        nextButton.on('pointerout', () => nextButton.setTexture('botonSinSeleccionar'));
        nextButton.on('pointerdown', () => this.scene.start('ModeGame_Scene'));

        // Boton Volver
        const backButton = this.add.sprite(50, 550, 'botonVolver').setInteractive().setScale(0.5);
        backButton.on('pointerdown', () => this.scene.start('SelecPlayer_Scene'));
    }
}
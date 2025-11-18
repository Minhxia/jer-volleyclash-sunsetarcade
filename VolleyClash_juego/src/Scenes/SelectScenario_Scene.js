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
        this.add.text(230, 10, 'Selecciona Escenario', { fontSize: '28px'});

        // Imagen del escenario seleccionado
        this.selectedImage = this.add.image(400, 180, 'gym').setScale(1.2);

        // Escenarios
        const escenarios = ['gym', 'playa', 'jardin'];

        escenarios.forEach((nombre, i) => {
            const boton = this.add.image(190 + i * 200, 330, 'botonSinSeleccionar').setInteractive().setScale(0.6);
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
            boton.on('pointerup', () => boton.setTexture('botonSinSeleccionar'));
            boton.setName(`boton${i}`);
        });

        // Boton Siguiente
        const nextButton = this.add.image(700, 420, 'botonSinSeleccionar').setInteractive().setScale(0.4);
        const nextText = this.add.text(0, 0, 'Siguiente', { fontSize: '10px', color: '#000' });
        Phaser.Display.Align.In.Center(nextText, nextButton);

        nextButton.on('pointerover', () => nextButton.setTexture('botonSeleccionado'));
        nextButton.on('pointerout', () => nextButton.setTexture('botonSinSeleccionar'));
        nextButton.on('pointerdown', () => nextButton.setTexture('botonSeleccionado'));
        nextButton.on('pointerup', () => this.scene.start('ModeGame_Scene'));
        
        // Boton Volver
        const backButton = this.add.image(30, 420, 'botonVolver').setInteractive().setScale(0.1);
        backButton.on('pointerdown', () => this.scene.start('SelecPlayer_Scene'));
    }
}
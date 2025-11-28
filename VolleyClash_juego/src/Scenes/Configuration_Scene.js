// Pantalla de Configuración
import Phaser from 'phaser';

export class Configuration_Scene extends Phaser.Scene {
    constructor() {
        super('Configuration_Scene');
    }

    preload() {
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;

        // TODO: cambiarlo?
        // título de la escena de configuración
        this.add.text(centerX, height * 0.18, 'Configuración', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // TODO: hacer la funcionalidad, ahora solo hay texto
        this.add.text(centerX, height * 0.35, 'Controles', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        //// BOTÓN VOLVER ////
        // arriba a la izquierda
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

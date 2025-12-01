// Pantalla de Créditos
import Phaser from 'phaser';

export class Credits_Scene extends Phaser.Scene {
    constructor() {
        super('Credits_Scene');
    }

    preload() {
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('logo', 'ASSETS/LOGO/Logo.png');
    }

    create() {
        // posiciones base para los botones del menú
        const style = this.game.globals.defaultTextStyle;

        const background = this.add.image(0, 0, 'fondo')
        .setOrigin(0)
        .setDepth(-1);
        // (así se puede cambiar el tamaño sin problemas)
        const { width, height } = this.scale;
        const centerX = width / 2;

        // TODO: cambiar por una imagen?
        // título de la escena de créditos
        this.add.text(centerX, 80, 'Créditos', {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // TODO: ponerlo más bonito
        // miembros del equipo
        const nombresEquipo = [
            'GRUPO 5 - SUNSET ARCADE',
            'Sara Bueno Esteban',
            'Antonio Morán Barrera',
            'Cristine Nioka Tewo',
            'Álvaro Ibáñez Montero'
        ];
        // se muestran los nombres centrados
        const inicioY = 150;
        const separacion = 30;

        nombresEquipo.forEach((nombre, index) => {
            this.add.text(centerX, inicioY + index * separacion, nombre, {
                ...style,
                fontSize: '20px',
                color: '#5f0000ff'
            }).setOrigin(0.5);
        });

        //// BOTÓN VOLVER ////
        // arriba a la izquierda
        const backX = width * 0.06;
        const backY = height * 0.08;

        const backButton = this.add
            .sprite(backX, backY, 'botonVolver')
            .setScale(1)
            .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            // vuelve al menú principal
            this.scene.start('Menu_Scene');
        });

        this.add.image(width / 2, 400, 'logo').setOrigin(0.5).setScale(1.2);
    }
}

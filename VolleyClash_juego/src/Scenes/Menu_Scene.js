// Pantalla del menú de inicio
import Phaser from 'phaser';

export class Menu_Scene extends Phaser.Scene {
    constructor() {
        super('Menu_Scene');
    }

    preload() {
        // sprite del botón (de momento, se usa el mismo para todos)
        this.load.image('baseButton', 'assets_temp/ui/boton_generico.png');
    }

    create() {
        // el tamaño del juego se utiliza para colocar/centrar los botones
        const { width, height } = this.scale;

        ///// BOTONES /////
        const playButton = this.add.image(width / 2, height / 2 - 60, 'baseButton')
            .setInteractive({ useHandCursor: true });

        const configButton = this.add.image(width / 2, height / 2, 'baseButton')
            .setInteractive({ useHandCursor: true });

        const creditsButton = this.add.image(width / 2, height / 2 + 60, 'baseButton')
            .setInteractive({ useHandCursor: true });

        // texto encima de cada botón
        this.add.text(width / 2, height / 2 - 60, 'Jugar', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, 'Configuración', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 60, 'Créditos', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // efecto al pasar el ratón por encima de un botón
        [playButton, configButton, creditsButton].forEach(button => {
            button.on('pointerover', () => button.setScale(1.05));
            button.on('pointerout',  () => button.setScale(1));
        });

        //////////
        
    }
}
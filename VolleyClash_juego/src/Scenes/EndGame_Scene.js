//Pantalla de Fin
import Phaser from 'phaser';
import { createUIButton } from '../UI/Buttons.js';

export class EndGame_Scene extends Phaser.Scene {
    constructor() {
        super('EndGame_Scene');
    }

    init(data) {
        this.winner = data.winner;
        this.player1 = data.player1;
        this.player2 = data.player2;
    }
    preload() {
        // imágenes fondo y ui
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE_G_SELECCIONADO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_G.png');

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() { 
        const { width, height } = this.scale;
        const style = this.game.globals.defaultTextStyle;

        const charP1 = this.player1.name;
        const charP2 = this.player2.name;

        // Fondo
        this.add.image(0, 0, 'fondo').setOrigin(0).setDepth(-1);

        // Título
        this.add.text(width / 2, height * 0.18, "¡Fin del partido!", {
            ...style,
            fontSize: '42px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        const winnerTextY = height * 0.36;
        const spriteRowY = height * 0.52;
        const buttonY = height * 0.90;
        const spriteOffsetX = width * 0.2;

        // Texto indicando el ganador
        const winnerText =
            this.winner === "player1"
                ? "Victoria de: " + charP1
                : "Victoria de: " + charP2;

        this.add.text(width / 2, winnerTextY, winnerText, {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // Huecos para sprites de ganador y perdedor (animaciones futuras)
        this.winnerSpriteSlot = this.add.container(width / 2 - spriteOffsetX, spriteRowY);
        this.loserSpriteSlot = this.add.container(width / 2 + spriteOffsetX, spriteRowY);


        // botón para volver al menú principal
        const buttonTextStyle = {
            ...style,
            fontSize: '28px',
            color: '#000000'
        };
        createUIButton(this, {
            x: width / 2,
            y: buttonY,
            label: 'Volver',
            onClick: () => {
                this.scene.start('Menu_Scene');
            },
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });
    }
}

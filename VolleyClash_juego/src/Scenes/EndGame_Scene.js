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

        // Fondo (color crema)
        this.add.image(0, 0, 'fondo').setOrigin(0).setDepth(-1);

        // Título principal
        this.add.text(width / 2, height * 0.18, "¡FIN DEL PARTIDO!", {
            ...style,
            fontSize: '64px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // Texto del ganador
        const winnerText =
            this.winner === "player1"
                ? "Ganador: " + charP1
                : "Ganador: " + charP2;

        this.add.text(width / 2, height * 0.40, winnerText, {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // botón para volver al menú principal
        const buttonTextStyle = {
            ...style,
            fontSize: '26px',
            color: '#000000'
        };
        createUIButton(this, {
            x: width / 2,
            y: height * 0.60,
            label: 'Volver a inicio',
            textStyle: buttonTextStyle,
            scale: 3,
            onClick: () => {
                this.scene.start('Menu_Scene');
            }
        });
    }
}
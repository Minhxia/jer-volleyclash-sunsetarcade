//Pantalla de Fin
import Phaser from 'phaser';

export class EndGame_Scene extends Phaser.Scene {
    constructor() {
        super('EndGame_Scene');
    }

    init(data) {
        this.winner = data.winner; // player1 o player2
        this.player1 = data.player1;
        this.player2 = data.player2;
    }
    preload() {
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE_G_SELECCIONADO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_G.png');
    }

    create() { 
        const { width, height } = this.scale;
        const style = this.game.globals.defaultTextStyle;


        const charP1 = this.player1.name;
        const charP2 = this.player2.name;

        // Fondo color crema
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
                ? "Ganador:" + charP1
                : "Ganador:" + charP2;

        this.add.text(width / 2, height * 0.40, winnerText, {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // Botón naranja para volver al menú

        const volverButton = this.add
            .sprite(width / 2,
            height * 0.60, 'botonSinSeleccionar')
            .setScale(3)
            .setInteractive({ useHandCursor: true });

        const menuText = this.add.text(0, 0 * 0.52, "Volver a inicio", {
            ...style,
            fontSize: '26px',
            color: '#000000'
        });

            Phaser.Display.Align.In.Center(menuText, volverButton);
            
        // Interacción del botón
        volverButton.on("pointerdown", () => {
            this.scene.start("Menu_Scene");
        });

        // Efecto hover
        volverButton.on("pointerover", () => {
            volverButton.setTexture('botonSeleccionado');
        });
        volverButton.on("pointerout", () => {
            volverButton.setTexture('botonSinSeleccionar');
        });

    }
}
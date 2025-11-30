//Pantalla de Fin
import Phaser from 'phaser';

export class EndGame_Scene extends Phaser.Scene {
    constructor() {
        super('EndGame_Escene');
    }

    init(data) {
        this.winner = data.winner; // player1 o player2
    }

    create() { 
        const { width, height } = this.scale;

        // Fondo color crema
        this.cameras.main.setBackgroundColor("#fae9d6");

        // Título principal
        this.add.text(width / 2, height * 0.18, "¡FIN DEL PARTIDO!", {
            fontSize: "64px",
            color: "#000000",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Texto del ganador
        const winnerText =
            this.winner === "player1"
                ? "Ganador: Jugador 1"
                : "Ganador: Jugador 2";

        this.add.text(width / 2, height * 0.40, winnerText, {
            fontSize: "32px",
            color: "#000000",
            fontFamily: "Arial"
        }).setOrigin(0.5);

        // Botón naranja
        const buttonBG = this.add.rectangle(
            width / 2,
            height * 0.60,
            280,
            70,
            0xfbb04d
        ).setInteractive();

        const buttonText = this.add.text(width / 2, height * 0.60, "Volver a inicio", {
            fontSize: "26px",
            color: "#ffffff",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Interacción del botón
        buttonBG.on("pointerdown", () => {
            this.scene.start("Menu_Scene");
        });

        // Efecto hover
        buttonBG.on("pointerover", () => {
            buttonBG.setFillStyle(0xf6a427);
        });
        buttonBG.on("pointerout", () => {
            buttonBG.setFillStyle(0xfbb04d);
        });

    }
}
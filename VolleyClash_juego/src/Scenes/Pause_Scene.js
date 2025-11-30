//Pantalla de Pausa
import Phaser from 'phaser';

export class Pause_Scene extends Phaser.Scene {
    constructor() {
        super('Pause_Scene');
    }

   preload() {
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
    }

    create() { 
        const { width, height } = this.scale;
        const centerX = width / 2;

        // 📌 Fondo crema igual que EndGame
        this.cameras.main.setBackgroundColor("#fae9d6");

        // 📌 TÍTULO PRINCIPAL → “PAUSA”
        this.add.text(centerX, height * 0.18, 'PAUSA', {
            fontSize: '48px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 📌 Subtítulo → “Controles”
        this.add.text(centerX, height * 0.32, 'Controles', {
            fontSize: '26px',
            color: '#000000',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // --- BOTÓN CONTINUAR ---
        const continuarBG = this.add.rectangle(
            centerX,
            height * 0.52,
            260,
            60,
            0xfbb04d
        ).setInteractive();

        const continuarText = this.add.text(centerX, height * 0.52, "Continuar", {
            fontSize: "24px",
            color: "#ffffff",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5);

        continuarBG.on("pointerdown", () => {
            this.scene.stop();              // quitamos la escena de pausa
            this.scene.resume("Game_Scene"); // volvemos al juego
        });

        continuarBG.on("pointerover", () => continuarBG.setFillStyle(0xf6a427));
        continuarBG.on("pointerout", () => continuarBG.setFillStyle(0xfbb04d));

        // --- BOTÓN VOLVER AL MENÚ ---
        const menuBG = this.add.rectangle(
            centerX,
            height * 0.66,
            260,
            60,
            0xfbb04d
        ).setInteractive();

        const menuText = this.add.text(centerX, height * 0.66, "Menú principal", {
            fontSize: "24px",
            color: "#ffffff",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5);

        menuBG.on("pointerdown", () => {
            this.scene.stop("Game_Scene");
            this.scene.start("Menu_Scene");
        });

        menuBG.on("pointerover", () => menuBG.setFillStyle(0xf6a427));
        menuBG.on("pointerout", () => menuBG.setFillStyle(0xfbb04d));

        // --- BOTÓN VOLVER ARRIBA A LA IZQUIERDA ---
        const backX = width * 0.06;
        const backY = height * 0.08;

        const backButton = this.add
            .sprite(backX, backY, 'botonVolver')
            .setScale(0.1)
            .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('Game_Scene');
        });

    }
}
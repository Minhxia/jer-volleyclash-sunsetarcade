//Pantalla de Pausa
import Phaser from 'phaser';

export class Pause_Scene extends Phaser.Scene {
    constructor() {
        super('Pause_Scene');
    }

    preload() {
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE_G_SELECCIONADO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_G.png');

        // Sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const style = this.game.globals.defaultTextStyle; 
        const { width, height } = this.scale;
        const centerX = width / 2;

        this.add.image(0, 0, 'fondo').setOrigin(0).setDepth(-1);

        //TÍTULO PRINCIPAL → “PAUSA”
        this.add.text(centerX, height * 0.18, 'PAUSA', {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // --- BOTÓN CONTINUAR ---
        const continuarBG = this.add
            .sprite(centerX, height * 0.52, 'botonSinSeleccionar')
            .setScale(2)
            .setInteractive({ useHandCursor: true });

        const continuarText = this.add.text(0, 0 * 0.52, "Continuar", {
            ...style,
           fontSize: '20px',
            color: '#000000'
        });
        Phaser.Display.Align.In.Center(continuarText, continuarBG);
      

        continuarBG.on("pointerdown", () => {
            this.scene.stop();              // quitamos la escena de pausa
            this.scene.resume("Game_Scene"); // volvemos al juego
            
        });

        continuarBG.on("pointerover", () => continuarBG.setTexture('botonSeleccionado'));
        continuarBG.on("pointerout", () => continuarBG.setTexture('botonSinSeleccionar'));

        // --- BOTÓN VOLVER AL MENÚ ---
       const menuBotton = this.add
            .sprite(centerX, height * 0.66, 'botonSinSeleccionar')
            .setScale(2)
            .setInteractive({ useHandCursor: true });

        const menuText = this.add.text(0, 0 * 0.52, "Menú Principal", {
            ...style,
            fontSize: '20px',
            color: '#000000'
        });
        Phaser.Display.Align.In.Center(menuText, menuBotton);

        menuBotton.on("pointerdown", () => {
            // Limpiar listeners y keys del teclado de Game_Scene
            const gameScene = this.scene.get("Game_Scene");
            if (gameScene) {
                gameScene.input.keyboard.removeAllListeners();
                gameScene.input.keyboard.removeAllKeys();
            }

            this.scene.stop("Game_Scene");
            this.scene.start("Menu_Scene");
        });

        menuBotton.on("pointerover", () => menuBotton.setTexture('botonSeleccionado'));
        menuBotton.on("pointerout", () => menuBotton.setTexture('botonSinSeleccionar'));

        // Función para añadir sonido de clic con volumen global
        const addClickSound = (button) => {
            button.on('pointerdown', () => {
                const volume = parseFloat(localStorage.getItem('volume')) || 1;
                this.sound.play('sonidoClick', { volume });
            });
        };

        addClickSound(menuBotton);
        addClickSound(continuarBG);
    }
}
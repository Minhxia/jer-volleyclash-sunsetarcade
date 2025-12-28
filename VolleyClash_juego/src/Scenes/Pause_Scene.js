//Pantalla de Pausa
import Phaser from 'phaser';
import { createUIButton } from '../UI/Buttons.js';

export class Pause_Scene extends Phaser.Scene {
    constructor() {
        super('Pause_Scene');
    }

    preload() {
        // Imágenes fondo y ui
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

        // Título
        this.add.text(centerX, height * 0.18, 'PAUSA', {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        const buttonTextStyle = {
            ...style,
            fontSize: '20px',
            color: '#000000'
        };

        // botón Continuar
        createUIButton(this, {
            x: centerX,
            y: height * 0.52,
            label: 'Continuar',
            textStyle: buttonTextStyle,
            scale: 2,
            onClick: () => {
                this.scene.stop();
                this.scene.resume('Game_Scene');
            }
        });

        // botón Menú Principal
        createUIButton(this, {
            x: centerX,
            y: height * 0.66,
            label: 'Menú Principal',
            textStyle: buttonTextStyle,
            scale: 2,
            onClick: () => {
                const gameScene = this.scene.get('Game_Scene');
                if (gameScene) {
                    gameScene.input.keyboard.removeAllListeners();
                    gameScene.input.keyboard.removeAllKeys();
                }

                this.scene.stop('Game_Scene');
                this.scene.start('Menu_Scene');
            }
        });
    }
}
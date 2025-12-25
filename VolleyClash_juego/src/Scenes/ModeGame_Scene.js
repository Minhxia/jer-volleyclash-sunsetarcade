// Pantalla para elegir Modo de Juego
import Phaser from 'phaser';
import { createUIButton, createIconButton } from '../UI/Buttons.js';
import { applyStoredVolume } from '../UI/Audio.js';

export class ModeGame_Scene extends Phaser.Scene {
    constructor() {
        super('ModeGame_Scene');
    }

    preload() {
        // botones
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');

        // fondo
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const { width, height } = this.scale;
        
        const style = this.game.globals?.defaultTextStyle ?? {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#000000',
        };

        // se aplica el volumen
        applyStoredVolume(this);

        // fondo
        this.add.image(0, 0, 'fondo')
            .setOrigin(0)
            .setDepth(-1)
            .setDisplaySize(width, height);

        // título
        this.add
            .text(width / 2, height * 0.18, 'Modo de Juego', {
                ...style,
                fontSize: '40px',
                color: '#000000',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        // layout
        const buttonY = height * 0.5;
        const spacing = Math.min(280, width * 0.3);
        const startX = width / 2 - spacing / 2;

        const buttonTextStyle = {
            ...style,
            fontSize: '24px',
            color: '#000000',
        };

        const startMode = (mode) => {
            // se pasa el modo a la siguiente escena
            this.scene.start('SelecPlayer_Scene', { mode });
        };

        // Botón LOCAL
        createUIButton(this, {
            x: startX,
            y: buttonY,
            label: 'Local',
            onClick: () => startMode('local'),
            scale: 2,
            textureNormal: 'botonSinSeleccionar',
            textureHover: 'botonSeleccionado',
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        // Botón RED
        createUIButton(this, {
            x: startX + spacing,
            y: buttonY,
            label: 'Red',
            onClick: () => startMode('network'),
            scale: 2,
            textureNormal: 'botonSinSeleccionar',
            textureHover: 'botonSeleccionado',
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        // Botón volver
        createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            clickSoundKey: 'sonidoClick',
            onClick: () => this.scene.start('Menu_Scene'),
        });
    }
}

// Pantalla del Menú Principal
import Phaser from 'phaser';
import { createUIButton } from '../UI/Buttons.js';
import { ensureLoopingMusic } from '../UI/Audio.js';

export class Menu_Scene extends Phaser.Scene {
    constructor() {
        super('Menu_Scene');
    }

    preload() {
        // botones
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE_G_SELECCIONADO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_G.png');
        this.load.image('fondoMenuPrincipal', 'ASSETS/FONDOS/MENU_PRINCIPAL.png');

        // logo
        this.load.image('logoEmpresa', 'ASSETS/LOGO/logo_empresa.png');

        // audio
        this.load.audio('sonidoGeneral', 'ASSETS/SONIDO/SONIDO1.mp3');
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        // música de fondo
        ensureLoopingMusic(this, 'sonidoGeneral', { loop: true });

        // estilo base del texto
        const style = this.game.globals?.defaultTextStyle ?? {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        };
        
        // layout
        const { width, height } = this.scale;
        const centerX = width / 2;
        const rightHalfX = centerX + (centerX / 2);

        // fondo ajustado al canvas
        const background = this.add.image(0, 0, 'fondoMenuPrincipal')
            .setOrigin(0)
            .setDepth(-1);
        background.setDisplaySize(width, height);
        
        // título del juego
        this.add.text(rightHalfX, 100, 'Volley Clash', {
            ...style,
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        //// BOTONES ////
        const firstButtonY = height / 2 - 60;
        const buttonSpacing = 70;
        const buttonTextStyle = { ...style, fontSize: '20px', color: '#000000' };

        // botón Jugar
        createUIButton(this, {
            x: rightHalfX,
            y: firstButtonY,
            label: 'Jugar',
            onClick: () => this.scene.start('ModeGame_Scene'),
            textStyle: buttonTextStyle,
        });

        // botón Configuración
        createUIButton(this, {
            x: rightHalfX,
            y: firstButtonY + buttonSpacing,
            label: 'Configuración',
            onClick: () => this.scene.start('Configuration_Scene'),
            textStyle: buttonTextStyle,
        });

        // botón Créditos
        createUIButton(this, {
            x: rightHalfX,
            y: firstButtonY + buttonSpacing * 2,
            label: 'Créditos',
            onClick: () => this.scene.start('Credits_Scene'),
            textStyle: buttonTextStyle,
        });
        /////////

        // logo de la empresa
        this.add.image(this.scale.width - 20, this.scale.height - 20, 'logoEmpresa')
            .setScale(0.5)
            .setOrigin(1, 1);
    }
}

// Pantalla del Menú Principal
import Phaser from 'phaser';
import { createUIButton } from '../UI/Buttons.js';
import { ensureLoopingMusic, applyStoredVolume } from '../UI/Audio.js';

export class Menu_Scene extends Phaser.Scene {
    constructor() {
        super('Menu_Scene');
    }

    preload() {
        // fondo
        this.load.image('fondoMenuPrincipal', 'ASSETS/FONDOS/MENU_PRINCIPAL.png');

        // botones
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE_G_SELECCIONADO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_G.png');

        // logo
        this.load.image('logoEmpresa', 'ASSETS/LOGO/logo_empresa.png');

        // audio
        this.load.audio('sonidoGeneral', 'ASSETS/SONIDO/SONIDO1.mp3');
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        // música de fondo
        applyStoredVolume(this);
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
        this.add.text(rightHalfX, 115, 'Volley Clash', {
            ...style,
            fontSize: '68px',
            color: '#ffffff'
        }).setOrigin(0.5);

        //// BOTONES ////
        const firstButtonY = height / 2 - 63;
        const buttonSpacing = 70;
        const buttonTextStyle = { ...style, fontSize: '28px', color: '#000000' };

        // botón Jugar
        createUIButton(this, {
            x: rightHalfX,
            y: firstButtonY,
            label: 'Jugar',
            onClick: () => this.scene.start('ModeGame_Scene'),
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        // botón Tutorial
        createUIButton(this, {
            x: rightHalfX,
            y: firstButtonY + buttonSpacing,
            label: 'Tutorial',
            onClick: () => this.scene.start('Tutorial_Scene', { returnScene: 'Menu_Scene' }),
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        // botón Configuración
        createUIButton(this, {
            x: rightHalfX,
            y: firstButtonY + buttonSpacing * 2,
            label: 'Configuración',
            onClick: () => this.scene.start('Configuration_Scene'),
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        // botón Créditos
        createUIButton(this, {
            x: rightHalfX,
            y: firstButtonY + buttonSpacing * 3,
            label: 'Créditos',
            onClick: () => this.scene.start('Credits_Scene'),
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        // botón de cerrar sesión
        createUIButton(this, {
            x: width - 115,
            y: 40,
            label: 'Cerrar Sesión',
            onClick: () => { this.handleLogout() },
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });
        /////////

        // logo de la empresa
        this.add.image(this.scale.width - 20, this.scale.height - 20, 'logoEmpresa')
            .setScale(0.42)
            .setOrigin(1, 1);

        /////////
        // Estado del servidor
        this.connectionText = this.add.text(20, 20, 'Servidor: ONLINE', { fontSize: '16px', color: '#00ff00' });
        
        const onUpdateCount = (count) => {
            if (this.connectionText.active && this.connectionText) {
                this.connectionText.setText(`Servidor: ONLINE | Usuarios: ${count}`);
            }
        };

        this.game.events.on('update_online_count', onUpdateCount);

        this.events.once('shutdown', () => {
            this.game.events.off('update_online_count', onUpdateCount);
        });
    }

    async handleLogout() {
        const username = this.registry.get('username');
        
        try {
            // Avisar al servidor para que deje libre el puesto de Host
            await fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
        } catch (e) { console.error("Error en logout"); }

        // Limpiar local
        sessionStorage.removeItem('voley_username');
        sessionStorage.removeItem('voley_session_token');

        // Limpiar registry
        this.registry.destroy();

        // Volver a la pantalla de login
        this.scene.stop('Connection_Scene');
        this.scene.start('Logging_Scene');
    }
}
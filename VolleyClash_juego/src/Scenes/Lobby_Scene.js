//Pantalla de Lobby
import Phaser from 'phaser';
import { createUIButton, createIconButton } from '../UI/Buttons.js';

export class Lobby_Scene extends Phaser.Scene {
    constructor() {
        super('Lobby_Scene');
        this.isPlayerReady = false;
    }

    init(data) {
        // Recuperamos el modo, el rol y los datos de jugador
        this.mode = data.mode;
        this.isHost = data.isHost;
        this.player1 = data.player1; // Si es Host
        this.player2 = data.player2; // Si es Invitado
        
        console.log('Lobby iniciado como:', this.isHost ? 'Host' : 'Invitado');
    }

    preload() {
        // Imágenes fondo y ui
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('marco','ASSETS/UI/MARCOS/VACIOS/MARCOS_ESCENARIO.png')
        this.load.image('botonSimple', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonSimpleSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');

        // Sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const style = this.game.globals.defaultTextStyle; 
        const { width, height } = this.scale;
        const centerX = width / 2;

        this.add.image(0, 0, 'fondo').setOrigin(0).setDepth(-1);

        // Título
        this.add.text(centerX, height * 0.18, 'LOBBY', {
            ...style, fontSize: '40px', color: '#000', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Filtro del marco
        const frameY = height * 0.48;
        const frame = this.add.image(centerX, frameY, 'marco').setOrigin(0.5);
        frame.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        // Escala del marco
        const targetFrameWidth = width * 0.3;
        const targetFrameHeight = height * 0.3;
        frame.setDisplaySize(targetFrameWidth, targetFrameHeight);

        // Configuración de nombres y estados
        const lineSpacing = 40;
        const startY = frameY - lineSpacing;

        // Título/Encabezado del Lobby (dentro del marco arriba)
        this.add.text(centerX, startY, "ESTADO DE JUGADORES", {
            ...style,
            fontSize: '22px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Jugador 1
        const name1 = this.isHost ? (this.player1?.name || 'Tú') : (this.player1?.name || 'Admin...');
        this.p1StatusText = this.add.text(centerX, frameY, `${name1} --- ❌`, {
            ...style,
            fontSize: '20px',
            color: '#000000'
        }).setOrigin(0.5);

        // Jugador 2
        const name2 = !this.isHost ? (this.player2?.name || 'Tú') : (this.player2?.name || 'Esperando...');
        this.p2StatusText = this.add.text(centerX, frameY + lineSpacing, `${name2} --- ❌`, {
            ...style,
            fontSize: '20px',
            color: '#000000'
        }).setOrigin(0.5);

        // Botón Listo
        this.btnListo = createUIButton(this, {
            x: centerX,
            y: height * 0.75,
            label: 'Listo?',
            onClick: () => this.toggleReady(),
            scale: 1.5,
            textureNormal: 'botonSimple',
            textureHover: 'botonSimpleSeleccionado',
            textStyle: { ...style, fontSize: '14px', color: '#000' },
            clickSoundKey: 'sonidoClick'
        });

        // Botón Volver
        this.btnVolver = createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            clickSoundKey: 'sonidoClick',
            onClick: () => this.handleBack()
        });
    }

    toggleReady() {
        this.isPlayerReady = !this.isPlayerReady;
        const emoji = this.isPlayerReady ? '✅' : '❌';
        
        // Actualizamos visualmente NUESTRO estado
        if (this.isHost) {
            this.p1StatusText.setText(`${this.player1.name} --- ${emoji}`);
        } else {
            this.p2StatusText.setText(`${this.player2.name} --- ${emoji}`);
        }

        const nuevoTextoBoton = this.isPlayerReady ? 'CANCELAR' : 'LISTO?';
        
        if (this.btnListo.setLabel) {
            this.btnListo.setLabel(nuevoTextoBoton);
        } else if (this.btnListo.text) {
            this.btnListo.text.setText(nuevoTextoBoton);
        }
        
        // Bloquear/Desbloquear botón volver
        if (this.isPlayerReady) {
            this.btnVolver.disableInteractive();
            this.btnVolver.setAlpha(0.3);
        } else {
            this.btnVolver.setInteractive();
            this.btnVolver.setAlpha(1);
        }

        // Aquí es donde envia al servidor
        // socket.emit('player_ready_status', this.isPlayerReady);
    }

    handleBack() {
        const targetScene = this.isHost ? 'SelectScenario_Scene' : 'SelectPlayer_Scene';
        const data = this.isHost ? { mode: this.mode, player1: this.player1, isHost: true } : { mode: this.mode, isHost: false };
        this.scene.start(targetScene, data);
    }
}
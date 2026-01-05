//Pantalla de Lobby
import Phaser from 'phaser';
import { createUIButton, createIconButton } from '../UI/Buttons.js';
import { io } from 'socket.io-client';

export class Lobby_Scene extends Phaser.Scene {
    constructor() {
        super('Lobby_Scene');
        this.isPlayerReady = false;
        this.lobbyPlayers = [];
    }

    init(data) {
        // Recuperamos el modo, el rol y los datos de jugador
        this.mode = data.mode;
        this.isHost = data.isHost;
        this.player1 = data.player1; // Si es Host
        this.player2 = data.player2; // Si es Invitado
        this.selectedScenario = data.selectedScenario;
        
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

        this.isPlayerReady = false; 
        this.showingAbandonError = false;

        if (this.btnListo.text) this.btnListo.text.setText('Listo?');
        this.btnVolver.setAlpha(1);
        this.btnVolver.setInteractive();

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

        // Conexión al WebSockets
        this.socket = this.registry.get('socket');
        if (!this.socket) {
            this.socket = io();
            this.registry.set('socket', this.socket);
        } else {
            this.socket.removeAllListeners();
            this.socket.emit('player_ready', false);
        }

        this.socket.on('lobby_update', (players) => { /* ... */ });
        this.socket.on('start_game', (data) => { /* ... */ });
        this.socket.on('player_abandoned', (data) => { /* ... */ });

        // Unirse al lobby
        this.socket.emit('join_lobby', {
            username: this.registry.get('username'),
            character: this.registry.get('myCharacter'),
            selectedScenario: this.selectedScenario
        });

        // Actualizaciones del lobby
        this.socket.on('lobby_update', (players) => {
            this.lobbyPlayers = players;

            if (this.showingAbandonError) return;

            this.p1StatusText.setText('Esperando Host...');
            this.p2StatusText.setText('Esperando rival...');

            const p1Data = players.find(p => p.isHost);
            const p2Data = players.find(p => !p.isHost);


            if (p1Data) {
                const emoji = p1Data.ready ? '✅' : '❌';
                this.p1StatusText.setText(`${p1Data.username} (HOST) --- ${emoji}`);
                
                // Si YO soy el nuevo host (porque el anterior se fue)
                if (p1Data.id === this.socket.id) {
                    this.isHost = true;
                    console.log("Ahora eres el Host de la sala");
                }
            }

            if (p2Data) {
                const emoji = p2Data.ready ? '✅' : '❌';
                this.p2StatusText.setText(`${p2Data.username} --- ${emoji}`);
            } else {
                this.p2StatusText.setText('Esperando rival...');
            }
        });

        // Escuchar orden de inicio
        this.socket.on('start_game', (data) => {
            const players = data?.players ?? this.lobbyPlayers;
            const selectedScenario = data?.selectedScenario ?? this.selectedScenario ?? 'Gym';
            const host = players.find(p => p.isHost);
            const guest = players.find(p => !p.isHost);

            if (!host || !guest) {
                console.error('Lobby sin jugadores listos');
                return;
            }

            const player1 = { name: host.username, character: host.character };
            const player2 = { name: guest.username, character: guest.character };

            this.scene.start('GameOnline_Scene', {
                mode: 'online',
                player1,
                player2,
                selectedScenario
            });
        });

        this.socket.on('player_abandoned', (data) => {
            this.showingAbandonError = true;

            console.log(`El usuario ${data.username} ha salido del lobby`);
            
            this.p2StatusText.setText(`¡${data.username} ha salido!`);
            this.p2StatusText.setStyle({ fill: '#ff0000' });

            this.time.delayedCall(3000, () => {
                this.showingAbandonError = false;
                if (this.p2StatusText) {
                    this.p2StatusText.setStyle({ fill: '#000' });
                    this.socket.emit('request_lobby_update');
                }
            });

            this.isPlayerReady = false;
            this.btnListo.text.setText('LISTO?');
        });
    }

    toggleReady() {
        this.isPlayerReady = !this.isPlayerReady;
        
        // Enviamos el estado al servidor vía WebSocket
        this.socket.emit('player_ready', this.isPlayerReady);

        // Actualizar botón
        const nuevoTextoBoton = this.isPlayerReady ? 'CANCELAR' : 'LISTO?';
        
        if (this.btnListo.setLabel) {
            this.btnListo.setLabel(nuevoTextoBoton);
        } else if (this.btnListo.text) {
            this.btnListo.text.setText(nuevoTextoBoton);
        }

        this.btnVolver.setAlpha(this.isPlayerReady ? 0.3 : 1);
        this.isPlayerReady ? this.btnVolver.disableInteractive() : this.btnVolver.setInteractive();
    }

    handleBack() {
        if (this.socket) this.socket.disconnect();
        const targetScene = this.isHost ? 'SelectScenario_Scene' : 'SelectPlayer_Scene';
        this.scene.start(targetScene, { mode: this.mode, isHost: this.isHost });
    }

    shutdown() {
        // Eliminamos todos los escuchadores de red para que no afecten a la siguiente partida
        if (this.socket) {
            this.socket.off('start_game');
            this.socket.off('join_lobby');
            this.socket.off('player_abandoned');
            this.socket.off('lobby_update');
        }
    }
}
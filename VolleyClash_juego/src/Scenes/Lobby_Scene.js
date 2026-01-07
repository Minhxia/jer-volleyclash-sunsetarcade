// Pantalla de Lobby
// (permite al host elegir escenario)
import Phaser from 'phaser';
import { createUIButton, createIconButton } from '../UI/Buttons.js';
import ScenarioPickerUI from '../UI/ScenarioPicker.js';
import PlayerCardUI from '../UI/PlayerCard.js';

export class Lobby_Scene extends Phaser.Scene {
    constructor() {
        super('Lobby_Scene');

        this.isPlayerReady = false;
        this.lobbyPlayers = [];
        this.pendingLobbyUpdate = null;

        this.ws = null;
    }

    init(data) {
        // se recupera el modo, el rol y los datos del jugador
        this.mode = data.mode;
        this.isHost = false;    // se actualiza al recibir lobby_update
        this.player1 = data.player1;
        this.player2 = data.player2;
        this.selectedScenario = data.selectedScenario;

        console.log('Lobby iniciado como:', this.isHost ? 'Host' : 'Invitado');
    }

    preload() {
        // imágenes, fondo y ui
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('marco', 'ASSETS/UI/MARCOS/VACIOS/MARCOS_ESCENARIO.png')
        this.load.image('botonSimple', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonSimpleSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');

        // escenarios
        this.load.image('Gym', 'ASSETS/FONDOS/GIMNASIO.png');
        this.load.image('Playa', 'ASSETS/FONDOS/PLAYA.png');
        this.load.image('Jardin', 'ASSETS/FONDOS/JARDIN.png');

        // botones
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');

        // retratos de personajes
        this.load.image('portraitA', 'ASSETS/UI/MARCOS/PERSONAJES%20EN%20MARCOS/PERSONAJE_A.png');
        this.load.image('portraitB', 'ASSETS/UI/MARCOS/PERSONAJES%20EN%20MARCOS/PERSONAJE_B.png');
        this.load.image('portraitC', 'ASSETS/UI/MARCOS/PERSONAJES%20EN%20MARCOS/PERSONAJE_C.png');

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const style = this.game.globals.defaultTextStyle;
        const { width, height } = this.scale;

        this.add.image(0, 0, 'fondo').setOrigin(0).setDepth(-1);

        // Título arriba
        this.add.text(width / 2, height * 0.09, 'Lobby', {
            ...style,
            fontSize: '38px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        //// ZONA SUPERIOR: ESCENARIO ////
        const previewX = width * 0.33;
        const previewY = height * 0.34;
        const previewW = width * 0.42;
        const previewH = height * 0.30;

        // Marco del escenario
        const scenarioFrame = this.add.image(previewX, previewY, 'marco').setOrigin(0.5);
        scenarioFrame.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        scenarioFrame.setDisplaySize(previewW, previewH);

        // ScenarioPicker, preview encima del marco a la izq + botones a la dcha
        this.scenarioUI = new ScenarioPickerUI(this, {
            style,
            scenarios: ['Gym', 'Playa', 'Jardin'],
            defaultScenario: this.selectedScenario ?? 'Gym',
            buttonTextures: { normal: 'botonSinSeleccionar', selected: 'botonSeleccionado' },

            previewX,
            previewY,
            previewW,
            previewH,

            buttonsX: width * 0.72,
            buttonsY: previewY - previewH * 0.28,
            buttonsSpacingY: previewH * 0.34,
            buttonsScale: 1.55,

            onSelect: (scenarioName) => {
                this._sendWS({ type: 'select_scenario', selectedScenario: scenarioName });
            }
        });

        //// ZONA INFERIOR: JUGADORES /////
        const playersCenterX = (width / 2) - 30;
        this.add.text(playersCenterX, height * 0.61, 'Estado de los jugadores', {
            ...style,
            fontSize: '22px',
            color: '#000',
        }).setOrigin(0.5);

        const portraitKeys = {
            characterA: 'portraitA',
            characterB: 'portraitB',
            characterC: 'portraitC',
        };

        const cardsY = height * 0.76;
        const cardWidth = width * 0.30;
        const cardsGap = width * 0.06;
        const cardsTotalWidth = cardWidth * 2 + cardsGap;
        const hostCardX = playersCenterX - cardsTotalWidth / 2 + cardWidth / 2 - 30;
        const guestCardX = hostCardX + cardWidth + cardsGap;

        this.hostCard = new PlayerCardUI(this, hostCardX, cardsY, {
            style,
            title: 'Host',
            portraitKeys,
            defaultPortraitKey: null,
            w: cardWidth,
            h: height * 0.18,
        });

        this.guestCard = new PlayerCardUI(this, guestCardX, cardsY, {
            style,
            title: 'Rival',
            portraitKeys,
            defaultPortraitKey: null,
            w: cardWidth,
            h: height * 0.18,
        });

        ///// BOTONES /////
        this.btnListo = createUIButton(this, {
            x: playersCenterX,
            y: height * 0.92,
            label: '¿Listo?',
            onClick: () => this.toggleReady(),
            textureNormal: 'botonSimple',
            textureHover: 'botonSimpleSeleccionado',
            textStyle: { ...style, fontSize: '22px', color: '#000' },
            clickSoundKey: 'sonidoClick'
        });

        this.btnListo.button.disableInteractive();
        this.btnListo.button.setAlpha(0.7);

        this.btnVolver = createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            clickSoundKey: 'sonidoClick',
            onClick: () => this.handleBack()
        });


        // ----- CONEXIÓN A WEBSOCKETS -----
        this.ws = this.registry.get('ws');

        if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
            this.ws = new WebSocket(this._getWsUrl());
            this.registry.set('ws', this.ws);
        }

        // “Resetea” handlers del ws
        this.ws.onmessage = (event) => {
            let msg;
            try {
                msg = JSON.parse(event.data);
            } catch (e) {
                console.error('WS mensaje no-JSON:', event.data);
                return;
            }
            this._handleWSMessage(msg);
        };

        // errores del ws
        this.ws.onerror = (e) => {
            console.error('[WS] error', e);
        };

        // cierre del ws
        this.ws.onclose = () => {
            console.log('[WS] conexión cerrada');
        };

        // se envía join_lobby cuando el socket esté OPEN
        const joinPayload = {
            type: 'join_lobby',
            username: this.registry.get('username'),
            character: this.registry.get('myCharacter'),
            selectedScenario: this.selectedScenario
        };

        // si ya está abierto, se envía ya, si no, espera a onopen
        if (this.ws.readyState === WebSocket.OPEN) {
            this.btnListo?.button.setInteractive?.({ useHandCursor: true });
            this._sendWS({ type: 'player_ready', isReady: false });
            this._sendWS(joinPayload);
        } else {
            this.ws.onopen = () => {
                console.log('[WS] conectado');
                this.btnListo?.button.setInteractive?.({ useHandCursor: true });
                this._sendWS({ type: 'player_ready', isReady: false });
                this._sendWS(joinPayload);
            };

        }

        // limpieza al salir del lobby
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
    }

    // Cambia el estado Ready/NotReady del jugador
    toggleReady() {
        this.isPlayerReady = !this.isPlayerReady;

        // se envía el estado al servidor vía WebSocket
        this._sendWS({ type: 'player_ready', isReady: this.isPlayerReady });

        // se actualiza el botón
        const nuevoTextoBoton = this.isPlayerReady ? 'Cancelar' : '¿Listo?';
        this.btnListo.text.setText(nuevoTextoBoton);

        this.btnVolver.setAlpha(this.isPlayerReady ? 0.3 : 1);
        this.isPlayerReady ? this.btnVolver.disableInteractive() : this.btnVolver.setInteractive({ useHandCursor: true });
    }

    // Controla el botón de volver atrás
    handleBack() {
        // avisa que ya no está listo
        this._sendWS({ type: 'player_ready', isReady: false });

        // avisa que abandona el lobby
        this._sendWS({ type: 'leave_lobby' });

        // cierra el ws y limpia el registry
        if (this.ws) {
            try { this.ws.close(); } catch { }
        }
        this.registry.remove('ws');

        // navega según el modo
        if (this.mode === 'online') {
            this.scene.start('SelectPlayer_Scene', { mode: 'online' });
            return;
        }

        // fallback
        this.scene.start('SelectPlayer_Scene', { mode: 'local' });
    }


    // Limpia al salir del lobby
    shutdown() {
        // destruye UIs
        this.scenarioUI?.destroy();
        this.scenarioUI = null;
        this.hostCard?.destroy();
        this.hostCard = null;
        this.guestCard?.destroy();
        this.guestCard = null;

        // limpia handlers del ws
        if (this.ws) {
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.onopen = null;
        }
    }

    // Construye la URL del WebSocket según el protocolo y host actuales
    _getWsUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        // frontend en 3000, backend en 8080
        const backendPort = (window.location.port === '3000') ? '8080' : window.location.port;

        return `${protocol}://${window.location.hostname}:${backendPort}`;
    }


    // Envía un objeto JSON vía WebSocket
    _sendWS(obj) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify(obj));
    }

    // Controla los mensajes entrantes del WebSocket
    _handleWSMessage(msg) {
        switch (msg.type) {
            // actualización del estado del lobby
            case 'lobby_update': {
                const players = msg.players ?? [];
                this.lobbyPlayers = players;
                if (this.showingAbandonError) {
                    this.pendingLobbyUpdate = {
                        players,
                        selectedScenario: msg.selectedScenario
                    };
                    return;
                }

                this._applyLobbyUpdate(players, msg.selectedScenario);
                break;
            }

            // inicio de la partida
            case 'start_game': {
                const players = msg?.players ?? this.lobbyPlayers;
                const selectedScenario = msg?.selectedScenario ?? this.selectedScenario ?? 'Gym';

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
                break;
            }

            // un jugador ha abandonado el lobby
            case 'player_abandoned': {
                this.showingAbandonError = true;

                console.log(`El usuario ${msg.username} ha salido del lobby`);

                // se pinta el aviso en la tarjeta del rival
                this.guestCard?.showLeftMessage?.(msg.username);

                this.time.delayedCall(2000, () => {
                    this.showingAbandonError = false;
                    if (this.pendingLobbyUpdate) {
                        const { players, selectedScenario } = this.pendingLobbyUpdate;
                        this.pendingLobbyUpdate = null;
                        this._applyLobbyUpdate(players, selectedScenario);
                    }

                    // se quita el estilo rojo
                    this.guestCard?.clearAlertStyle?.();
                });

                // Reset del botón Listo
                this.isPlayerReady = false;

                if (this.btnListo?.setLabel) this.btnListo.setLabel('¿Listo?');
                else if (this.btnListo?.text) this.btnListo.text.setText('¿Listo?');

                // se re-habilita volver
                this.btnVolver.setAlpha(1);
                this.btnVolver.setInteractive({ useHandCursor: true });

                break;
            }

            // mensajes de error
            case 'error':
                console.error('[WS error]', msg.message);
                break;

            // para depurar
            default:
                console.log('[WS] msg desconocido', msg);
                break;
        }
    }

    _applyLobbyUpdate(players, selectedScenario) {
        // escenario (viene del servidor)
        if (selectedScenario) {
            this.selectedScenario = selectedScenario;
            this.scenarioUI?.setScenario(this.selectedScenario);
        }

        const host = players.find(p => p.isHost) ?? null;
        const guest = players.find(p => !p.isHost) ?? null;

        // host
        const myUsername = this.registry.get('username');
        const newIsHost = !!(host && host.username === myUsername);
        if (newIsHost !== this.isHost) {
            console.log(newIsHost
                ? `[LOBBY] Ahora eres el HOST (${myUsername})`
                : `[LOBBY] Ya NO eres el host (host actual: ${host?.username ?? '—'})`
            );
        }

        this.isHost = newIsHost;
        this.scenarioUI?.setIsHost(this.isHost);

        // Tarjetas
        this.hostCard?.setPlayer(host ? { ...host, isHost: true } : null);
        this.guestCard?.setPlayer(guest ? { ...guest, isHost: false } : null);
    }
}

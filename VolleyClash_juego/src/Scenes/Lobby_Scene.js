// Pantalla de Lobby
// (permite al host elegir escenario)
import Phaser from 'phaser';
import { createUIButton, createIconButton } from '../UI/Buttons.js';
import ScenarioPickerUI from '../UI/ScenarioPicker.js';


export class Lobby_Scene extends Phaser.Scene {
    constructor() {
        super('Lobby_Scene');

        this.isPlayerReady = false;
        this.lobbyPlayers = [];

        this.ws = null;
    }

    init(data) {
        // se recupera el modo, el rol y los datos del jugador
        this.mode = data.mode;
        this.isHost = data.isHost;
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

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const style = this.game.globals.defaultTextStyle;
        const { width, height } = this.scale;
        const centerX = width / 2;

        this.isPlayerReady = false;
        this.showingAbandonError = false;

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

        // Selector de escenario
        this.scenarioUI = new ScenarioPickerUI(this, {
            centerX,
            frameY,
            frameW: targetFrameWidth,
            frameH: targetFrameHeight,
            style,
            scenarios: ['Gym', 'Playa', 'Jardin'],
            defaultScenario: this.selectedScenario ?? 'Gym',
            buttonTextures: {
                normal: 'botonSinSeleccionar',
                selected: 'botonSeleccionado'
            },
            onSelect: (scenarioName) => {
                // solo se llama si es host (la clase lo bloquea si no)
                this._sendWS({ type: 'select_scenario', selectedScenario: scenarioName });
            }
        });


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
            fontSize: '28px',
            color: '#000000'
        }).setOrigin(0.5);

        // Jugador 2
        const name2 = !this.isHost ? (this.player2?.name || 'Tú') : (this.player2?.name || 'Esperando...');
        this.p2StatusText = this.add.text(centerX, frameY + lineSpacing, `${name2} --- ❌`, {
            ...style,
            fontSize: '28px',
            color: '#000000'
        }).setOrigin(0.5);

        // Botón Listo
        this.btnListo = createUIButton(this, {
            x: centerX,
            y: height * 0.75,
            label: '¿Listo?',
            onClick: () => this.toggleReady(),
            scale: 1.5,
            textureNormal: 'botonSimple',
            textureHover: 'botonSimpleSeleccionado',
            textStyle: { ...style, fontSize: '14px', color: '#000' },
            clickSoundKey: 'sonidoClick'
        });
        this.btnListo?.disableInteractive?.();

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

        if (this.btnListo?.setLabel) {
            this.btnListo.setLabel('¿Listo?');
        } else if (this.btnListo?.text) {
            this.btnListo.text.setText('Listo?');
        }
        this.btnVolver?.setAlpha(1);
        this.btnVolver?.setInteractive();

        // ----- Conexión a WebSockets -----
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
            this.btnListo?.setInteractive?.();
            this._sendWS({ type: 'player_ready', isReady: false });
            this._sendWS(joinPayload);
        } else {
            this.ws.onopen = () => {
                console.log('[WS] conectado');
                this.btnListo?.setInteractive?.();
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
        if (this.btnListo.setLabel) {
            this.btnListo.setLabel(nuevoTextoBoton);
        } else if (this.btnListo.text) {
            this.btnListo.text.setText(nuevoTextoBoton);
        }

        this.btnVolver.setAlpha(this.isPlayerReady ? 0.3 : 1);
        this.isPlayerReady ? this.btnVolver.disableInteractive() : this.btnVolver.setInteractive();
    }

    // Controla el botón de volver atrás
    handleBack() {
        // avisa que ya no está listo
        this._sendWS({ type: 'player_ready', isReady: false });

        // se cierra el ws y vuelve a la selección
        if (this.ws) {
            try { this.ws.close(); } catch { }
        }
        this.registry.remove('ws');

        const targetScene = this.isHost ? 'SelectScenario_Scene' : 'SelectPlayer_Scene';
        this.scene.start(targetScene, { mode: this.mode, isHost: this.isHost });
    }

    // Limpia al salir del lobby
    shutdown() {
        if (this.ws) {
            this.scenarioUI?.destroy();
            this.scenarioUI = null;

            // se limpian los handlers del lobby
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.onopen = null;
        }
    }

    // Construye la URL del WebSocket según el protocolo y host actuales
    _getWsUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        return `${protocol}://${window.location.hostname}:8080`;
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

                if (this.showingAbandonError) return;

                // escenario (viene del servidor)
                if (msg.selectedScenario) {
                    // se guarda el escenario seleccionado
                    this.selectedScenario = msg.selectedScenario;
                    // se actualiza la UI
                    this.scenarioUI?.setScenario(this.selectedScenario);
                }

                this.p1StatusText.setText('Esperando Host...');
                this.p2StatusText.setText('Esperando rival...');

                const p1Data = players.find(p => p.isHost);
                const p2Data = players.find(p => !p.isHost);

                const myUsername = this.registry.get('username');

                // host
                let newIsHost = false;

                if (p1Data) {
                    const emoji = p1Data.ready ? '✅' : '❌';
                    this.p1StatusText.setText(`${p1Data.username} (HOST) --- ${emoji}`);

                    newIsHost = (p1Data.username === myUsername);

                    if (newIsHost !== this.isHost) {
                        if (newIsHost) {
                            console.log(`[LOBBY] Ahora eres el HOST (${myUsername})`);
                        } else {
                            console.log(`[LOBBY] Ya NO eres el host (host actual: ${p1Data.username})`);
                        }
                    }
                } else {
                    if (this.isHost) {
                        console.log('[LOBBY] Ya NO eres el host (no hay host asignado)');
                    }
                    newIsHost = false;
                }

                this.isHost = newIsHost;

                // si tienes UI de selección de escenario:
                this.scenarioUI?.setIsHost(this.isHost);

                // player2
                if (p2Data) {
                    const emoji = p2Data.ready ? '✅' : '❌';
                    this.p2StatusText.setText(`${p2Data.username} --- ${emoji}`);
                } else {
                    this.p2StatusText.setText('Esperando rival...');
                }

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

                this.p2StatusText.setText(`¡${msg.username} ha salido!`);
                this.p2StatusText.setStyle({ fill: '#ff0000' });

                this.time.delayedCall(3000, () => {
                    this.showingAbandonError = false;
                    if (this.p2StatusText) {
                        this.p2StatusText.setStyle({ fill: '#000' });
                        // se espera al siguiente lobby_update, que llega tras leave
                    }
                });

                this.isPlayerReady = false;
                if (this.btnListo?.setLabel) this.btnListo.setLabel('¿Listo?');
                else if (this.btnListo?.text) this.btnListo.text.setText('¿Listo?');

                // re-habilitar volver
                this.btnVolver.setAlpha(1);
                this.btnVolver.setInteractive();
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
}

// Clase de la escena de juego online

import Phaser from 'phaser';
import { Player } from '../Entities/Player.js';
import { PowerUp } from '../Entities/PowerUp.js';
import { Ball } from '../Entities/Ball.js';
import { CommandProcessor } from '../Commands/CommandProcessor.js';
import { MovePlayerCommand } from '../Commands/MovePlayerCommand.js';
import { getStoredSfxVolume } from '../UI/Audio.js';

export class GameOnline_Scene extends Phaser.Scene {
    tiempoTotal = 60; // para 2 min poner 120 segundos
    tiempoRestante;
    timerText;
    timerEvent;

    constructor() {
        super('GameOnline_Scene');
    }

    init(data) {
        this.players = new Map();
        this.inputMappings = [];
        this.commandProcessor = new CommandProcessor();
        this.player1 = data.player1;
        this.player2 = data.player2;
        this.selectedScenario = data.selectedScenario;
        this.ball = null;
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        this.setsP1 = 0;
        this.setsP2 = 0;
        this.maxSets = 3; // mejor de 3
        this.currentSet = 1; // set actual
        this.isGoldenPoint = false;
        this.isSetEnding = false;
        this.ws = this.registry.get('ws');
        this.myUsername = this.registry.get('username');
        this.seed = data?.seed ?? Date.now().toString();
        this.rng = new Phaser.Math.RandomDataGenerator([String(this.seed)]);
        console.log('[GameOnline] RNG seed:', this.seed);

        // console.log('player1:', this.player1);
        // console.log('player2:', this.player2);
        // console.log('myUsername:', this.myUsername);

        // WEBSOCKETS
        // Pelota
        this.rallyId = 0;

        this.ballNet = {
            lastSeq: 0,
            hasTarget: false,
            tx: 0, ty: 0,
            tvx: 0, tvy: 0,
            snapDist: 120,   // si la pelota se va, snap
            lerp: 0.35       // suavizado por frame
        };

        this.ballSyncSeq = 0;
        this.ballSyncEvent = null;

        this.lastHitTime = 0;
        this.tiempoRestante = this.tiempoTotal;

        // PowerUps
        this.powerUpSeq = 0;
        this.powerUpsById = new Map();      // host: id -> PowerUp
        this.powerUpsNetById = new Map();   // no-host: id -> sprite (visual)
        this.powerUpsNetOverlapsById = new Map();
        this.powerUpExpiryTimers = new Map();   // para poder cancelar las delayedCalls de desaparición

        this.pendingCollectPowerUps = new Set();
        this.pendingPowerUpUse = null;
        this._suppressCollectBroadcast = false;
    }

    preload() {
        // characterA
        this.load.spritesheet(
            'charA_move',
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_A/ANIMACIONES_CORRER_RECIBIR.png',
            { frameWidth: 29, frameHeight: 44 }
        );
        this.load.spritesheet(
            'charA_jump',
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_A/ANIMACION_REMATE.png',
            { frameWidth: 32, frameHeight: 44 }
        );
        // characterB
        this.load.spritesheet(
            'charB_move',
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_B/ANIMACIONES_CORRER_RECIBIR.png',
            { frameWidth: 29, frameHeight: 44 }
        );
        this.load.spritesheet(
            'charB_jump',
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_B/ANIMACION_REMATE.png',
            { frameWidth: 32, frameHeight: 44 }
        );
        // characterC
        this.load.spritesheet(
            'charC_move',
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_C/ANIMACIONES_CORRER_RECIBIR.png',
            { frameWidth: 29, frameHeight: 44 }
        );
        this.load.spritesheet(
            'charC_jump',
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_C/ANIMACION_REMATE.png',
            { frameWidth: 32, frameHeight: 44 }
        );

        // Escenarios
        this.load.image('Gym', 'ASSETS/FONDOS/GIMNASIO.png');
        this.load.image('Playa', 'ASSETS/FONDOS/PLAYA.png');
        this.load.image('Jardin', 'ASSETS/FONDOS/JARDIN.png');

        // PowerUps
        this.load.image('por2', 'ASSETS/ITEMS/POWER UPS/MULTIPLICADOR 2.png');
        this.load.image('por3', 'ASSETS/ITEMS/POWER UPS/MULTIPLICADOR 3.png');
        this.load.image('paralizar', 'ASSETS/ITEMS/POWER UPS/PARALIZADO.png');
        this.load.image('ralentizar', 'ASSETS/ITEMS/POWER UPS/RELENTIZAR.png');
        this.load.image('velocidad', 'ASSETS/ITEMS/POWER UPS/VELOCIDAD.png');
        this.load.image('marcoPowerUp', 'ASSETS/JUEGO/Base_powerUp.png');

        // Pelota
        this.load.image('ball', 'ASSETS/ITEMS/PELOTAS/P_NORMAL.png');
        // Red
        this.load.image('red', 'ASSETS/JUEGO/RED.png');
        // Cronómetro
        this.load.image('reloj', 'ASSETS/JUEGO/TIMER.png');
        // Marco
        this.load.image('marcoGeneral', 'ASSETS/JUEGO/MARCADOR_SET.png');

        // Efectos de sonido
        this.load.audio('sfx_silbato', 'ASSETS/SONIDO/Silbato_inicio_partido_1p4s.mp3');
        this.load.audio('sfx_remate', 'ASSETS/SONIDO/Toque_pelota_remate_03s.mp3');
        this.load.audio('sfx_recepcion', 'ASSETS/SONIDO/Toque_pelota_recepcion.mp3');
        this.load.audio('sfx_salto', 'ASSETS/SONIDO/SonidoSalto_1p.mp3');
        this.load.audio('sfx_punto', 'ASSETS/SONIDO/SonidoPunto.mp3');

    }

    create() {
        // se guardan las dimensiones
        const { width, height } = this.scale;
        this.worldWidth = width;
        this.worldHeight = height;
        const style = this.game.globals.defaultTextStyle;

        // se definen los efectos de sonido
        this.sfx = {
            whistle: 'sfx_silbato',
            spike: 'sfx_remate',
            receive: 'sfx_recepcion',
            jump: 'sfx_salto',
            point: 'sfx_punto'
        };
        // se reproduce el silbato de inicio de partido
        this.playSfx(this.sfx.whistle);

        // Cronómetro
        this.timerText = this.add.text(this.scale.width / 2, 30, "", {
            ...style,
            fontSize: '32px',
            color: '#ffffff'
        })
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(9999);

        this.timerIcon = this.add.image(this.scale.width / 2, 45, 'reloj')
            .setOrigin(0.5)
            .setScale(2)
            .setScrollFactor(0)
            .setDepth(9000); // debajo del texto

        // marco de set
        this.setFrame = this.add.image(this.scale.width / 2, 120, 'marcoGeneral')
            .setOrigin(0.5)
            .setScale(1)
            .setDepth(9998);

        // texto del set actual
        this.setText = this.add.text(this.scale.width / 2, 120, `SET ${this.currentSet}`, {
            ...style,
            fontSize: '32px',
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setDepth(9999);

        const setFrameWidth = this.setFrame.displayWidth;
        const setFrameHeight = this.setFrame.displayHeight;
        const setScoreY = this.setFrame.y + Math.round(setFrameHeight / 2) + 13;
        const setScoreOffsetX = Math.round(setFrameWidth * 0.22);
        const setScoreFrameScaleX = 0.4;
        const setScoreFrameScaleY = 0.38;

        this.setScoreFrameLeft = this.add.image(this.scale.width / 2 - setScoreOffsetX, setScoreY, 'marcoGeneral')
            .setOrigin(0.5)
            .setScale(setScoreFrameScaleX, setScoreFrameScaleY)
            .setDepth(9998);

        this.setScoreFrameRight = this.add.image(this.scale.width / 2 + setScoreOffsetX, setScoreY, 'marcoGeneral')
            .setOrigin(0.5)
            .setScale(setScoreFrameScaleX, setScoreFrameScaleY)
            .setDepth(9998);

        this.setScoreLeft = this.add.text(this.scale.width / 2 - setScoreOffsetX, setScoreY, `${this.setsP1}`, {
            ...style,
            fontSize: '28px',
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setDepth(9999);

        this.setScoreRight = this.add.text(this.scale.width / 2 + setScoreOffsetX, setScoreY, `${this.setsP2}`, {
            ...style,
            fontSize: '28px',
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setDepth(9999);

        // texto para mostrar el ganador del set
        this.setWinnerText = this.add.text(this.scale.width / 2, 205, '', {
            ...style,
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        })
            .setOrigin(0.5)
            .setDepth(9999)
            .setVisible(false);
        
        if (this.isHostClient()) {
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: this.updateTimer,
                callbackScope: this,
                loop: true
            });
        }
        this._renderTimerText();

        // FONDO DEL ESCENARIO SELECCIONADO
        this.add.image(width / 2, height / 2, this.selectedScenario)
            .setOrigin(0.5)
            .setDisplaySize(width, height)
            .setDepth(-1);

        // Red
        const red = this.physics.add.staticSprite(width / 2, height - 160, 'red').setScale(0.6);

        const redTexture = this.textures.get('red').getSourceImage();
        red.body.setSize(redTexture.width * 0.5, redTexture.height * 0.5); // multiplicar por el scale
        red.body.setOffset(-red.body.width / 2, -red.body.height / 2);
        red.body.updateFromGameObject();
        this.red = red;

        this._createAnimations();

        //PUNTUACION DE LOS JUGADORES
        // Marcos de puntuación
        this.pointsLeft = 0;
        this.pointsRight = 0;

        this.scoreFrameLeft = this.add.image(200, 50, 'marcoGeneral').setScale(0.8, 0.55).setOrigin(0.5);
        this.scoreFrameRight = this.add.image(this.worldWidth - 200, 50, 'marcoGeneral').setScale(0.8, 0.55).setOrigin(0.5);

        this.scoreLeft = this.add.text(200, 45, '0', {
            ...style,
            fontSize: '40px',
            color: '#ffffffff'
        }).setOrigin(0.5).setDepth(9999);

        this.rightScore = this.add.text(this.worldWidth - 200, 45, '0', {
            ...style,
            fontSize: '40px',
            color: '#ffffffff'
        }).setOrigin(0.5).setDepth(9999);

        // suelo de prueba: crear un cuerpo estático rectangular invisible
        // altura y desplazamiento configurables desde el fondo (`groundOffset`)
        const groundHeight = 20;
        const groundOffset = 90;
        this.groundHeight = groundHeight;
        this.groundY = this.worldHeight - groundOffset;

        const ground = this.add.rectangle(
            this.worldWidth / 2,
            this.groundY,
            this.worldWidth,
            groundHeight
        ).setOrigin(0.5, 0).setVisible(false);
        // añadir un cuerpo físico estático al rectángulo
        this.physics.add.existing(ground, true);

        // primero se crean los jugadores
        this._createPlayers();
        // después, se montan las colisiones con el suelo, red, etc.
        this._setupPhysicsWorld(ground);
        // por último, se asignan las teclas
        this._setupInputMappings();

        // powerups
        this.powerUps = [];
        this.maxPowerUps = 2;
        // la aparición de power-ups son menos frecuentes y con pesos, para que unos salgan
        // más que otros (por ejemplo, se reduce la aparición de paralizar)
        this.powerUpSpawnConfig = {
            // entre 3.5 y 7 segundos
            minDelayMs: 3500,
            maxDelayMs: 7000,
            weights: {
                velocidad: 3,
                ralentizar: 2,
                paralizar: 1,
                por2: 3,
                por3: 2
            },
            cooldownMs: {
                // para evitar que salgan muy seguidos y un jugador no pueda moverse
                // durante mucho tiempo
                paralizar: 10000
            }
        };
        this.powerUpLastSpawnAt = {};

        this.inventoryUI = {
            player1: [
                this.add.image(50, 50, 'por2').setScale(1.4).setVisible(false).setDepth(1),
                this.add.image(110, 50, 'por2').setScale(1.4).setVisible(false).setDepth(1)
            ],
            player2: [
                this.add.image(this.worldWidth - 110, 50, 'por2').setScale(1.4).setVisible(false).setDepth(1),
                this.add.image(this.worldWidth - 50, 50, 'por2').setScale(1.4).setVisible(false).setDepth(1)
            ]
        };

        // se inicia la generación de power-ups (host)
        if (this.isHostClient()) {
            this.schedulePowerUpSpawn();
        }

        // Marcos del inventario
        this.inventoryFrames = {
            player1: [
                this.add.image(50, 50, 'marcoPowerUp').setScale(1).setOrigin(0.5).setDepth(0),
                this.add.image(110, 50, 'marcoPowerUp').setScale(1).setOrigin(0.5).setDepth(0)
            ],
            player2: [
                this.add.image(this.worldWidth - 110, 50, 'marcoPowerUp').setScale(1).setOrigin(0.5).setDepth(0),
                this.add.image(this.worldWidth - 50, 50, 'marcoPowerUp').setScale(1).setOrigin(0.5).setDepth(0)
            ]
        };

        // inicialización de la pelota
        this._createBall();
        // el host inicializa la pelota y las colisiones
        if (this.isHostClient()) {
            // empujón sutíl para evitar que se quede sobre la red al inicio
            this.ball.setServePosition();
            // colliders de la pelota
            this._setupBallCollisions();
            // eventos de la pelota
            this._setupBallEvents();

            // el host manda ball_sync periódicos
            this._startBallSync(66);
            // manda un reset inicial para que el no-host haga snap
            this._sendBallReset('start');
        }
        // el no-host solo renderiza/desactiva físicas activas
        else {
            this.ball.sprite.body.setAllowGravity(false);
            this.ball.sprite.body.setVelocity(0, 0);
            //this.ball.sprite.body.enable = false; // fuera de físicas, solo render
            this.ball.sprite.body.moves = false;

            // target inicial (para que no haga saltos al primer update)
            this.ballNet.tx = this.ball.sprite.x;
            this.ballNet.ty = this.ball.sprite.y;
            this.ballNet.hasTarget = true;
        }

        // se activan los listeners del WebSocket
        this.setupWebSocketListeners();

        // se reanuda el cronómetro al volver de pausa
        this.events.on('resume', () => {
            this.timerEvent.paused = false;
        });
        // se detiene el envío de ball_sync al cerrar la escena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this._stopBallSync();
        });
    }

    // Comprueba si el cliente es el host del juego
    isHostClient() {
        return this.player1?.name === this.myUsername;
    }

    // Configura los listeners del WebSocket
    setupWebSocketListeners() {
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            } catch (error) {
                console.error('Error parsing server message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            if (!this.gameEnded) {
                this.handleDisconnection();
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (!this.gameEnded) {
                this.handleDisconnection();
            }
        };
    }

    // Controla los mensajes recibidos del servidor (servidor -> cliente)
    handleServerMessage(data) {
        switch (data.type) {
            case 'opponent_move':
                this._handleOponentInput(data);
                break;
            case 'ball_update': // ball_sync en server
                // lo usa el no-host
                if (!this.isHostClient()) this._onBallUpdate(data);
                break;

            case 'ball_reset':  // ball_reset en server
                // el host actualiza el rallyId, el no-host resetea la pelota (snap)
                if (this.isHostClient()) {
                    if (data.rallyId != null) this.rallyId = data.rallyId;
                } else {
                    this._onBallReset(data);
                }
                break;

            case 'spawn_powerup': // coincide con server
                if (this.isHostClient()) break;

                const pu = this.physics.add.staticImage(data.x, data.y, data.powerType)
                    .setDepth(2)
                    .setScale(1.2);

                if (pu.refreshBody) pu.refreshBody();

                this.powerUpsNetById.set(data.id, pu);

                // jugador local (en este cliente)
                const localPlayer = (this.player1.name === this.myUsername)
                    ? this.players.get('player1')
                    : this.players.get('player2');

                const attachOverlap = (player) => {
                    if (!player?.sprite) return false;
                    if (this.powerUpsNetOverlapsById.has(data.id)) return true;

                    const overlap = this.physics.add.overlap(player.sprite, pu, () => {
                        if (this.pendingCollectPowerUps.has(data.id)) return;

                        this.pendingCollectPowerUps.add(data.id);

                        // se pide al host que recoga el power-up
                        this.sendMessage({
                            type: 'collect_powerup',
                            id: data.id,
                            playerName: this.myUsername
                        });
                    });
                    this.powerUpsNetOverlapsById.set(data.id, overlap);
                    return true;
                };

                if (!attachOverlap(localPlayer)) {
                    this.time.delayedCall(100, () => {
                        if (!this.powerUpsNetById.has(data.id)) return;
                        const retryPlayer = (this.player1.name === this.myUsername)
                            ? this.players.get('player1')
                            : this.players.get('player2');
                        attachOverlap(retryPlayer);
                    });
                }
                break;

            case 'remove_powerup': // coincide con server
                const expiryTimer = this.powerUpExpiryTimers.get(data.id);
                if (expiryTimer) expiryTimer.remove(false);
                this.powerUpExpiryTimers.delete(data.id);

                if (!this.isHostClient()) {
                    // se borran los overlaps y los sprites de los powerups
                    const pu = this.powerUpsNetById.get(data.id);
                    const ov = this.powerUpsNetOverlapsById.get(data.id);

                    if (ov) ov.destroy();
                    if (pu) pu.destroy();

                    this.powerUpsNetOverlapsById.delete(data.id);
                    this.powerUpsNetById.delete(data.id);
                    this.pendingCollectPowerUps.delete(data.id);
                }
                break;

            case 'collect_denied':
                if (!this.isHostClient()) {
                    if (data?.id != null) {
                        const deniedId = data.id;
                        this.time.delayedCall(300, () => {
                            this.pendingCollectPowerUps.delete(deniedId);
                        });
                    }
                }
                break;

            case 'collect_powerup': {
                if (!this.isHostClient()) break;

                // se valian id y jugador
                const id = data.id;
                const who = data.playerName;

                // se intenta almacenar el powerup(p_u)
                const p_u = this.powerUpsById.get(id);
                if (!p_u) break; // si ya no existe, sale

                const player = (this.player1.name === who)
                    ? this.players.get('player1')
                    : this.players.get('player2');

                if (!player) break;

                // se guarda en el inventario del jugador
                this._suppressCollectBroadcast = true;
                const stored = p_u.collect(player);
                this._suppressCollectBroadcast = false;

                if (stored) {
                    const expiryTimer = this.powerUpExpiryTimers.get(id);
                    if (expiryTimer) expiryTimer.remove(false);
                    this.powerUpExpiryTimers.delete(id);
                    // se borra si se recoge
                    this.powerUpsById.delete(id);
                    // avisa al otro cliente para que lo quite del campo
                    this.sendMessage({ type: 'remove_powerup', id });
                    // manda inventarios actualizados
                    this._sendInventorySync();
                } else {
                    // inventario lleno -> permite que el oponente lo intente luego
                    this.sendMessage({ type: 'collect_denied', id, playerName: who });
                }
                break;
            }

            case 'use_powerup':
            case 'apply_powerup':   // use_powerup en server
                const whoUsed = data.playerName; // primero se determina QUIÉN lo usó
                const powerType = data.powerType;

                console.log('[PowerUp] apply_powerup recv. isHost?', this.isHostClient(),
                    'who:', whoUsed, 'type:', powerType);

                const player = (this.player1.name === whoUsed)
                    ? this.players.get('player1')
                    : this.players.get('player2');

                if (!player) break;

                // host
                if (this.isHostClient()) {
                    let appliedType = null;
                    if (powerType) appliedType = player.useNextPowerUp(powerType);
                    if (!appliedType) appliedType = player.useNextPowerUp();

                    if (!appliedType) {
                        console.log('[PowerUp] Host apply failed. who:', whoUsed,
                            'type:', powerType, 'inv:', player.powerUpInventory);
                        this._sendInventorySync();
                        break;
                    }

                    console.log('[PowerUp] Host apply ok:', appliedType,
                        'inv:', player.powerUpInventory);

                    this.updatePlayerInventoryUI(player);
                    this._sendInventorySync();

                    this.sendMessage({
                        type: 'use_powerup',
                        playerName: whoUsed,
                        powerType: appliedType
                    });
                } else {
                    // no-host
                    if (this.pendingPowerUpUse && this.pendingPowerUpUse.playerName === whoUsed) {
                        this.pendingPowerUpUse = null;
                    }

                    if (powerType) {
                        const appliedType = player.useNextPowerUp(powerType);
                        if (!appliedType) {
                            player.activatePowerUp(powerType);
                            console.log('[PowerUp] no-host apply fallback:', powerType,
                                'inv:', player.powerUpInventory);
                        } else {
                            console.log('[PowerUp] no-host applied:', appliedType,
                                'inv:', player.powerUpInventory);
                        }
                        this.updatePlayerInventoryUI(player);
                    }
                }
                break;

            case 'set_message':
                if (!this.isHostClient()) {
                    this.setWinnerText.setText(data.text ?? '');
                    this.setWinnerText.setVisible(!!data.visible);

                    if (data.visible) {
                        this.time.delayedCall(2000, () => {
                            this.setWinnerText.setVisible(false);
                        });
                    }

                    if (data.text.toLowerCase().includes('oro')) {
                        this.isGoldenPoint = true;
                    }
                }
                break;

            case 'inv_sync':
                if (!this.isHostClient()) {
                    // obtiene los jugadores
                    const p1 = this.players.get('player1');
                    const p2 = this.players.get('player2');

                    // sustituye sus inventarios
                    if (p1) { p1.powerUpInventory = data.p1Inv ?? []; this.updatePlayerInventoryUI(p1); }
                    if (p2) { p2.powerUpInventory = data.p2Inv ?? []; this.updatePlayerInventoryUI(p2); }

                    this.pendingPowerUpUse = null;
                }
                break;

            case 'score_sync':
                const oldP1 = this.scoreP1;
                const oldP2 = this.scoreP2;

                this._applyScoreSync(data);
                if (!this.isHostClient() && (this.scoreP1 > oldP1 || this.scoreP2 > oldP2)) {
                    this.playSfx(this.sfx.point);
                }
                break;

            case 'timer_sync':
                if (!this.isHostClient() && typeof data.tiempoRestante === 'number') {
                    this.tiempoRestante = data.tiempoRestante;
                    this._renderTimerText();
                }
                break;

            case 'playerDisconnected':
                this.handleDisconnection();
                break;
            
            case 'play_sound_sync':
                if (!this.isHostClient()) {
                    const key = this.sfx[data.sfx];
                    this.playSfx(key);
                }
                break;
            
            case 'game_finished':
                this.gameEnded = true; 
                console.log("Recibido fin de partida del servidor");
                
                this.scene.start("EndGame_Scene", {
                    winner: data.winner,
                    player1: data.player1,
                    player2: data.player2
                });
                break;
            
            case 'players_snap':
                if (!this.isHostClient()) {
                    const p1 = this.players.get('player1');
                    const p2 = this.players.get('player2');
                    
                    if (p1) {
                        p1.setPosition(data.p1.x, data.p1.y);
                        p1.idleRight();
                    }
                    if (p2) {
                        p2.setPosition(data.p2.x, data.p2.y);
                        p2.idleLeft();
                    }
                    console.log("Posiciones de jugadores reiniciadas (Snap)");
                }
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    }

    handleDisconnection() {
        this.gameEnded = true;
        // detiene el cronómetro y las físicas
        if (this.timerEvent) this.timerEvent.paused = true;
        this.physics.world.pause();

        // feedback visual
        const abandonText = `El oponente ha abandonado.`;
        console.log(abandonText);

        this.add.text(400, 250, abandonText, {
            fontSize: '48px',
            color: '#ff0000'
        }).setOrigin(0.5);

        // limpieza y salida
        this.shutdown();
        this.scene.start('Menu_Scene');
    }

    shutdown() {
        if (this.powerUpExpiryTimers && this.powerUpExpiryTimers.size > 0) {
            this.powerUpExpiryTimers.forEach(timer => {
                if (timer) timer.remove(false);
            });
            this.powerUpExpiryTimers.clear();
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        }
    }

    // Manda un mensaje al servidor
    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    // Genera un nuevo power-up en una posición aleatoria cada cierto tiempo
    schedulePowerUpSpawn() {
        const { minDelayMs, maxDelayMs } = this.powerUpSpawnConfig;
        const rng = this.rng ?? Phaser.Math.RND;
        const delay = rng.between(minDelayMs, maxDelayMs);

        this.time.delayedCall(delay, () => {
            if (this.powerUps.length < this.maxPowerUps) {
                const netX = this.red.x;
                const margin = 80;
                const inner = 25;

                const spawnLeft = rng.between(0, 1) === 0;

                const xMin = spawnLeft ? margin : (netX + inner);
                const xMax = spawnLeft ? (netX - inner) : (this.worldWidth - margin);

                const x = rng.between(Math.floor(xMin), Math.floor(xMax));

                const y = rng.between(this.worldHeight - 220, this.worldHeight - 120);

                const type = this._getWeightedPowerUpType();
                if (type) {
                    const id = ++this.powerUpSeq;
                    const powerUp = new PowerUp(this, x, y, type);
                    
                    const originalCollect = powerUp.collect.bind(powerUp);
                    powerUp.collect = (player) => {
                        const before = Array.isArray(player?.powerUpInventory)
                            ? player.powerUpInventory.length
                            : 0;
                        originalCollect(player);
                        const after = Array.isArray(player?.powerUpInventory)
                            ? player.powerUpInventory.length
                            : 0;
                        const stored = after > before;

                        if (stored && this.isHostClient() && !this._suppressCollectBroadcast) {
                            const expiryTimer = this.powerUpExpiryTimers.get(id);
                            if (expiryTimer) expiryTimer.remove(false);
                            this.powerUpExpiryTimers.delete(id);
                            this.powerUpsById.delete(id);
                            this.sendMessage({ type: 'remove_powerup', id });
                            this._sendInventorySync();
                        }

                        return stored;
                    };

                    this.powerUps.push(powerUp);
                    this.powerUpLastSpawnAt[type] = this.time.now;
                    this.powerUpsById.set(id, powerUp);

                    this.sendMessage({
                        type: 'spawn_powerup',
                        id,
                        x, y,
                        powerType: type
                    });

                    // controla la desaparición del powerup por tiempo (se queda sin recoger)
                    const lifetimeMs = Number.isFinite(powerUp?.lifetime) ? powerUp.lifetime : 5000;
                    const expiryTimer = this.time.delayedCall(lifetimeMs, () => {
                        this.powerUpExpiryTimers.delete(id);
                        const current = this.powerUpsById.get(id);
                        if (!current) return;
                        if (current.isCollected) {
                            this.powerUpsById.delete(id);
                            return;
                        }

                        this.sendMessage({ type: 'remove_powerup', id });
                        this.powerUpsById.delete(id);
                    });
                    this.powerUpExpiryTimers.set(id, expiryTimer);
                }
            }

            this.schedulePowerUpSpawn(); // recursivo
        });
    }

    // Obtiene un tipo de power-up basado en los pesos configurados anteriormente
    _getWeightedPowerUpType() {
        const { weights, cooldownMs } = this.powerUpSpawnConfig;

        const now = this.time.now;
        const entries = Object.entries(weights).filter(([type, weight]) => {
            // se filtran los tipos que no se pueden usar
            // si el peso es 0
            if (weight <= 0) return false;
            // si todavía está en cooldown desde la última aparición
            const cooldown = cooldownMs?.[type];
            if (!cooldown) return true;
            const last = this.powerUpLastSpawnAt?.[type] || 0;
            return now - last >= cooldown;
        });

        // si no queda ningún tipo disponible, se devuelve null
        if (!entries.length) return null;

        // se suman todos los pesos, se elige un número aleatorio entre 1 y esa suma
        const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
        const rng = this.rng ?? Phaser.Math.RND;
        let roll = rng.between(1, total);
        // se van restando pesos hasta que el contador cae en un tipo
        for (const [type, weight] of entries) {
            roll -= weight;
            // se devuelve el tipo
            if (roll <= 0) {
                console.log('[Game_Scene] Power-up aleatorio: ', type);
                return type;
            }
        }

        // si por alguna razón no cae en ninguno, se devuelve el último tipo válido
        return entries[entries.length - 1][0];
    }

    // Reproduce un efecto de sonido
    playSfx(key) {
        if (!key) return;

        this.sound.play(key, { volume: getStoredSfxVolume() });
    }

    // Bucle principal del juego
    update() {
        // se procesan los inputs de los jugadores
        this._handleMyInput();
        // se actualizan los power-ups
        this.players.forEach(player => player.updatePowerUps());

        if (!this.ball) return;

        // el host actualiza el estado de la pelota
        if (this.isHostClient()) {
            this.ball.update();
            // verifica si la pelota golpea el suelo (groundY es la parte superior del suelo)
            if (this.ball.isBallLive && this.ball.sprite.y > this.groundY) {
                this.ball.onGrounded();
            }
            // verifica si la pelota cruza la red (red está en x = 480)
            if (this.ball.sprite.x < 475 && this.ball.courtSide === 'right') {
                this.ball.crossNet();
            } else if (this.ball.sprite.x > 485 && this.ball.courtSide === 'left') {
                this.ball.crossNet();
            }
        }
        // el no-host renderiza lo que llega por red
        else {
            this._applyBallNet();
        }
    }

    // Actualiza el temporizador cada segundo
    updateTimer() {
        if (!this.isHostClient()) return;

        this.tiempoRestante--;
        this._renderTimerText();

        // manda el tiempo al otro cliente
        this.sendMessage({ type: 'timer_sync', tiempoRestante: this.tiempoRestante });

        // se comprueba el fin del tiempo
        if (this.tiempoRestante <= 0) {
            this.timerEvent.paused = true;
            console.log("FIN DEL TIEMPO");

            if (this.scoreP1 > this.scoreP2) this._endSet("player1");
            else if (this.scoreP2 > this.scoreP1) this._endSet("player2");
            else {
                console.log("Empate en el set");

                const msg = 'EMPATE: punto de oro';

                this.isGoldenPoint = true;
                if (this.setWinnerText) {
                    this.setWinnerText.setText(msg);
                    this.setWinnerText.setVisible(true);

                    this.time.delayedCall(2000, () => {
                        if (this.setWinnerText) {
                            this.setWinnerText.setVisible(false);
                        }
                    });
                }

                this.sendMessage({ 
                    type: 'golden_point_sync', 
                    text: msg 
                });
            }
        }
    }

    updateSetScoreUI() {
        if (this.setScoreLeft) this.setScoreLeft.setText(this.setsP1.toString());
        if (this.setScoreRight) this.setScoreRight.setText(this.setsP2.toString());
    }

    // Actualiza la UI del inventario de power-ups de un jugador
    updatePlayerInventoryUI(player) {
        const ui = this.inventoryUI[player.id];

        for (let i = 0; i < 2; i++) {
            if (player.powerUpInventory[i]) {
                ui[i].setTexture(player.powerUpInventory[i]);
                ui[i].setVisible(true);
            } else {
                ui[i].setVisible(false);
            }
        }
    }

    //// MÉTODOS AUXILIARES ////
    // Crea las animaciones de los 3 personajes
    _createAnimations() {
        //// CharacterA ////
        this.anims.create({
            key: 'charA_idleRight',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 0, end: 1 }), // fila 0
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'charA_idleLeft',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 20, end: 21 }).reverse(), // fila 0
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'charA_receiveRight',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 0, end: 10 }), // fila 0
            frameRate: 17,
            repeat: 0
        });
        this.anims.create({
            key: 'charA_receiveLeft',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 17,
            repeat: 0
        });

        this.anims.create({
            key: 'charA_runRight',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 22, end: 32 }), // fila 2
            frameRate: 22,
            repeat: -1
        });
        this.anims.create({
            key: 'charA_runLeft',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 22,
            repeat: -1
        });

        this.anims.create({
            key: 'charA_jumpRight',
            frames: this.anims.generateFrameNumbers('charA_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 17,
            repeat: 0
        });
        this.anims.create({
            key: 'charA_jumpLeft',
            frames: this.anims.generateFrameNumbers('charA_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 17,
            repeat: 0
        });
        ////////

        //// CharacterB ////
        this.anims.create({
            key: 'charB_idleRight',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 0, end: 1 }), // fila 0
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'charB_idleLeft',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 20, end: 21 }).reverse(), // fila 0
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'charB_receiveRight',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 0, end: 10 }), // fila 0
            frameRate: 17,
            repeat: 0
        });
        this.anims.create({
            key: 'charB_receiveLeft',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 17,
            repeat: 0
        });

        this.anims.create({
            key: 'charB_runRight',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 22, end: 32 }), // fila 2
            frameRate: 22,
            repeat: -1
        });
        this.anims.create({
            key: 'charB_runLeft',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 22,
            repeat: -1
        });

        this.anims.create({
            key: 'charB_jumpRight',
            frames: this.anims.generateFrameNumbers('charB_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 17,
            repeat: 0
        });
        this.anims.create({
            key: 'charB_jumpLeft',
            frames: this.anims.generateFrameNumbers('charB_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 17,
            repeat: 0
        });
        ////////

        //// CharacterC ////
        this.anims.create({
            key: 'charC_idleRight',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 0, end: 1 }), // fila 0
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'charC_idleLeft',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 20, end: 21 }).reverse(), // fila 0
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'charC_receiveRight',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 0, end: 10 }), // fila 0
            frameRate: 17,
            repeat: 0
        });
        this.anims.create({
            key: 'charC_receiveLeft',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 17,
            repeat: 0
        });

        this.anims.create({
            key: 'charC_runRight',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 22, end: 32 }), // fila 2
            frameRate: 22,
            repeat: -1
        });
        this.anims.create({
            key: 'charC_runLeft',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 22,
            repeat: -1
        });

        this.anims.create({
            key: 'charC_jumpRight',
            frames: this.anims.generateFrameNumbers('charC_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 17,
            repeat: 0
        });
        this.anims.create({
            key: 'charC_jumpLeft',
            frames: this.anims.generateFrameNumbers('charC_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 17,
            repeat: 0
        });
        ////////
    }

    // Crea los personajes de cada jugador
    _createPlayers() {
        const charP1 = this.player1.character;
        const charP2 = this.player2.character;

        const p1 = new Player(
            this,
            'player1',
            this.worldWidth * 0.25,   // izquierda
            this.groundY - 100,        // arriba del suelo (más margen)
            charP1
        );

        const p2 = new Player(
            this,
            'player2',
            this.worldWidth * 0.75,   // derecha
            this.groundY - 100,        // arriba del suelo (más margen)
            charP2
        );

        this.players.set('player1', p1);
        this.players.set('player2', p2);

        // se establecen los límites de la cancha para cada jugador
        const courtTop = 50;
        // alinear el límite inferior justo por encima del suelo
        // como el ground ahora tiene origin en (0.5, 0), groundY es la parte superior
        const courtBottom = Math.floor(this.groundY);
        const courtInteriorMargin = 25;
        const courtExteriortMargin = 80;

        // player1 (izquierda):
        p1.setBounds(courtExteriortMargin, 480 - courtInteriorMargin, courtTop, courtBottom);

        // player2 (derecha):
        p2.setBounds(480 + courtInteriorMargin, this.worldWidth - courtExteriortMargin, courtTop, courtBottom);

        this.commandProcessor.setPlayers(this.players);
        this.commandProcessor.setGameScene(this);

        // por defecto, animación idle
        p1.idleRight();
        p2.idleLeft();
    }

    // Crea el suelo, la red, los límites, etc.
    _setupPhysicsWorld(ground) {
        this.players.forEach(player => {
            // colisión jugador-suelo
            this.physics.add.collider(player.sprite, ground);

            // colisión jugador-red
            this.physics.add.collider(player.sprite, this.red, () => {
                console.log(`${player.id} tocó la red!`);
                player.sprite.setVelocityX(0);
            });
        });
    }

    // Asigna los controles/teclas de cada jugador
    _setupInputMappings() {
        const inputConfig = [
            // jugador 1
            {
                playerId: 'player1',
                leftKey: 'A',
                rightKey: 'D',
                jumpKey: 'W',
                receiveKey: 'S',
                powerKey: 'E'
            },
            // jugador 2
            {
                playerId: 'player2',
                leftKey: 'J',
                rightKey: 'L',
                jumpKey: 'I',
                receiveKey: 'K',
                powerKey: 'O'
            }
        ];

        this.inputMappings = inputConfig.map(config => {
            return {
                playerId: config.playerId,
                leftKeyObj: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes[config.leftKey]
                ),
                rightKeyObj: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes[config.rightKey]
                ),
                jumpKeyObj: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes[config.jumpKey]
                ),
                receiveKeyObj: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes[config.receiveKey]
                ),
                powerKeyObj: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes[config.powerKey]
                )
            };
        });
    }

    // Procesa solo el input del jugador local
    _handleMyInput() {
        const player = this.player1.name === this.myUsername ? this.players.get('player1') : this.players.get('player2');
        const mapping = this.inputMappings.find(mapping => mapping.playerId === player.id);
        // si está paralizado, se deja en idle
        if (player.isParalyzed) {
            const idleDir = (player.facing === 'left') ? 'idleLeft' : 'idleRight';
            this.commandProcessor.process(
                new MovePlayerCommand(player, idleDir)
            );
            return;
        }

        let direction;

        // movimiento horizontal normal
        if (mapping.leftKeyObj.isDown) {
            direction = 'left';
        }
        else if (mapping.rightKeyObj.isDown) {
            direction = 'right';
        }
        // no se pulsa nada, así que se queda idle según hacia dónde miraba
        else {
            direction = (player.facing === 'left') ? 'idleLeft' : 'idleRight';
        }

        // se aplica movimiento/idle SOLO si no está saltando
        // si está saltando, no se procesa el movimiento para no sobrescribir la animación
        if (!player.isJumping) {
            this.commandProcessor.process(
                new MovePlayerCommand(player, direction)
            );
            this.sendMessage({
                type: 'player_move', playerName: this.myUsername, command: direction
            });
        }

        // recepción
        if (Phaser.Input.Keyboard.JustDown(mapping.receiveKeyObj)) {
            const receiveDir = (player.facing === 'left') ? 'receiveLeft' : 'receiveRight';
            this.commandProcessor.process(
                new MovePlayerCommand(player, receiveDir)
            );
            this.sendMessage({
                type: 'player_move', playerName: this.myUsername, command: receiveDir
            });
        }

        // salto/remate
        if (Phaser.Input.Keyboard.JustDown(mapping.jumpKeyObj)) {
            const jumpDir = (player.facing === 'left') ? 'jumpLeft' : 'jumpRight';
            this.commandProcessor.process(
                new MovePlayerCommand(player, jumpDir)
            );
            this.sendMessage({
                type: 'player_move', playerName: this.myUsername, command: jumpDir
            });
        }

        // powerups
        if (Phaser.Input.Keyboard.JustDown(mapping.powerKeyObj)) {
            console.log('[PowerUp] key pressed. isHost?', this.isHostClient(),
                'player:', player.id,
                'inv:', player.powerUpInventory);

            // host
            if (this.isHostClient()) {
                const usedType = player.useNextPowerUp();
                if (!usedType) return;

                console.log('[PowerUp] Host used:', usedType, 'inv:', player.powerUpInventory);

                this.updatePlayerInventoryUI(player);

                console.log('[PowerUp] Host send use_powerup:', usedType);
                this.sendMessage({
                    type: 'use_powerup',
                    playerName: this.myUsername,
                    powerType: usedType
                });

                this._sendInventorySync();
            } else {
                // no-host
                if (this.pendingPowerUpUse) {
                    console.log('[PowerUp] blocked: pendingPowerUpUse=', this.pendingPowerUpUse);
                    return;
                }

                const requestedType = player.powerUpInventory?.[0];
                if (!requestedType) {
                    console.log('[PowerUp] no powerups in inventory -> ignore');
                    return;
                }

                this.pendingPowerUpUse = {
                    playerName: this.myUsername,
                    powerType: requestedType,
                    t: this.time.now
                };

                console.log('[PowerUp] requesting use:', requestedType);

                this.sendMessage({
                    type: 'use_powerup',
                    playerName: this.myUsername,
                    powerType: requestedType
                });
            }
        }

        // se actualiza el estado del jugador local
        player.update();
    }

    _handleOponentInput(data) {
        const opponent = this.player1.name === data.playerName ? this.players.get('player1') : this.players.get('player2');
        if (data.command === 'powerUp') {
            opponent.useNextPowerUp();
            this.updatePlayerInventoryUI(opponent);
        } else {
            this.commandProcessor.process(
                new MovePlayerCommand(opponent, data.command)
            );
        }
        opponent.update();
    }

    // Crea la pelota
    _createBall() {
        this.ball = new Ball(this, this.worldWidth / 2, 150);
    }

    // Configura las colisiones de la pelota
    _setupBallCollisions() {
        // colisiones de la pelota con los jugadores
        this.players.forEach(player => {
            this.physics.add.overlap(
                this.ball.sprite,
                player.sprite,
                () => this._onBallPlayerCollision(this.ball, player),
                null,
                this
            );
        });

        // colisión pelota-red
        this.physics.add.collider(this.ball.sprite, this.red, () => {
            // se dispara al tocar la red
            console.log('La pelota toca la red!');

            this.ball.sprite.setVelocityX(this.ball.sprite.body.velocity.x * 0.5);
            this.ball.sprite.setVelocityY(this.ball.sprite.body.velocity.y * 0.5);
        });

        // colisión de la pelota con el suelo (dispara puntuación)
        const groundY = this.worldHeight - 10;
        this.ball.sprite.setCollideWorldBounds(true);
        this.ball.sprite.setBounce(0.8);
    }

    // Configura los event listeners de la pelota
    _setupBallEvents() {
        this.events.on('rallyConcluded', (data) => {
            if (this.isSetEnding) return;

            console.log(`Rally concluded: ${data.scoringPlayerId} scores!`);
            const scorerId = data.scoringPlayerId;

            // se coge el player que ha anotado
            const scoringPlayer = this.players.get(scorerId);
            const multiplier = scoringPlayer ? (scoringPlayer.scoreMultiplier || 1) : 1;

            // 1 punto base * multiplicador
            const pointsToAdd = multiplier;

            if (scorerId === 'player1') {
                // marcador visual
                this.pointsLeft += pointsToAdd;
                this.scoreLeft.setText(this.pointsLeft.toString());

                // puntos del set (para lógica de sets)
                this.scoreP1 += pointsToAdd;
            }
            else if (scorerId === 'player2') {
                this.pointsRight += pointsToAdd;
                this.rightScore.setText(this.pointsRight.toString());

                this.scoreP2 += pointsToAdd;
            }
            // se reproduce el efecto de sonido de punto
            this.playSfx(this.sfx.point);

            if (this.isGoldenPoint) {
                this.isGoldenPoint = false;
                this._endSet(scorerId);
                return;
            }

            // condición de 11 puntos con 2 de diferencia
            this._checkWinCondition();

            // si NO se está terminando el set, resetea rally y avisa
            if (!this.isSetEnding) {
                this.ball.resetRally();
                this.ball.setServePosition();

                this._sendBallReset('point');
            }

            // sincroniza el marcador
            this._sendScoreSync();
        });

    }

    // Verifica si la pelota está en la zona válida para golpearla
    _isBallInHitZone(ballSprite, player, isJumping, isReceiving) {
        const body = player.sprite.body;
        if (!body) return false;

        const ballX = ballSprite.x;
        const ballY = ballSprite.y;
        const bodyTop = body.y;
        const bodyHeight = body.height;
        const bodyCenterX = body.x + body.width * 0.5;

        const zone = isJumping
            ? { top: -0.1, bottom: 0.6 }
            : (isReceiving ? { top: 0.35, bottom: 0.85 } : { top: 0.25, bottom: 0.85 });

        const zoneTop = bodyTop + bodyHeight * zone.top;
        const zoneBottom = bodyTop + bodyHeight * zone.bottom;

        if (ballY < zoneTop || ballY > zoneBottom) {
            return false;
        }

        const facingRight = player.facing === 'right';
        const wideHit = isReceiving || isJumping;
        const reachForward = body.width * (wideHit ? 0.9 : 0.75);
        const reachBack = body.width * (wideHit ? 0.25 : 0.15);
        const minX = facingRight ? bodyCenterX - reachBack : bodyCenterX - reachForward;
        const maxX = facingRight ? bodyCenterX + reachForward : bodyCenterX + reachBack;

        if (ballX < minX || ballX > maxX) return false;

        return true;
    }

    // Maneja colisión entre pelota y jugador
    _onBallPlayerCollision(ball, player) {
        if (!ball.isBallLive) return;

        const isJumping = !player.sprite.body.blocked.down;
        const isReceiving = player.isReceiving;
        const playerDirection = player.facing;

        if (!this._isBallInHitZone(ball.sprite, player, isJumping, isReceiving)) {
            return;
        }

        ball.hit(player, playerDirection, isJumping, isReceiving);

        const now = this.time.now;
        if (now > this.lastHitTime + 300) {
            this.lastHitTime = now;

            const soundType = isJumping ? 'spike' : 'receive';
            
            this.playSfx(this.sfx[soundType]);

            this.sendMessage({
                type: 'play_sound_sync',
                sfx: soundType
            });
        }
    }

    // Controla el final del juego
    _endGame(winner) {
        this._stopBallSync();
        this.gameEnded = true;

        // se para el timer del set
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }

        // silbato de final de partido
        this.playSfx(this.sfx.whistle);

        // se detiene la física de esta escena antes de salir
        if (this.physics && this.physics.world) {
            this.physics.world.pause();
        }

        this.sendMessage({
            type: 'game_finished',
            winner: winner,
            player1: this.player1,
            player2: this.player2
        });

        console.log("Partida Online terminada. Ganador:", winner);

        this.time.delayedCall(100, () => {
            this.scene.start("EndGame_Scene", {
                winner: winner,
                player1: this.player1,
                player2: this.player2
            });
        });
    }

    // Verifica si algún jugador ha ganado el set
    _checkWinCondition() {
        const minPoints = 11;   // puntos mínimos para ganar
        const minDiff = 2;      // diferencia mínima de puntos para ganar

        // diferencia de puntos
        const scoreDiff = this.scoreP1 - this.scoreP2;
        const maxScore = Math.max(this.scoreP1, this.scoreP2);

        // si no se cumple alguna de las condiciones, no se termina el set
        if (maxScore < minPoints || Math.abs(scoreDiff) < minDiff) {
            return;
        }

        // sino, se determina el ganador del set
        const winner = scoreDiff > 0 ? "player1" : "player2";
        this._endSet(winner);
    }

    // Controla el final de un set
    _endSet(winner) {
        if (this.isSetEnding) return;

        this.isSetEnding = true;
        if (this.ball?.sprite) {
            this.ball.isBallLive = false;
            this.ball.sprite.setVelocity(0, 0);
        }

        // actualizar sets ganados
        if (winner === 'player1') this.setsP1++;
        else if (winner === 'player2') this.setsP2++;

        console.log(`Set terminado. Score sets: P1=${this.setsP1}, P2=${this.setsP2}`);

        this.updateSetScoreUI();
        // sincroniza el marcador
        this._sendScoreSync();
        this.sendMessage({ type: 'set_message', text: `SET para ${winner}`, visible: true });

        // mostrar mensaje de ganador de set
        const winnerLabel = (winner === 'player1') ? this.player1.name : this.player2.name;
        this.setWinnerText.setText(`SET para ${winnerLabel}`);
        this.setWinnerText.setVisible(true);

        this.sendMessage({
            type: 'set_message',
            text: this.setWinnerText.text,
            visible: true
        });

        // Avanzar número de set
        this.currentSet++;

        const matchOver = (this.setsP1 === 2 || this.setsP2 === 2);

        if (matchOver) {
            // último set: se muestra el mensaje 2s y luego se pasa a la escena final
            this.time.delayedCall(2000, () => {
                // (si quieres, aquí podrías ocultar el texto)
                this._endGame(winner);
            });
        } else {
            // set intermedio: se muestra el mensaje 2s, se oculta y se reinicia el set
            this.time.delayedCall(2000, () => {
                if (this.setWinnerText) {
                    this.setWinnerText.setVisible(false);
                }
                this._resetSet();
            });
        }
    }

    // Reinicia el estado para un nuevo set
    _resetSet() {
        this.isSetEnding = false;
        this.isGoldenPoint = false;

        // se actualiza el texto del set actual
        this.setText.setText(`SET ${this.currentSet}`);

        // se reinicia el tiempo
        this.tiempoRestante = this.tiempoTotal;
        this.timerEvent.paused = false;
        this.updateTimer();

        // se reinicia la puntuación del set (lógica)
        this.scoreP1 = 0;
        this.scoreP2 = 0;

        // se reinicia el marcador visual en pantalla
        this.pointsLeft = 0;
        this.pointsRight = 0;
        this.scoreLeft.setText('0');
        this.rightScore.setText('0');

        // se sincroniza el marcador
        this._sendScoreSync();

        // se reposicionan los jugadores a sus posiciones iniciales
        const p1 = this.players.get('player1');
        const p2 = this.players.get('player2');

        const p1X = this.worldWidth * 0.25;
        const p1Y = this.worldHeight * 0.7;
        const p2X = this.worldWidth * 0.75;
        const p2Y = this.worldHeight * 0.7;

        p1.setPosition(p1X, p1Y);
        p2.setPosition(p2X, p2Y);

        p1.idleRight();
        p2.idleLeft();

        this.sendMessage({
            type: 'players_snap',
            p1: { x: p1X, y: p1Y },
            p2: { x: p2X, y: p2Y }
        });

        // se resetea la pelota y se avisa al otro cliente
        this.ball.resetRally();
        this.ball.setServePosition();
        this._sendBallReset('set_reset');
        this.playSfx(this.sfx.whistle);
    }

    // Actualiza el texto del temporizador en pantalla
    _renderTimerText() {
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = this.tiempoRestante % 60;
        const formato = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        this.timerText.setText(formato);
    }


    //  WEBSOCKET - SINCRONIZACIÓN PELOTA
    // Inicia el envío periódico de la posición/velocidad de la pelota (solo host)
    _startBallSync(intervalMs = 66) {
        if (!this.isHostClient()) return;
        if (this.ballSyncEvent) this.ballSyncEvent.remove(false);

        this.ballSyncEvent = this.time.addEvent({
            delay: intervalMs,
            loop: true,
            callback: () => {
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
                if (!this.ball?.sprite?.body) return;

                const b = this.ball.sprite.body;
                this.ballSyncSeq++;

                this.sendMessage({
                    type: 'ball_sync',
                    x: this.ball.sprite.x,
                    y: this.ball.sprite.y,
                    vx: b.velocity?.x ?? 0,
                    vy: b.velocity?.y ?? 0,
                    seq: this.ballSyncSeq
                });
            }
        });
    }

    // Detiene el envío periódico de la posición/velocidad de la pelota (solo host)
    _stopBallSync() {
        if (this.ballSyncEvent) {
            this.ballSyncEvent.remove(false);
            this.ballSyncEvent = null;
        }
    }

    // Envía un mensaje de reseteo de la pelota (solo host)
    _sendBallReset(reason = 'point') {
        if (!this.isHostClient()) return;
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        if (!this.ball?.sprite?.body) return;

        const b = this.ball.sprite.body;
        this.ballSyncSeq++;

        this.sendMessage({
            type: 'ball_reset',
            reason,
            x: this.ball.sprite.x,
            y: this.ball.sprite.y,
            vx: b.velocity?.x ?? 0,
            vy: b.velocity?.y ?? 0,
            seq: this.ballSyncSeq
        });
    }

    // Controla la actualización de la pelota recibida por red (solo no-host)
    _onBallUpdate(msg) {
        // para evitar updates viejos
        if (msg.rallyId != null && msg.rallyId !== this.rallyId) return;

        const seq = msg.seq ?? 0;
        if (seq && seq <= this.ballNet.lastSeq) return;

        this.ballNet.lastSeq = seq;
        this.ballNet.tx = msg.x;
        this.ballNet.ty = msg.y;
        this.ballNet.tvx = msg.vx ?? 0;
        this.ballNet.tvy = msg.vy ?? 0;
        this.ballNet.hasTarget = true;
    }

    // Controla el reseteo de la pelota recibido por red (ambos clientes)
    _onBallReset(msg) {
        if (msg.rallyId != null) this.rallyId = msg.rallyId;
        this.ballNet.lastSeq = msg.seq ?? this.ballNet.lastSeq;

        if (!this.ball?.sprite) return;

        // snap
        this.ball.sprite.setPosition(msg.x, msg.y);

        // target igual para que el smoothing no vuelva atrás
        this.ballNet.tx = msg.x;
        this.ballNet.ty = msg.y;
        this.ballNet.hasTarget = true;
    }

    // Aplica la interpolación de la pelota (solo no-host)
    _applyBallNet() {
        if (!this.ballNet.hasTarget || !this.ball?.sprite) return;

        const sx = this.ball.sprite.x;
        const sy = this.ball.sprite.y;

        const dx = this.ballNet.tx - sx;
        const dy = this.ballNet.ty - sy;
        const dist = Math.hypot(dx, dy);

        if (dist > this.ballNet.snapDist) {
            // si está demasiado lejos, snap
            this.ball.sprite.setPosition(this.ballNet.tx, this.ballNet.ty);
            return;
        }

        // suavizado
        this.ball.sprite.x = Phaser.Math.Linear(sx, this.ballNet.tx, this.ballNet.lerp);
        this.ball.sprite.y = Phaser.Math.Linear(sy, this.ballNet.ty, this.ballNet.lerp);
    }

    // Aplica la sincronización de puntuación recibida por red
    _applyScoreSync(data) {
        // adapta nombres según lo que mandes tú
        if (typeof data.scoreP1 === 'number') this.scoreP1 = data.scoreP1;
        if (typeof data.scoreP2 === 'number') this.scoreP2 = data.scoreP2;

        if (typeof data.pointsLeft === 'number') {
            this.pointsLeft = data.pointsLeft;
            this.scoreLeft.setText(String(this.pointsLeft));
        }
        if (typeof data.pointsRight === 'number') {
            this.pointsRight = data.pointsRight;
            this.rightScore.setText(String(this.pointsRight));
        }

        if (typeof data.setsP1 === 'number') this.setsP1 = data.setsP1;
        if (typeof data.setsP2 === 'number') this.setsP2 = data.setsP2;
        this.updateSetScoreUI();

        if (typeof data.currentSet === 'number') {
            this.currentSet = data.currentSet;
            this.setText.setText(`SET ${this.currentSet}`);
        }

        if (typeof data.isGoldenPoint === 'boolean') this.isGoldenPoint = data.isGoldenPoint;
    }

    // Envía la sincronización de puntuación (solo host)
    _sendScoreSync() {
        if (!this.isHostClient()) return;

        this.sendMessage({
            type: 'update_score', // coincide con server
            scoreP1: this.scoreP1,
            scoreP2: this.scoreP2,
            pointsLeft: this.pointsLeft,
            pointsRight: this.pointsRight,
            setsP1: this.setsP1,
            setsP2: this.setsP2,
            currentSet: this.currentSet,
            isGoldenPoint: this.isGoldenPoint
        });
    }

    // Envía la sincronización del inventario de power-ups (solo host)
    _sendInventorySync() {
        if (!this.isHostClient()) return;
        console.log("[GAMEONLINE] Enviando mensaje de sincronizar inventarios...");

        const p1 = this.players.get('player1');
        const p2 = this.players.get('player2');

        console.log("[GAMEONLINE] Enviando mensaje para el server...");
        this.sendMessage({
            type: 'inv_sync',
            p1Inv: p1?.powerUpInventory ?? [],
            p2Inv: p2?.powerUpInventory ?? []
        });
    }
}

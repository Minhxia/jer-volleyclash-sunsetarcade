// Clase de la escena de juego online

import Phaser from 'phaser';
import { Player } from '../Entities/Player.js';
import { PowerUp } from '../Entities/PowerUp.js';
import { Ball } from '../Entities/Ball.js';
import { CommandProcessor } from '../Commands/CommandProcessor.js';
import { MovePlayerCommand } from '../Commands/MovePlayerCommand.js';
import { getStoredSfxVolume } from '../UI/Audio.js';
import { io } from 'socket.io-client';

export class GameOnline_Scene extends Phaser.Scene {
    tiempoTotal = 60; // para 2 min poner 120 segundos
    tiempoRestante = this.tiempoTotal;
    timerText;
    timerEvent;
    constructor() {
        super('GameOnline_Scene');
    }

    init(data) {
        this.socket = this.registry.get('socket');   
        
        if(!this.socket) {
            this.socket = io();
            this.registry.set('socket', this.socket);
        }

        this.players = new Map();
        this.player1Data = data.player1;
        this.player2Data = data.player2;
        this.selectedScenario = data.selectedScenario;

        this.commandProcessor = new CommandProcessor();
        
        this.myUsername = this.registry.get('username');
        this.myRole = (this.player1Data.name === this.myUsername) ? 'player1' : 'player2';
        this.opponentRole = (this.myRole === 'player1') ? 'player2' : 'player1';

        this.ball = null;
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        this.setsP1 = 0;
        this.setsP2 = 0;
        this.maxSets = 3; // mejor de 3
        this.currentSet = 1; // set actual
        this.isGoldenPoint = false;
        this.isSetEnding = false;
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

        // iniciar el contador para el cronómetro
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.updateTimer();

        // FONDO DEL ESCENARIO SELECCIONADO
        this.add.image(width / 2, height / 2, this.selectedScenario)
            .setOrigin(0.5)
            .setDisplaySize(width, height)
            .setDepth(-1); 

        // Red
        const red = this.physics.add.staticSprite(width / 2, height - 160, 'red').setScale(0.6);

        const redTexture = this.textures.get('red').getSourceImage();
        red.body.setSize(redTexture.width * 0.5, redTexture.height * 0.5); // multiplicar por el scale
        red.body.setOffset(-red.body.width/2, -red.body.height/2);
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
        // Configurable: altura y desplazamiento desde el fondo (`groundOffset`)
        const groundHeight = 20;
        const groundOffset = 90; // elevar el suelo 100px desde el fondo
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
        // montar colisiones físicas entre jugadores y suelo para que body.blocked.down funcione
        this._setupPhysicsWorld(ground);

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

        this.schedulePowerUpSpawn();

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
        // empujón sutíl para evitar que se quede sobre la red al inicio
        this.ball.setServePosition();
        // colliders de la pelota
        this._setupBallCollisions();
        // eventos de la pelota
        this._setupBallEvents();

        // acceso directo a la escena de fin de partida
        this.input.keyboard.on("keydown-F", () => {
            const winner = this.scoreP1 >= this.scoreP2 ? "player1" : "player2";
            this._endGame(winner);
        });

        // ------- WEBSOCKETS -------

        // Movimiento del rival
        this.socket.on('opponent_move', (data) => {
            const opponent = this.players.get(this.opponentRole);
            if (opponent && opponent.sprite) {
                opponent.sprite.setPosition(data.x, data.y);
                opponent.sprite.setFlipX(data.flipX);

                opponent.isReceiving = data.isReceiving;
                
                if (data.anim) {
                    opponent.sprite.play(data.anim, true);
                }

                opponent.clampWithinBounds();
                opponent.updateMultiplierTextPosition();
            }
        });

        // Sincronización de pelota (El Host envía, el Invitado recibe)
        this.socket.on('ball_update', (data) => {
            if (this.myRole === 'player2' && this.ball) {
                this.ball.sprite.setPosition(data.x, data.y);
                this.ball.sprite.setVelocity(data.vx, data.vy);
            }
        });

        // Sincronización del tiempo
        this.socket.on('timer_sync', (data) => {
            if (this.myRole === 'player2') {
                this.tiempoRestante = data.time;
                this._updateTimerVisuals();
            }
        });

        // Sincronizacion de los sets
        this.socket.on('set_finished_sync', (data) => {
            if (this.myRole === 'player2') {
                this.setsP1 = data.setsP1;
                this.setsP2 = data.setsP2;
                this._handleSetEndLogic(data.winner, data.matchOver);
            }
        });

        // Puntuación sincronizada
        this.socket.on('score_sync', (data) => {
            this.scoreP1 = data.p1;
            this.scoreP2 = data.p2;
            this.scoreLeft.setText(this.scoreP1.toString());
            this.rightScore.setText(this.scoreP2.toString());
        });

        // Gestión de desconexiones
        this.socket.on('player_abandoned', (data) => {
            // Detener cronómetro y físicas
            if (this.timerEvent) this.timerEvent.paused = true;
            this.physics.world.pause();

            // Feedback visual
            const abandonText = `El oponente (${data.username}) ha abandonado.`;
            console.log(abandonText);
            
            // Puedes usar un alert como tenías o un texto de Phaser
            alert(abandonText + "\nPartida finalizada.");

            // Limpieza y salida
            this.scene.start('Menu_Scene');
        });

        // Aplicación de powerUps
        this.socket.on('apply_powerup', (data) => {
            // data: { type: 'paralizar', attacker: 'player1' }
            console.log(`El rival (${data.attacker}) ha usado: ${data.type}`);
            
            const attacker = this.players.get(data.attacker);
            const opponentId = (data.attacker === 'player1') ? 'player2' : 'player1';
            const opponent = this.players.get(opponentId);

            attacker.useNextPowerUp();

            if (data.type === 'por2' || data.type === 'por3' || data.type === 'velocidad') {
                attacker.applyPowerUpEffect(data.type);
            } else if (data.type === 'paralizar' || data.type === 'ralentizar') {
                opponent.applyPowerUpEffect(data.type);
            }

            this.updatePlayerInventoryUI(attacker);
            this.updatePlayerInventoryUI(opponent);
        });

        // Spawn de power ups
        this.socket.on('force_spawn_powerup', (data) => {
            // Si soy el Invitado, obedezco lo que el Host ha decidido
            if (this.myRole === 'player2') {
                this._createPowerUpLocal(data.x, data.y, data.type);
            }
        });

        // Punto de Oro
        this.socket.on('force_golden_point', () => {
            if (this.myRole === 'player2') {
                this.isGoldenPoint = true;
                this.setWinnerText.setText('EMPATE: punto de oro');
                this.setWinnerText.setVisible(true);
            }
        });
    }

    // Genera un nuevo power-up en una posición aleatoria cada cierto tiempo
    schedulePowerUpSpawn() {
        const { minDelayMs, maxDelayMs } = this.powerUpSpawnConfig;
        const delay = Phaser.Math.Between(minDelayMs, maxDelayMs);

        this.time.delayedCall(delay, () => {
            // --- SOLO EL HOST (P1) TOMA LA DECISIÓN ---
            if (this.myRole === 'player1') {
                if (this.powerUps.length < this.maxPowerUps) {
                    const x = Phaser.Math.Between(80, this.worldWidth - 80);
                    const y = Phaser.Math.Between(this.worldHeight - 220, this.worldHeight - 120);
                    const type = this._getWeightedPowerUpType();

                    if (type) {
                        // 1. Lo creamos en nuestra pantalla (Host)
                        this._createPowerUpLocal(x, y, type);

                        // 2. Avisamos al rival para que lo cree exactamente igual
                        this.socket.emit('spawn_powerup', { x, y, type });
                    }
                }
            }
            // El bucle sigue corriendo para el Host
            this.schedulePowerUpSpawn(); 
        });
    }

    // Método auxiliar para no repetir código
    _createPowerUpLocal(x, y, type) {
        const powerUp = new PowerUp(this, x, y, type);
        this.powerUps.push(powerUp);
        this.powerUpLastSpawnAt[type] = this.time.now;
        console.log(`[Online] Power-up creado: ${type} en ${x},${y}`);
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
        let roll = Phaser.Math.Between(1, total);
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
        this.players.forEach(player => {
            player.update();
            player.updatePowerUps();
            player.updateMultiplierTextPosition();
        });

        if (this.ball) {
            this.ball.update();
            
            // Solo el Host valida si la pelota toca el suelo para evitar dobles puntos
            if (this.myRole === 'player1') {
                if (this.ball.isBallLive && this.ball.sprite.y > this.groundY) {
                    this.ball.onGrounded();
                }
            }
        }

        // Procesar input local
        this._handleMyLocalInput();

        const myPlayer = this.players.get(this.myRole);
        if (myPlayer && myPlayer.sprite && myPlayer.sprite.anims) {
            let animToSend = null;
            const currentAnim = myPlayer.sprite.anims.currentAnim;

            if (currentAnim) {
                // Si estamos saltando y la animación ya terminó, no volvemos a enviar "jump"
                if (myPlayer.isJumping && !myPlayer.sprite.anims.isPlaying) {
                    animToSend = null; // Detenemos el envío de la key para que no reinicie
                } else {
                    animToSend = currentAnim.key;
                }
            }

            this.socket.emit('player_move', {
                x: myPlayer.sprite.x,
                y: myPlayer.sprite.y,
                anim: animToSend,
                flipX: myPlayer.sprite.flipX,
                isReceiving: myPlayer.isReceiving
            });
        }

        if (this.myRole === 'player1' && this.ball) {
            this.socket.emit('ball_sync', {
                x: this.ball.sprite.x,
                y: this.ball.sprite.y,
                vx: this.ball.sprite.body.velocity.x,
                vy: this.ball.sprite.body.velocity.y
            });
        }
    }

    _handleSetEndLogic(winner, matchOver) {
        this.isSetEnding = true;
        if (this.ball?.sprite) {
            this.ball.isBallLive = false;
            this.ball.sprite.setVelocity(0, 0);
        }

        this.timerEvent.paused = true;
        this.updateSetScoreUI();

        const winnerLabel = (winner === 'player1') ? this.player1Data.name : this.player2Data.name;
        this.setWinnerText.setText(`SET para ${winnerLabel}`);
        this.setWinnerText.setVisible(true);

        if (matchOver) {
            this.time.delayedCall(3000, () => {
                const finalWinner = (this.setsP1 === 2) ? 'player1' : 'player2';

                this.scene.start("EndGame_Scene", {
                    winner: finalWinner,
                    player1: this.player1Data,
                    player2: this.player2Data
                });
            });
        } else {
            this.currentSet++;
            this.time.delayedCall(2000, () => {
                this.setWinnerText.setVisible(false);
                this._resetSet();
            });
        }
    }

    // Actualiza el temporizador cada segundo
    updateTimer() {
        // Solo el Host descuenta el tiempo
        if (this.myRole === 'player1') {
            this.tiempoRestante--;
            // Avisamos al rival del tiempo actual
            this.socket.emit('timer_sync', { time: this.tiempoRestante });

            if (this.tiempoRestante <= 0) {
                this._handleTimerEnd();
            }
        }
        this._updateTimerVisuals();
    }

    _updateTimerVisuals() {
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = this.tiempoRestante % 60;
        const formato = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        this.timerText.setText(formato);
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
        const charP1 = this.player1Data.character;
        const charP2 = this.player2Data.character;

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

    // Procesa el input del jugador
    _handleMyLocalInput() {
        console.log('Manejando inputs del jugador');
        const player = this.players.get(this.myRole);
        if (!player) return;

        if (player.isParalyzed) {
            const idleDir = (player.facing === 'left') ? 'idleLeft' : 'idleRight';
            this.commandProcessor.process(new MovePlayerCommand(player, idleDir));
            return;
        }

        const keys = { left: 'A', right: 'D', jump: 'W', receive: 'S', power: 'E' };

        const cursorKeys = {
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.left]),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.right]),
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.jump]),
            receive: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.receive]),
            power: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.power])
        };

        let direction;

        // 3. Movimiento Horizontal
        if (cursorKeys.left.isDown) {
            direction = 'left';
        } else if (cursorKeys.right.isDown) {
            direction = 'right';
        } else {
            direction = (player.facing === 'left') ? 'idleLeft' : 'idleRight';
        }

        // Aplicar movimiento solo si no está en medio de un salto (para no romper la animación)
        if (!player.isJumping) {
            this.commandProcessor.process(new MovePlayerCommand(player, direction));
        }

        // 4. Recepción (JustDown para que no se repita infinitamente al mantener)
        if (Phaser.Input.Keyboard.JustDown(cursorKeys.receive)) {
            const receiveDir = (player.facing === 'left') ? 'receiveLeft' : 'receiveRight';
            this.commandProcessor.process(new MovePlayerCommand(player, receiveDir));
        }

        // 5. Salto / Remate
        if (Phaser.Input.Keyboard.JustDown(cursorKeys.jump)) {
            const jumpDir = (player.facing === 'left') ? 'jumpLeft' : 'jumpRight';
            this.commandProcessor.process(new MovePlayerCommand(player, jumpDir));
        }

        // 6. Uso de PowerUp
        if (Phaser.Input.Keyboard.JustDown(cursorKeys.power)) {
            const powerType = player.getNextPowerUpType();

            if (powerType) {
                player.useNextPowerUp();
                this.updatePlayerInventoryUI(player);

                // Notificar al rival para que su pantalla reaccione (Fase 4: Sincronización)
                this.socket.emit('use_powerup', { 
                    type: powerType, 
                    attacker: this.myRole 
                });
            }
        }
    }

    _handleTimerEnd() {
        console.log("[Host] Tiempo agotado. Evaluando ganador del set...");
        this.timerEvent.paused = true;

        if (this.scoreP1 > this.scoreP2) {
            this._endSet("player1");
        } else if (this.scoreP2 > this.scoreP1) {
            this._endSet("player2");
        } else {
            // Lógica de empate (Punto de Oro)
            console.log("[Host] Empate al final del tiempo. Iniciando Punto de Oro.");
            this.isGoldenPoint = true;
            
            // Avisamos al rival para que vea el mensaje de Punto de Oro
            this.socket.emit('golden_point_sync'); 
            
            if (this.setWinnerText) {
                this.setWinnerText.setText('EMPATE: punto de oro');
                this.setWinnerText.setVisible(true);
            }
        }
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
                () => {
                    // SOLO EL HOST tiene autoridad para procesar el hit físico
                    if (this.myRole === 'player1') {
                        // Verificamos zona de impacto
                        const isJumping = !player.sprite.body.blocked.down;
                        const isReceiving = player.isReceiving; // Este valor ya viene actualizado por el socket
                        const playerDirection = player.facing;

                        if (this._isBallInHitZone(this.ball.sprite, player, isJumping, isReceiving)) {
                            // Aplicamos el golpe en el Host
                            this.ball.hit(player, playerDirection, isJumping, isReceiving);

                            // Sincronizamos la nueva velocidad inmediatamente
                            this.socket.emit('ball_sync', {
                                x: this.ball.sprite.x,
                                y: this.ball.sprite.y,
                                vx: this.ball.sprite.body.velocity.x,
                                vy: this.ball.sprite.body.velocity.y
                            });
                        }
                    }
                },
                null,
                this
            );
        });

        // colisión pelota-red
        this.physics.add.collider(this.ball.sprite, this.red, () => {
            // Esto se dispara al tocar la red
            console.log('La pelota toca la red!');

            if (this.myRole === 'player1') {
                this.ball.sprite.setVelocityX(this.ball.sprite.body.velocity.x * 0.5);
                this.ball.sprite.setVelocityY(this.ball.sprite.body.velocity.y * 0.5);
            }
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

            // SOLO EL HOST calcula y emite el nuevo estado
            if (this.myRole === 'player1') {
                const scorerId = data.scoringPlayerId;
                const scoringPlayer = this.players.get(scorerId);
                const multiplier = scoringPlayer ? (scoringPlayer.scoreMultiplier || 1) : 1;

                if (scorerId === 'player1') this.scoreP1 += multiplier;
                else this.scoreP2 += multiplier;

                // Emitimos a todos para que actualicen sus textos (10 pts Victoria)
                this.socket.emit('update_score', {
                    p1: this.scoreP1,
                    p2: this.scoreP2
                });
                this._checkWinCondition();
            }
            this.playSfx(this.sfx.point);
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
    }

    // Controla el final del juego
    _endGame(winner) {
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

        console.log("Partida Online terminada. Ganador:", winner);

        this.scene.start("EndGame_Scene", {
            winner: winner,
            player1: this.player1Data,
            player2: this.player2Data,
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

    _endSet(winner) {
        if (this.isSetEnding) return;

        if (this.myRole === 'player1') {
            if (winner === 'player1') this.setsP1++;
            else if (winner === 'player2') this.setsP2++;

            console.log(`Set terminado. Score sets: P1=${this.setsP1}, P2=${this.setsP2}`);

            const matchOver = (this.setsP1 === 2 || this.setsP2 === 2);

            // Notificamos al Player 2
            this.socket.emit('set_finished_sync', {
                winner: winner,
                setsP1: this.setsP1,
                setsP2: this.setsP2,
                matchOver: matchOver
            });

            // Ejecutamos la lógica común
            this._handleSetEndLogic(winner, matchOver);
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

        // se reinicia la pelota
        this.ball.resetRally();

        // se reposicionan los jugadores a sus posiciones iniciales
        const p1 = this.players.get('player1');
        const p2 = this.players.get('player2');

        p1.setPosition(this.worldWidth * 0.25, this.worldHeight * 0.7);
        p2.setPosition(this.worldWidth * 0.75, this.worldHeight * 0.7);

        p1.idleRight();
        p2.idleLeft();

        this.playSfx(this.sfx.whistle);
    }    

    shutdown() {
        // Eliminamos todos los escuchadores de red para que no afecten a la siguiente partida
        if (this.socket) {
            this.socket.off('opponent_move');
            this.socket.off('ball_update');
            this.socket.off('apply_powerup');
            this.socket.off('score_sync');
            this.socket.off('timer_sync');
            this.socket.off('player_abandoned');
            this.socket.off('set_finished_sync');
        }
    }
}
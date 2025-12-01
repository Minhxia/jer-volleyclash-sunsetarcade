// Clase de la escena de juego

import Phaser from 'phaser';
import { Player } from '../Entities/Player.js';
import { PowerUp } from '../Entities/PowerUp.js';
import { Ball } from '../Entities/Ball.js';
import { CommandProcessor } from '../Commands/CommandProcessor.js';
import { MovePlayerCommand } from '../Commands/MovePlayerCommand.js';

export class Game_Scene extends Phaser.Scene {
    tiempoTotal = 120;
    tiempoRestante = this.tiempoTotal;
    timerText;
    timerEvent;
    constructor() {
        super('Game_Scene');
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

        // Ball
        this.load.image('ball', 'ASSETS/ITEMS/PELOTAS/P_NORMAL.png');

        //Cronometro
        this.load.image('reloj', 'ASSETS/JUEGO/TIMER.png');

        // Marco
        this.load.image('marcoGeneral', 'ASSETS/JUEGO/MARCADOR_SET.png');

        // Red
        this.load.image('red', 'ASSETS/JUEGO/RED.png');
    }

    create() {
        // se guardan las dimensiones
        const { width, height } = this.scale;
        this.worldWidth = width;
        this.worldHeight = height;
        const style = this.game.globals.defaultTextStyle;


        //Cronometro
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

        // Marco de set
        this.setFrame = this.add.image(this.scale.width / 2, 120, 'marcoGeneral')
            .setOrigin(0.5)
            .setScale(1)
            .setDepth(9998);

        // Texto del set actual
        this.setText = this.add.text(this.scale.width / 2, 120, `SET ${this.currentSet}`, {
            ...style,
            fontSize: '32px',
            color: '#ffffff'
        })
        .setOrigin(0.5)
        .setDepth(9999);

        // iniciar el contador
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

        // TODO: cambiar?
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
        // por último, se asignan las teclas
        this._setupInputMappings();

        // powerups
        this.powerUps = [];
        this.maxPowerUps = 2;

        this.inventoryUI = {
            player1: [
                this.add.image(50, 50, '').setScale(1.4).setVisible(false).setDepth(1),
                this.add.image(110, 50, '').setScale(1.4).setVisible(false).setDepth(1)
            ],
            player2: [
                this.add.image(this.worldWidth - 110, 50, '').setScale(1.4).setVisible(false).setDepth(1),
                this.add.image(this.worldWidth - 50, 50, '').setScale(1.4).setVisible(false).setDepth(1)
            ]
        };

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

        // cada 2-5s intentamos generar uno
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            loop: true,
            callback: () => {
                if (this.powerUps.length >= this.maxPowerUps) return;

                const x = Phaser.Math.Between(80, this.worldWidth - 80);
                const y = Phaser.Math.Between(this.worldHeight - 220, this.worldHeight - 120); // evitar la red y el suelo

                const types = ['velocidad', 'ralentizar', 'paralizar', 'por2', 'por3'];
                const type = Phaser.Utils.Array.GetRandom(types);

                const powerUp = new PowerUp(this, x, y, type);
                this.powerUps.push(powerUp);

                // crear colisión con los jugadores
                this.players.forEach(player => {
                    this.physics.add.overlap(player.sprite, powerUp.sprite, () => {
                        const stored = player.applyPowerUp(type);

                        if (stored) {
                            powerUp.destroy();
                            this.powerUps = this.powerUps.filter(p => p !== powerUp);
                            this.updatePlayerInventoryUI(player);
                        }

                    });
                });

                // limpiar de la lista cuando desaparece
                this.time.delayedCall(powerUp.lifetime, () => {
                    this.powerUps = this.powerUps.filter(p => p !== powerUp);
                });
            }
        });

        // inicialización de la pelota
        this._createBall();
        // colliders de la pelota
        this._setupBallCollisions();
        // eventos de la pelota
        this._setupBallEvents();

        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.pause();               // detiene el game loop
            this.timerEvent.paused = true;
            this.scene.launch("Pause_Scene"); // muestra la escena de pausa
        });
        this.events.on('resume', () => {
            this.timerEvent.paused = false;
        });
    }

    updateTimer() {
        this.tiempoRestante--;

        // Formato
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = this.tiempoRestante % 60;
        const formato = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

        this.timerText.setText(formato);

        if (this.tiempoRestante <= 0) {
            this.timerEvent.paused = true;
            console.log("FIN DEL TIEMPO");

            if (this.scoreP1 > this.scoreP2) this._endSet("player1");
            else if (this.scoreP2 > this.scoreP1) this._endSet("player2");
            else {
                console.log("Empate en el set");
                this._resetSet();
            }
        }
    }

    update() {
        // se procesan los inputs de los jugadores
        this._handleInputForAllPlayers();
        // se actualizan los power-ups
        this.players.forEach(player => player.updatePowerUps());
        // se actualiza el estado de la pelota
        if (this.ball) {
            this.ball.update();
            // verificar si la pelota golpea el suelo (comparar con la posición del suelo)
            // groundY es la parte superior del suelo
            if (this.ball.isBallLive && this.ball.sprite.y > this.groundY) {
                this.ball.onGrounded();
            }
            // verificar si la pelota cruza la red (red está en x = 480)
            if (this.ball.sprite.x < 475 && this.ball.courtSide === 'right') {
                this.ball.crossNet();
            } else if (this.ball.sprite.x > 485 && this.ball.courtSide === 'left') {
                this.ball.crossNet();
            }
        }
    }

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
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'charA_receiveLeft',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'charA_runRight',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 22, end: 32 }), // fila 2
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'charA_runLeft',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'charA_jumpRight',
            frames: this.anims.generateFrameNumbers('charA_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'charA_jumpLeft',
            frames: this.anims.generateFrameNumbers('charA_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 15,
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
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'charB_receiveLeft',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'charB_runRight',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 22, end: 32 }), // fila 2
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'charB_runLeft',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'charB_jumpRight',
            frames: this.anims.generateFrameNumbers('charB_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'charB_jumpLeft',
            frames: this.anims.generateFrameNumbers('charB_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 15,
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
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'charC_receiveLeft',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'charC_runRight',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 22, end: 32 }), // fila 2
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'charC_runLeft',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'charC_jumpRight',
            frames: this.anims.generateFrameNumbers('charC_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'charC_jumpLeft',
            frames: this.anims.generateFrameNumbers('charC_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 15,
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
            this.physics.add.collider(player.sprite, ground);
        });

        this.players.forEach(player => {
            // colisión jugador-red
            this.physics.add.collider(player.sprite, this.red, () => {
                // Se dispara si el jugador toca la red
                console.log(`${player.id} tocó la red!`);
                // Podrías detenerlo o empujarlo hacia atrás:
                player.sprite.setVelocityX(0);
            });

            // colisión jugador-suelo
            this.physics.add.collider(player.sprite, ground);
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

    // Procesa el input de los dos jugadores
    _handleInputForAllPlayers() {
        this.inputMappings.forEach(mapping => {
            const player = this.players.get(mapping.playerId);
            if (!player) return;

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
                direction = (player.facing === 'left') ? 'idleLeft': 'idleRight';
            }

            // se aplica movimiento/idle SOLO si no está saltando
            // si está saltando, no se procesa el movimiento para no sobrescribir la animación
            if (!player.isJumping) {
                this.commandProcessor.process(
                    new MovePlayerCommand(player, direction)
                );
            }

            // recepción
            if (Phaser.Input.Keyboard.JustDown(mapping.receiveKeyObj)) {
                const receiveDir = (player.facing === 'left') ? 'receiveLeft' : 'receiveRight';
                this.commandProcessor.process(
                    new MovePlayerCommand(player, receiveDir)
                );
            }

            // salto/remate
            if (Phaser.Input.Keyboard.JustDown(mapping.jumpKeyObj)) {
                const jumpDir = (player.facing === 'left') ? 'jumpLeft' : 'jumpRight';
                this.commandProcessor.process(
                    new MovePlayerCommand(player, jumpDir)
                );
            }

            // PowerUps
            if (Phaser.Input.Keyboard.JustDown(mapping.powerKeyObj)) {
                player.useNextPowerUp();
                this.updatePlayerInventoryUI(player);
            }
        });

        // se actualiza el estado de los jugadores (suelo, etc.)
        this.players.forEach(player => player.update());
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
            // Esto se dispara al tocar la red
            console.log('La pelota toca la red!');
            
            // Por ejemplo, se puede frenar la pelota:
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
            console.log(`Rally concluded: ${data.scoringPlayerId} scores!`);
        const scorer = data.scoringPlayerId;

        if (scorer === 'player1') {
            this.pointsLeft++;
            this.scoreLeft.setText(this.pointsLeft.toString());
        }
        else if (scorer === 'player2') {
            this.pointsRight++;
            this.rightScore.setText(this.pointsRight.toString());
        }
        });
    }

    // Maneja colisión entre pelota y jugador
    _onBallPlayerCollision(ball, player) {
        if (!ball.isBallLive) return;

        const isJumping = !player.sprite.body.blocked.down;
        const isReceiving = player.isReceiving;
        const playerDirection = player.facing;

        ball.hit(player, playerDirection, isJumping, isReceiving);
    }

    _endGame(winner) {
        this.scene.pause(); 
        this.scene.start("EndGame_Scene", {
            winner: winner,
            player1: this.player1,
            player2: this.player2,
        });
    }

    _checkWinCondition() {
        const scoreDiff = this.scoreP1 - this.scoreP2;

        if (this.scoreP1 >= 11 && scoreDiff >= 2) {
            this._endSet("player1");
        } else if (this.scoreP2 >= 11 && scoreDiff <= -2) {
            this._endSet("player2");
        }
    }

    _endSet(winner) {
        if (winner === 'player1') this.setsP1++;
        else if (winner === 'player2') this.setsP2++;

        console.log(`Set terminado. Score sets: P1=${this.setsP1}, P2=${this.setsP2}`);

        // Actualizar set actual
        this.currentSet++;

        // Revisar si alguien ganó el partido
        if (this.setsP1 === 2) {
            this._endGame("player1");
        } else if (this.setsP2 === 2) {
            this._endGame("player2");
        } else {
            // Reiniciar set
            this._resetSet();
        }
    }

    _resetSet() {
        // Actualizar set
        this.setText.setText(`SET ${this.currentSet}`);

        // Reiniciar tiempo
        this.tiempoRestante = this.tiempoTotal;
        this.timerEvent.paused = false;
        this.updateTimer();

        // Reiniciar puntuación
        this.scoreP1 = 0;
        this.scoreP2 = 0;

        // Reiniciar pelota
        this.ball.resetRally();

        // Reposicionar jugadores a sus posiciones iniciales
        const p1 = this.players.get('player1');
        const p2 = this.players.get('player2');

        p1.setPosition(this.worldWidth * 0.25, this.worldHeight * 0.7);
        p2.setPosition(this.worldWidth * 0.75, this.worldHeight * 0.7);

        p1.idleRight();
        p2.idleLeft();
    }
}

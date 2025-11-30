// Clase de la escena de juego

import Phaser from 'phaser';
import { Player } from '../Entities/Player.js';
import { PowerUp } from '../Entities/PowerUp.js';
import { CommandProcessor } from '../Commands/CommandProcessor.js';
import { MovePlayerCommand } from '../Commands/MovePlayerCommand.js';

export class Game_Scene extends Phaser.Scene {
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
        this.load.image('por2', 'ASSETS/ITEMS/POWER UPS/MULTIPLICADOR 2.png')
        this.load.image('por3', 'ASSETS/ITEMS/POWER UPS/MULTIPLICADOR 3.png')
        this.load.image('paralizar', 'ASSETS/ITEMS/POWER UPS/PARALIZADO.png')
        this.load.image('ralentizar', 'ASSETS/ITEMS/POWER UPS/RELENTIZAR.png')
        this.load.image('velocidad', 'ASSETS/ITEMS/POWER UPS/VELOCIDAD.png')
    }

    create() {
        // se guardan las dimensiones
        const { width, height } = this.scale;
        this.worldWidth = width;
        this.worldHeight = height;

        // FONDO DEL ESCENARIO SELECCIONADO
        this.add.image(width / 2, height / 2, this.selectedScenario)
            .setOrigin(0.5)
            .setDisplaySize(width, height); 

        this._createAnimations();

        // TODO: cambiar?
        // suelo de prueba
        const ground = this.physics.add.staticImage(
            this.worldWidth / 2,
            this.worldHeight - 10,
            'ground'
        ).setVisible(false);
        
        // primero se crean los jugadores
        this._createPlayers();
        // después, se montan las colisiones con el suelo, red, etc.
        //this._setupPhysicsWorld(ground);
        // por último, se asignan las teclas
        this._setupInputMappings();

        // PowerUps
        this.powerUps = [];
        this.maxPowerUps = 2;

        // Cada 10-20s intentamos generar uno
        this.time.addEvent({
            delay: Phaser.Math.Between(10000, 20000),
            loop: true,
            callback: () => {
                if (this.powerUps.length >= this.maxPowerUps) return;

                const x = Phaser.Math.Between(50, this.worldWidth - 50);
                const y = Phaser.Math.Between(100, this.worldHeight - 150); // evitar la red y suelo

                const types = ['velocidad', 'ralentizar', 'paralizar', 'por2', 'por3'];
                const type = Phaser.Utils.Array.GetRandom(types);

                const powerUp = new PowerUp(this, x, y, type);
                this.powerUps.push(powerUp);

                // limpiar de la lista cuando desaparece
                this.time.delayedCall(powerUp.lifetime, () => {
                    this.powerUps = this.powerUps.filter(p => p !== powerUp);
                });
            }
        });

    }

    update() {
        this._handleInputForAllPlayers();

        this.players.forEach(player => player.updatePowerUps());
    }
    
    //// MÉTODOS AUXILIARES ////
    // Crea las animaciones de los 3 personajes
    _createAnimations() {
        //// CharacterA ////
        this.anims.create({
            key: 'charA_idle',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 0, end: 1 }), // fila 0
            frameRate: 6,
            repeat: -1
        });        

        this.anims.create({
            key: 'charA_receiveRight',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 0, end: 10 }), // fila 0
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'charA_receiveLeft',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'charA_runRight',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 22, end: 32 }), // fila 2
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'charA_runLeft',
            frames: this.anims.generateFrameNumbers('charA_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'charA_jumpRight',
            frames: this.anims.generateFrameNumbers('charA_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'charA_jumpLeft',
            frames: this.anims.generateFrameNumbers('charA_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 10,
            repeat: 0
        });
        ////////

        //// CharacterB ////
        this.anims.create({
            key: 'charB_idle',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 0, end: 1 }), // fila 0
            frameRate: 6,
            repeat: -1
        });        

        this.anims.create({
            key: 'charB_receiveRight',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 0, end: 10 }), // fila 0
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'charB_receiveLeft',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'charB_runRight',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 22, end: 32 }), // fila 2
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'charB_runLeft',
            frames: this.anims.generateFrameNumbers('charB_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'charB_jumpRight',
            frames: this.anims.generateFrameNumbers('charB_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'charB_jumpLeft',
            frames: this.anims.generateFrameNumbers('charB_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 10,
            repeat: 0
        });
        ////////

        //// CharacterC ////
        this.anims.create({
            key: 'charC_idle',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 0, end: 1 }), // fila 0
            frameRate: 6,
            repeat: -1
        });        

        this.anims.create({
            key: 'charC_receiveRight',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 0, end: 10 }), // fila 0
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'charC_receiveLeft',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 11, end: 21 }).reverse(), // fila 1
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'charC_runRight',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 22, end: 32 }), // fila 2
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'charC_runLeft',
            frames: this.anims.generateFrameNumbers('charC_move', { start: 33, end: 43 }).reverse(), // fila 3
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'charC_jumpRight',
            frames: this.anims.generateFrameNumbers('charC_jump', { start: 0, end: 12 }), // fila 0
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'charC_jumpLeft',
            frames: this.anims.generateFrameNumbers('charC_jump', { start: 13, end: 25 }).reverse(), // fila 1
            frameRate: 10,
            repeat: 0
        });
        ////////
    }

    // TODO: esta hardcodeado, habrá que enlazarlo con la escena de selección de personaje
    // Crea los personajes de cada jugador
    _createPlayers() {
        const charP1 = this.player1;
        const charP2 = this.player2;

        const p1 = new Player(
            this,
            'player1',
            this.worldWidth * 0.25,   // izquierda
            this.worldHeight * 0.7,
            charP1
        );

        const p2 = new Player(
            this,
            'player2',
            this.worldWidth * 0.75,   // derecha
            this.worldHeight * 0.7,
            charP2
        );

        this.players.set('player1', p1);
        this.players.set('player2', p2);

        this.commandProcessor.setPlayers(this.players);
        this.commandProcessor.setGameScene(this);

        p1.stop();
        p2.stop();
    }    

    // Crea el suelo, la red, los límites, etc.
    _setupPhysicsWorld(ground) {
        this.players.forEach(player => {
            this.physics.add.collider(player.sprite, ground);
        });
    }

    // Asigna los controles/teclas de cada jugador
    _setupInputMappings() {
        const inputConfig = [
            {
                playerId: 'player1',
                leftKey: 'A',
                rightKey: 'D',
                jumpKey: 'W',
                receiveKey: 'SHIFT'
            },
            {
                playerId: 'player2',
                leftKey: 'J',
                rightKey: 'L',
                jumpKey: 'I',
                receiveKey: 'SHIFT'
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
                )
            };
        });
    }

    // Procesa el input de los dos jugadores
    _handleInputForAllPlayers() {
        this.inputMappings.forEach(mapping => {
            const player = this.players.get(mapping.playerId);
            if (!player) return;

            let direction = 'stop';

            // recepción
            if (mapping.receiveKeyObj.isDown) {
                // si las teclas de dirección (left, right) están pulsadas
                if (mapping.leftKeyObj.isDown) {
                    direction = 'receiveLeft';
                } 
                else if (mapping.rightKeyObj.isDown) {
                    direction = 'receiveRight';
                }
                // si solo se pulsa SHIFT, se usala orientación actual
                else {                    
                    direction = (player.facing === 'left') ? 'receiveLeft': 'receiveRight';
                }
            }
            // moivimiento horizontal normal 
            else {
                if (mapping.leftKeyObj.isDown) {
                    direction = 'left';
                } else if (mapping.rightKeyObj.isDown) {
                    direction = 'right';
                }
            }

            // recepción o movimiento
            this.commandProcessor.process(
                new MovePlayerCommand(player, direction)
            );

            // salto/remate
            if (Phaser.Input.Keyboard.JustDown(mapping.jumpKeyObj)) {
                const jumpDir = (player.facing === 'left') ? 'jumpLeft' : 'jumpRight';
                this.commandProcessor.process(
                    new MovePlayerCommand(player, jumpDir)
                );
            }
        });

        // se actualiza el estado de los jugadores (suelo, etc.)
        this.players.forEach(player => player.update());
    }
}

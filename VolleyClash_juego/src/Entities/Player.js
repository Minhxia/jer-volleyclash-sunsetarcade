// Clase de la entidad "personaje", se tiene en cuenta que son 3 personajes distintos

export class Player {

    constructor(scene, id, x, y, characterType) {
        // INICIALIZACIÓN
        this.scene = scene;
        this.id = id;                       // identificador del jugador (P1, P2)
        this.characterType = characterType; // indica qué personaje se ha elegido

        // TODO: ajustar los valores
        this.moveSpeed = 200;   // velocidad de movimiento (horizontal)
        this.jumpSpeed = 200;   // fuerza de salto

        this.activePowerUps = {};   // PowerUps activos
        this.isParalyzed = false;   // para el power up "paralizar"
        this.scoreMultiplier = 1;   // para por2 / por3
        
        this.isReceiving = false;   // estado de recepción

        // configuración de los sprites y las animaciones según el personaje elegido
        const CHARACTER_CONFIG = {
            // equilibrado y simpático
            characterA: {
                textureKey: 'charA_move',
                startFrame: 0,
                idleLeftAnim: 'charA_idleLeft',
                idleRightAnim: 'charA_idleRight',
                runLeftAnim: 'charA_runLeft',
                runRightAnim: 'charA_runRight',
                jumpLeftAnim: 'charA_jumpLeft',
                jumpRightAnim: 'charA_jumpRight',
                receiveLeftAnim: 'charA_receiveLeft',
                receiveRightAnim: 'charA_receiveRight'
            },
            // rápido y competitivo
            characterB: {
                textureKey: 'charB_move',
                startFrame: 0,
                idleLeftAnim: 'charB_idleLeft',
                idleRightAnim: 'charB_idleRight',
                runLeftAnim: 'charB_runLeft',
                runRightAnim: 'charB_runRight',
                jumpLeftAnim: 'charB_jumpLeft',
                jumpRightAnim: 'charB_jumpRight',
                receiveLeftAnim: 'charB_receiveLeft',
                receiveRightAnim: 'charB_receiveRight'
            },
            // divertido y algo distraído
            characterC: {
                textureKey: 'charC_move',
                startFrame: 0,
                idleLeftAnim: 'charC_idleLeft',
                idleRightAnim: 'charC_idleRight',
                runLeftAnim: 'charC_runLeft',
                runRightAnim: 'charC_runRight',
                jumpLeftAnim: 'charC_jumpLeft',
                jumpRightAnim: 'charC_jumpRight',
                receiveLeftAnim: 'charC_receiveLeft',
                receiveRightAnim: 'charC_receiveRight'
            }
        };

        // si viene un tipo de personaje inválido, se usa characterA por defecto
        this.config = CHARACTER_CONFIG[characterType] || CHARACTER_CONFIG.characterA;

        // se crea el sprite físico del jugador
        this.sprite = this.scene.physics.add.sprite(
            x,
            y,
            this.config.textureKey,
            this.config.startFrame
        );
        // se hace un poco más grande
        this.sprite.setScale(2);
        // se ajusta la hitbox al nuevo tamaño para las colisiones  
        this.sprite.body.setSize(this.sprite.width, this.sprite.height, true);

        // Collider
        this.sprite.setCollideWorldBounds(true);

        // se guarda una referencia hacia Player dentro del propio sprite
        // (es útil si en colisiones se quiere acceder a la lógica)
        this.sprite.setData('player', this);

        // para controlar dirección actual
        this.facing = 'right';

        // estado simple: en el aire o no
        this.isOnGround = false;

        // cuando se termine la animación de recibir, se deja de "estar recibiendo"
        this.sprite.on('animationcomplete', (anim) => {
            if (
                anim.key === this.config.receiveLeftAnim ||
                anim.key === this.config.receiveRightAnim
            ) {
                this.isReceiving = false;
            }
        });
    }

    //// ANIMACIONES ////
    // Movimiento del personaje hacia la izquierda
    moveLeft() {
        if (this.isParalyzed) return;

        this.sprite.setVelocityX(-this.moveSpeed);
        this.facing = 'left';
        this.playAnimation(this.config.runLeftAnim);
    }
    // Movimiento del personaje hacia la derecha
    moveRight() {
        if (this.isParalyzed) return;

        this.sprite.setVelocityX(this.moveSpeed);
        this.facing = 'right';
        this.playAnimation(this.config.runRightAnim);
    }    

    // Salto/remate del personaje hacia la izquierda
    jumpLeft() {
        if (this.isParalyzed) return;

        // si está tocando el suelo, salta/remata
        if (this.sprite.body && this.sprite.body.blocked.down) {
            this.sprite.setVelocityY(-this.jumpSpeed);
            this.facing = 'left';
            this.playAnimation(this.config.jumpLeftAnim);
        }
    }
    // Salto/remate del personaje hacia la derecha
    jumpRight() {
        if (this.isParalyzed) return;

        // si está tocando el suelo, salta/remata
        if (this.sprite.body && this.sprite.body.blocked.down) {
            this.sprite.setVelocityY(-this.jumpSpeed);
            this.facing = 'right';
            this.playAnimation(this.config.jumpRightAnim);
        }
    }

    // Recepción del personaje por la izquierda
    receiveLeft() {
        if (this.isParalyzed) return;
        if (this.isReceiving) return; // no reiniciar si ya está recibiendo 

        // si está tocando el suelo, recibe la pelota
        if (this.sprite.body && this.sprite.body.blocked.down) {
            this.isReceiving = true;
            this.sprite.setVelocityX(0);
            this.facing = 'left';
            this.playAnimation(this.config.receiveLeftAnim);
        }
    }
    // Recepción del personaje por la derecha
    receiveRight() {
        if (this.isParalyzed) return;
        if (this.isReceiving) return; // no reiniciar si ya está recibiendo 

        // si está tocando el suelo, recibe la pelota
        if (this.sprite.body && this.sprite.body.blocked.down) {
            this.isReceiving = true;
            this.sprite.setVelocityX(0);
            this.facing = 'right';
            this.playAnimation(this.config.receiveRightAnim);
        }
    }

    // Personaje idle izda
    idleLeft() {
        if (this.isParalyzed || this.isReceiving) return;

        // si está tocando el suelo, parado, se muestra idle
        if (this.sprite.body && this.sprite.body.blocked.down) {
            this.sprite.setVelocityX(0);
            this.facing = 'left';
            this.playAnimation(this.config.idleLeftAnim);
        }
    }
    // Personaje idle dcha
    idleRight() {
        if (this.isParalyzed || this.isReceiving) return;

        // si está tocando el suelo, parado, se muestra idle
        if (this.sprite.body && this.sprite.body.blocked.down) {
            this.sprite.setVelocityX(0);
            this.facing = 'right';
            this.playAnimation(this.config.idleRightAnim);
        }
    }
    ////////

    // TODO: revisar si esto es necesario
    // Reproduce una animación si existe
    playAnimation(animKey) {
        if (!animKey) return;
        if (!this.sprite.anims) return;

        this.sprite.anims.play(animKey, true);
    }

    // Actualiza flags como isOnGround (se llama a esto desde la escena, en cada frame)
    update() {
        if (this.sprite.body) {
            this.isOnGround = this.sprite.body.blocked.down;
        }
    }

    // Uso de los power-ups
    applyPowerUp(type) {
        const now = this.scene.time.now;

        switch(type) {
            case 'velocidad':
                this.moveSpeed *= 1.5;
                break;
            case 'ralentizar':
                const opponent = this.getOpponent();
                if (opponent) opponent.moveSpeed *= 0.5;
                break;
            case 'paralizar':
                const opp = this.getOpponent();
                if (opp) opp.isParalyzed = true;
                break;
            case 'por2':
                this.scoreMultiplier = 2;
                break;
            case 'por3':
                this.scoreMultiplier = 3;
                break;
        }

        // Duración 10 segundos
        this.activePowerUps[type] = now + 10000;
    }

    // Actualiza los power-ups
    updatePowerUps() {
        const now = this.scene.time.now;
        for (const type in this.activePowerUps) {
            if (now > this.activePowerUps[type]) {
                // Restaurar efecto
                switch(type) {
                    case 'velocidad':
                        this.moveSpeed /= 1.5;
                        break;
                    case 'ralentizar':
                        const opponent = this.getOpponent();
                        if (opponent) opponent.moveSpeed /= 0.5;
                        break;
                    case 'paralizar':
                        const opp = this.getOpponent();
                        if (opp) opp.isParalyzed = false;
                        break;
                    case 'por2':
                    case 'por3':
                        this.scoreMultiplier = 1;
                        break;
                }
                delete this.activePowerUps[type];
            }
        }
    }

    // para modo EN RED?
    getOpponent() {
        if (!this.scene.players) return null;
        return Array.from(this.scene.players.values()).find(p => p !== this);
    }
}

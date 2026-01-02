// Clase de la entidad "personaje", se tiene en cuenta que son 3 personajes distintos

const POWERUP_DURATION_MS = {
  velocidad: 4000,
  ralentizar: 4000,
  paralizar: 2500,
  por2: 4000,
  por3: 4000,
};

const SPEED_MULT = {
  velocidad: 1.5,
  ralentizar: 0.5,
};

export class Player {

    constructor(scene, id, x, y, characterType) {
        // INICIALIZACIÓN
        this.scene = scene;
        this.id = id;                       // identificador del jugador (P1, P2)
        this.characterType = characterType; // indica qué personaje se ha elegido

        // velocidad de movimiento
        this.baseMoveSpeed = 250;
        this.moveSpeed = this.baseMoveSpeed;

        this.jumpSpeed = 275;   // fuerza de salto

        this.activePowerUps = {};   // powerups activos

        // estados de power-ups
        this.isParalyzed = false;       // para el power up "paralizar"
        this.paralysisTween = null;     // al quedarse paralizado -> rojo
        this.speedEffectActive = false; // velocidad -> cian/verde
        this.slowEffectActive = false;  // ralentizado -> azul

        this.scoreMultiplier = 1;       // para por2 / por3
        // texto flotante para mostrar x2 / x3
        this.multiplierText = this.scene.add.text(x, y - 50, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        })
            .setOrigin(0.5, 1)
            .setDepth(20)
            .setVisible(false);
        
        this.powerUpInventory = []; // máximo 2
        
        this.isReceiving = false;   // estado de recepción

        // límites de movimiento personalizados
        this.boundsLeft = 0;
        this.boundsRight = 960;
        this.boundsTop = 0;
        this.boundsBottom = 540;

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
        this.sprite.setScale(2.5);
        // se ajusta la hitbox al nuevo tamaño para las colisiones, se reducen
        //this.sprite.body.setSize(this.sprite.width, this.sprite.height, true);
        this.sprite.body.setSize(this.sprite.width * 0.9, this.sprite.height * 0.9, true);

        // se guarda una referencia hacia Player dentro del propio sprite
        // (es útil si en colisiones se quiere acceder a la lógica)
        this.sprite.setData('player', this);

        // para controlar dirección actual
        this.facing = 'right';

        // estado simple: en el aire o no
        this.isOnGround = false;
        
        // flag para saber si está en animación de salto
        this.isJumping = false;
        
        // timestamp para detectar si isJumping se queda stuck (timeout de 1 segundo)
        this.jumpStartTime = 0;

        // cuando se termine la animación de recibir, se deja de "estar recibiendo"
        this.sprite.on('animationcomplete', (anim) => {
            try {
                if (
                    anim.key === this.config.receiveLeftAnim ||
                    anim.key === this.config.receiveRightAnim
                ) {
                    this.isReceiving = false;
                }

                // el salto termina según la física + update(), no por la animación.
            } catch (error) {
                console.error(`Animation complete handler error for ${anim.key}:`, error);
            }
        });

    }

    // Helper para verificar si está en el suelo de forma fiable
    isGrounded() {
        const body = this.sprite.body;
        if (!body) return false;

        // blocked.down → colisiones con límites del mundo
        // touching.down → colisiones con otros cuerpos
        return body.blocked.down || body.touching.down;
    }

    // Comprueba si los pies del jugador están cerca del suelo
    isNearGround(threshold = 12) {
        const body = this.sprite.body;
        if (!body) return false;
        if (typeof this.scene.groundY !== 'number') return false;

        // parte inferior del body (no del sprite escalado)
        const feetY = body.y + body.height;
        return Math.abs(feetY - this.scene.groundY) <= threshold;
    }

    //// ANIMACIONES ////
    // Movimiento del personaje hacia la izquierda
    moveLeft() {
        if (this.isParalyzed || this.isReceiving) return;

        this.sprite.setVelocityX(-this.moveSpeed);
        this.facing = 'left';
        this.playAnimation(this.config.runLeftAnim);
    }
    // Movimiento del personaje hacia la derecha
    moveRight() {
        if (this.isParalyzed || this.isReceiving) return;

        this.sprite.setVelocityX(this.moveSpeed);
        this.facing = 'right';
        this.playAnimation(this.config.runRightAnim);
    }    

    // Salto/remate del personaje hacia la izquierda
    jumpLeft() {
        if (this.isParalyzed) return;

        if (this.isGrounded() || this.isNearGround(20)) {
            // por si una recepción se quedó a medias, se cancela
            this.isReceiving = false;

            this.isJumping = true;
            this.jumpStartTime = this.scene.time.now;
            this.sprite.setVelocityY(-this.jumpSpeed);
            this.facing = 'left';
            this.playAnimation(this.config.jumpLeftAnim);
            this.scene?.playSfx?.(this.scene?.sfx?.jump);
        }
    }
    // Salto/remate del personaje hacia la derecha
    jumpRight() {
        if (this.isParalyzed) return;

        if (this.isGrounded() || this.isNearGround(20)) {
            this.isReceiving = false;

            this.isJumping = true;
            this.jumpStartTime = this.scene.time.now;
            this.sprite.setVelocityY(-this.jumpSpeed);
            this.facing = 'right';
            this.playAnimation(this.config.jumpRightAnim);
            this.scene?.playSfx?.(this.scene?.sfx?.jump);
        }
    }

    // Recepción del personaje por la izquierda
    receiveLeft() {
        if (this.isParalyzed) return;
        if (this.isReceiving) return; // no se reinicia si ya está recibiendo 

        // si está tocando el suelo, recibe la pelota
        if (this.isGrounded() || this.isNearGround(20)) {
            this.isReceiving = true;
            this.sprite.setVelocityX(0);
            this.facing = 'left';
            this.playAnimation(this.config.receiveLeftAnim);
        }
    }
    // Recepción del personaje por la derecha
    receiveRight() {
        if (this.isParalyzed) return;
        if (this.isReceiving) return; // no se reinicia si ya está recibiendo 

        // si está tocando el suelo, recibe la pelota
        if (this.isGrounded() || this.isNearGround(20)) {
            this.isReceiving = true;
            this.sprite.setVelocityX(0);
            this.facing = 'right';
            this.playAnimation(this.config.receiveRightAnim);
        }
    }

    // Personaje idle izda
    idleLeft() {
        if (this.isReceiving) return;

        // siempre detener la velocidad horizontal al entrar en idle
        this.sprite.setVelocityX(0);
        this.facing = 'left';
        // reproducir la animación de idle
        this.playAnimation(this.config.idleLeftAnim);
    }
    // Personaje idle dcha
    idleRight() {
        if (this.isReceiving) return;

        // siempre detener la velocidad horizontal al entrar en idle
        this.sprite.setVelocityX(0);
        this.facing = 'right';
        // reproducir la animación de idle
        this.playAnimation(this.config.idleRightAnim);
    }
    ////////

    // Establecer los límites de movimiento del jugador (para confinar a la cancha)
    setBounds(left, right, top, bottom) {
        this.boundsLeft = left;
        this.boundsRight = right;
        this.boundsTop = top;
        this.boundsBottom = bottom;
    }

    // Mantener el jugador dentro de los límites
    clampWithinBounds() {
        const halfWidth = this.sprite.width / 2;
        // limitar posición horizontal (X)
        if (this.sprite.x - halfWidth < this.boundsLeft) {
            this.sprite.x = this.boundsLeft + halfWidth;
            this.sprite.setVelocityX(0);
        }
        if (this.sprite.x + halfWidth > this.boundsRight) {
            this.sprite.x = this.boundsRight - halfWidth;
            this.sprite.setVelocityX(0);
        }
    }

    // Mover el jugador a una posición concreta (y detenerlo)
    // (se llama al cambiar de sets)
    setPosition(x, y) {
        if (!this.sprite) return;

        this.sprite.setPosition(x, y);
        this.sprite.setVelocity(0, 0); // por si venía con velocidad

        // actualizar también la posición del texto x2/x3
        this.updateMultiplierTextPosition();
    }


    updateMultiplierTextPosition() {
        if (!this.multiplierText || !this.sprite) return;

        // altura “visual” del sprite para colocar el texto encima de la cabeza
        const displayH = this.sprite.displayHeight || this.sprite.height || 40;
        const offsetY = displayH * 0.6; // ajusta si quieres más arriba/abajo

        this.multiplierText.setPosition(
            this.sprite.x,
            this.sprite.y - offsetY
        );
    }

    // Reproduce una animación si existe (solo si no está ya reproduciéndose)
    playAnimation(animKey) {
        if (!animKey) return;
        if (!this.sprite.anims) return;

        // si estamos en salto, ignorar cualquier animación que no sea de salto
        if (
            this.isJumping &&
            animKey !== this.config.jumpLeftAnim &&
            animKey !== this.config.jumpRightAnim
        ) {
            return;
        }

        const currentAnim = this.sprite.anims.currentAnim;
        if (this.sprite.anims.isPlaying && currentAnim && currentAnim.key === animKey) {
            return;
        }

        this.sprite.anims.play(animKey, true);
    }

    // Actualizar flags como isOnGround (se llama a esto desde la escena, en cada frame)
    update() {
        if (this.sprite.body) {
            const wasOnGround = this.isOnGround;
            this.isOnGround = this.isGrounded();

            const currentAnim = this.sprite.anims.currentAnim;
            const currentKey = currentAnim ? currentAnim.key : null;

            if (this.isParalyzed) {
                this.sprite.setVelocityX(0); // por si acaso
            }

            // failsafe recepción: si el flag dice "recibiendo" pero la animación no lo es
            if (
                this.isReceiving &&
                currentKey !== this.config.receiveLeftAnim &&
                currentKey !== this.config.receiveRightAnim
            ) {
                this.isReceiving = false;
            }

            // failsafe salto: si isJumping es true pero la animación actual NO es de salto
            // (y hay animación), se asume que terminó
            if (
                this.isJumping &&
                currentKey &&
                currentKey !== this.config.jumpLeftAnim &&
                currentKey !== this.config.jumpRightAnim
            ) {
                this.isJumping = false;
            }

            // timeout de salto por seguridad
            if (this.isJumping && (this.scene.time.now - this.jumpStartTime > 1500)) {
                this.isJumping = false;
            }

            // aterrizaje real
            if (this.isJumping && !wasOnGround && this.isOnGround) {
                this.isJumping = false;
                if (this.facing === 'left') {
                    this.idleLeft();
                } else {
                    this.idleRight();
                }
            }
        }
        this.clampWithinBounds();

        this.updateMultiplierTextPosition();
    }

    // Uso de los power-ups
    applyPowerUp(type) {
        // inventario máximo de 2
        if (this.powerUpInventory.length >= 2) return false;

        this.powerUpInventory.push(type);
        return true;
    }

    useNextPowerUp() {
        if (this.powerUpInventory.length === 0) return;

        const type = this.powerUpInventory.shift();
        this.activatePowerUp(type);
    }

    // Activa el efecto del power-up
    activatePowerUp(type) {
        switch (type) {
            case 'velocidad':
                this.applyOrRefreshTimedEffect('velocidad', POWERUP_DURATION_MS.velocidad);
                break;
            case 'ralentizar': {
                const opponent = this.getOpponent();
                if (opponent) {
                    opponent.applyOrRefreshTimedEffect('ralentizar', POWERUP_DURATION_MS.ralentizar);
                }
                break;
            }
            case 'paralizar': {
                const opponent = this.getOpponent();
                if (opponent) {
                    opponent.applyOrRefreshTimedEffect('paralizar', POWERUP_DURATION_MS.paralizar);
                }
                break;
            }
            case 'por2':
            case 'por3':
                this.applyOrRefreshTimedEffect(type, POWERUP_DURATION_MS[type]);
                break;
        }
    }

    // Actualiza los power-ups
    updatePowerUps() {
        const now = this.scene.time.now;

        let speedNeedsRecalc = false;
        let scoreNeedsRecalc = false;

        // se revisan todos los power-ups activos
        for (const type in this.activePowerUps) {
            if (now <= this.activePowerUps[type]) continue;

            delete this.activePowerUps[type];

            switch (type) {
                case 'velocidad':
                    this.setSpeedEffect(false);
                    speedNeedsRecalc = true;
                    break;
                case 'ralentizar':
                    this.setSlowEffect(false);
                    speedNeedsRecalc = true;
                    break;
                case 'paralizar':
                    this.setParalyzed(false);
                    break;
                case 'por2':
                case 'por3':
                    scoreNeedsRecalc = true;
                    break;
            }
        }

        if (speedNeedsRecalc) this.recalculateMoveSpeed();
        if (scoreNeedsRecalc) this.recalculateScoreEffect();
    }


    //// EFECTOS VISUALES DE LOS POWER-UPS ////
    // paralizar -> rojo + parpadeo
    setParalyzed(isParalyzed) {
        this.isParalyzed = isParalyzed;

        if (isParalyzed) {
            // feedback visual: rojo + parpadeo
            this.sprite.setTint(0xff5555);   // rojizo
            this.sprite.setAlpha(1);

            // por si ya había un tween anterior
            if (this.paralysisTween) {
                this.paralysisTween.stop();
                this.paralysisTween = null;
            }

            this.paralysisTween = this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.3,
                yoyo: true,
                duration: 200,
                repeat: -1
            });

            // seguridad extra: que se quede quieto horizontalmente
            this.sprite.setVelocityX(0);

        } else {
            // quitar solo el efecto de parpadeo, el color se recalcula
            this.sprite.setAlpha(1);

            if (this.paralysisTween) {
                this.paralysisTween.stop();
                this.paralysisTween = null;
            }

            // Volvemos a aplicar el color de otros power-ups activos (si los hay)
            this.refreshPowerUpVisuals();
        }
    }    

    // velocidad -> naranja
    setSpeedEffect(active) {
        this.speedEffectActive = active;
        this.refreshPowerUpVisuals();
    }

    // ralentizar -> azul
    setSlowEffect(active) {
        this.slowEffectActive = active;
        this.refreshPowerUpVisuals();
    }
    
    // Recalcula la velocidad de movimiento según los power-ups que estén activos
    recalculateMoveSpeed() {
        let mult = 1;

        if (this.activePowerUps.velocidad) mult *= SPEED_MULT.velocidad;
        if (this.activePowerUps.ralentizar) mult *= SPEED_MULT.ralentizar;

        this.moveSpeed = this.baseMoveSpeed * mult;
    }

    // Recalcula el multiplicador de puntuación en función de por2/por3 activos
    recalculateScoreEffect() {
        let multiplier = 1;

        if (this.activePowerUps['por2']) {
            multiplier = Math.max(multiplier, 2);
        }
        if (this.activePowerUps['por3']) {
            multiplier = Math.max(multiplier, 3);
        }

        this.scoreMultiplier = multiplier;

        // feedback visual con texto x2 / x3
        if (this.multiplierText) {
            if (this.scoreMultiplier > 1) {
                this.multiplierText.setText('x' + this.scoreMultiplier);
                this.multiplierText.setVisible(true);
            } else {
                this.multiplierText.setVisible(false);
            }
        }

        // mantener los colores que ya se tenían
        this.refreshPowerUpVisuals();
    }

    // Aplica o actualiza la duración de un power-up
    applyOrRefreshTimedEffect(type, durationMs) {
        const now = this.scene.time.now;
        this.activePowerUps[type] = now + durationMs;

        // se activa el feedback/estado
        if (type === 'velocidad') this.setSpeedEffect(true);
        if (type === 'ralentizar') this.setSlowEffect(true);
        if (type === 'paralizar') this.setParalyzed(true);

        // se recalculan los efectos si es necesario
        if (type === 'velocidad' || type === 'ralentizar') {
            this.recalculateMoveSpeed();
        }
        if (type === 'por2' || type === 'por3') {
            this.recalculateScoreEffect();
        }
    }

    // Decide qué tinte mostrar según el estado actual
    refreshPowerUpVisuals() {
        // si está paralizado, la parálisis manda (color  rojo + parpadeo)
        if (this.isParalyzed) {
            return;
        }

        // Phaser solo permite un color a la vez por sprite, por eso la
        // prioridad visual es: ralentizar > velocidad > multiplicador
        if (this.slowEffectActive) {
            // azul oscuro para ralentizar
            this.sprite.setTint(0x5555ff);
        } else if (this.speedEffectActive) {
            // naranja para velocidad
            this.sprite.setTint(0xff8c00);
        } else if (this.scoreMultiplier > 1) {
            // verde para x2 / x3
            this.sprite.setTint(0x32cd32);
        } else {
            // sin efectos
            this.sprite.clearTint();
        }
    }
    ///////

    getOpponent() {
        if (!this.scene.players) return null;
        return Array.from(this.scene.players.values()).find(p => p !== this);
    }
}

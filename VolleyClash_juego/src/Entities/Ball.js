export class Ball {
    constructor(scene, x, y) {
        this.scene = scene;
        this.players = null;
        this.commandProcessor = null;

        this.sprite = scene.physics.add.sprite(x, y, 'ball');
        this.sprite.setScale(1.0);
        this.sprite.setBounce(0.8);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setData('ball', this);

        // seguimiento del estado del rally
        this.lastTouchedBy = null;      // id del jugador ('player1' o 'player2')
        this.touchCount = 0;            // toques en el rally actual por lado de la cancha
        this.courtSide = 'left';        // lado de la cancha donde está la pelota
        this.isBallLive = true;

        // posición de la red (hardcodeado para ancho de 960px)
        this.netX = 480;

        // para evitar toques múltiples por estar pegada y que "desaparezca"
        this.lastHitTime = 0;
        this.lastHitPlayerId = null;
		
        //this.isFirstServe = true;
    }

    // Genera un número aleatorio para variar levemente la velocidad de la pelota
    _getRandomFactor(min = 0.95, max = 1.05) {
        return min + (max - min) * Math.random();
    }

    // Se llama cuando un jugador golpea la pelota
    hit(player, playerFacingDirection, isJumping, isReceiving = false) {
        if (!this.isBallLive) return;

        const now = this.scene.time.now;

        // si es el mismo jugador y ha pasado muy poco tiempo,
        // ignoramos ese "toque" para no sumar más golpes
        if (this.lastHitPlayerId === player.id && (now - this.lastHitTime) < 120) {
            return;
        }

        // registramos este nuevo golpe válido
        this.lastHitPlayerId = player.id;
        this.lastHitTime = now;

        // se incrementa el contador de toques si el mismo jugador continúa, se reinicia si es el otro
        if (this.lastTouchedBy === player.id) {
            this.touchCount++;
        } else {
            this.touchCount = 1;
            this.lastTouchedBy = player.id;
        }
        if (this.touchCount > 3) {
            this.onFalta('toqueExcedido', player);
            return;
        }
        // se reproduce el efecto de sonido según el tipo de golpe
        if (isReceiving) {
            this.scene?.playSfx?.(this.scene?.sfx?.receive);
        } else if (isJumping) {
            this.scene?.playSfx?.(this.scene?.sfx?.spike);
        }


        // se calcula velocidad de la pelota según la dirección del jugador y si está saltando/recibiendo
        let velocityX, velocityY;

        if (isReceiving) {
            // recepción: parábola larga y ancha (trayectoria defensiva)
            // menor velocidad horizontal, mayor velocidad vertical para el arco
            const baseSpeedX = 180;
            const verticalStrength = -310; // componente vertical mayor para el arco
            const randomFactorX = this._getRandomFactor();
            const randomFactorY = this._getRandomFactor();

            if (playerFacingDirection === 'left') {
                velocityX = -baseSpeedX * randomFactorX;
            } else {
                velocityX = baseSpeedX * randomFactorX;
            }
            velocityY = verticalStrength * randomFactorY;
        } else if (isJumping) {
            // salto/ataque: horizontal fuerte, vertical débil (remate/smash)
            // alta velocidad horizontal, baja velocidad vertical para trayectoria plana
            const baseSpeedX = 220;
            const verticalStrength = -140; // componente vertical bajo para ataque plano
            const randomFactorX = this._getRandomFactor();
            const randomFactorY = this._getRandomFactor();

            if (playerFacingDirection === 'left') {
                velocityX = -baseSpeedX * randomFactorX;
            } else {
                velocityX = baseSpeedX * randomFactorX;
            }
            velocityY = verticalStrength * randomFactorY;
        } else {
            // golpe regular desde el suelo
            const baseSpeedX = 180;

            if (playerFacingDirection === 'left') {
                velocityX = -baseSpeedX;
            } else {
                velocityX = baseSpeedX;
            }
            velocityY = -100;
        }

        this.sprite.setVelocity(velocityX, velocityY);

        // se actualizar el lado de la cancha según la dirección de la velocidad
        if (velocityX > 0) {
            this.courtSide = 'right';
        } else if (velocityX < 0) {
            this.courtSide = 'left';
        }
    }

    // Se llama cuando la pelota cruza la red
    crossNet() {
        // se reinicia el contador de toques para el nuevo lado de cancha
        this.touchCount = 0;
        this.lastTouchedBy = null;

        // se cambia de lado de cancha
        this.courtSide = this.courtSide === 'left' ? 'right' : 'left';
    }

    // Se llama cuando la pelota toca el suelo
    onGrounded() {
        if (!this.isBallLive) return;

        const ballOnLeft = this.sprite.x < this.netX;
        const ballOnRight = this.sprite.x > this.netX;

        // determinar quién anota
        if (ballOnLeft) {
            this.onRallyEnd('player2'); // player2 anota
            this.resetRally('player2');
        } else if (ballOnRight) {
            this.onRallyEnd('player1'); // player1 anota
            this.resetRally('player1');
        }
    }    

    // Se llama cuando ocurre una falta (demasiados toques, pelota fuera de límites, etc.)
    onFalta(faltaType, faltingPlayer) {
        if (!this.isBallLive) return;

        // se determinar el jugador que anota (opuesto al que cometió falta)
        const scoringPlayerId = faltingPlayer.id === 'player1' ? 'player2' : 'player1';

        this.onRallyEnd(scoringPlayerId);
        this.resetRally(scoringPlayerId);
    }

    // Se llama cuando finaliza un rally (alguien anota)
    onRallyEnd(scoringPlayerId) {
        this.isBallLive = false;

        // se lanza un evento para que Game_Scene maneje la puntuación
        this.scene.events.emit('rallyConcluded', {
            scoringPlayerId: scoringPlayerId,
            touchCount: this.touchCount,
            lastTouchedBy: this.lastTouchedBy
        });
    }

    // Empujon sutil al saque para evitar que caiga sobre la red
    _getSubtleNudge(spawnX, sidePadding, worldWidth) {
        const sign = Math.random() < 0.5 ? -1 : 1;
        const offset = sign * 12;
        const clampedX = Math.max(sidePadding, Math.min(worldWidth - sidePadding, spawnX + offset));

        return { spawnX: clampedX, velocityX: offset };
    }

    // Coloca la pelota para el saque sin reiniciar el rally
    setServePosition(scoringPlayer) {
        const spawnY = 100;
        const sidePadding = 60;
        const worldWidth = this.scene.worldWidth ?? this.scene.scale?.width ?? this.netX * 2;
        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

        let spawnX = this.netX;
        let nudgeVelocityX = 0;

        const hasScoringPlayer = scoringPlayer === 'player1' || scoringPlayer === 'player2';

        if (hasScoringPlayer) {
            const player = this.scene.players?.get ? this.scene.players.get(scoringPlayer) : null;
            if (player?.sprite) {
                if (scoringPlayer === 'player1') {
                    spawnX = clamp(player.sprite.x, sidePadding, this.netX - sidePadding);
                } else {
                    spawnX = clamp(player.sprite.x, this.netX + sidePadding, worldWidth - sidePadding);
                }
            } else {
                spawnX = scoringPlayer === 'player1' ? this.netX - 100 : this.netX + 100;
            }
        }
        else {
            const nudge = this._getSubtleNudge(spawnX, sidePadding, worldWidth);
            spawnX = nudge.spawnX;
            nudgeVelocityX = nudge.velocityX;
        }

        this.sprite.setPosition(spawnX, spawnY);
        this.sprite.setVelocity(nudgeVelocityX, 0);
    }

    // Reinicia el estado del rally y reposiciona la pelota para el saque
    resetRally(scoringPlayer) {
        this.isBallLive = true;
        this.lastTouchedBy = null;
        this.touchCount = 0;
        this.setServePosition(scoringPlayer);

        // limpiar info de último golpe
        this.lastHitTime = 0;
        this.lastHitPlayerId = null;
    }


    // Actualiza el estado de la pelota cada frame (se rastrea el lado de la cancha según la posición)
    update() {
        if (!this.isBallLive) return;

        // se actualiza el lado de cancha según posición actual
        if (this.sprite.x < this.netX - 20) {
            this.courtSide = 'left';
        } else if (this.sprite.x > this.netX + 20) {
            this.courtSide = 'right';
        }
    }
}

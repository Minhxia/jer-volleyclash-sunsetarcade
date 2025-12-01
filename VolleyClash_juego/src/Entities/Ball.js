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

        // se calcula velocidad de la pelota según la dirección del jugador y si está saltando/recibiendo
        let velocityX, velocityY;

        if (isReceiving) {
            // recepción: parábola larga y ancha (trayectoria defensiva)
            // menor velocidad horizontal, mayor velocidad vertical para el arco
            const baseSpeedX = 180;
            const verticalStrength = -350; // componente vertical mayor para el arco

            if (playerFacingDirection === 'left') {
                velocityX = -baseSpeedX;
            } else {
                velocityX = baseSpeedX;
            }
            velocityY = verticalStrength;
        } else if (isJumping) {
            // salto/ataque: horizontal fuerte, vertical débil (remate/smash)
            // alta velocidad horizontal, baja velocidad vertical para trayectoria plana
            const baseSpeedX = 220; // 300
            const verticalStrength = -150; // componente vertical bajo para ataque plano

            if (playerFacingDirection === 'left') {
                velocityX = -baseSpeedX;
            } else {
                velocityX = baseSpeedX;
            }
            velocityY = verticalStrength;
        } else {
            // golpe regular desde el suelo
            const baseSpeedX = 200;

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

        // se determina en qué lado de la cancha está la pelota
        const ballOnLeft = this.sprite.x < this.netX;
        const ballOnRight = this.sprite.x > this.netX;

        // si la pelota está en la cancha, ese jugador pierde el rally
        if (ballOnLeft) {
            this.onRallyEnd('player2'); // player2 anota
        } else if (ballOnRight) {
            this.onRallyEnd('player1'); // player1 anota
        }

        this.resetRally();
    }

    // Se llama cuando ocurre una falta (demasiados toques, pelota fuera de límites, etc.)
    onFalta(faltaType, faltingPlayer) {
        if (!this.isBallLive) return;

        // se determinar el jugador que anota (opuesto al que cometió falta)
        const scoringPlayerId = faltingPlayer.id === 'player1' ? 'player2' : 'player1';

        this.onRallyEnd(scoringPlayerId);
        this.resetRally();
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

    // Reinicia el estado del rally y reposiciona la pelota para el saque
    resetRally() {
        this.isBallLive = true;
        this.lastTouchedBy = null;
        this.touchCount = 0;
        this.courtSide = 'left'; // por defecto, a la izquierda para el próximo saque

        // se reposiciona la pelota al centro de la cancha, ligeramente sobre el suelo
        this.sprite.setPosition(this.netX, 100);
        this.sprite.setVelocity(0, 0);

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

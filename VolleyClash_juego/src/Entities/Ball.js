export class Ball {
    constructor(scene, x, y) {
        this.scene = scene;
        this.players = null; // Set by Game_Scene
        this.commandProcessor = null; // Set by Game_Scene

        // Phaser physics sprite
        this.sprite = scene.physics.add.sprite(x, y, 'ball');
        this.sprite.setScale(0.5);
        this.sprite.setBounce(0.8);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setData('ball', this);

        // Rally state tracking
        this.lastTouchedBy = null; // player ID: 'player1' or 'player2'
        this.touchCount = 0; // touches in current rally for current court side
        this.courtSide = 'left'; // which side the ball is currently on
        this.isBallLive = true;

        // Net position (hardcoded for 960px width)
        this.netX = 480;
    }

    /**
     * Called when a player hits the ball
     * @param {Object} player - The player who hit the ball
     * @param {string} playerFacingDirection - 'left' or 'right'
     * @param {boolean} isJumping - Whether player was airborne
     * @param {boolean} isReceiving - Whether player is in receiving state
     */
    hit(player, playerFacingDirection, isJumping, isReceiving = false) {
        if (!this.isBallLive) return;

        // Increment touch count if same player continues, reset if different player
        if (this.lastTouchedBy === player.id) {
            this.touchCount++;
        } else {
            this.touchCount = 1;
            this.lastTouchedBy = player.id;
        }

        // Check if touch count exceeded (3 touches per court side)
        if (this.touchCount > 3) {
            // Falta: too many touches
            this.onFalta('toqueExcedido', player);
            return;
        }

        // Calculate ball velocity based on player direction and jump/receive state
        let velocityX, velocityY;

        if (isReceiving) {
            // Receiving: long and wide parabola (defensive trajectory)
            // Lower horizontal speed, higher vertical speed for arc
            const baseSpeedX = 180;
            const verticalStrength = -350; // Higher vertical component for arc

            if (playerFacingDirection === 'left') {
                velocityX = -baseSpeedX;
            } else {
                velocityX = baseSpeedX;
            }
            velocityY = verticalStrength;
        } else if (isJumping) {
            // Jumping/Attack: strong horizontal, weak vertical (spike/smash)
            // High horizontal speed, low vertical speed for flat trajectory
            const baseSpeedX = 300;
            const verticalStrength = -150; // Low vertical component for flat attack

            if (playerFacingDirection === 'left') {
                velocityX = -baseSpeedX;
            } else {
                velocityX = baseSpeedX;
            }
            velocityY = verticalStrength;
        } else {
            // Regular ground hit
            const baseSpeedX = 200;

            if (playerFacingDirection === 'left') {
                velocityX = -baseSpeedX;
            } else {
                velocityX = baseSpeedX;
            }
            velocityY = -100;
        }

        this.sprite.setVelocity(velocityX, velocityY);

        // Update court side based on velocity direction
        if (velocityX > 0) {
            this.courtSide = 'right';
        } else if (velocityX < 0) {
            this.courtSide = 'left';
        }
    }

    /**
     * Called when ball crosses the net
     */
    crossNet() {
        // Reset touch count for new court side
        this.touchCount = 0;
        this.lastTouchedBy = null;

        // Swap court side
        this.courtSide = this.courtSide === 'left' ? 'right' : 'left';
    }

    /**
     * Called when ball touches the ground
     */
    onGrounded() {
        if (!this.isBallLive) return;

        // Determine which court side the ball is on
        const ballOnLeft = this.sprite.x < this.netX;
        const ballOnRight = this.sprite.x > this.netX;

        // If ball is on court, that player loses the rally
        if (ballOnLeft) {
            this.onRallyEnd('player2'); // player2 scores
        } else if (ballOnRight) {
            this.onRallyEnd('player1'); // player1 scores
        }

        this.resetRally();
    }

    /**
     * Called when a falta occurs (too many touches, ball out of bounds, etc.)
     * @param {string} faltaType - Type of fault ('toqueExcedido', 'outOfBounds', etc.)
     * @param {Object} faltingPlayer - The player who committed the falta
     */
    onFalta(faltaType, faltingPlayer) {
        if (!this.isBallLive) return;

        // Determine scoring player (opposite of faulting player)
        const scoringPlayerId = faltingPlayer.id === 'player1' ? 'player2' : 'player1';

        this.onRallyEnd(scoringPlayerId);
        this.resetRally();
    }

    /**
     * Called when a rally ends (someone scores)
     * @param {string} scoringPlayerId - ID of player who scores
     */
    onRallyEnd(scoringPlayerId) {
        this.isBallLive = false;

        // Emit event for Game_Scene to handle scoring
        this.scene.events.emit('rallyConcluded', {
            scoringPlayerId: scoringPlayerId,
            touchCount: this.touchCount,
            lastTouchedBy: this.lastTouchedBy
        });
    }

    /**
     * Reset rally state and reposition ball for serve
     */
    resetRally() {
        this.isBallLive = true;
        this.lastTouchedBy = null;
        this.touchCount = 0;
        this.courtSide = 'left'; // Default to left for next serve

        // Reposition ball to center court, slightly above ground
        this.sprite.setPosition(this.netX, 100);
        this.sprite.setVelocity(0, 0);
    }

    /**
     * Update ball state each frame (track court side based on position)
     */
    update() {
        if (!this.isBallLive) return;

        // Update court side based on current position
        if (this.sprite.x < this.netX - 20) {
            this.courtSide = 'left';
        } else if (this.sprite.x > this.netX + 20) {
            this.courtSide = 'right';
        }
    }
}

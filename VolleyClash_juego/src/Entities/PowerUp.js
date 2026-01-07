import { ApplyPowerUpCommand } from "../Commands/ApplyPowerUpCommand";

export class PowerUp {
    constructor(scene, x, y, type, id = null) {
        this.scene = scene;
        this.type = type;
        this.id = id;

        this.isCollected = false;   // para evitar recoger varias veces
        this._destroyed = false;    // para evitar destruir varias veces
        this._cooldownUntil = 0;    // tiempo hasta el que no se puede recoger

        this.fadeStart = 3000;      // ms hasta empezar a desvanecerse
        this.lifetime = 5000;       // ms de vida total

        this._overlaps = [];        // colliders overlaps
        this.fadeTween = null;      // tween de fade
        this._lifetimeTimer = null; // timer de vida

        this.sprite = scene.physics.add.staticImage(x, y, type)
            .setScale(1.2)
            .setInteractive();

        // se actualiza el body tras el escalado
        if (this.sprite.refreshBody) this.sprite.refreshBody();

        // se guarda el tween para poder pararlo en destroy
        const fadeDelay = Math.max(0, Math.min(this.fadeStart, this.lifetime));
        const fadeDuration = Math.max(0, this.lifetime - fadeDelay);

        if (fadeDuration > 0) {
            this.fadeTween = scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                delay: fadeDelay,
                duration: fadeDuration
            });
        }

        // overlaps con los jugadores
        const players = scene.players;
        if (players && typeof players.forEach === 'function') {
            players.forEach(player => {
                if (!player?.sprite) return;

                const c = scene.physics.add.overlap(
                    player.sprite,
                    this.sprite,
                    () => this.collect(player),
                    null,
                    this
                );
                this._overlaps.push(c);
            });
        }

        // timer de vida
        this._lifetimeTimer = scene.time.delayedCall(this.lifetime, () => {
            this.destroy();
        });
    }

    // Recoge el power-up
    collect(player) {
        console.log('[PowerUp] overlap con', player.id, 'tipo', this.type);

        if (this._destroyed) return;
        if (this.isCollected) return;

        // si el inventario está lleno y el jugador se queda encima, se evita el spam
        const now = this.scene.time.now;
        if (this._cooldownUntil && now < this._cooldownUntil) return;

        this.isCollected = true;

        const cmd = new ApplyPowerUpCommand(player, this.type);
        this.scene.commandProcessor.process(cmd);

        // si NO se puede guardar porque el inventario está lleno, NO se destruye
        if (!cmd.stored) {
            this.isCollected = false;
            this._cooldownUntil = now + 300;
            return;
        }

        this.destroy();
        this.scene.updatePlayerInventoryUI?.(player);
    }

    // Destruye el power-up
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;

        // AVISA AL NO-HOST
        if (this.scene?.isHostClient?.() && this.id != null) {
            this.scene.sendMessage({
                type: 'remove_powerup',
                id: this.id
            });
        }

        // colliders overlaps
        if (Array.isArray(this._overlaps)) {
            this._overlaps.forEach(c => {
                try { c.destroy(); } catch { }
            });
            this._overlaps = [];
        }

        // tween
        if (this.fadeTween) {
            try { this.fadeTween.stop(); } catch { }
            this.fadeTween = null;
        }

        // timer
        if (this._lifetimeTimer) {
            this._lifetimeTimer.remove(false);
            this._lifetimeTimer = null;
        }

        // sprite
        if (this.sprite) {
            try { this.sprite.destroy(); } catch { }
            this.sprite = null;
        }

        // finalmente, se quita del array
        if (Array.isArray(this.scene.powerUps)) {
            this.scene.powerUps = this.scene.powerUps.filter(p => p !== this);
        }
    }
}

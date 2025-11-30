import { ApplyPowerUpCommand } from "../Commands/ApplyPowerUpCommand";

export class PowerUp {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type; // "velocidad", "ralentizar", "paralizar", "por2", "por3"

        this.sprite = scene.physics.add.staticImage(x, y, type)
            .setScale(1.2)
            .setInteractive();

        this.spawnTime = scene.time.now;
        this.fadeStart = 3000; // ms antes de empezar a desvanecer
        this.lifetime = 5000; // ms total que permanece visible
        this.isCollected = false;

        // Efecto de fade out
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            delay: this.fadeStart,
            duration: this.lifetime - this.fadeStart
        });

        // Colisión con jugadores
        scene.players.forEach(player => {
            scene.physics.add.overlap(player.sprite, this.sprite, () => this.collect(player), null, this);
        });

        this._lifetimeTimer = scene.time.delayedCall(this.lifetime, () => {
            this.destroy(); // limpieza centralizada
        });
    }

    collect(player) {
        if (this.isCollected) return;
        this.isCollected = true;

        this.scene.commandProcessor.process(
            new ApplyPowerUpCommand(player, this.type)
        );

        this.destroy();

        if (this.scene.updatePlayerInventoryUI) {
            this.scene.updatePlayerInventoryUI(player);
        }
    }

    destroy() {
        // Evitar múltiples llamadas
        if (this._destroyed) return;
        this._destroyed = true;

        // cancelar tween si existe
        if (this.fadeTween) {
            this.fadeTween.stop();
            this.fadeTween = null;
        }

        // cancelar timer si existe
        if (this._lifetimeTimer) {
            this._lifetimeTimer.remove(false);
            this._lifetimeTimer = null;
        }

        // destruir sprite si existe y no está ya destruido
        if (this.sprite && this.sprite.destroy) {
            try {
                this.sprite.destroy();
            } catch (e) {
                // ignore
            }
            this.sprite = null;
        }

        // quitar referencia del array scene.powerUps si existe
        if (Array.isArray(this.scene.powerUps)) {
            this.scene.powerUps = this.scene.powerUps.filter(p => p !== this);
        }
    }
}

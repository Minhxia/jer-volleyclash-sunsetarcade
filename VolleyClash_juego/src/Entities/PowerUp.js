import { ApplyPowerUpCommand } from "../Commands/ApplyPowerUpCommand";

export class PowerUp {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type; // "velocidad", "ralentizar", "paralizar", "por2", "por3"

        this.sprite = scene.physics.add.sprite(x, y, type)
            .setScale(0.5)
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
    }

    collect(player) {
        if (this.isCollected) return;
        this.isCollected = true;
        this.sprite.destroy();

        this.scene.commandProcessor.process(
            new ApplyPowerUpCommand(player, this.type)
        );
    }
}

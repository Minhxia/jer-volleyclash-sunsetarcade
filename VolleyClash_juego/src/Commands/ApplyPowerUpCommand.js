export class ApplyPowerUpCommand {
    constructor(player, powerUpType) {
        this.player = player;
        this.powerUpType = powerUpType;
        this.stored = false;
    }

    execute() {
        this.stored = this.player.applyPowerUp(this.powerUpType);
        return this.stored;
    }
}

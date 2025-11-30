// Commands/ApplyPowerUpCommand.js
export class ApplyPowerUpCommand {
    constructor(player, powerUpType) {
        this.player = player;
        this.powerUpType = powerUpType;
    }

    execute() {
        this.player.applyPowerUp(this.powerUpType);
    }
}

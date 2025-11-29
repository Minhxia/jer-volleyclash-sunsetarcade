// Clase que se encarga de la lógica del movimiento del personaje

import { Command } from './Command.js';

export class MovePlayerCommand extends Command {
    constructor(player, direction) {
        super();
        this.player = player;       // instancia del personaje
        this.direction = direction; // dirección de movmiento
    }

    execute() {
         switch (this.direction) {
            // correr hacia la izda
            case 'left':
                this.player.moveLeft();
                break;
            // correr hacia la dcha
            case 'right':
                this.player.moveRight();
                break;
            // saltar/rematar a la izda
            case 'jumpLeft':
                this.player.jumpLeft();
                break;
            // saltar/remata a la dcha
            case 'jumpRight':
                this.player.jumpRight();
                break;
            // recibir por la izda
            case 'receiveLeft':
                this.player.receiveLeft();
                break;
            // recibir por la dcha
            case 'receiveRight':
                this.player.receiveRight();
                break;
            // parado, idle
            default:
                this.player.stop();
                break;
        }
    }

    // para el modo EN RED
    getPlayer() {
        return this.player.id;
    }

    serialize() {
        return {
            type: 'MovePlayerCommand',
            playerId: this.player.id,
            direction: this.direction
        };
    }
}

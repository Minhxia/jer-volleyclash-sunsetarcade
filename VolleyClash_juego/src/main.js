// Base del juego para la estructura y tener acceso a todos los archivos
import Phaser from "phaser";
import { Menu_Scene } from "./Scenes/Menu_Scene.js";
import { Game_Scene } from "./Scenes/Game_Scene.js";
import { Configuration_Scene } from "./Scenes/Configuration_Scene.js";
import { Credits_Scene } from "./Scenes/Credits_Scene.js";
import { EndGame_Scene } from "./Scenes/EndGame_Scene.js";
import { ModeGame_Scene } from "./Scenes/ModeGame_Scene.js";
import { Pause_Scene } from "./Scenes/Pause_Scene.js";
import { SelectPlayer_Scene } from "./Scenes/SelectPlayer_Scene.js"
import { SelectScenario_Scene } from "./Scenes/SelectScenario_Scene.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-cointainer',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 300},
            debug: true
        }
    },
    // Phaser arranca automáticamente la primera escena en el array (menú de inicio)
    scene: [Menu_Scene, Game_Scene,Configuration_Scene, Credits_Scene, EndGame_Scene, ModeGame_Scene,Pause_Scene, SelectPlayer_Scene, SelectScenario_Scene],
    backgroundColor:'#8675f1',
}

const game = new Phaser.Game(config);
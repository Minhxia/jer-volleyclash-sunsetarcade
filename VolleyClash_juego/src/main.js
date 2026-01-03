// Base del juego, estructura y acceso a todos los archivos
import Phaser from "phaser";
import { Menu_Scene } from "./Scenes/Menu_Scene.js";
import { Game_Scene } from "./Scenes/Game_Scene.js";
import { Tutorial_Scene } from "./Scenes/Tutorial_Scene.js";
import { Configuration_Scene } from "./Scenes/Configuration_Scene.js";
import { Credits_Scene } from "./Scenes/Credits_Scene.js";
import { EndGame_Scene } from "./Scenes/EndGame_Scene.js";
import { ModeGame_Scene } from "./Scenes/ModeGame_Scene.js";
import { Pause_Scene } from "./Scenes/Pause_Scene.js";
import { SelectPlayer_Scene } from "./Scenes/SelectPlayer_Scene.js";
import { SelectScenario_Scene } from "./Scenes/SelectScenario_Scene.js";

(async () => {
    // fallback para evitar problemas con las fuentes personalizadas
    if (document.fonts && document.fonts.load) {
        await Promise.all([
            document.fonts.load('20px "MiFuente"'),
            document.fonts.load('20px "VT323"')
        ]);
        await document.fonts.ready;
    }

    const globals = {
        defaultTextStyle: { fontFamily: 'MiFuente', fontSize: '20px', color: '#ffffff' },
        music: null
    };

    const config = {
        type: Phaser.AUTO,
        width: 960,
        height: 540,
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 300 },
                debug: false // poner a true para ver las líneas de los cuerpos físicos
            }
        },
        dom: {
            createContainer: true
        },
        callbacks: {
            preBoot: (game) => {
                game.globals = globals;
            }
        },
        scene: [Menu_Scene, Game_Scene, Tutorial_Scene, Configuration_Scene, Credits_Scene, EndGame_Scene, Pause_Scene, ModeGame_Scene, SelectPlayer_Scene, SelectScenario_Scene],
        backgroundColor: '#8675f1',
    };

    const game = new Phaser.Game(config);
})();

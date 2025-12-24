// Pantalla de Configuración
import Phaser from 'phaser';
import { getStoredVolume, setStoredVolume, applyStoredVolume, playClick } from '../UI/Audio.js';
import { createIconButton } from '../UI/Buttons.js';

export class Configuration_Scene extends Phaser.Scene {
    constructor() {
        super('Configuration_Scene');

        this.volumeSlider = null;
    }

    preload() {
        // imágenes fondo y ui
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');

        // controles
        this.load.image('derTeclas', 'ASSETS/UI/CONTROLES/der.png');
        this.load.image('izqTeclas', 'ASSETS/UI/CONTROLES/izq.png');

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const style = this.game.globals.defaultTextStyle;

        // Fondo
        this.add.image(0, 0, 'fondo')
            .setOrigin(0)
            .setDepth(-1)
            .setDisplaySize(width, height);

        // Título de la escena
        this.add.text(centerX, height * 0.1, 'Configuración', {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // Subtítulo de controles
        this.add.text(centerX, height * 0.2, 'Volumen de la música', {
            ...style,
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);

        //// VOLUMEN ////
        const initialVolume = getStoredVolume();
        
        // se aplica el volumen nada más cargar
        applyStoredVolume(this, initialVolume);

        // barra de volumen (slider)
        this.volumeSlider = this.add
            .dom(centerX, height * 0.26)
            .createFromHTML(`<input type="range" min="0" max="1" step="0.01" value="${initialVolume}"
                style="width:220px; height:20px; accent-color:#00aaff; border-radius:5px;"/>
            `);

        this.volumeSlider.addListener('input');
        this.volumeSlider.on('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) return;

            const volume = setStoredVolume(target.value);
            applyStoredVolume(this, volume);
        });
        ////////

        // botón Volver atrás
        createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            onClick: () => this.scene.start('Menu_Scene'),
        });

        // Separador visual
        const line = this.add.graphics();
            line.lineStyle(3, 0x000000, 1); // grosor, color, alpha
            line.beginPath();
            line.moveTo(width * 0.1, height * 0.35);   // inicio (20% del ancho)
            line.lineTo(width * 0.9, height * 0.35);   // final (80% del ancho)
            line.strokePath();

        // Controles
        this.add.text(centerX, height * 0.4, 'Controles', {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff',
        }).setOrigin(0.5);

        const separation = 400;

        // TECLA DERECHA
        this.add.image(width / 2 + separation / 2, 380, 'derTeclas')
            .setScale(0.35)
            .setOrigin(0.5);

        // TECLA IZQUIERDA
        this.add.image(width / 2 - separation / 2, 380, 'izqTeclas')
            .setScale(0.35)
            .setOrigin(0.5);

        // se limpia el slider al salir de la escena
        // (así se evita que se acumulen si entras y sales varias veces)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.volumeSlider) {
                this.volumeSlider.removeAllListeners();
                this.volumeSlider.destroy();
                this.volumeSlider = null;
            }
        });
    }
}

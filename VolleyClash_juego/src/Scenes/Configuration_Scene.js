// Pantalla de Configuración
import Phaser from 'phaser';
import { ensureStoredAudioSettings, getStoredMusicVolume, getStoredSfxVolume, getStoredGlobalVolume, setStoredMusicVolume, setStoredSfxVolume, setStoredGlobalVolume, applyStoredVolume, playClick } from '../UI/Audio.js';
import { createIconButton } from '../UI/Buttons.js';

export class Configuration_Scene extends Phaser.Scene {
    constructor() {
        super('Configuration_Scene');

        this.musicVolumeSlider = null;
        this.sfxVolumeSlider = null;
        this.globalVolumeSlider = null;
    }

    preload() {
        // imágenes fondo y ui
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');

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

        //// VOLUMENES ////
        ensureStoredAudioSettings();
        const initialGlobalVolume = getStoredGlobalVolume();
        const initialMusicVolume = getStoredMusicVolume();
        const initialSfxVolume = getStoredSfxVolume();

        // se aplica el volumen nada mas cargar
        applyStoredVolume(this);

        // Subtitulo global
        this.add.text(centerX, height * 0.18, 'Volumen General', {
            ...style, 
            fontSize: '24px', 
            color: '#000'
        }).setOrigin(0.5);

        // barra de volumen (global)
        this.globalVolumeSlider = this.add.dom(centerX, height * 0.24)
            .createFromHTML(`<input type="range" min="0" max="1" step="0.01" value="${initialGlobalVolume}" 
                style="width:220px; height:20px; accent-color:#00aaff; border-radius:5px;"/>`);

        this.globalVolumeSlider.addListener('input');
        this.globalVolumeSlider.on('input', (event) => {
            if (!(event.target instanceof HTMLInputElement)) return;
            setStoredGlobalVolume(event.target.value);
            applyStoredVolume(this);
        });


        // Subtitulo de musica
        this.add.text(centerX, height * 0.32, 'Volumen de la Música', {
            ...style,
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);

        // barra de volumen (musica)
        this.musicVolumeSlider = this.add
            .dom(centerX, height * 0.38)
            .createFromHTML(`<input type="range" min="0" max="1" step="0.01" value="${initialMusicVolume}"
                style="width:220px; height:20px; accent-color:#00aaff; border-radius:5px;"/>
            `);

        this.musicVolumeSlider.addListener('input');
        this.musicVolumeSlider.on('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) return;

            setStoredMusicVolume(target.value);
            applyStoredVolume(this);
        });

        // Subtitulo de efectos
        this.add.text(centerX, height * 0.46, 'Volumen de Efectos', {
            ...style,
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);

        // barra de volumen (efectos)
        this.sfxVolumeSlider = this.add
            .dom(centerX, height * 0.52)
            .createFromHTML(`<input type="range" min="0" max="1" step="0.01" value="${initialSfxVolume}"
                style="width:220px; height:20px; accent-color:#00aaff; border-radius:5px;"/>
            `);

        this.sfxVolumeSlider.addListener('input');
        this.sfxVolumeSlider.on('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) return;

            setStoredSfxVolume(target.value);
            applyStoredVolume(this);
        });

        this.sfxVolumeSlider.addListener('change');
        this.sfxVolumeSlider.on('change', (event) => {
            playClick(this, 'sonidoClick'); // se reproduce al soltar
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

        // se limpia el slider al salir de la escena
        // (así se evita que se acumulen si entras y sales varias veces)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.musicVolumeSlider) {
                this.musicVolumeSlider.removeAllListeners();
                this.musicVolumeSlider.destroy();
                this.musicVolumeSlider = null;
            }
            if (this.sfxVolumeSlider) {
                this.sfxVolumeSlider.removeAllListeners();
                this.sfxVolumeSlider.destroy();
                this.sfxVolumeSlider = null;
            }
            if (this.globalVolumeSlider) {
                this.globalVolumeSlider.removeAllListeners();
                this.globalVolumeSlider.destroy();
                this.globalVolumeSlider = null;
            }
        });
    }
}

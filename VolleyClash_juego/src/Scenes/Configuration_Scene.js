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

        // Título
        this.add.text(centerX, height * 0.1, 'Configuración', {
            ...style,
            fontSize: '42px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        //// VOLUMENES ////
        ensureStoredAudioSettings();
        const initialGlobalVolume = getStoredGlobalVolume();
        const initialMusicVolume = getStoredMusicVolume();
        const initialSfxVolume = getStoredSfxVolume();

        // se aplica el volumen nada mas cargar
        applyStoredVolume(this);

        // layout de los sliders
        const sections = 3;
        const sectionGap = height * 0.18;
        const labelToSliderGap = height * 0.05;
        const groupHeight = (sections - 1) * sectionGap + labelToSliderGap;
        const groupTopY = (height / 2) - (groupHeight / 2);

        const globalLabelY = groupTopY;
        const globalSliderY = globalLabelY + labelToSliderGap;
        const musicLabelY = groupTopY + sectionGap;
        const musicSliderY = musicLabelY + labelToSliderGap;
        const sfxLabelY = groupTopY + (sectionGap * 2);
        const sfxSliderY = sfxLabelY + labelToSliderGap;

        // Subtítulo global
        this.add.text(centerX, globalLabelY, 'Volumen General', {
            ...style, 
            fontSize: '28px', 
            color: '#000'
        }).setOrigin(0.5);

        // barra de volumen (global)
        this.globalVolumeSlider = this.add.dom(centerX, globalSliderY)
            .createFromHTML(`<input type="range" min="0" max="1" step="0.01" value="${initialGlobalVolume}" 
                style="width:220px; height:20px; accent-color:#00aaff; border-radius:5px;"/>`);

        this.globalVolumeSlider.addListener('input');
        this.globalVolumeSlider.on('input', (event) => {
            if (!(event.target instanceof HTMLInputElement)) return;
            setStoredGlobalVolume(event.target.value);
            applyStoredVolume(this);
        });


        // Subtítulo de música
        this.add.text(centerX, musicLabelY, 'Volumen Música', {
            ...style,
            fontSize: '28px',
            color: '#000'
        }).setOrigin(0.5);

        // barra de volumen (música)
        this.musicVolumeSlider = this.add
            .dom(centerX, musicSliderY)
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

        // Subtítulo de efectos
        this.add.text(centerX, sfxLabelY, 'Volumen Efectos', {
            ...style,
            fontSize: '28px',
            color: '#000'
        }).setOrigin(0.5);

        // barra de volumen (efectos)
        this.sfxVolumeSlider = this.add
            .dom(centerX, sfxSliderY)
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
            // se reproduce al soltar para dar feedback
            playClick(this, 'sonidoClick');
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

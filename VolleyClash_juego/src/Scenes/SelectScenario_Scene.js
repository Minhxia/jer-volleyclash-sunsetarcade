//Pantalla de Seleccion de escenario
import Phaser from 'phaser';
import { applyStoredVolume, playClick } from '../UI/Audio.js';
import { createUIButton, createIconButton } from '../UI/Buttons.js';

export class SelectScenario_Scene extends Phaser.Scene {
    constructor() {
        super('SelectScenario_Scene');
        this.selectedScenario = 'Gym';
        this.mode = 'local';
    }

    preload() {
        // Botones
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
        this.load.image('botonSimple', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonSimpleSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');

        // Fondo
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');

        // Escenarios
        this.load.image('Gym', 'ASSETS/FONDOS/GIMNASIO.png');
        this.load.image('Playa', 'ASSETS/FONDOS/PLAYA.png');
        this.load.image('Jardin', 'ASSETS/FONDOS/JARDIN.png');

        // Sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');

        // Marco
        this.load.image('marco', 'ASSETS/UI/MARCOS/VACIOS/MARCOS_ESCENARIO.png')
    }

    init(data) {
        this.player1 = data.player1;
        this.player2 = data.player2;
        this.mode = data.mode || 'local';
        this.isHost = data.isHost || false;
    }

    create() {
        const { width, height } = this.scale;
        const style = this.game.globals.defaultTextStyle;

        // se aplica el volumen
        applyStoredVolume(this);

        // Fondo
        this.add.image(0, 0, 'fondo')
            .setOrigin(0)
            .setDepth(-1)
            .setDisplaySize(width, height);

        // Título
        this.add.text(width / 2, 50, 'Selecciona Escenario', {
            ...style,
            fontSize: '42px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // Imagen del escenario seleccionado
        this.selectedScenario = 'Gym';
        this.selectedImage = this.add.image(width / 2, 240, this.selectedScenario).setScale(0.5);

        // Escenarios (botones)
        const escenarios = ['Gym', 'Playa', 'Jardin'];
        const spacing = 200;
        const startX = width / 2 - spacing;

        const scenarioButtons = {};

        // función para seleccionar escenario
        const setSelectedScenario = (nombre) => {
            this.selectedScenario = nombre;
            this.selectedImage.setTexture(nombre).setScale(0.5);

            // se deja marcado el seleccionado
            escenarios.forEach((key) => {
                scenarioButtons[key].setTexture(key === nombre ? 'botonSeleccionado' : 'botonSinSeleccionar');
            });
        };

        escenarios.forEach((nombre, i) => {
            const boton = this.add.image(startX + i * spacing, 440, 'botonSinSeleccionar')
                .setInteractive({ useHandCursor: true })
                .setScale(1.75);

            scenarioButtons[nombre] = boton;

            // texto en el centro
            const texto = this.add.text(0, 0, nombre, { ...style, fontSize: '28px', color: '#000' });
            Phaser.Display.Align.In.Center(texto, boton);

            // hover
            boton.on('pointerover', () => boton.setTexture('botonSeleccionado'));
            boton.on('pointerout', () => {
                boton.setTexture(this.selectedScenario === nombre ? 'botonSeleccionado' : 'botonSinSeleccionar');
            });

            // click: sonido + seleccionar
            boton.on('pointerdown', () => playClick(this, 'sonidoClick'));
            boton.on('pointerup', (pointer) => {
                const inside = boton.getBounds().contains(pointer.x, pointer.y);
                if (!inside) return;
                setSelectedScenario(nombre);
            });
        });

        // se marca el escenario por defecto visualmente
        setSelectedScenario(this.selectedScenario);

        // Marco
        const frameY = 240; // Y de la imagen del escenario
        const frame = this.add.image(width / 2, frameY, 'marco').setOrigin(0.5);
        frame.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        // Ajuste del tamaño del marco
        const targetFrameWidth = 500; 
        const targetFrameHeight = 300;
        frame.setDisplaySize(targetFrameWidth, targetFrameHeight);

        // botón Siguiente
        createUIButton(this, {
            x: width / 2,
            y: 500,
            label: 'Siguiente',
            onClick: () => {
                if (this.mode === 'local'){
                    this.scene.start('Game_Scene', {
                        player1: this.player1,
                        player2: this.player2,
                        selectedScenario: this.selectedScenario,
                        mode: this.mode,
                        isHost: this.isHost
                    });
                } else {
                    this.scene.start('Lobby_Scene', {
                        player1: this.player1,
                        player2: this.player2,
                        selectedScenario: this.selectedScenario,
                        mode: this.mode,
                        isHost: this.isHost
                    });
                }
            },
            scale: 1.5,
            textureNormal: 'botonSimple',
            textureHover: 'botonSimpleSeleccionado',
            textStyle: { ...style, fontSize: '18px', color: '#000' },
            clickSoundKey: 'sonidoClick',
        });

        // botón Volver atrás
        createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            clickSoundKey: 'sonidoClick',
            onClick: () => {
                this.scene.start('SelectPlayer_Scene', { 
                    mode: this.mode,
                    isHost: this.isHost
                });
            }
        });
    }
}
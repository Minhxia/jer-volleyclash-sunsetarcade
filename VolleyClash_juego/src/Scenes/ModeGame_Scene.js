// Pantalla para elegir Modo de Juego
import Phaser from 'phaser';
import { createUIButton, createIconButton } from '../UI/Buttons.js';
import { applyStoredVolume } from '../UI/Audio.js';

export class ModeGame_Scene extends Phaser.Scene {
    constructor() {
        super('ModeGame_Scene');
        this.serverActive = false; // inicializar
    }

    preload() {
        // botones
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');

        // fondo
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const { width, height } = this.scale;
        this.serverCheck = setInterval(() => {
            this.checkServerStatus();
        }, 5000);

        const style = this.game.globals?.defaultTextStyle ?? {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#000000',
        };

        // se aplica el volumen
        applyStoredVolume(this);

        // fondo
        this.add.image(0, 0, 'fondo')
            .setOrigin(0)
            .setDepth(-1)
            .setDisplaySize(width, height);

        // título
        this.add
            .text(width / 2, height * 0.18, 'Modo de Juego', {
                ...style,
                fontSize: '42px',
                color: '#5f0000ff'
            })
            .setOrigin(0.5);

        // layout
        const buttonY = height * 0.5;
        const spacing = Math.min(280, width * 0.3);
        const startX = width / 2 - spacing / 2;

        const buttonTextStyle = {
            ...style,
            fontSize: '28px',
            color: '#000000',
        };

        const startMode = (mode) => {
            this.registry.set('mode', mode);
            console.log('Modo seleccionado:', mode);
            this.scene.start('SelectPlayer_Scene', { mode });
        };

        // Botón LOCAL
        createUIButton(this, {
            x: startX,
            y: buttonY,
            label: 'Local',
            onClick: () => startMode('local'),
            scale: 2,
            textureNormal: 'botonSinSeleccionar',
            textureHover: 'botonSeleccionado',
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        // Botón RED
        createUIButton(this, {
            x: startX + spacing,
            y: buttonY,
            label: 'Red',
            onClick: () => {
                if (this.serverActive) {
                    startMode('online');
                } else {
                    console.log('Servidor no disponible');
                }
            },
            scale: 2,
            textureNormal: 'botonSinSeleccionar',
            textureHover: 'botonSeleccionado',
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });


        // Botón volver
        createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            clickSoundKey: 'sonidoClick',
            onClick: () => this.scene.start('Menu_Scene'),
        });

        // CONEXIÓN A SERVIDOR Y JUGADORES CONECTADOS
        // Textos
        this.serverStatusText = this.add.text(width / 2, height * 0.30, 'Estado del servidor: comprobando...', {
            ...style,
            fontSize: '22px',
            color: '#555555'
        }).setOrigin(0.5);

        this.playersCountText = this.add.text(width / 2, height * 0.36, 'Jugadores conectados: 0', {
            ...style,
            fontSize: '22px',
            color: '#555555'
        }).setOrigin(0.5);

        // Llamadas iniciales
        this.baseUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
        this.checkServerStatus();
        this.updatePlayersCount();

        // Timer para actualizar cada 3s
        this.playersCountTimer = this.time.addEvent({
            delay: 3000,
            callback: () => this.updatePlayersCount(),
            loop: true
        });
    }
    updatePlayersCount() {
        fetch(`${this.baseUrl}/api/players/count`)
            .then(res => res.json())
            .then(data => {
                this.playersCountText.setText(`Jugadores conectados: ${data.count}`);
            })
            .catch(() => {
                this.playersCountText.setText('Jugadores conectados: -');
            });
    }

    // Estado del servidor
    checkServerStatus() {
        fetch(`${this.baseUrl}/status`)
            .then(res => res.text())
            .then(data => {
                const active = data === 'active';
                this.serverActive = active;

                this.serverStatusText
                    .setText(`Estado del servidor: ${active ? 'ACTIVO' : 'INACTIVO'}`)
                    .setColor(active ? '#00AA00' : '#AA0000');
            })
            .catch(() => {
                this.serverActive = false;
                this.serverStatusText
                    .setText('Estado del servidor: NO DISPONIBLE')
                    .setColor('#AA0000');
            });
    }

    shutdown() {
        if (this.serverCheck) {
            clearInterval(this.serverCheck);
        }
    }
}

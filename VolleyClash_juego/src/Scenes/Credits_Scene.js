// Pantalla de Créditos
import Phaser from 'phaser';
import { createIconButton } from '../UI/Buttons.js';

export class Credits_Scene extends Phaser.Scene {
    constructor() {
        super('Credits_Scene');
    }

    preload() {
        // imágenes fondo y ui
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('logo', 'ASSETS/LOGO/logo_empresa.png');
        this.load.image('marco','ASSETS/UI/MARCOS/VACIOS/MARCOS_ESCENARIO.png')

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;

        const style = this.game.globals?.defaultTextStyle ?? {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#000000',
        };

        // fondo
        this.add
            .image(0, 0, 'fondo')
            .setOrigin(0)
            .setDepth(-1)
            .setDisplaySize(width, height);

        // título
        this.add
            .text(centerX, height * 0.15, 'Créditos', {
                ...style,
                fontSize: '32px',
                color: '#5f0000ff',
            })
            .setOrigin(0.5);

        // nombres del equipo
        const nombresEquipo = [
            'GRUPO 5 - SUNSET ARCADE',
            'Sara Bueno Esteban',
            'Antonio Morán Barrera',
            'Cristine Nioka Tewo',
            'Álvaro Ibáñez Montero',
        ];

        // marco centrado
        this.textures.get('marco').setFilter(Phaser.Textures.FilterMode.LINEAR);
        const frameY = height * 0.42;
        const frame = this.add.image(centerX, frameY, 'marco').setOrigin(0.5);

        // escala del marco según la resolución
        const targetFrameWidth = width * 0.45;
        const scale = targetFrameWidth / frame.width;
        frame.setScale(scale);

        // textos dentro del marco centrados verticalmente
        const lineSpacing = 30;
        const startY = frameY - ((nombresEquipo.length - 1) * lineSpacing) / 2;

        nombresEquipo.forEach((nombre, i) => {
            const isHeader = i === 0;
            this.add
                .text(centerX, startY + i * lineSpacing, nombre, {
                    ...style,
                    fontSize: isHeader ? '22px' : '20px',
                    color: '#000000',
                })
                .setOrigin(0.5);
        });

        // logo empresa
        this.add
            .image(centerX, height * 0.78, 'logo')
            .setOrigin(0.5)
            .setScale(0.6);

        // botón Volver atrás
        createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            onClick: () => this.scene.start('Menu_Scene'),
        });
    }
}

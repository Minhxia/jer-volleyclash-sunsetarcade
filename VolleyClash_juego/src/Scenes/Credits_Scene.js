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
        this.load.image('fondoMenuPrincipal', 'ASSETS/FONDOS/MENU_PRINCIPAL.png');
        this.load.image('logo', 'ASSETS/LOGO/logo_empresa.png');
        this.load.image('marco', 'ASSETS/UI/MARCOS/VACIOS/MARCOS_ESCENARIO.png')

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;

        const style = this.game.globals?.defaultTextStyle ?? {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
        };

        // fondo
        this.add.image(0, 0, 'fondoMenuPrincipal')
            .setOrigin(0)
            .setDepth(-2)
            .setDisplaySize(width, height);

        // capa oscura por encima del fondo
        this.add.rectangle(0, 0, width, height, 0x000000, 0.50)
            .setOrigin(0)
            .setDepth(-1);

        // nombre y miembros del equipo
        const nombresEquipo = [
            'GRUPO 5 - SUNSET ARCADE',
            'Sara Bueno Esteban',
            'Antonio Morán Barrera',
            'Cristine Nioka Tewo',
            'Alvaro Ibáñez Montero',
        ];

        //tarjeta donde se muestra el nombre del equipo y los miembros
        const cardWidth = width * 0.38;
        const cardHeight = height * 0.46;
        const cardX = width * 0.75;
        const cardY = height * 0.46;

        const card = this.add
            .rectangle(cardX, cardY, cardWidth, cardHeight, 0x111111, 0.7)
            .setOrigin(0.5);
        card.setStrokeStyle(2, 0xffffff, 0.2);

        const lineSpacing = 36;
        const startY = cardY - ((nombresEquipo.length - 1) * lineSpacing) / 2;

        nombresEquipo.forEach((nombre, i) => {
            const isHeader = i === 0;
            this.add
                .text(cardX, startY + i * lineSpacing, nombre, {
                    ...style,
                    fontFamily: 'VT323',
                    fontSize: isHeader ? '36px' : '32px',
                    color: isHeader ? '#f5d76e' : '#ffffff',
                })
                .setOrigin(0.5);
        });
               
        // título
        this.add.text(cardX, height * 0.1, 'Créditos', {
                ...style,
                fontSize: '42px',
                color: '#ffffff'
            })
            .setOrigin(0.5);

        // logo empresa
        const logoX = cardX;
        const logoY = cardY + (cardHeight / 2) + height * 0.16 - 3;
        this.add
            .image(logoX, logoY, 'logo')
            .setOrigin(0.5)
            .setScale(0.7);

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

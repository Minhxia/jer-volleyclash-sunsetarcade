// Pantalla de Tutorial
import Phaser from 'phaser';
import { applyStoredVolume, playClick } from '../UI/Audio.js';
import { createUIButton, createIconButton } from '../UI/Buttons.js';

export class Tutorial_Scene extends Phaser.Scene {
    constructor() {
        super('Tutorial_Scene');

        // un único tutorial con páginas
        this.pageIndex = 0;
        this.returnScene = 'Menu_Scene';
    }

    init(data) {
        // escena desde la que se abrió el tutorial, para reanudarla
        this.returnScene = data?.returnScene ?? 'Menu_Scene';
    }

    preload() {
        // imágenes, fondo y ui
        this.load.image('tut1_partido', 'ASSETS/TUTORIAL/TUT1_PARTIDO.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;

        const style = this.game.globals?.defaultTextStyle ?? {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#000000',
        };

        applyStoredVolume(this);

        // fondo
        this.add
            .image(0, 0, 'fondo')
            .setOrigin(0)
            .setDepth(-1)
            .setDisplaySize(width, height);

        // título
        this.add
            .text(centerX, height * 0.15, 'Tutorial', {
                ...style,
                fontSize: '32px',
                color: '#5f0000ff',
            })
            .setOrigin(0.5);

        // botón Volver atrás
        createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            onClick: () => this.scene.start('Menu_Scene'),
        });

        // contenido del tutorial (slides o páginas)
        this.pageIndex = 0;
        this.pages = [
            { key: 'tut1_partido', title: 'Objetivo', body: 'Gana el punto cuando el rival no devuelve el balon.' },
            { key: 'tut_2', title: 'Controles', body: 'Mover, saltar, recibir y golpear.' },
            { key: 'tut_3', title: 'Golpes', body: 'Recepcion, remate y rebotes.' }
        ];

        // layout for image (left) + text (right)
        const contentWidth = width * 0.85;
        const contentLeft = centerX - contentWidth / 2;
        const contentTop = height * 0.25;
        const contentHeight = height * 0.5;
        const leftColWidth = contentWidth * 0.48;
        const colGap = contentWidth * 0.03;
        const rightColWidth = contentWidth - leftColWidth - colGap;

        this.layout = {
            contentTop,
            contentHeight,
            leftColWidth,
            rightColWidth,
            contentLeft,
            colGap,
        };

        // ELEMENTOS DE LA PAGINA
        // titulo
        this.titleText = this.add.text(
            contentLeft + leftColWidth + colGap,
            contentTop,
            '',
            {
                ...style,
                fontSize: '28px',
                color: '#000'
            }
        ).setOrigin(0, 0);

        // cuerpo del texto
        this.bodyText = this.add.text(
            contentLeft + leftColWidth + colGap,
            contentTop + 50,
            '',
            {
                ...style,
                color: '#000',
                align: 'left',
                wordWrap: { width: rightColWidth }
            }
        ).setOrigin(0, 0);

        // imagen de la pagina
        this.slideImage = this.add.image(
            contentLeft + leftColWidth / 2,
            contentTop + contentHeight / 2,
            this.pages[0].key
        );
        this._fitImage(this.slideImage, leftColWidth * 0.9, contentHeight * 0.9);

        // indicador de pagina
        this.pageIndicator = this.add.text(centerX, height * 0.9, '', {
            ...style,
            fontSize: '20px',
            color: '#000'
        }).setOrigin(0.5);

        // BOTONES DE NAVEGACIÓN
        const buttonTextStyle = { ...style, fontSize: '20px', color: '#000000' };
        // botón Anterior
        createUIButton(this, {
            x: centerX - 160,
            y: height * 0.9,
            label: 'Anterior',
            onClick: () => this.prev(),
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });
        // botón Siguiente
        createUIButton(this, {
            x: centerX + 160,
            y: height * 0.9,
            label: 'Siguiente',
            onClick: () => this.next(),
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        this.renderPage();
    }

    _fitImage(img, maxW, maxH) {
        const scale = Math.min(maxW / img.width, maxH / img.height);
        img.setScale(scale);
    }

    renderPage() {
        const p = this.pages[this.pageIndex];
        this.titleText.setText(p.title);
        this.bodyText.setText(p.body);
        this.slideImage.setTexture(p.key);
        this._fitImage(
            this.slideImage,
            this.layout.leftColWidth * 0.9,
            this.layout.contentHeight * 0.9
        );
        this.pageIndicator.setText(`${this.pageIndex + 1} de ${this.pages.length}`);
    }

    next() {
        if (this.pageIndex < this.pages.length - 1) {
            this.pageIndex++;
            this.renderPage();
        }
    }

    prev() {
        if (this.pageIndex > 0) {
            this.pageIndex--;
            this.renderPage();
        }
    }

}

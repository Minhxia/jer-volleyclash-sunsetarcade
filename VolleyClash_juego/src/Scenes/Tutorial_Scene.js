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
        // imágenes del tutorial
        this.load.image('tut0_controles', 'ASSETS/TUTORIAL/TUT0_Controles.png');
        this.load.image('tut1_set', 'ASSETS/TUTORIAL/TUT1_Set.png');
        this.load.image('tut2_pelota', 'ASSETS/TUTORIAL/TUT2_Pelota.png');
        this.load.image('tut3_powerup', 'ASSETS/TUTORIAL/TUT3_Powerup.png');
        this.load.image('tut4_lista', 'ASSETS/TUTORIAL/TUT4_Lista.png');

        // fondo y ui
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;

        const style = {
            ...(this.game.globals?.defaultTextStyle ?? {
                fontFamily: 'VT323',
                fontSize: '20px',
                color: '#000000',
            })
        };

        applyStoredVolume(this);

        // fondo
        this.add
            .image(0, 0, 'fondo')
            .setOrigin(0)
            .setDepth(-1)
            .setDisplaySize(width, height);

        // título
        this.mainTitleText = this.add
            .text(centerX, height * 0.1, 'Tutorial', {
                ...style,
                fontSize: '42px',
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
            onClick: () => this.scene.start(this.returnScene),
        });

        // contenido del tutorial (slides)
        this.pageIndex = 0;
        this.pages = [
            { key: 'tut0_controles', title: 'Controles Local - Online' },
            { key: 'tut1_set', title: 'Reglas básicas: set' },
            { key: 'tut2_pelota', title: 'Reglas básicas: pelota' },
            { key: 'tut3_powerup', title: 'Reglas básicas: power-ups' },
            { key: 'tut4_lista', title: 'Lista de power-ups' }
        ];

        // panel para las imágenes
        const panelMargin = Math.max(8, Math.round(Math.min(width, height) * 0.015));
        const panelGap = Math.max(6, Math.round(height * 0.012));
        const navY = height * 0.91;

        const panelTop = this.mainTitleText.y + this.mainTitleText.height + panelGap;
        const panelBottom = navY - panelGap;
        const panelHeight = Math.max(0, panelBottom - panelTop);
        const panelWidth = Math.max(0, width - panelMargin * 2);

        this.layout = {
            panelTop,
            panelHeight,
            panelWidth,
        };

        // imagen de la pagina
        this.slideImage = this.add.image(
            centerX,
            panelTop + panelHeight / 2,
            this.pages[0].key
        );
        this._fitImage(this.slideImage, panelWidth, panelHeight);

        // indicador de pagina
        this.pageIndicator = this.add.text(centerX, navY + 20, '', {
            ...style,
            fontSize: '28px',
            color: '#000'
        }).setOrigin(0.5);

        // BOTONES DE NAVEGACIÓN
        const buttonTextStyle = { ...style, fontSize: '28px', color: '#000000' };
        
        // botón Anterior
        this.prevBtn = createUIButton(this, {
            x: centerX - 165,
            y: navY + 20,
            label: 'Anterior',
            onClick: () => this.prev(),
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        // botón Siguiente
        this.nextBtn = createUIButton(this, {
            x: centerX + 165,
            y: navY + 20,
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
        this.mainTitleText.setText(p.title ?? 'Tutorial');
        this.slideImage.setTexture(p.key);
        this._fitImage(this.slideImage, this.layout.panelWidth, this.layout.panelHeight);
        this.pageIndicator.setText(`${this.pageIndex + 1} de ${this.pages.length}`);

        // Botón Anterior: se deshabilita si estamos en la página 0
        const isFirstPage = this.pageIndex === 0;
        this.toggleButtonState(this.prevBtn, !isFirstPage);

        // Botón Siguiente: se deshabilita si estamos en la última página
        const isLastPage = this.pageIndex === this.pages.length - 1;
        this.toggleButtonState(this.nextBtn, !isLastPage);
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

    toggleButtonState(btnObj, enabled) {
        const sprite = btnObj.button;
        const text = btnObj.text;

        if (enabled) {
            sprite.setInteractive();
            sprite.setAlpha(1);
            text.setAlpha(1);
        } else {
            sprite.disableInteractive();
            sprite.setAlpha(0);
            text.setAlpha(0);
        }
    }
}

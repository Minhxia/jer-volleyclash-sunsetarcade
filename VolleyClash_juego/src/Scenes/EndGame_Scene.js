//Pantalla de Fin
import Phaser from 'phaser';
import { createUIButton } from '../UI/Buttons.js';

export class EndGame_Scene extends Phaser.Scene {
    constructor() {
        super('EndGame_Scene');
    }

    init(data) {
        this.winner = data.winner;
        this.player1 = data.player1;
        this.player2 = data.player2;
    }
    preload() {
        // imágenes fondo y ui
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE_G_SELECCIONADO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_BASE_G.png');

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');

        //Animaciones de victoria
        this.load.spritesheet(
            'victoria_A', 
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJES_A/A_VICTORIA.png', 
            {frameWidth:128,frameHeight: 128});
        this.load.spritesheet(
            'victoria_B', 
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJES_B/A_VICTORIA.png', 
            {frameWidth:128,frameHeight: 128});
        this.load.spritesheet(
            'victoria_C', 
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJES_C/A_VICTORIA.png', 
            {frameWidth:128,frameHeight: 128});
    }

    create() { 
        this._createAnimations();
        const { width, height } = this.scale;
        const style = this.game.globals.defaultTextStyle;

        const charP1 = this.player1.name;
        const spriteP1 = this.player1.character;
        const charP2 = this.player2.name;
        const spriteP2 = this.player2.character;

        // Fondo
        this.add.image(0, 0, 'fondo').setOrigin(0).setDepth(-1);

        // Título
        this.add.text(width / 2, height * 0.18, "¡Fin del partido!", {
            ...style,
            fontSize: '42px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        const winnerTextY = height * 0.36;
        const spriteRowY = height * 0.52;
        const buttonY = height * 0.90;
        const spriteOffsetX = width * 0.2;

        // Texto indicando el ganador
        const winnerText =
            this.winner === "player1"
                ? "Victoria de: " + charP1
                : "Victoria de: " + charP2;

        this.add.text(width / 2, winnerTextY, winnerText, {
            ...style,
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);
        let winnerCharacter;

        if (this.winner === "player1") {
            winnerCharacter = spriteP1; // 'A', 'B' o 'C'
        } else {
            winnerCharacter = spriteP2;
        }
        const animKey = `victoria_${winnerCharacter}`;

        // Huecos para sprites de ganador y perdedor (animaciones futuras)
        this.winnerSpriteSlot = this.add.container(width / 2 - spriteOffsetX, spriteRowY);

        const winnerSprite = this.add.sprite(0, 0, `victoria_${winnerCharacter}`);
        winnerSprite.setScale(0.5);
        winnerSprite.play(animKey);

        // Añadir al contenedor del ganador
        this.winnerSpriteSlot.add(winnerSprite);
        


        // botón para volver al menú principal
        const buttonTextStyle = {
            ...style,
            fontSize: '28px',
            color: '#000000'
        };
        createUIButton(this, {
            x: width / 2,
            y: buttonY,
            label: 'Menú Principal',
            onClick: () => {
                this.scene.start('Menu_Scene');
            },
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });
    }
    _createAnimations(){
        this.anims.create({
            key: 'charA_victory',
            frames: this.anims.generateFrameNumbers('victoria_A', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'charB_victory',
            frames: this.anims.generateFrameNumbers('victoria_B', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'charC_victory',
            frames: this.anims.generateFrameNumbers('victoria_C', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });
    }
}

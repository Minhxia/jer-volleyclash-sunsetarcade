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

        // animaciones de victoria
        this.load.spritesheet(
            'victoria_A', 
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_A/A_VICTORIA.png', 
            {frameWidth:128,frameHeight: 128});
        this.load.spritesheet(
            'victoria_B', 
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_B/A_VICTORIA.png', 
            {frameWidth:128,frameHeight: 128});
        this.load.spritesheet(
            'victoria_C', 
            'ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_C/A_VICTORIA.png', 
            {frameWidth:128,frameHeight: 128});
    }

    create() { 
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

        const winnerTextY = height * 0.33;
        const buttonY = height * 0.90;
        const spritePadding = height * 0.04;
        const spriteCenterY = Math.round((winnerTextY + buttonY) / 2 - height * 0.02);

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

        // se crean las animaciones
        this._createAnimations();

        const winnerCharacter = this.winner === "player1" ? spriteP1 : spriteP2;

        const victoryConfig = {
            characterA: { spriteKey: 'victoria_A', animKey: 'charA_victory' },
            characterB: { spriteKey: 'victoria_B', animKey: 'charB_victory' },
            characterC: { spriteKey: 'victoria_C', animKey: 'charC_victory' }
        };

        const { spriteKey, animKey } = victoryConfig[winnerCharacter] || victoryConfig.characterA;

        // hueco para los sprites del ganador
        this.winnerSpriteSlot = this.add.container(Math.round(width / 2), spriteCenterY);

        const winnerSprite = this.add.sprite(0, 0, spriteKey);
        winnerSprite.setCrop(0, 1, 128, 127);
        const availableHeight = (buttonY - winnerTextY) - spritePadding * 2;
        const availableWidth = width * 0.6;
        let scale = Math.min(
            availableHeight / winnerSprite.height,
            availableWidth / winnerSprite.width
        ) * 0.85;
        scale = Math.round(scale * 10) / 10;
        winnerSprite.setScale(Math.max(0.2, scale));
        winnerSprite.play(animKey);
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
            label: 'Volver',
            onClick: () => {
                this.scene.start('Menu_Scene');
            },
            textStyle: buttonTextStyle,
            clickSoundKey: 'sonidoClick',
        });

        this.updateUserStats(this.winner);
    }

    // Crea las animaciones de victoria
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

    updateUserStats(winner) {
        const username = this.registry.get('username');
        if (!username) return;

        const winnerName = (winner === "player1") ? this.player1.name : this.player2.name;

        const myResult = (username === winnerName) ? "win" : "lose";
        console.log(`[Stats] Usuario: ${username}, Resultado local: ${myResult}`);

        const baseUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

        fetch(`${baseUrl}/api/game/finish`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                resultado: myResult
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Estadísticas actualizadas:', data);
        })
        .catch(err => {
            console.error('Error actualizando estadísticas', err);
        });
    }
}

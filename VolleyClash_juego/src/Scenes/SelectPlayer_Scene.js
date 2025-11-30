//Pantalla de Seleccion de jugador
import Phaser from 'phaser';

export class SelectPlayer_Scene extends Phaser.Scene {
    constructor() {
        super('SelecPlayer_Scene');
    }

    preload() {
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
        this.load.image('botonSimple', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonSimpleSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('marco','ASSETS/UI/MARCOS/VACIOS/MARCO_PERSONAJE_SELECCIONADO.png')

        this.load.image('personajeA', 'ASSETS/PERSONAJES/PERSONAJES_POSE/personajes_a.png');
        this.load.image('personajeB', 'ASSETS/PERSONAJES/PERSONAJES_POSE/personajes_b.png');
        this.load.image('personajeC', 'ASSETS/PERSONAJES/PERSONAJES_POSE/personaje_c.png');
        
    }

    create() {
        const { width, height } = this.scale;

        const background = this.add.image(0, 0, 'fondo')
        .setOrigin(0)
        .setDepth(-1);

        // Datos jugadores
        this.players = [
            { name: '', character: null, color: 0x00aaff }, // Azul - Jugador 1
            { name: '', character: null, color: 0xff5555 }  // Rojo - Jugador 2
        ];

        this.selectedCharacters = new Set(); // Conjunto con los personajes seleccionados

        // Texto superior
        this.add.text(width / 2, 50, 'Selecciona Personaje', { fontSize: '40px', color: '#000', fontStyle: 'bold' }).setOrigin(0.5);

        // Crear áreas de selección
        this.createPlayerArea(0); // Jugador 1
        this.createPlayerArea(1); // Jugador 2

        // Boton Siguiente
        const nextButton = this.add.image(width/2, 500, 'botonSinSeleccionar')
            .setInteractive()
            .setScale(1.5);
        const nextText = this.add.text(0, 0, 'Siguiente', { fontSize: '12px', color: '#000' });
        Phaser.Display.Align.In.Center(nextText, nextButton);

        nextButton.on('pointerover', () => nextButton.setTexture('botonSimpleSeleccionado'));
        nextButton.on('pointerout', () => nextButton.setTexture('botonSimple'));
        nextButton.on('pointerdown', () => nextButton.setTexture('botonSimpleSeleccionado'));
        nextButton.on('pointerup', () => {
            const name1 = this.playerInputs[0].node.querySelector('input').value.trim();
            const name2 = this.playerInputs[1].node.querySelector('input').value.trim();

            console.log("Nombre de usuario:", name1);
            console.log("Nombre de usuario:", name2);

            if (!name1 || !name2) {
                console.warn("Ambos jugadores deben poner nombre");
                return;
            }
            this.players[0].name = name1;
            this.players[1].name = name2;

            this.scene.start('SelectScenario_Scene', { 
                player1: this.players[0],
                player2: this.players[1]
            });
        });

        // Boton Volver
        const backX = width * 0.06;
        const backY = height * 0.08;

        const backButton = this.add
            .sprite(backX, backY, 'botonVolver')
            .setScale(1)
            .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('ModeGame_Scene');
        });
    }

    createPlayerArea(idx) {
        const { width, height } = this.scale;
        const player = this.players[idx];

        // Turno: 0 = jugador 1, 1 = jugador 2
        this.currentTurn = 0;

        // Crear inputs y marcos para cada jugador
        this.players.forEach((player, idx) => {
            // Input de nombre arriba
            this.add.text(width * (0.25 + 0.5 * idx), 110, 'Nombre:', { fontSize: '24px', color: '#000' }).setOrigin(0.5);
            const input = this.add.dom(width * (0.25 + 0.5 * idx), 150).createFromHTML(`
                <input type="text" placeholder="Nombre jugador" maxlength="10"
                    style="width:120px; padding:5px; font-size:16px; border-radius:5px;">
            `);
            if (!this.playerInputs) this.playerInputs = [];
            this.playerInputs[idx] = input;

            // Imagen grande
            player.bigImage = this.add.image(width * (0.25 + 0.5 * idx), height * 0.6, 'personajeA')
                .setScale(1.2)
                .setVisible(false);

            player.bigFrame = this.add.image(player.bigImage.x, player.bigImage.y, 'marco')
            .setScale(2.8) 
            .setVisible(true);
            // Marco sobre miniatura
            player.frame = this.add.rectangle(0, 0, 60, 120)
                .setStrokeStyle(4, player.color)
                .setVisible(false);
        });


        // Miniaturas en triángulo central
        const personajes = ['personajeA', 'personajeB', 'personajeC'];
        const spacing = 150; // aumenta espaciado
        const startX = width / 2 - spacing / 2;
        const startY = height * 0.5;

        const positions = [
            { x: startX, y: startY },
            { x: startX + spacing, y: startY },
            { x: startX + spacing / 2, y: startY + spacing / 2 }
        ];

        personajes.forEach((nombre, i) => {
            const mini = this.add.image(positions[i].x, positions[i].y, nombre)
                .setInteractive()
                .setScale(0.45)
                .setData('characterName', nombre);

            mini.on('pointerdown', () => {
                const player1 = this.players[0];
                const player2 = this.players[1];

                let currentPlayer, otherPlayer;

                // Si currentTurn es null (ambos tienen personaje), nadie puede seleccionar
                if (this.currentTurn === null) {
                    // Pero si clickeas tu propio personaje para deseleccionar, permitimos
                    if (player1.character === nombre) currentPlayer = player1;
                    else if (player2.character === nombre) currentPlayer = player2;
                    else return; // otro personaje ocupado, no permitir
                    otherPlayer = currentPlayer === player1 ? player2 : player1;
                } else {
                    // Turno definido
                    currentPlayer = this.players[this.currentTurn];
                    otherPlayer = this.players[1 - this.currentTurn];
                }

                // Deseleccion si clickeo mi propio personaje
                if (currentPlayer.character === nombre) {
                    currentPlayer.character = null;
                    currentPlayer.bigImage.setVisible(false);
                    currentPlayer.frame.setVisible(false);
                    this.selectedCharacters.delete(nombre);

                    // Si ambos tenian personaje antes, este jugador tiene turno
                    this.currentTurn = this.players.indexOf(currentPlayer);
                    return;
                }

                // No permitir seleccionar si ya está ocupado por el otro jugador
                if (otherPlayer.character === nombre) return;

                // Si ambos jugadores ya tienen personaje, no permitir seleccionar otro
                if (player1.character && player2.character) return;

                // Liberar personaje anterior del jugador
                if (currentPlayer.character) this.selectedCharacters.delete(currentPlayer.character);

                // Asignar nuevo personaje
                currentPlayer.character = nombre;
                currentPlayer.bigImage.setTexture(nombre).setVisible(true);
                this.selectedCharacters.add(nombre);

                // Marco sobre miniatura
                currentPlayer.frame.setPosition(mini.x, mini.y);
                currentPlayer.frame.setVisible(true);

                // Cambiar turno (Solo si el otro jugador no tiene personaje)
                if (!otherPlayer.character) {
                    this.currentTurn = 1 - this.currentTurn;
                } else {
                    // Ambos tienen personaje: no hay turno fijo
                    this.currentTurn = null;
                }
            });
        });
    }
}
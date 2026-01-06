// Pantalla de Selección de jugador
import Phaser from 'phaser';
import { applyStoredVolume, playClick } from '../UI/Audio.js';
import { createUIButton, createIconButton } from '../UI/Buttons.js';

export class SelectPlayer_Scene extends Phaser.Scene {
    constructor() {
        super('SelectPlayer_Scene');

        this.players = [];
        this.currentTurn = 0;    // turnos: 0 -> jugador1, 1 -> jugador2, null -> ambos listos
        this.playerInputs = [];
        this.playerInputEls = [];
        this.turnText = null;
    }

    init(data) {
        this.mode = this.registry.get('mode');
        console.log('Modo de Juego:', this.mode);
        //this.isHost = this.registry.get('isHost');
        //console.log('Host:', this.isHost);
    }

    preload() {
        // botones
        this.load.image('botonSeleccionado', 'ASSETS/UI/BOTONES/BOTON_SELECCIONDO.png');
        this.load.image('botonSinSeleccionar', 'ASSETS/UI/BOTONES/BOTON_SIN_SELECCIONAR.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/VOLVER.png');
        this.load.image('botonSimple', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonSimpleSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');

        // fondo
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');
        this.load.image('marcoJugador', 'ASSETS/UI/MARCOS/VACIOS/MARCO_PERSONAJE_SELECCIONADO.png');

        // personajes
        this.load.image('characterA', 'ASSETS/PERSONAJES/PERSONAJES_POSE/personajes_a.png');
        this.load.image('characterB', 'ASSETS/PERSONAJES/PERSONAJES_POSE/personajes_b.png');
        this.load.image('characterC', 'ASSETS/PERSONAJES/PERSONAJES_POSE/personaje_c.png');

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
    }

    create() {
        // se limpian todas las teclas capturadas por otras escenas
        this.input.keyboard.removeAllKeys(true);
        this.input.keyboard.removeAllListeners();

        const { width, height } = this.scale;

        const style = this.game.globals?.defaultTextStyle ?? {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
        };

        // se aplica el volumen
        applyStoredVolume(this);

        // Fondo
        this.add.image(0, 0, 'fondo')
            .setOrigin(0)
            .setDepth(-1)
            .setDisplaySize(width, height);

        // Título
        this.add.text(width / 2, 50, 'Selecciona Personaje', {
            ...style,
            fontSize: '42px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // según el modo se crea una UI u otra
        if (this.mode === 'local') {
            this.createLocalUI(width, height, style);
        }
        if (this.mode === 'online') {
            this.createOnlineUI(width, height, style);
        }

        // Botón volver
        createIconButton(this, {
            x: width * 0.06,
            y: height * 0.08,
            texture: 'botonVolver',
            scale: 1,
            hoverScale: 1.1,
            clickSoundKey: 'sonidoClick',
            onClick: () => this.scene.start('ModeGame_Scene'),
        });

        // se limpia DOM al salir
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.playerInputs.forEach((dom) => dom?.destroy());
            this.playerInputs = [];
            this.playerInputEls = [];
            this.input.keyboard.enabled = true;
        });
    }

    createLocalUI(width, height, style) {
        // Datos de los jugadores
        this.players = [
            { name: '', character: null, color: 0x00aaff, bigImage: null, bigFrame: null, frame: null },
            { name: '', character: null, color: 0xff5555, bigImage: null, bigFrame: null, frame: null },
        ];

        // Texto de turno
        this.turnText = this.add.text(width / 2, 95, 'TURNO: Jugador 1', {
            ...style,
            fontFamily: 'VT323',
            fontSize: '28px',
            color: '#000',
        }).setOrigin(0.5);

        const selectionOffsetY = 25;

        // UI jugadores + miniaturas
        this.createPlayersUI(selectionOffsetY);
        this.createCharacterMiniatures(0, selectionOffsetY);
        this.updateTurnText();

        // Botón Siguiente
        createUIButton(this, {
            x: width / 2,
            y: 500,
            label: 'Siguiente',
            onClick: () => this.handleNext(),
            scale: 1.5,
            textureNormal: 'botonSimple',
            textureHover: 'botonSimpleSeleccionado',
            textStyle: { ...style, fontSize: '18px', color: '#000' },
            clickSoundKey: 'sonidoClick'
        });
    }

    createOnlineUI(width, height, style) {
        // Datos del jugador
        this.players = [
            { name: this.registry.get('username') || 'JugadorX', character: null, color: 0x00aaff, bigImage: null, bigFrame: null, frame: null }
        ];

        const selectionOffsetY = 40;

        this.add.text(width / 2, 60 + selectionOffsetY, `${this.players[0].name}`, {
            ...style,
            fontFamily: 'VT323',
            fontSize: '32px',
            color: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Texto de turno (Estado en este caso, pero con el mismo nombre para manterner la misma funcionalidad)
        this.turnText = this.add.text(width / 2, 130, 'Ningún personaje seleccionado', {
            ...style,
            fontFamily: 'VT323',
            fontSize: '28px',
            color: '#000',
        }).setOrigin(0.5);

        // UI jugadores + miniaturas
        this.createPlayerOnlineUI(selectionOffsetY);
        this.createCharacterMiniatures(150, selectionOffsetY);

        // Botón Siguiente
        createUIButton(this, {
            x: width / 2,
            y: 500,
            label: 'Siguiente',
            onClick: () => this.handleNext(),
            scale: 1.5,
            textureNormal: 'botonSimple',
            textureHover: 'botonSimpleSeleccionado',
            textStyle: { ...style, fontSize: '18px', color: '#000' },
            clickSoundKey: 'sonidoClick',
        });
    }

    // Crea la UI de selección de jugadores
    createPlayersUI(offsetY = 0) {
        const { width, height } = this.scale;
        const style = this.game.globals.defaultTextStyle;

        const positionsX = [width * 0.25, width * 0.75];

        this.players.forEach((player, idx) => {
            const x = positionsX[idx];

            // Label nombre
            this.add.text(x, 100 + offsetY, 'Nombre:', { ...style, fontSize: '24px', color: '#000' })
                .setOrigin(0.5);

            // Input nombre
            const dom = this.add.dom(x, 140 + offsetY).createFromHTML(`
                <input type="text" placeholder="Nombre jugador" maxlength="10"
                style="
                    width:150px;
                    padding:6px;
                    font-size:16px;
                    font-family:${style.fontFamily};
                    border-radius:12px;
                    border: 6px solid #FFAA00;
                    outline: none;
                    text-align:center;
                    background-color:#f0f0f0;
                    transition: border-color 0.2s, box-shadow 0.2s;"
                onfocus="this.style.borderColor='#FF8316'; this.style.boxShadow='0 0 5px #FF8316';"
                onblur="this.style.borderColor='#FFAA00'; this.style.boxShadow='none';"
                />
            `);

            const inputEl = /** @type {HTMLInputElement} */ (dom.node.querySelector('input'));

            // para que el teclado no interfiera con Phaser
            inputEl.addEventListener('focus', (e) => {
                this.input.keyboard.enabled = false;
                e.stopPropagation();
            });
            inputEl.addEventListener('blur', (e) => {
                this.input.keyboard.enabled = true;
                e.stopPropagation();
            });
            inputEl.addEventListener('keydown', (e) => e.stopPropagation());

            // Letras + espacios
            inputEl.addEventListener('input', () => {
                inputEl.value = inputEl.value.replace(/[^a-zA-ZÀ-ÿñÑ ]/g, '');
                this.updateTurnText();
            });

            this.playerInputs[idx] = dom;
            this.playerInputEls[idx] = inputEl;

            // “Slot” grande + marco
            player.bigImage = this.add.image(width * (0.25 + 0.5 * idx), height * 0.6 + offsetY, 'characterA')
                .setScale(1.2)
                .setOrigin(0.5)
                .setVisible(false);

            player.bigFrame = this.add.image(player.bigImage.x, player.bigImage.y, 'marcoJugador')
                .setScale(2.8)
                .setOrigin(0.5)
                .setVisible(true);
            player.bigFrame.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

            // Marco sobre miniatura (rectángulo)
            player.frame = this.add.rectangle(0, 0, 60, 120)
                .setStrokeStyle(4, player.color)
                .setVisible(false);
        });

        // Turno empieza en jugador 1
        this.currentTurn = 0;
        this.updateTurnText();
    }

    createPlayerOnlineUI(offsetY = 0) {
        const { width, height } = this.scale;

        const player = this.players[0];
        const centerX = width / 2;

        // “Slot” grande + marco
        player.bigImage = this.add.image(centerX - 150, height * 0.5 + offsetY, 'characterA')
            .setScale(1.2)
            .setOrigin(0.5)
            .setVisible(false);

        player.bigFrame = this.add.image(player.bigImage.x, player.bigImage.y, 'marcoJugador')
            .setScale(2.8)
            .setOrigin(0.5)
            .setVisible(true);
        player.bigFrame.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        // Marco sobre miniatura (rectángulo)
        player.frame = this.add.rectangle(0, 0, 60, 120)
            .setStrokeStyle(4, player.color)
            .setVisible(false);
    }

    // Crea las miniaturas de los personajes seleccionables
    createCharacterMiniatures(x, y) {
        const { width, height } = this.scale;

        const personajes = ['characterA', 'characterB', 'characterC'];
        const spacing = 150;
        const startX = width / 2 - spacing / 2;
        const startY = height * 0.4;

        const positions = [
            { x: startX + x, y: startY + y },
            { x: startX + x + spacing, y: startY + y },
            { x: startX + x + spacing / 2, y: startY + y + spacing / 2 },
        ];

        personajes.forEach((nombre, i) => {
            const mini = this.add.image(positions[i].x, positions[i].y, nombre)
                .setInteractive({ useHandCursor: true })
                .setScale(0.45)
                .setData('characterName', nombre);

            mini.on('pointerdown', () => {
                playClick(this, 'sonidoClick');
                this.onMiniClicked(nombre, mini);
            });
        });
    }

    // Lógica al hacer click sobre una miniatura (personaje)
    onMiniClicked(characterName, mini) {
        if (this.mode === 'online') {
            const player = this.players[0];

            // Si el personaje ya es el seleccionado, se deselecciona
            if (player.character === characterName) {
                player.character = null;
                if (player.bigImage) player.bigImage.setVisible(false);
                if (player.frame) player.frame.setVisible(false);
            } else {
                // Si es uno nuevo, se selecciona (y automáticamente desmarca el anterior si lo hubiera)
                player.character = characterName;
                if (player.bigImage) player.bigImage.setTexture(characterName).setVisible(true);
                if (player.frame) player.frame.setPosition(mini.x, mini.y).setVisible(true);
            }
            this.updateTurnText();
            return; // Salimos para no ejecutar la lógica de turnos del modo local
        }

        const ownerIndex = this.players.findIndex(p => p.character === characterName);

        // si el personaje ya pertenece a alguien, se deselecciona siempre
        if (ownerIndex !== -1) {
            const owner = this.players[ownerIndex];

            owner.character = null;

            if (owner.bigImage) owner.bigImage.setVisible(false);
            if (owner.frame) owner.frame.setVisible(false);

            // El turno pasa a ese jugador para que elija inmediatamente otro
            this.currentTurn = ownerIndex;
            this.updateTurnText();
            return;
        }

        // si el personaje no pertenece a nadie, lo asignamos según el turno (o según quién falte)
        const p1 = this.players[0];
        const p2 = this.players[1];

        let targetIndex = this.currentTurn;

        // si currentTurn es null (ambos ya tenían), no se deja reemplazar sin deseleccionar antes,
        // pero si uno está vacío, se elige automáticamente el vacío
        if (targetIndex === null || targetIndex === undefined) {
            if (!p1.character && p2.character) targetIndex = 0;
            else if (!p2.character && p1.character) targetIndex = 1;
            else if (!p1.character && !p2.character) targetIndex = 0;
            else {
                // ambos tienen personaje: para cambiar, primero deselecciona uno (click en su mini)
                return;
            }
        }

        const target = this.players[targetIndex];
        const other = this.players[1 - targetIndex];

        // no se permite escoger uno que tenga el otro
        if (other.character === characterName) return;

        // Asignar personaje
        target.character = characterName;

        if (target.bigImage) target.bigImage.setTexture(characterName).setVisible(true);
        if (target.frame) target.frame.setPosition(mini.x, mini.y).setVisible(true);

        // turno: si el otro aún no eligió, pasa al otro; si ya eligió, queda en null (ambos listos)
        if (!other.character) this.currentTurn = 1 - targetIndex;
        else this.currentTurn = null;

        this.updateTurnText();
    }

    // Controla que pasa al hacer click en el botón Siguiente
    handleNext() {
        if (this.mode === 'local') {
            const name1 = this.playerInputEls?.[0]?.value?.trim() ?? '';
            const p1HasChar = !!this.players?.[0]?.character;

            const name2 = this.playerInputEls?.[1]?.value?.trim() ?? '';
            const p2HasChar = !!this.players?.[1]?.character;

            const ready = (name1.length > 0) && (name2.length > 0) && p1HasChar && p2HasChar;

            if (!ready) {
                // se actualiza el texto de arriba (turnText) con el mensaje específico
                this.updateTurnText();

                // se destaca el mensaje en rojo durante 1s
                this.flashTurnText('#b00000', 900);

                return;
            }

            // se guardan nombres
            this.players[0].name = name1;
            this.players[1].name = name2;

            // se pasa a la siguiente escena
            this.scene.start('SelectScenario_Scene', {
                mode: this.mode,
                player1: this.players[0],
                player2: this.players[1],
            });
        }

        if (this.mode === 'online') {
            const p1HasChar = !!this.players?.[0]?.character;

            if (!p1HasChar) {
                // solo se avisa si no ha elegido personaje
                this.flashTurnText('#b00000', 900);
                this.turnText.setText('Debes elegir un personaje primero');
                return;
            }

            this.registry.set('myCharacter', this.players[0].character);

            /*if (this.isHost) {
                // Soy el admin: puedo pasar a elegir escenario
                this.scene.start('SelectScenario_Scene', {
                    mode: this.mode,
                    player1: this.players[0],
                    isHost: true
                });
            } else {
                this.scene.start('Lobby_Scene', {
                    mode: this.mode,
                    player2: this.players[0],
                    isHost: false 
                });
            }*/
            this.scene.start('Lobby_Scene', {mode: this.mode});
        }
    }

    // Hace parpadear el texto de turno con un color rojo durante unos milisegundos
    flashTurnText(color = '#b00000', ms = 900) {
        if (!this.turnText) return;

        const oldColor = this.turnText.style.color || '#000000';
        this.turnText.setColor(color);

        this.time.delayedCall(ms, () => {
            // vuelve al color normal y refresca el texto por si cambió algo
            this.turnText.setColor(oldColor);
            this.updateTurnText();
        });
    }

    // Actualiza el texto de turno/estado actual
    updateTurnText() {
        if (!this.turnText) return;

        if (this.mode === 'local') {
            const name1 = this.playerInputEls?.[0]?.value?.trim() ?? '';
            const name2 = this.playerInputEls?.[1]?.value?.trim() ?? '';

            const p1HasChar = !!this.players?.[0]?.character;
            const p2HasChar = !!this.players?.[1]?.character;

            const p1HasName = name1.length > 0;
            const p2HasName = name2.length > 0;

            const allChars = p1HasChar && p2HasChar;
            const allNames = p1HasName && p2HasName;

            // si todo está completo
            if (allChars && allNames) {
                this.turnText.setText('¡Listo para continuar!');
                return;
            }

            // si faltan NOMBRES (y ya están los personajes), especifica quién
            if (allChars && !allNames) {
                if (!p1HasName && !p2HasName) this.turnText.setText('Faltan los nombres de Jugador 1 y Jugador 2');
                else if (!p1HasName) this.turnText.setText('Falta el nombre de Jugador 1');
                else this.turnText.setText('Falta el nombre de Jugador 2');
                return;
            }

            // si faltan PERSONAJES (y ya están los nombres), especifica quién
            if (allNames && !allChars) {
                if (!p1HasChar && !p2HasChar) this.turnText.setText('Faltan los personajes de Jugador 1 y Jugador 2');
                else if (!p1HasChar) this.turnText.setText('Falta el personaje de Jugador 1');
                else this.turnText.setText('Falta el personaje de Jugador 2');
                return;
            }

            // si faltan cosas mixtas (nombres y personajes)
            if (this.currentTurn === null || this.currentTurn === undefined) {
                this.turnText.setText('Completa nombres y personajes');
                return;
            }

            this.turnText.setText(`TURNO: Jugador ${this.currentTurn + 1}`);
        }

        if (this.mode === 'online') {

            const p1HasChar = !!this.players?.[0]?.character;

            if (!p1HasChar) {
                this.turnText.setText('Ningún personaje seleccionado');
            } else {
                this.turnText.setText('Listo: el jugador tiene personaje');
            }
        }
    }
}

// Pantalla de Configuración
import Phaser from 'phaser';

export class Configuration_Scene extends Phaser.Scene {
    constructor() {
        super('Configuration_Scene');
    }

    preload() {
        // Imágenes
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');

        // Audio
        this.load.audio('sonidoGeneral', 'ASSETS/SONIDO/SONIDO1.mp3');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;

        // Fondo
        this.add.image(0, 0, 'fondo').setOrigin(0).setDepth(-1);

        // Título de la escena
        this.add.text(centerX, height * 0.1, 'Configuración', {
            fontSize: '32px',
            color: '#5f0000ff'
        }).setOrigin(0.5);

        // Subtítulo de controles
        this.add.text(centerX, height * 0.25, 'Volumen', {
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);

        // Volumen inicial guardado o 1
        this.currentVolume = parseFloat(localStorage.getItem('volume')) || 1;

        // Barra de volumen HTML
        this.volumeSlider = this.add.dom(centerX, height * 0.3).createFromHTML(`
            <input type="range" min="0" max="1" step="0.01" value="${this.currentVolume}"
                style="width:200px; height:20px; accent-color:#00aaff; border-radius:5px;">
        `);

        this.volumeSlider.addListener('input');
        this.volumeSlider.addListener('change');

        this.volumeSlider.on('input', (event) => {
            const volume = parseFloat(event.target.value);
            this.currentVolume = volume;
            this.sound.volume = volume; // Volumen global
            this.music.setVolume(volume); // Música de fondo
            localStorage.setItem('volume', volume); // Guardar entre escenas
        });

        // Música de fondo
        this.music = this.sound.add('sonidoGeneral', { loop: true, volume: this.currentVolume });
        this.music.play();

        // Botón Volver arriba a la izquierda
        const backX = width * 0.06;
        const backY = height * 0.08;

        const backButton = this.add.sprite(backX, backY, 'botonVolver')
            .setScale(1)
            .setInteractive({ useHandCursor: true });

        // Hover efecto
        backButton.on('pointerover', () => backButton.setScale(1.1));
        backButton.on('pointerout', () => backButton.setScale(1));

        // Acción al hacer click
        backButton.on('pointerdown', () => {
            this.scene.start('Menu_Scene');
        });


        //Controles
        this.add.text(centerX, height * 0.5, 'Controles', {
        fontSize: '24px',
        color: '#000',
        fontStyle: 'bold'
        }).setOrigin(0.5);
    }
}

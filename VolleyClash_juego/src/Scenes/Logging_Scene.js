//Pantalla de Logging
import Phaser from 'phaser';
import { createUIButton, createIconButton } from '../UI/Buttons.js';
import { flatMap } from 'lodash';

export class Logging_Scene extends Phaser.Scene {
    constructor() {
        super('Logging_Scene');
        this.isPlayerReady = false;
        this.apiUrl = '/api';
        this.isRegistering = false;
    }

    async init(data) {
        const savedName = sessionStorage.getItem('voley_username');
        const savedPass = sessionStorage.getItem('voley_password'); // Guarda la pass (o un token) para re-loguear

        if (savedName && savedPass) {
            console.log("Intentando auto-login para:", savedName);
            
            // En lugar de entrar directo, preguntamos al servidor para que nos asigne Host/Invitado
            try {
                const response = await fetch(`${this.apiUrl}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: savedName, password: savedPass })
                });
                const resData = await response.json();

                if (response.ok) {
                    this.registry.set('username', resData.username);
                    this.registry.set('isHost', resData.isHost);
                    this.scene.launch('ConnectionManager_Scene');
                    this.scene.start('Menu_Scene');
                }
            } catch (e) {
                console.error("Auto-login fallido");
            }
        }
    }

    preload() {
        // botones
        this.load.image('botonSimple', 'ASSETS/UI/BOTONES/BOTON_BASE_SINSELECCIONAR.png');
        this.load.image('botonSimpleSeleccionado', 'ASSETS/UI/BOTONES/BOTON_BASE.png');
        this.load.image('botonVolver', 'ASSETS/UI/BOTONES/FLECHA_VOLVER.png');

        // fondo
        this.load.image('fondo', 'ASSETS/FONDOS/FONDO_BASE.png');

        // sonido
        this.load.audio('sonidoClick', 'ASSETS/SONIDO/SonidoBoton.mp3');
        
        // marco
        this.load.image('marco','ASSETS/UI/MARCOS/VACIOS/MARCOS_ESCENARIO.png')
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const style = this.game.globals?.defaultTextStyle ?? { fontFamily: 'Arial' };

        // Fondo
        this.add.image(0, 0, 'fondo').setOrigin(0).setDisplaySize(width, height).setDepth(-1);

        // Titulo
        this.titleText = this.add.text(centerX, 60, 'INICIAR SESIÓN', {
            ...style, fontSize: '36px', color: '#000', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Marco
        const marco = this.add.image(centerX, height * 0.52, 'marco').setOrigin(0.5);
        marco.setDisplaySize(width * 0.4, height * 0.65);
        marco.texture.setFilter(Phaser.Textures.FilterMode.NEAREST); // Solo a esta instancia

        // INPUTS
        // Usuario
        this.add.text(centerX, height * 0.28, 'Usuario:', { ...style, fontSize: '20px', color: '#000' }).setOrigin(0.5);
        this.userInput = this.createHtmlInput(centerX, height * 0.35, 'Nombre de usuario', style);

        // Contraseña
        this.add.text(centerX, height * 0.45, 'Contraseña:', { ...style, fontSize: '20px', color: '#000' }).setOrigin(0.5);
        this.passInput = this.createHtmlInput(centerX, height * 0.52, '********', style, true);

        // --- BOTONES ---
        // Botón Principal
        this.mainBtn = createUIButton(this, {
            x: centerX - 80,
            y: height * 0.7,
            label: 'ENTRAR',
            onClick: () => this.handleSubmit(),
            scale: 2,
            textureNormal: 'botonSimple',
            textureHover: 'botonSimpleSeleccionado',
            textStyle: { ...style, fontSize: '14px', color: '#000' },
            clickSoundKey: 'sonidoClick'
        });

        // Boton de Borrado
        this.deleteBtn = createUIButton(this, {
            x: centerX + 80,
            y: height * 0.7,
            label: 'ELIMINAR CUENTA',
            onClick: () => this.handleDeleteUser(),
            scale: 2,
            textureNormal: 'botonSimple',
            textureHover: 'botonSimpleSeleccionado',
            textStyle: { ...style, fontSize: '14px', color: '#FF0000' },
            clickSoundKey: 'sonidoClick'
        });
        
        // Texto para alternar entre Login y Registro
        this.toggleText = this.add.text(centerX, height * 0.62, '¿Aún no tienes cuenta? Regístrate aquí', {
            ...style, fontSize: '16px', color: '#0000EE', fontStyle: 'italic'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.toggleText.on('pointerdown', () => this.toggleMode());
    }

    createHtmlInput(x, y, placeholder, style, isPassword = false) {
        const type = isPassword ? 'password' : 'text';
        const dom = this.add.dom(x, y).createFromHTML(`
            <input type="${type}" placeholder="${placeholder}" 
            style="width:180px; padding:8px; font-size:16px; font-family:${style.fontFamily}; 
            border-radius:12px; border: 6px solid #FFAA00; text-align:center; outline:none;" />
        `);

        const inputEl = dom.node.querySelector('input');
        
        inputEl.addEventListener('focus', () => this.input.keyboard.enabled = false);
        inputEl.addEventListener('blur', () => this.input.keyboard.enabled = true);
        
        return inputEl;
    }

    toggleMode() {
        this.isRegistering = !this.isRegistering;
        const { width } = this.scale;
        const centerX = width / 2;

        this.titleText.setText(this.isRegistering ? 'REGISTRARSE' : 'INICIAR SESIÓN');
        this.mainBtn.text.setText(this.isRegistering ? 'CREAR CUENTA' : 'ENTRAR');
        this.toggleText.setText(this.isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Aún no tienes cuenta? Regístrate aquí');

        if (this.isRegistering) {
            // MODO REGISTRO: Botón principal al centro y ocultamos borrar
            this.mainBtn.button.setX(centerX);
            this.mainBtn.text.setX(centerX);

            this.deleteBtn.button.setVisible(false);
            this.deleteBtn.text.setVisible(false);
        } else {
            // MODO LOGIN: Volvemos a la posición original
            this.mainBtn.button.setX(centerX - 80);
            this.mainBtn.text.setX(centerX - 80);
            
            this.deleteBtn.button.setVisible(true);
            this.deleteBtn.text.setVisible(true);
        }
    }

    async handleSubmit() {
        // Obtenemos los valores de los elementos HTML reales
        const usernameValue = this.userInput.value.trim();
        const passwordValue = this.passInput.value.trim();

        if (usernameValue.length < 3) {
            alert("Usuario demasiado corto");
            return;
        }

        if (passwordValue.length < 3) {
            alert("Contraseña demasiado corta");
            return;
        }

        const endpoint = this.isRegistering ? '/register' : '/login';

        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: usernameValue, 
                    password: passwordValue
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (this.isRegistering) {
                    // Si es registro, NO entramos al juego
                    alert("¡Registro completado con éxito! Ahora puedes iniciar sesión.");
                    this.toggleMode(); // Cambio a modo login automáticamente
                    this.userInput.value = "";
                    this.passInput.value = "";
                } else {
                    // Login: Guardamos datos en el registry
                    this.registry.set('username', usernameValue);
                    this.registry.set('userToken', data.token);
                    this.registry.set('isHost', data.isHost);

                    // Persistencia local para auto-login
                    sessionStorage.setItem('voley_session_token', data.token);
                    sessionStorage.setItem('voley_username', usernameValue);
                    sessionStorage.setItem('voley_password', passwordValue);

                    console.log(`Login correcto. Usuario: ${usernameValue} | Host: ${data.isHost}`);
                    this.scene.launch('ConnectionManager_Scene');
                    this.scene.start('Menu_Scene');
                }
            } else {
                alert(data.error || 'Error en la autenticación');
            }
        } catch (err) {
            console.error("Error conectando a la API:", err);
            alert("No se pudo conectar con el servidor.");
        }
    }

    async handleDeleteUser() {
        const username = this.userInput.value.trim();
        const password = this.passInput.value.trim();

        if (!username || !password) {
            alert("Introduce usuario y contraseña para eliminar");
            return;
        }

        if (!confirm(`¿Seguro que quieres eliminar "${username}"?`)) return;

        try {
            const response = await fetch(`${this.apiUrl}/users/${username}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();

            if (response.ok) {
                alert(`Usuario "${username}" eliminado`);
                this.userInput.value = "";
                this.passInput.value = "";
            } else {
                alert(data.error || 'Error eliminando el usuario');
            }
        } catch (err) {
            console.error("Error conectando a la API:", err);
            alert("No se pudo conectar con el servidor.");
        }
    }

}

// Pantalla de Desconexión
import Phaser from 'phaser';

export class NoConnection_Scene extends Phaser.Scene {
    constructor() { 
        super('NoConnection_Scene'); 
    }

    create() {
        const { width, height } = this.scale;

        // Fondo Oscuro
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);
        
        // Textos de estado
        this.add.text(width / 2, height / 2 - 20, 'CONEXIÓN PERDIDA', {
            fontSize: '40px', color: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 30, 'Intentando reconectar...', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5);

        // Comprobación continua cada 2 segundos
        this.time.addEvent({
            delay: 2000,
            callback: this.checkServer,
            callbackScope: this,
            loop: true
        });
    }

    async checkServer() {
        try {
            const res = await fetch('/status');
            if (res.ok) {
                console.log("Servidor recuperado. Intentando re-login automático...");

                const savedName = sessionStorage.getItem('voley_username');
                const savedPass = sessionStorage.getItem('voley_password');

                if (savedName && savedPass) {
                    const loginRes = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: savedName, password: savedPass })
                    });

                    if (loginRes.ok) {
                        const data = await loginRes.json();
                        this.registry.set('username', data.username);
                        this.registry.set('isHost', data.isHost);
                        console.log("Re-autenticación completada con éxito.");
                    }
                }

                // Si el servidor responde, cerramos este aviso y reanudamos
                const lastActive = this.registry.get('lastActiveScene');

                if (lastActive) {
                    const targetScene = this.scene.get(lastActive);

                    this.scene.resume(lastActive);

                    if (targetScene && targetScene.input) {
                        targetScene.input.enabled = true;
                        targetScene.input.resetPointers();
                    }
                }

                this.scene.stop();
            }
        } catch (e) {
            console.log("Servidor sigue inactivo...");
        }
    }
}

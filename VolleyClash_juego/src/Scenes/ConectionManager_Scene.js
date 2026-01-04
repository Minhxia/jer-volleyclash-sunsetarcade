// Manager de Conexión
import Phaser from 'phaser';

export class ConnectionManager_Scene extends Phaser.Scene {
    constructor() {
        super('ConnectionManager_Scene');
    }

    create() {
        this.startHeartbeat();
    }

    startHeartbeat() {
        this.time.addEvent({
            delay: 2000,
            callback: async () => {
                const username = this.registry.get('username');
                if (!username) return;

                try {
                    const res = await fetch(`/api/users/keepalive/${username}`);
                    
                    if (res.status === 401) { // Sesión expirada en server
                        this.handleReconnection(username);
                        return;
                    }

                    if (!res.ok) throw new Error("Offline");

                    const data = await res.json();

                    this.game.events.emit('update_online_count', data.count);
                } catch (err) {
                    this.handleServerDown();
                }
            },
            loop: true
        });
    }

    async handleReconnection(username) {
        const password = sessionStorage.getItem('voley_password');
        if (password) {
            await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
        }
    }

    handleServerDown() {
        if (!this.scene.isActive('NoConnection_Scene')) {
            const activeScenes = this.game.scene.getScenes(true);
            
            activeScenes.forEach(s => {
                if (s.scene.key !== 'ConnectionManager_Scene' && s.scene.key !== 'NoConnection_Scene') {
                    console.log("Pausando escena por caída de servidor:", s.scene.key);
                    this.registry.set('lastActiveScene', s.scene.key);
                    
                    s.scene.pause();
                    if (s.input) s.input.enabled = false;
                }
            });
            
            this.scene.launch('NoConnection_Scene');
        }
    }
}

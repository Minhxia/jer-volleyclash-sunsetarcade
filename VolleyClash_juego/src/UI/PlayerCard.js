// Tarjeta del jugador (marco, foto, nombre y ready)
export default class PlayerCardUI {
    constructor(scene, x, y, cfg = {}) {
        this.scene = scene;

        this.w = cfg.w ?? 320;
        this.h = cfg.h ?? 210;

        this.x = x;
        this.y = y;

        this.style = cfg.style ?? {};
        this.title = cfg.title ?? '';

        // { characterA:'portraitA', characterB:'portraitB'... }
        this.portraitKeys = cfg.portraitKeys ?? {};
        this.defaultPortraitKey = cfg.defaultPortraitKey ?? null;

        this.container = scene.add.container(x, y);

        // Fondo
        //this.bg = scene.add.rectangle(0, 0, cfg.w ?? 320, cfg.h ?? 210, 0xffffff, 0.35)
        //    .setStrokeStyle(2, 0x000000, 0.25);

        // Layout
        this.padding = 14;

        // Zona del retrato
        this.portraitBoxW = this.w * 0.42;  // ancho del hueco del retrato dentro de la tarjeta
        this.portraitBoxH = this.h * 0.82;  // alto del hueco del retrato

        this.portraitX = -this.w / 2 + this.padding + this.portraitBoxW / 2;
        this.portraitY = -6; // ajusta un pelín arriba/abajo si quieres

        // Zona de texto
        this.textBoxW = this.portraitX;
        // this.textBoxW = this.w - (this.portraitBoxW + this.padding * 3);
        //this.textBoxW = Math.max(120, this.textBoxW);

        // Ancho total del bloque (retrato + gap + texto)
        const gap = this.padding;
        const contentW = this.portraitBoxW + gap + this.textBoxW;
        const left = -contentW / 2;

        // Posiciones centradas
        this.portraitX = left + this.portraitBoxW / 2;
        this.textX = this.portraitX;

        this.portraitY = -6;

        // Retrato
        this.portrait = scene.add.image(this.portraitX, this.portraitY, this.defaultPortraitKey ?? 'portraitA')
            .setOrigin(0.5)
            .setVisible(false);

        this._fitToBox(this.portrait, this.portraitBoxW, this.portraitBoxH, 6);

        // Escala
        // this.portrait.setDisplaySize(120, 120);

        const nameY = this.portraitY + this.portraitBoxH / 2 + 12;
        // Nombre
        this.nameText = scene.add.text(this.textX, nameY, 'Esperando...', {
            ...this.style,
            fontSize: '18px',
            color: '#000',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Texto de ready
        this.readyText = scene.add.text(this.textX, 55, '❌', {
            ...this.style,
            fontSize: '18px',
            color: '#000',
        }).setOrigin(0.5);

        // Rol (HOST/JUGADOR)
        this.roleText = scene.add.text(this.textX, -55, this.title, {
            ...this.style,
            fontSize: '20px',
            color: '#333',
        }).setOrigin(0.5);

        this._layoutNameAndReady();
        this.container.add([/*this.bg,*/ this.roleText, this.portrait, this.nameText, this.readyText]);
    }

    // Devuelve la key del retrato según el personaje
    _portraitKeyFromCharacter(character) {
        if (!character) return this.defaultPortraitKey;
        return this.portraitKeys[character] ?? this.defaultPortraitKey;
    }

    // Ajusta la imagen al tamaño del recuadro
    _fitToBox(img, boxW, boxH, padding = 0, mode = 'contain') {
        if (!img?.texture) return;

        const maxW = Math.max(1, boxW - padding * 2);
        const maxH = Math.max(1, boxH - padding * 2);

        const tw = img.width;
        const th = img.height;

        // contain = encaja sin recortar, y cover = rellena recortando
        const scale = (mode === 'cover')
            ? Math.max(maxW / tw, maxH / th)
            : Math.min(maxW / tw, maxH / th);

        img.setScale(scale);

        if (mode === 'cover') {
            // recorta al centro para que "rellene"
            const cropW = maxW / scale;
            const cropH = maxH / scale;
            img.setCrop(
                (tw - cropW) / 2,
                (th - cropH) / 2,
                cropW,
                cropH
            );
        } else {
            img.setCrop(); // limpia crop
        }
    }

    // Configura la tarjeta con los datos del jugador
    setPlayer(player) {
        // p: { username, ready, character, isHost }
        if (!player) {
            this.setWaiting();
            return;
        }

        this.clearAlertStyle();

        const emoji = player.ready ? '✅' : '❌';
        const role = player.isHost ? 'Host' : 'Jugador';

        this.roleText.setText(this.title || (player.isHost ? 'Host' : 'Rival'));
        this.nameText.setText(player.username ?? 'Jugador');
        this.readyText.setText(emoji);
        this._layoutNameAndReady();

        // retrato
        const portraitKey = this.portraitKeys?.[player.character] ?? null;
        if (portraitKey) {
            this.portrait.setVisible(true);
            this.portrait.setTexture(portraitKey);

            this._fitToBox(this.portrait, this.portraitBoxW, this.portraitBoxH, 6, 'contain');
        }
        else {
            this.portrait.setVisible(false);
        }
    }

    // Configura la tarjeta en estado de esperando jugador
    setWaiting() {
        this.roleText.setText(this.title || '');
        this.nameText.setText('Esperando...');
        this.readyText.setText('❌');
        this.portrait.setVisible(false);
        this.clearAlertStyle();
        this._layoutNameAndReady();
    }

    // Muestra un mensaje de que el jugador ha salido
    showLeftMessage(username) {
        this.roleText.setText('RIVAL');
        this.nameText.setText(`¡${username} ha salido!`);
        this.readyText.setText('❌');

        this.nameText.setColor('#b00000');
        this.readyText.setColor('#b00000');

        this.portrait?.setVisible(false);
        this._layoutNameAndReady();
    }

    // Limpia el estilo de alerta
    clearAlertStyle() {
        this.nameText.setColor('#000');
        this.readyText.setColor('#000');
    }

    _layoutNameAndReady() {
        const gap = 6;
        const nameWidth = this.nameText.width;

        this.nameText.setX(this.textX);
        this.readyText.setOrigin(0, 0.5);
        this.readyText.setPadding(0, 0, 0, 1);
        this.readyText.setPosition(this.nameText.x + nameWidth / 2 + gap, this.nameText.y - 2);
    }

    // Destruye la UI
    destroy() {
        this.container?.destroy(true);
        this.container = null;
    }
}

// UI para elegir escenario en el lobby
export default class ScenarioPickerUI {
    // cfg: { centerX, frameY, frameW, frameH, style, scenarios, 
    //         defaultScenario, buttonTextures, onSelect }
    constructor(scene, cfg) {
        this.scene = scene;

        this.scenarios = cfg.scenarios ?? [];
        this.selectedScenario = cfg.defaultScenario ?? (this.scenarios[0] ?? 'Gym');

        this.style = cfg.style;
        this.buttonTextures = cfg.buttonTextures ?? {
            normal: 'botonSinSeleccionar',
            selected: 'botonSeleccionado',
        };

        this.onSelect = cfg.onSelect ?? (() => { });
        this.isHost = false;

        this.container = scene.add.container(0, 0);

        // Layout (lateral)
        this.previewX = cfg.previewX ?? cfg.centerX;
        this.previewY = cfg.previewY ?? cfg.frameY;
        this.previewW = cfg.previewW ?? cfg.frameW;
        this.previewH = cfg.previewH ?? cfg.frameH;

        this.buttonsX = cfg.buttonsX ?? (cfg.centerX ?? this.previewX);
        this.buttonsY = cfg.buttonsY ?? (this.previewY - 70);
        this.buttonsSpacingY = cfg.buttonsSpacingY ?? 90;
        this.buttonsScale = cfg.buttonsScale ?? 1.6;

        this.container = scene.add.container(0, 0);
        this.controls = scene.add.container(0, 0);

        // Preview
        this.preview = scene.add.image(this.previewX, this.previewY, this.selectedScenario).setOrigin(0.5);
        this.preview.setDisplaySize(this.previewW * 0.92, this.previewH * 0.92);

        this.infoText = scene.add.text(
            this.previewX,
            this.previewY + this.previewH / 2 + 22,
            `Escenario: ${this.selectedScenario}`,
            { ...this.style, fontSize: '22px', color: '#000' }
        ).setOrigin(0.5);

        this.onlyHostText = scene.add.text(
            this.buttonsX,
            this.buttonsY + this.buttonsSpacingY * this.scenarios.length + 10,
            'El host elige el escenario',
            { ...this.style, fontSize: '22px', color: '#444' }
        ).setOrigin(0.5);

        // Botones de selección (columna derecha)
        this.buttons = {};

        this.scenarios.forEach((name, i) => {
            const x = this.buttonsX;
            const y = this.buttonsY + i * this.buttonsSpacingY;

            const btn = scene.add.image(x, y, this.buttonTextures.normal)
                .setScale(this.buttonsScale)
                .setInteractive({ useHandCursor: true });

            const label = scene.add.text(x, y, name, {
                ...this.style,
                fontSize: '28px',
                color: '#000',
            }).setOrigin(0.5);

            // Hover
            btn.on('pointerover', () => {
                if (!this.isHost) return;
                btn.setTexture(this.buttonTextures.selected);
            });

            btn.on('pointerout', () => {
                if (!this.isHost) return;
                this._refreshButtons();
            });

            // Click
            btn.on('pointerup', (pointer) => {
                if (!this.isHost) return;
                const inside = btn.getBounds().contains(pointer.x, pointer.y);
                if (!inside) return;

                this.scene.sound?.play?.('sonidoClick');
                this.setScenario(name);
                this.onSelect(name);
            });

            this.buttons[name] = { btn, label };
            this.controls.add([btn, label]);
        });

        this.container.add([this.preview, this.infoText, this.controls, this.onlyHostText]);

        this._refreshButtons();
        this.setIsHost(false);
    }

    // Cambia el escenario seleccionado
    setScenario(name) {
        if (!name) return;
        this.selectedScenario = name;

        this.preview?.setTexture(name);
        this.infoText?.setText(`Escenario: ${name}`);

        this._refreshButtons();
    }

    // Define si el jugador es host o no
    setIsHost(isHost) {
        this.isHost = !!isHost;

        // host ve controles y el no-host ve texto informativo
        this.onlyHostText?.setVisible(!this.isHost);

        for (const { btn, label } of Object.values(this.buttons)) {
            if (this.isHost) {
                btn.setAlpha(1);
                // se re-habilita si estaba desactivado
                label.setAlpha(1);
                btn.setInteractive({ useHandCursor: true });
            } else {
                btn.disableInteractive();
                btn.setAlpha(0.6);
                label.setAlpha(0.6);
            }
        }

        this._refreshButtons();
    }

    // Actualiza el estado visual de los botones
    _refreshButtons() {
        for (const [name, { btn }] of Object.entries(this.buttons)) {
            const isSelected = (name === this.selectedScenario);
            btn.setTexture(isSelected ? this.buttonTextures.selected : this.buttonTextures.normal);
        }
    }

    // Destruye la UI
    destroy() {
        this.container?.destroy(true);
        this.container = null;
    }
}

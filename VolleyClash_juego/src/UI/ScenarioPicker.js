// UI para elegir escenario en el lobby
export default class ScenarioPickerUI {
    constructor(scene, cfg) {
        this.scene = scene;

        // cfg: { centerX, frameY, frameW, frameH, style, scenarios, 
        //         defaultScenario, buttonTextures, onSelect }
        this.centerX = cfg.centerX;
        this.frameY = cfg.frameY;
        this.frameW = cfg.frameW;
        this.frameH = cfg.frameH;
        this.style = cfg.style;
        this.scenarios = cfg.scenarios ?? [];
        this.selectedScenario = cfg.defaultScenario ?? (this.scenarios[0] ?? 'Gym');
        this.buttonTextures = cfg.buttonTextures ?? {
            normal: 'botonSinSeleccionar',
            selected: 'botonSeleccionado',
        };
        this.onSelect = cfg.onSelect ?? (() => { });
        this.isHost = false;
        this.container = scene.add.container(0, 0);

        // preview del escenario (encajada al marco)
        this.preview = scene.add.image(this.centerX, this.frameY, this.selectedScenario).setOrigin(0.5);
        this.preview.setDisplaySize(this.frameW * 0.92, this.frameH * 0.92);

        this.infoText = scene.add.text(
            this.centerX,
            this.frameY + this.frameH / 2 + 18,
            `Escenario: ${this.selectedScenario}`,
            { ...this.style, fontSize: '18px', color: '#000' }
        ).setOrigin(0.5);

        this.onlyHostText = scene.add.text(
            this.centerX,
            this.frameY + this.frameH / 2 + 40,
            `El host elige el escenario`,
            { ...this.style, fontSize: '16px', color: '#444' }
        ).setOrigin(0.5);

        // Controles del host
        this.controls = scene.add.container(0, 0);
        this.buttons = {};

        const btnY = scene.scale.height * 0.62;
        const btnSpacing = 170;
        const startX = this.centerX - btnSpacing;

        this.scenarios.forEach((name, i) => {
            const x = startX + i * btnSpacing;

            //// BOTÓN ////
            const btn = scene.add.image(x, btnY, this.buttonTextures.normal)
                .setScale(1.75);

            // texto
            const label = scene.add.text(x, btnY, name, {
                ...this.style,
                fontSize: '28px',
                color: '#000',
            }).setOrigin(0.5);

            // hover
            btn.on('pointerover', () => {
                if (!this.isHost) return;
                btn.setTexture(this.buttonTextures.selected);
            });

            btn.on('pointerout', () => {
                if (!this.isHost) return;
                this._refreshButtons();
            });

            // click (selecciona y avisa al lobby para mandar WS)
            btn.on('pointerup', (pointer) => {
                if (!this.isHost) return;
                const inside = btn.getBounds().contains(pointer.x, pointer.y);
                if (!inside) return;

                this.setScenario(name); // cambia UI local
                this.onSelect(name);    // el Lobby manda {type:'select_scenario', ...}
            });

            this.buttons[name] = { btn, label };
            this.controls.add([btn, label]);
        });

        this._refreshButtons();
        this.setIsHost(false);

        this.container.add([this.preview, this.infoText, this.onlyHostText, this.controls]);
    }

    // Cambia el escenario seleccionado
    setScenario(name) {
        if (!name) return;
        this.selectedScenario = name;

        if (this.preview) this.preview.setTexture(name);
        if (this.infoText) this.infoText.setText(`Escenario: ${name}`);

        this._refreshButtons();
    }

    // Define si el jugador es host o no
    setIsHost(isHost) {
        this.isHost = !!isHost;

        // host ve controles y el no-host ve texto informativo
        this.controls?.setVisible(this.isHost);
        this.onlyHostText?.setVisible(!this.isHost);

        // activar/desactivar interacciones
        for (const btn of Object.values(this.buttons)) {
            if (this.isHost) {
                btn.setInteractive({ useHandCursor: true });
            }
            else {
                btn.removeInteractive?.();
                if (!btn.removeInteractive) {
                    if (btn.input) btn.disableInteractive();
                }
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
    }
}

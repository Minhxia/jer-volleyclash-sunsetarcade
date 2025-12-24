import { playClick } from './Audio.js';

// Crea un botón base para la UI
export function createUIButton(scene, {
    x, y,
    label,
    onClick,
    textureNormal = 'botonSinSeleccionar',
    textureHover = 'botonSeleccionado',
    scale = 2,
    textStyle = {},
    clickSoundKey = 'sonidoClick',
}) {
    const button = scene.add.sprite(x, y, textureNormal)
        .setScale(scale)
        .setInteractive({ useHandCursor: true });

    const text = scene.add.text(x, y, label, textStyle).setOrigin(0.5);

    // eventos del botón
    const setNormal = () => button.setTexture(textureNormal);
    const setHover = () => button.setTexture(textureHover);

    button.on('pointerover', setHover);
    button.on('pointerout', setNormal);
    button.on('pointerdown', () => {
        setHover();
        playClick(scene, clickSoundKey);
    });
    // solo se lanza si se suelta encima
    button.on('pointerup', (pointer) => {
        const inside = button.getBounds().contains(pointer.x, pointer.y);
        if (!inside) { 
            setNormal(); 
            return; 
        }

        setHover();
        onClick?.();
    });

    return { button, text };
}

// Crea un botón base con un icono (como el de volver atrás)
export function createIconButton(scene, options) {
    const {
        x, y,
        texture,
        onClick,
        scale = 1,
        hoverScale = 1.1,
        clickSoundKey = 'sonidoClick',
    } = options;

    const button = scene.add
        .sprite(x, y, texture)
        .setScale(scale)
        .setInteractive({ useHandCursor: true });

    // eventos del botón
    button.on('pointerover', () => button.setScale(scale * hoverScale));
    button.on('pointerout', () => button.setScale(scale));
    button.on('pointerdown', () => {
        playClick(scene, clickSoundKey);
    });
    // solo se lanza si se suelta encima
    button.on('pointerup', (pointer) => {
        const inside = button.getBounds().contains(pointer.x, pointer.y);
        if (!inside) return;
        onClick();
    });

    return button;
}

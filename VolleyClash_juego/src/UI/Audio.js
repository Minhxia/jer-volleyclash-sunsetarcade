import Phaser from 'phaser';

// Obtiene el volumen y permite ponerlo a 0, evitando NaN 
export function getStoredVolume(defaultValue = 1) {
    const raw = localStorage.getItem('volume');
    const v = Number.parseFloat(raw ?? String(defaultValue));

    if (!Number.isFinite(v)) return defaultValue;

    return Phaser.Math.Clamp(v, 0, 1);
}

// Guarda el volumen
export function setStoredVolume(volume) {
    const v = Phaser.Math.Clamp(Number(volume), 0, 1);
    localStorage.setItem('volume', String(v));

    return v;
}

// Aplica el volumen al SoundManager y a la música global
export function applyStoredVolume(scene, volume = getStoredVolume()) {
    scene.sound.volume = volume;

    const music = scene.game.globals.music;
    if (music && 'setVolume' in music) {
        music.setVolume(volume);
    }
}

// Reproduce un sonido de click
export function playClick(scene, key = 'sonidoClick') {
    scene.sound.play(key, { volume: getStoredVolume() });
}

// Reproduce la música de fondo en bucle
export function ensureLoopingMusic(scene, soundKey, { loop = true } = {}) {
    const volume = getStoredVolume();

    let music = scene.game.globals.music;
    if (!music) {
        music = scene.sound.add(soundKey, { loop, volume });
        scene.game.globals.music = music;
    }

    // se actualiza volumen si el tipo lo soporta
    if (music && 'setVolume' in music) music.setVolume(volume);

    const tryPlay = () => {
        if (!music || !('play' in music)) return;

        // no se reinicia si ya está sonando
        if ('isPlaying' in music && music.isPlaying) return;

        try {
            music.play();
        } catch (err) {
            console.warn('[Audio.js] No se ha podido reproducir todavía la música.', err);
        }
    };

    // primero se intenta reproducir nada más cargar
    tryPlay();

    // sino, se reintenta tras la primera interacción/click
    scene.input.once('pointerdown', async () => {
        const ctx = scene.sound.context;
        if (ctx && ctx.state === 'suspended') {
            try {
                await ctx.resume();
            } catch { }
        }
        tryPlay();
    });

    return music;
}


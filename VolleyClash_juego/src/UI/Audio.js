import Phaser from 'phaser';

const SFX_VOLUME_KEY = 'sfxVolume';
const MUSIC_VOLUME_KEY = 'musicVolume';
const GLOBAL_VOLUME_KEY = 'globalVolume';
const LEGACY_VOLUME_KEY = 'volume';

function parseStoredVolume(raw, defaultValue) {
    const v = Number.parseFloat(raw ?? String(defaultValue));

    if (!Number.isFinite(v)) return defaultValue;

    return Phaser.Math.Clamp(v, 0, 1);
}

//// Getters&Setters ////
// Obtiene el volumen almacenado con una clave
function getStoredVolumeByKey(key, fallbackKey, defaultValue = 1) {
    const raw = localStorage.getItem(key);
    if (raw !== null) return parseStoredVolume(raw, defaultValue);

    const fallbackRaw = fallbackKey ? localStorage.getItem(fallbackKey) : null;
    if (fallbackRaw !== null) return parseStoredVolume(fallbackRaw, defaultValue);

    return Phaser.Math.Clamp(defaultValue, 0, 1);
}

function getLegacyVolume(defaultValue = 1) {
    const raw = localStorage.getItem(LEGACY_VOLUME_KEY);
    if (raw === null) return null;

    return parseStoredVolume(raw, defaultValue);
}

// Asegura que existan los valores de volumen almacenados
export function ensureStoredAudioSettings(defaultValue = 1) {
    const hasSfx = localStorage.getItem(SFX_VOLUME_KEY) !== null;
    const hasMusic = localStorage.getItem(MUSIC_VOLUME_KEY) !== null;

    if (hasSfx && hasMusic) return;

    const legacyVolume = getLegacyVolume(defaultValue);
    const initialVolume = legacyVolume && legacyVolume > 0 ? legacyVolume : defaultValue;

    if (!hasSfx) localStorage.setItem(SFX_VOLUME_KEY, String(initialVolume));
    if (!hasMusic) localStorage.setItem(MUSIC_VOLUME_KEY, String(initialVolume));
}

// Obtiene el volumen almacenado para los efectos de sonido
export function getStoredSfxVolume(defaultValue = 1) {
    return getStoredVolumeByKey(SFX_VOLUME_KEY, LEGACY_VOLUME_KEY, defaultValue);
}

// Obtiene el volumen almacenado para la música
export function getStoredMusicVolume(defaultValue = 1) {
    return getStoredVolumeByKey(MUSIC_VOLUME_KEY, LEGACY_VOLUME_KEY, defaultValue);
}

// Obtiene el volumen global
export function getStoredGlobalVolume(defaultValue = 1) {
    return getStoredVolumeByKey(GLOBAL_VOLUME_KEY, null, defaultValue);
}

// Almacena el volumen global
export function setStoredGlobalVolume(volume) {
    const v = Phaser.Math.Clamp(Number(volume), 0, 1);
    localStorage.setItem(GLOBAL_VOLUME_KEY, String(v));
    return v;
}

// Almacena el volumen para los efectos de sonido
export function setStoredSfxVolume(volume) {
    const v = Phaser.Math.Clamp(Number(volume), 0, 1);
    localStorage.setItem(SFX_VOLUME_KEY, String(v));

    return v;
}

// Almacena el volumen para la música
export function setStoredMusicVolume(volume) {
    const v = Phaser.Math.Clamp(Number(volume), 0, 1);
    localStorage.setItem(MUSIC_VOLUME_KEY, String(v));

    return v;
}
/////////

// Aplica el volumen al SoundManager y a la música global
export function applyStoredVolume(scene, options = {}) {
    let globalVol = getStoredGlobalVolume();
    let sfxVolume = getStoredSfxVolume();
    let musicVolume = getStoredMusicVolume();

    if (typeof options === 'number') {
        sfxVolume = Phaser.Math.Clamp(Number(options), 0, 1);
        musicVolume = sfxVolume;
    } else {
        sfxVolume = options.sfxVolume ?? sfxVolume;
        musicVolume = options.musicVolume ?? musicVolume;
    }

    // se usa el volumen global como master
    scene.sound.volume = globalVol;

    const music = scene.game.globals.music;
    if (music && 'setVolume' in music) {
        music.setVolume(musicVolume);
    }
}

// Reproduce un sonido de click
export function playClick(scene, key = 'sonidoClick') {
    scene.sound.play(key, { volume: getStoredSfxVolume() });
}

// Reproduce la música de fondo en bucle
export function ensureLoopingMusic(scene, soundKey, { loop = true } = {}) {
    const volume = getStoredMusicVolume();
    let music = scene.game.globals.music;
    if (!music) {
        music = scene.sound.add(soundKey, { loop, volume });
        scene.game.globals.music = music;
    }

    // se actualiza volumen si el tipo lo soporta
    if (music && 'setVolume' in music) music.setVolume(volume);

    const tryPlay = () => {
        if (!music || !('play' in music)) return;

        // no se reinicia si ya est? sonando
        if ('isPlaying' in music && music.isPlaying) return;

        try {
            music.play();
        } catch (err) {
            console.warn('[Audio.js] No se ha podido reproducir todav?a la m?sica.', err);
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

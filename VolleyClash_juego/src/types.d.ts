import 'phaser';

declare module 'phaser' {
    interface Game {
        globals: {
            defaultTextStyle: Phaser.Types.GameObjects.Text.TextStyle;
            music: Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | null;
        }
    }
}

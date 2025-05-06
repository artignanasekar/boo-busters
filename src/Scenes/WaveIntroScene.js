class WaveIntroScene extends Phaser.Scene {
    constructor() {
        super("waveIntroScene");
    }

    preload() {
        this.load.image("waveTitle", "assets/wavegame.png");
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
    
        let waveImage = this.add.image(centerX, centerY, "waveTitle").setOrigin(0.5);
    
        // Resize to fit canvas width while preserving aspect ratio
        const targetWidth = this.cameras.main.width;
        const scaleFactor = targetWidth / waveImage.width;
        waveImage.setScale(scaleFactor);
    
        this.time.delayedCall(3000, () => {
            this.scene.start("wave2Scene");
        });
    }
    
}

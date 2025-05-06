class BossIntroScene extends Phaser.Scene {
    constructor() {
        super("bossIntroScene");
    }

    preload() {
        this.load.image("bossTitle", "assets/bossgame.png"); // your 3s splash PNG
    }

    create() {
        const bg = this.add.image(0, 0, "bossTitle").setOrigin(0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.time.delayedCall(3000, () => {
            this.scene.start("bossScene");
        });
    }
}

class EndGameScene extends Phaser.Scene {
    constructor() {
        super("endGameScene");
    }

    init(data) {
        this.isVictory = data.isVictory;
        this.score = data.score || 0;
    }

    preload() {
        this.load.image("endgame", "assets/endgame.png");
        this.load.image("endgameloss", "assets/endgameloss.png");
        this.load.image("playButton", "assets/button_rectangle_depth_line.png");
    }

    create() {
        const endImageKey = this.isVictory ? "endgame" : "endgameloss";
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, endImageKey)
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Button setup
        const buttonX = this.cameras.main.width / 2 + 140;
        const buttonY = this.cameras.main.height - 130;

        const playButton = this.add.image(buttonX, buttonY, "playButton")
            .setInteractive()
            .setScale(1.5);

        const playText = this.add.text(buttonX, buttonY, "restart game!", {
            font: "28px Arial",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        playButton.on("pointerdown", () => {
            this.scene.start("titleScene");
        });

        // Bottom label (optional)
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 30, "End Game", {
            font: "18px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);
    }
}

class TitleScene extends Phaser.Scene {
    constructor() {
        super("titleScene");
        console.log("TitleScene constructor called");
    }

    preload() {
        console.log("TitleScene preload started");
        
        // Add more detailed error handling
        this.load.on('loaderror', function(file) {
            console.error('Error loading asset:', file.src);
            alert('Failed to load: ' + file.src);
        });
        
        try {
            this.load.image("title", "assets/titlegame.png");
            this.load.image("playButton", "assets/button_rectangle_depth_line.png");
            console.log("TitleScene preload complete");
        } catch (error) {
            console.error("Error in TitleScene preload:", error);
        }
    }

    create() {
        console.log("TitleScene create started");
        try {
            // Add a plain background color in case the image doesn't load
            this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0000ff)
                .setOrigin(0);
            
            // Add text as a fallback
            this.add.text(this.cameras.main.width / 2, 100, "MONSTER SHOOTER", {
                font: "40px Arial",
                fill: "#ffffff"
            }).setOrigin(0.5);
            
            // Now try to add the actual image
            this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "title")
                .setOrigin(0.5)
                .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

            // Create a simple button even if the image fails
            let buttonX = this.cameras.main.width / 2 + 140; // move 50px right
            let buttonY = this.cameras.main.height - 130;
            
            // Fallback button with rectangle
            let buttonBg = this.add.rectangle(buttonX, buttonY, 200, 50, 0x00ff00);
            
            // Updated button text to say "PLAY" instead of "PLAY GAME"
            let buttonText = this.add.text(buttonX, buttonY, "play game!", {
                font: "28px Arial",
                fill: "#000000"
            }).setOrigin(0.5);
            
            // Group them together
            let buttonGroup = this.add.container(0, 0, [buttonBg, buttonText]);
            buttonBg.setInteractive();
            
            // Now try to add the actual button image
            let playButton = this.add.image(buttonX, buttonY, "playButton")
                .setInteractive()
                .setScale(1.5);
                
            // Add "Play" text on top of the button image
            let playText = this.add.text(buttonX, buttonY, "play game!", {
                font: "28px Arial",
                fill: "#ffffff",
                stroke: "#000000",
                strokeThickness: 4
            }).setOrigin(0.5);

            // Add click handlers to both
            buttonBg.on("pointerdown", () => this.startGame());
            playButton.on("pointerdown", () => this.startGame());
            
            console.log("TitleScene create complete");
        } catch (error) {
            console.error("Error in TitleScene create:", error);
            alert("Error creating title screen: " + error.message);
        }
    }
    
    startGame() {
        console.log("Starting game - transitioning to monsterScene");
        this.scene.start("monsterScene");
    }
}
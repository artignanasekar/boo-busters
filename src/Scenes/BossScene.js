class BossScene extends Phaser.Scene {
    constructor() {
        super("bossScene");
        this.my = { sprite: {} };
        this.bodyX = 200;
        this.bodyY = 250;
    }

    preload() {
        this.load.atlasXML("alien", "assets/spritesheet_spaceships.png", "assets/spritesheet_spaceships.xml");
        this.load.image("bossghost", "assets/bossghost.png");
        this.load.atlasXML("lasers", "assets/spritesheet_lasers.png", "assets/spritesheet_lasers.xml");
        this.load.image("heart", "assets/tile_0044.png");
        this.load.image("playButton", "assets/button_rectangle_depth_line.png");
        this.load.audio("playerShoot", "assets/laserSmall_000.ogg");
        this.load.audio("enemyShoot", "assets/laserRetro_000.ogg");

    }

    create() {
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x001122).setOrigin(0);

        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.game.config.width);
            const y = Phaser.Math.Between(0, this.game.config.height);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);
            this.add.circle(x, y, size, 0xffffff, alpha);
        }

        let my = this.my;
        my.sprite.alien = this.physics.add.sprite(this.bodyX, this.bodyY, "alien", "shipPink_manned.png");
        my.sprite.alien.setCollideWorldBounds(true);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.lastFired = 0;
        this.fireRate = 300;

        this.playerShootSound = this.sound.add("playerShoot");
        this.enemyShootSound = this.sound.add("enemyShoot");

        this.bullets = this.physics.add.group();
        this.bossBullets = this.physics.add.group();

        this.boss = this.physics.add.sprite(this.game.config.width - 200, this.game.config.height / 2, "bossghost");
        this.boss.setScale(0.5);
        this.boss.setCollideWorldBounds(true);
        this.boss.body.setAllowGravity(false);
        this.boss.lastFired = 0;
        this.boss.fireRate = 800;
        this.boss.health = 10;

        this.bossSpeed = 3;
        this.bossDirection = 1;
        this.bossChangeDirectionTime = 0;
        this.bossChangeDirectionRate = 2000;

        this.bossHearts = [];
        for (let i = 0; i < this.boss.health; i++) {
            let heart = this.add.image(this.game.config.width / 2 - 150 + (i * 30), 30, "heart")
                .setScale(1.5)
                .setScrollFactor(0)
                .setDepth(1.5)
                .setTint(0xff0000);
            this.bossHearts.push(heart);
        }

        this.health = 3;
        this.hearts = [];
        for (let i = 0; i < this.health; i++) {
            let heart = this.add.image(this.game.config.width - (i * 50 + 30), 30, "heart")
                .setScale(2.5)
                .setScrollFactor(0)
                .setDepth(1.5);
            this.hearts.push(heart);
        }

        this.physics.add.overlap(this.bullets, this.boss, this.handleBulletHit, null, this);
        this.physics.add.overlap(this.bossBullets, my.sprite.alien, this.handlePlayerHit, null, this);

        this.score = 0;
        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "20px",
            fill: "#ffffff"
        });

        this.add.text(this.game.config.width / 2, 80, "BOSS GHOST", {
            fontSize: "32px",
            fill: "#ff0000",
            fontStyle: "bold"
        }).setOrigin(0.5);
    }

    fireBullet(x, y) {
        let bullet = this.bullets.create(x + 50, y, "lasers", "laserPink_burst.png");
        bullet.setScale(0.2);
        bullet.setVelocityX(600);
        bullet.body.setAllowGravity(false);
    
        if (this.playerShootSound) this.playerShootSound.play();
    }
    

    fireBossBullet() {
        let angle = Math.PI + Phaser.Math.FloatBetween(-0.5, 0.5);
        let speed = 400;
        let bullet = this.bossBullets.create(this.boss.x - 50, this.boss.y, "lasers", "laserBlue_burst.png");
        bullet.setScale(0.3);
        bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        bullet.body.setAllowGravity(false);
    
        if (this.enemyShootSound) this.enemyShootSound.play();
    }
    
    handleBulletHit(boss, bullet) {
        if (bullet && bullet.active) bullet.destroy();

        this.boss.health--;
        if (this.bossHearts[this.boss.health]) this.bossHearts[this.boss.health].setVisible(false);

        this.tweens.add({
            targets: boss,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3
        });

        this.score += 20;
        this.scoreText.setText("Score: " + this.score);

        if (this.boss.health <= 0) {
            this.endGame(true);
        }
    }

    handlePlayerHit(player, bullet) {
        if (bullet && bullet.active) bullet.destroy();

        this.health--;
        if (this.hearts[this.health]) this.hearts[this.health].setVisible(false);

        if (this.health <= 0) {
            this.endGame(false);
        } else {
            this.tweens.add({
                targets: player,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 3
            });
        }
    }

    endGame(isVictory) {
        this.scene.start("endGameScene", { isVictory: isVictory, score: this.score });
    }

    update(time, delta) {
        if (this.boss.health <= 0 || this.health <= 0) return;

        let my = this.my;
        if (this.wKey.isDown) my.sprite.alien.y -= 5;
        if (this.sKey.isDown) my.sprite.alien.y += 5;
        if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
            this.fireBullet(my.sprite.alien.x, my.sprite.alien.y);
            this.lastFired = time;
        }

        this.bullets.getChildren().forEach(b => {
            if (b.active && b.x > this.cameras.main.width) b.destroy();
        });

        this.bossBullets.getChildren().forEach(b => {
            if (b.active && (b.x < 0 || b.x > this.game.config.width || b.y < 0 || b.y > this.game.config.height)) {
                b.destroy();
            }
        });

        if (time > this.bossChangeDirectionTime + this.bossChangeDirectionRate) {
            this.bossDirection = Phaser.Math.Between(0, 1) ? 1 : -1;
            this.bossChangeDirectionTime = time;
        }

        this.boss.y += this.bossSpeed * this.bossDirection;

        if (time > this.boss.lastFired + this.boss.fireRate) {
            this.fireBossBullet();
            this.boss.lastFired = time;

            if (Phaser.Math.Between(0, 2) === 0) {
                this.time.delayedCall(200, () => {
                    if (this.boss.active) this.fireBossBullet();
                });
            }
        }

        const playerY = this.my.sprite.alien.y;
        const bossCrossed = this.boss.active && this.boss.x < this.my.sprite.alien.x && this.boss.y >= playerY;

        if (bossCrossed) {
            this.endGame(false);
        }
    }
}

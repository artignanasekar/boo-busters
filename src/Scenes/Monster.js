class Monster extends Phaser.Scene {
    constructor() {
        super("monsterScene");
        this.my = { sprite: {} };
        this.bodyX = 200;
        this.bodyY = 250;
    }

    preload() {
        this.load.atlasXML("alien", "assets/spritesheet_spaceships.png", "assets/spritesheet_spaceships.xml");
        this.load.atlasXML("ghosts", "assets/enemies.png", "assets/enemies.xml");
        this.load.atlasXML("lasers", "assets/spritesheet_lasers.png", "assets/spritesheet_lasers.xml");
        this.load.image("heart", "assets/tile_0044.png"); 
        this.load.audio("playerShoot", "assets/laserSmall_000.ogg");
        this.load.audio("enemyShoot", "assets/laserRetro_000.ogg");

        

        if (document.getElementById('description')) {
            document.getElementById('description').innerHTML = 
                '<h2>Monster.js<br>W - move up // S - move down<br>SPACE - fire bullets</h2>';
        }
    }

    create() {
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000033).setOrigin(0);

        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.game.config.width);
            const y = Phaser.Math.Between(0, this.game.config.height);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);
            this.add.circle(x, y, size, 0xffffff, alpha);
        }

        let my = this.my;
        my.sprite.alien = this.physics.add.sprite(this.bodyX, this.bodyY, "alien", "shipPink_manned.png");

        this.bullets = this.physics.add.group();
        this.lastFired = 0;
        this.fireRate = 300;

        this.enemyBullets = this.physics.add.group();

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.playerShootSound = this.sound.add("playerShoot");
        this.enemyShootSound = this.sound.add("enemyShoot");

        this.ghosts = this.physics.add.group();
        this.bigGhosts = this.physics.add.group();
        this.ghostTimer = 0;
        this.ghostSpawnRate = 1500;

        this.physics.add.overlap(this.bullets, this.ghosts, this.handleBulletGhostCollision, null, this);
        this.physics.add.overlap(this.bullets, this.bigGhosts, this.handleBulletGhostCollision, null, this);
        this.physics.add.overlap(this.enemyBullets, my.sprite.alien, this.handlePlayerHit, null, this);

        // === SCORE ===
        this.score = 0;
        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "20px",
            fill: "#ffffff"
        });

        // === HEALTH ===
        this.health = 3;
        this.hearts = [];
        for (let i = 0; i < this.health; i++) {
            let heart = this.add.image(this.game.config.width - (i * 50 + 30), 30, "heart")
                .setScale(2.5)
                .setScrollFactor(0)
                .setDepth(1.5);
            this.hearts.push(heart);
        }
        
    }

    spawnGhost() {
        let startY = Phaser.Math.Between(50, this.game.config.height - 50);
        let ghost = this.ghosts.create(this.game.config.width + 50, startY, "ghosts", "ghost_normal.png");
        ghost.setVelocityX(-100);
        ghost.setScale(0.5);
        ghost.waveOffset = Math.random() * 1000;
    }

    spawnBigGhost() {
        let startY = Phaser.Math.Between(100, this.game.config.height - 100);
        let ghost = this.bigGhosts.create(this.game.config.width + 100, startY, "ghosts", "ghost.png");

        ghost.setScale(1.5);
        ghost.setVelocityX(-200);
        ghost.setBounce(1);
        ghost.setCollideWorldBounds(true);
        ghost.setVelocityY(Phaser.Math.Between(-100, 100));
        ghost.lastFired = 0;
        ghost.fireRate = Phaser.Math.Between(800, 2000);
    }

    fireBullet(x, y) {
        let bullet = this.bullets.create(x + 50, y, "lasers", "laserPink_burst.png");
        bullet.setScale(0.2);
        bullet.setVelocityX(600);
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.body.setAllowGravity(false);
        if (this.playerShootSound) this.playerShootSound.play();
    }

    fireEnemyBullet(ghost) {
        let bullet = this.enemyBullets.create(ghost.x - 50, ghost.y, "lasers", "laserBlue_burst.png");
        bullet.setScale(0.2);
        bullet.setVelocityX(-400);
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.body.setAllowGravity(false);
        if (this.enemyShootSound) this.enemyShootSound.play();
    }

    handleBulletGhostCollision(bullet, ghost) {
        if (bullet && bullet.active) bullet.destroy();
        if (ghost && ghost.active) ghost.destroy();

        this.score += 10;
        this.scoreText.setText("Score: " + this.score);
    }

    handlePlayerHit(player, bullet) {
        if (bullet && bullet.active) bullet.destroy();

        this.health -= 1;
        if (this.hearts[this.health]) this.hearts[this.health].setVisible(false);

        if (this.health <= 0) {
            this.scene.restart();
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

    update(time, delta) {
        let my = this.my;
    
        if (this.wKey.isDown) my.sprite.alien.y -= 5;
        if (this.sKey.isDown) my.sprite.alien.y += 5;
    
        if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
            this.fireBullet(my.sprite.alien.x, my.sprite.alien.y);
            this.lastFired = time;
        }
    
        this.bullets.getChildren().forEach((b) => {
            if (b.active && b.x > this.cameras.main.width) b.destroy();
        });
    
        this.enemyBullets.getChildren().forEach((b) => {
            if (b.active && b.x < 0) b.destroy();
        });
    
        if (time > this.ghostTimer + this.ghostSpawnRate) {
            this.spawnGhost();
            if (Math.random() < 0.3) this.spawnBigGhost();
            this.ghostTimer = time;
        }
    
        this.ghosts.getChildren().forEach((g) => {
            g.y += Math.sin((time + g.waveOffset) * 0.005) * 0.7;
        });
    
        this.bigGhosts.getChildren().forEach((g) => {
            if (g.active && g.x <= this.game.config.width && g.x >= 0) {
                if (time > g.lastFired + g.fireRate) {
                    this.fireEnemyBullet(g);
                    g.lastFired = time;
                }
            }
        });
    
        const playerY = my.sprite.alien.y;
        let ghostCrossed = this.ghosts.getChildren().some(g => g.active && g.x < my.sprite.alien.x && g.y >= playerY);
        let bigGhostCrossed = this.bigGhosts.getChildren().some(g => g.active && g.x < my.sprite.alien.x && g.y >= playerY);
    
        if (ghostCrossed || bigGhostCrossed) {
            this.scene.restart();
            return;
        }
    
        if (this.score >= 100) {
            this.scene.start("waveIntroScene");
        }
    }
}

window.onload = function() {
    if (typeof Phaser === 'undefined') {
        console.error('Phaser is not loaded!');
        alert('Phaser not found!');
        return;
    }

    const config = {
        type: Phaser.AUTO,
        width: 1500,
        height: 900,
        parent: 'phaser-game',
        backgroundColor: '#000033',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [TitleScene, Monster, WaveIntroScene, Wave2, BossIntroScene, BossScene, EndGameScene] // Direct references; no import needed
    };

    const game = new Phaser.Game(config);
    window.game = game;
};

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    highScoreText: Phaser.GameObjects.Text;
    restartText: Phaser.GameObjects.Text;
    finalScore: number = 0;
    highScore: number = 0;

    constructor ()
    {
        super('GameOver');
    }

    init (data: { score?: number })
    {
        this.finalScore = data.score || 0;
        this.highScore = parseInt(localStorage.getItem('flappyBird-highScore') || '0', 10);
        
        if (this.finalScore > this.highScore)
        {
            this.highScore = this.finalScore;
            localStorage.setItem('flappyBird-highScore', this.highScore.toString());
        }
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.2);

        this.gameOverText = this.add.text(512, 200, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ff0000',
            stroke: '#ffffff', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.scoreText = this.add.text(512, 300, `Score: ${this.finalScore}`, {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.highScoreText = this.add.text(512, 380, `High Score: ${this.highScore}`, {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.restartText = this.add.text(512, 480, 'Press SPACE to Restart', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#00ff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.input.keyboard?.on('keydown-SPACE', this.changeScene, this);
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}

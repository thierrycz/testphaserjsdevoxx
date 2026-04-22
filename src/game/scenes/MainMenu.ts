import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    playButton: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.3);

        this.title = this.add.text(512, 300, 'Flappy Bird', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.playButton = this.add.text(512, 450, 'Press SPACE to Play', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.input.keyboard?.on('keydown-SPACE', this.changeScene, this);

        EventBus.emit('current-scene-ready', this);
    }
    
    changeScene ()
    {
        this.scene.start('Game');
    }
}

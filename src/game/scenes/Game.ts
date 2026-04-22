import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

interface Pipe {
    top: any;
    bottom: any;
}

export class Game extends Scene
{
    camera: any;
    bird: any;
    pipes: Pipe[] = [];
    pipeGenerator: any;
    score: number = 0;
    gameOver: boolean = false;
    paused: boolean = false;
    lastPassedPipeIndex: number = -1;
    gameWidth: number = 1024;
    gameHeight: number = 768;
    
    BIRD_START_X: number = 150;
    BIRD_START_Y: number = 384;
    BIRD_GRAVITY: number = 600;
    BIRD_FLAP_VELOCITY: number = -300;
    PIPE_GAP: number = 200;
    PIPE_MIN_TOP_Y: number = 100;
    INITIAL_PIPE_SPEED: number = -250;
    INITIAL_SPAWN_INTERVAL: number = 2000;
    CURRENT_PIPE_SPEED: number = -250;
    CURRENT_SPAWN_INTERVAL: number = 2000;
    CURRENT_PIPE_GAP: number = 200;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x87ceeb);

        try
        {
            this.bird = this.add.sprite(this.BIRD_START_X, this.BIRD_START_Y, 'bird');
            this.physics.add.existing(this.bird);
            this.bird.body.setGravityY(this.BIRD_GRAVITY);
        }
        catch (e)
        {
            console.error('Error creating bird:', e);
            this.scene.start('MainMenu');
            return;
        }

        this.input.keyboard?.on('keydown-SPACE', this.flap, this);

        this.pipeGenerator = this.time.addEvent({
            delay: this.CURRENT_SPAWN_INTERVAL,
            callback: this.generatePipe,
            callbackScope: this,
            loop: true
        });

        EventBus.on('pause-game', this.pauseGame, this);
        EventBus.on('resume-game', this.resumeGame, this);

        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.lastPassedPipeIndex = -1;

        EventBus.emit('current-scene-ready', this);
    }

    private updateDifficulty ()
    {
        const difficultyLevel = Math.floor(this.score / 5);
        
        if (difficultyLevel > 0)
        {
            this.CURRENT_PIPE_SPEED = Math.max(-400, this.INITIAL_PIPE_SPEED - (difficultyLevel * 20));
            this.CURRENT_SPAWN_INTERVAL = Math.max(1200, this.INITIAL_SPAWN_INTERVAL - (difficultyLevel * 100));
            this.CURRENT_PIPE_GAP = Math.max(150, this.PIPE_GAP - (difficultyLevel * 10));
        }
    }

    update ()
    {
        if (this.gameOver || this.paused || !this.bird)
        {
            return;
        }

        if (this.bird.y > this.gameHeight || this.bird.y < 0)
        {
            this.endGame();
            return;
        }

        this.pipes.forEach((pipe, index) =>
        {
            if (this.physics.overlap(this.bird, pipe.top) || this.physics.overlap(this.bird, pipe.bottom))
            {
                this.endGame();
            }

            if (!this.gameOver && pipe.top.x + 50 < this.bird.x && index > this.lastPassedPipeIndex)
            {
                this.lastPassedPipeIndex = index;
                this.score++;
                EventBus.emit('score-updated', this.score);
                this.playSound('score');
                this.updateDifficulty();
            }

            if (pipe.top.x < -100)
            {
                pipe.top.destroy();
                pipe.bottom.destroy();
                this.pipes.splice(index, 1);
            }
        });
    }

    flap ()
    {
        if (!this.gameOver && !this.paused && this.bird)
        {
            this.bird.body.setVelocityY(this.BIRD_FLAP_VELOCITY);
            this.playSound('flap');
        }
    }

    generatePipe ()
    {
        const randomGap = Math.floor(Math.random() * (this.gameHeight - this.CURRENT_PIPE_GAP - this.PIPE_MIN_TOP_Y - this.PIPE_MIN_TOP_Y + 1)) + this.PIPE_MIN_TOP_Y;
        
        const topPipe = this.add.sprite(this.gameWidth + 50, randomGap, 'pipe-top');
        this.physics.add.existing(topPipe);
        topPipe.body.setVelocityX(this.CURRENT_PIPE_SPEED);
        topPipe.body.setAllowGravity(false);
        topPipe.setOrigin(0, 1);

        const bottomPipe = this.add.sprite(this.gameWidth + 50, randomGap + this.CURRENT_PIPE_GAP, 'pipe-bottom');
        this.physics.add.existing(bottomPipe);
        bottomPipe.body.setVelocityX(this.CURRENT_PIPE_SPEED);
        bottomPipe.body.setAllowGravity(false);
        bottomPipe.setOrigin(0, 0);

        this.pipes.push({ top: topPipe, bottom: bottomPipe });
    }

    endGame ()
    {
        this.gameOver = true;
        if (this.bird)
        {
            this.bird.body.setVelocity(0, 0);
            this.bird.body.setGravityY(0);
        }

        if (this.pipeGenerator)
        {
            this.pipeGenerator.remove();
        }

        EventBus.off('pause-game');
        EventBus.off('resume-game');

        this.playSound('gameOver');
        EventBus.emit('game-over', { score: this.score });
        
        this.time.delayedCall(1000, () =>
        {
            this.scene.start('GameOver', { score: this.score });
        });
    }

    private playSound (type: 'flap' | 'score' | 'gameOver')
    {
        const gameAudio = (window as any).gameAudio;
        if (gameAudio)
        {
            switch (type)
            {
                case 'flap':
                    gameAudio.playFlap?.();
                    break;
                case 'score':
                    gameAudio.playScore?.();
                    break;
                case 'gameOver':
                    gameAudio.playGameOver?.();
                    break;
            }
        }
    }

    pauseGame ()
    {
        if (!this.gameOver)
        {
            this.paused = true;
            this.physics.pause();
        }
    }

    resumeGame ()
    {
        if (!this.gameOver && this.paused)
        {
            this.paused = false;
            this.physics.resume();
        }
    }
}


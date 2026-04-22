import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.add.image(512, 384, 'background');
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
    }

    create ()
    {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFD700, 1);
        graphics.arc(17, 12, 12, 0, Math.PI * 2);
        graphics.fillPath();
        graphics.generateTexture('bird', 34, 24);
        graphics.destroy();

        const pipeGfx = this.add.graphics();
        pipeGfx.fillStyle(0x228B22, 1);
        pipeGfx.fillRect(0, 0, 80, 400);
        pipeGfx.lineStyle(2, 0x1a5c1a, 1);
        pipeGfx.strokeRect(0, 0, 80, 400);
        pipeGfx.generateTexture('pipe-top', 80, 400);
        pipeGfx.generateTexture('pipe-bottom', 80, 400);
        pipeGfx.destroy();

        this.createSoundEffects();
        this.scene.start('MainMenu');
    }

    private createSoundEffects ()
    {
        try
        {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            (window as any).gameAudio = {
                context: audioContext,
                playFlap: () => this.playBeep(audioContext, 400, 0.1),
                playScore: () => this.playBeep(audioContext, 800, 0.1),
                playGameOver: () => this.playBeep(audioContext, 200, 0.3)
            };
        }
        catch (e)
        {
            console.warn('Audio context not available');
        }
    }

    private playBeep (audioContext: AudioContext, frequency: number, duration: number)
    {
        try
        {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        }
        catch (e)
        {
            // Silent fail
        }
    }
}

import { useEffect, useState } from 'react';
import { EventBus } from './game/EventBus';
import './gameui.css';

export const GameUI = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => 
        parseInt(localStorage.getItem('flappyBird-highScore') || '0', 10)
    );
    const [gameOverData, setGameOverData] = useState<{ score: number } | null>(null);

    useEffect(() => {
        const handleGameStarted = () => {
            setGameStarted(true);
            setScore(0);
            setGameOverData(null);
        };

        const handleScoreUpdated = (score: number) => {
            setScore(score);
        };

        const handleGameOver = (data: { score: number }) => {
            setGameStarted(false);
            setGameOverData(data);
            const newHighScore = Math.max(data.score, highScore);
            setHighScore(newHighScore);
        };

        // Listen for game events
        EventBus.on('game-started', handleGameStarted);
        EventBus.on('score-updated', handleScoreUpdated);
        EventBus.on('game-over', handleGameOver);

        return () => {
            EventBus.off('game-started', handleGameStarted);
            EventBus.off('score-updated', handleScoreUpdated);
            EventBus.off('game-over', handleGameOver);
        };
    }, [highScore]);

    return (
        <div className="game-ui">
            {gameStarted && (
                <div className="score-display">
                    <div className="score">Score: {score}</div>
                    <div className="high-score">High Score: {highScore}</div>
                </div>
            )}

            {gameOverData && (
                <div className="game-over-overlay">
                    <div className="game-over-content">
                        <h1>Game Over</h1>
                        <p className="final-score">Score: {gameOverData.score}</p>
                        <p className="high-score-info">High Score: {highScore}</p>
                        <p className="restart-info">Press SPACE to Restart</p>
                    </div>
                </div>
            )}
        </div>
    );
};

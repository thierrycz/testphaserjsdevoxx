import { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { GameUI } from './GameUI';

function App()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
            <GameUI />
        </div>
    )
}

export default App

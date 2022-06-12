import { GameGrid } from './features/game/GameGrid';
import  { ControlPanel } from './features/game/ControlPanel';
import { HandContainer } from './features/game/hand/HandContainer';
import { MainMenu } from './features/game/MainMenu';
import { useAppSelector } from './app/hooks';
import { selectGame } from './features/game/gameSlice';


import './App.scss';


function App() {
  // const hasGame = false;
  const hasGame = !!useAppSelector(selectGame);

  return (
    <div className="App">
      {hasGame ? 
        <>
          <GameGrid />        
          <div className="bottom-pane">
            <HandContainer />
            <ControlPanel />
          </div>
        </>
        : <MainMenu />
      }      
    </div>
  );
}

export default App;

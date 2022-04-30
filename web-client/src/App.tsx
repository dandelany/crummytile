import { GameGrid } from './features/game/GameGrid';
import  { ControlPanel } from './features/game/ControlPanel';
import { HandContainer } from './features/game/hand/HandContainer';

import './App.scss';

function App() {
  return (
    <div className="App">
      

      <GameGrid nodes={[]} edges={[]} />

      
      <div className="bottom-pane">
        <HandContainer />
        <ControlPanel />
      </div>
    </div>
  );
}

export default App;

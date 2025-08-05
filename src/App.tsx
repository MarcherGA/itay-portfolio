
import Scene from './components/scene'
import { Cursor } from './cursor';


function App() {


  return(
    <div id='background' className="flex flex-col h-full w-full overflow-x-hidden">
      <Cursor/>
      <Scene/>
    </div>
  )
}

export default App

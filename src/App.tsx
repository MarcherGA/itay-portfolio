import Menu from './menu'
import NameBanner from './Name'
import ProjectsCard from './ProjectsCard'
import Scene from './scene/scene'
import SynthwaveBackground from './synthwaveBg/synthwaveBackground'

function App() {

  return(
    <div id='background' className="animated-background flex flex-col h-full w-full overflow-x-hidden">
      <Scene/>
      <NameBanner/>
      <Menu/>
      <ProjectsCard/>
    </div>
  )
}

export default App


import Scene from './components/scene'
import { Cursor } from './cursor';
import { NavigationBar } from './components/navigation-bar';
import { ThemeToggle } from './components/theme-toggle';
import { ScrollHintOverlay } from './components/scroll-hint-overlay';
import { navigationItems } from './data/navigation-items';

function App() {

  return(
    <div id='background' className="flex flex-col h-full w-full overflow-x-hidden">
      <Cursor/>
      <NavigationBar items={navigationItems} />
      <ThemeToggle />
      <ScrollHintOverlay />
      <Scene/>
    </div>
  )
}

export default App

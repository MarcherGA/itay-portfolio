import { lazy, Suspense } from 'react';
import { Cursor } from './cursor';
import { NavigationBar } from './components/navigation-bar/navigation-bar';
import { ThemeToggle } from './components/theme-toggle';
import { ScrollHintOverlay } from './components/scroll-hint-overlay';
import { navigationItems } from './data/navigation-items';

// Lazy load the heavy 3D Scene component
const Scene = lazy(() => import('./components/scene'));

function App() {

  return(
    <div id='background' className="flex flex-col h-full w-full overflow-x-hidden">
      <Cursor/>
      <NavigationBar items={navigationItems} />
      <ThemeToggle />
      <ScrollHintOverlay />
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <Scene/>
      </Suspense>
    </div>
  )
}

export default App

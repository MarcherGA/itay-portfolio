import  { useEffect } from 'react'
import SynthwaveBackground from './synthwaveBg/synthwaveBackground'
import Game from './core/game'

function App() {

useEffect(() => {
    const game = Game()

    return () => {
      game.destroy(true)
    }
  }, [])


  return (
    <>
    <SynthwaveBackground>
      <div id="phaser-container" className="App"></div>
    </SynthwaveBackground>
    </>
  )
}

export default App

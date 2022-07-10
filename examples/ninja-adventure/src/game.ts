/// <reference types="svelte" />

import { FadeTransition } from 'merlyn/transitions'
import './styles.css'

export const transition = new FadeTransition()

const engine = new ex.Engine({
  canvasElementId: 'game',
  backgroundColor: ex.Color.Black,
  displayMode: ex.DisplayMode.FitContainer,
  resolution: ex.Resolution.GameBoyAdvance,
  suppressConsoleBootMessage: import.meta.env.DEV,
  antialiasing: false,
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    engine.stop()
  } else if (document.visibilityState === 'visible') {
    engine.start()
  }
})

export default engine

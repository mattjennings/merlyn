/// <reference types="svelte" />

import { Fade, CrossFade } from 'merlyn/transitions'
import './styles.css'

export const transition = new CrossFade()

const engine = new ex.Engine({
  canvasElementId: 'game',
  backgroundColor: ex.Color.Black,
  displayMode: ex.DisplayMode.FitContainer,
  resolution: ex.Resolution.GameBoyAdvance,
  antialiasing: false,
  suppressConsoleBootMessage: import.meta.env.DEV,
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    engine.stop()
  } else if (document.visibilityState === 'visible') {
    engine.start()
  }
})

export default engine

import { FadeTransition } from 'merlyn/transitions'

export const transition = new FadeTransition()
const engine = new ex.Engine({
  backgroundColor: ex.Color.fromHex('#5fcde4'),
  resolution: {
    width: 600,
    height: 400,
  },
  // Turn off anti-aliasing for pixel art graphics
  antialiasing: false,
  displayMode: ex.DisplayMode.FitScreen,
})

// Set global gravity, 800 pixels/sec^2
ex.Physics.acc = new ex.Vector(0, 800)

// pause game when hidden
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    engine.stop()
  } else if (document.visibilityState === 'visible') {
    engine.start()
  }
})

export const loader = new ex.Loader()

export default engine

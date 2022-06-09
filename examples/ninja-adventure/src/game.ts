import { SimpleLoader } from '@mattjennings/merlin'
import { DevTool } from '@excaliburjs/dev-tools'

const engine = new ex.Engine({
  backgroundColor: ex.Color.ExcaliburBlue,
  antialiasing: false,
  displayMode: ex.DisplayMode.FitScreen,
  resolution: ex.Resolution.GameBoyAdvance,
  suppressConsoleBootMessage: import.meta.env.DEV,
})

// new DevTool(engine)

export const loader = import.meta.env.DEV
  ? // during development, use loader that starts automatically
    new SimpleLoader()
  : new ex.Loader()

export default engine

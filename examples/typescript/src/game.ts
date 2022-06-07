import { SimpleLoader } from '@mattjennings/merlin'

const engine = new ex.Engine({
  backgroundColor: ex.Color.ExcaliburBlue,
  width: 600,
  height: 400,
  antialiasing: false,
  displayMode: ex.DisplayMode.FitScreen,
})

export const loader = import.meta.env.DEV
  ? // during development, use loader that starts automatically
    new SimpleLoader()
  : new ex.Loader()

export default engine

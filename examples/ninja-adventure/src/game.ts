const engine = new ex.Engine({
  backgroundColor: ex.Color.Black,
  antialiasing: false,
  displayMode: ex.DisplayMode.FitScreen,
  resolution: ex.Resolution.GameBoyAdvance,
  suppressConsoleBootMessage: import.meta.env.DEV,
})

export default engine

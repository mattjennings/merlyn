import { FadeTransition } from 'merlyn'
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

export default engine

// enforce ui stays at same resolution and scales up/down
function updateUi() {
  const ui = document.querySelector<HTMLElement>('#ui')

  if (ui) {
    const { width, height, left, top } = engine.canvas.getBoundingClientRect()
    const scaledWidth = width / engine.drawWidth
    const scaledHeight = height / engine.drawHeight

    ui.style.width = `${engine.drawWidth}px`
    ui.style.height = `${engine.drawHeight}px`
    ui.style.left = `${left}px`
    ui.style.top = `${top}px`

    ui.style.transformOrigin = '0 0'
    ui.style.transform = `scale(${scaledWidth}, ${scaledHeight})`
  }
}

setTimeout(() => updateUi())
window.addEventListener('resize', () => {
  updateUi()
})

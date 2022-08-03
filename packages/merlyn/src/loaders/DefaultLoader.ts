import type { Engine } from 'excalibur'
import { Color, Scene, ScreenElement } from 'excalibur'
import { ProgressBar } from './ProgressBar.js'

export class DefaultLoader extends Scene {
  progressBar: ProgressBar
  elapsedTime = 0
  complete = false

  ogBackgroundColor: ex.Color

  onInitialize(engine: Engine) {
    const width = this.camera.viewport.width
    const height = this.camera.viewport.height
    const { center } = engine.screen

    const fontSize = {
      sm: Math.min(height, width) / 28,
      lg: Math.min(height, width) / 10,
    }

    this.ogBackgroundColor = engine.backgroundColor
    engine.backgroundColor = Color.fromHex('#334155')

    this.progressBar = new ProgressBar({
      x: center.x,
      y: center.y,
      width: width * 0.5,
      height: Math.round(fontSize.sm / 2),
    })
    engine.add(this.progressBar)
  }

  onDeactivate() {
    this.engine.backgroundColor = this.ogBackgroundColor
  }

  onLoadStart() {
    this.progressBar.progress = 0
  }

  onLoad(progress: number) {
    this.progressBar.progress = progress
  }

  onPreUpdate(_, delta) {
    this.elapsedTime += delta
  }
}

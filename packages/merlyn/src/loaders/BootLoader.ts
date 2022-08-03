import type { Engine } from 'excalibur'
import {
  Scene,
  Label,
  Font,
  TextAlign,
  FontUnit,
  Color,
  ScreenElement,
} from 'excalibur'
import { ProgressBar } from './ProgressBar.js'

export class BootLoader extends Scene {
  defer = true //import.meta.env.PROD

  labels: Label[] = []
  progressBar: ProgressBar
  elapsedTime = 0
  complete = false

  ogBackgroundColor!: ex.Color

  onInitialize(engine: Engine) {
    const width = this.camera.viewport.width
    const height = this.camera.viewport.height
    const { center } = engine.screen

    const fontSize = {
      sm: Math.min(width, height) / 28,
      lg: Math.min(width, height) / 10,
    }

    this.ogBackgroundColor = engine.backgroundColor
    engine.backgroundColor = Color.fromHex('#334155')

    this.labels.push(
      new Label({
        text: '🧙‍♂️',
        x: center.x,
        y: center.y,
        font: new Font({
          textAlign: TextAlign.Center,
          family: 'Helvetica',
          size: fontSize.lg,
          unit: FontUnit.Px,
          color: Color.White,
          quality: window.devicePixelRatio * 2,
        }),
      }),
      new Label({
        text: 'made with merlyn',
        x: center.x,
        y: center.y + fontSize.sm * 2,
        font: new Font({
          textAlign: TextAlign.Center,
          family: 'Luminari',
          size: fontSize.sm,
          unit: FontUnit.Px,
          color: Color.White,
          quality: window.devicePixelRatio * 2,
        }),
      })
    )

    this.labels.forEach((l) => engine.add(l))

    this.progressBar = new ProgressBar({
      x: center.x,
      y: center.y + fontSize.sm * 8,
      width: height * 0.5,
      height: Math.round(fontSize.sm / 2),
    })
    engine.add(this.progressBar)
  }

  onDeactivate() {
    this.engine.backgroundColor = this.ogBackgroundColor
  }
  onActivate() {
    // this.progressBar.progress = 0
    // this.progressBar.graphics.opacity = 0
    this.complete = false

    setTimeout(() => {
      if (!this.complete) {
        this.progressBar.actions.fade(1, 250)
      }
    }, 1000)

    this.labels.forEach((l) => {
      l.graphics.opacity = 1
    })
  }

  onLoad(progress: number) {
    this.progressBar.progress = progress
  }

  onLoadComplete() {
    this.complete = true
    // this.progressBar.actions.clearActions()
    // this.progressBar.actions.fade(0, 250)

    setTimeout(() => {
      // this.emit('continue', undefined)
    }, Math.max(0, 1500 - this.elapsedTime))
  }

  onPreUpdate(_, delta) {
    this.elapsedTime += delta
  }
}

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
  defer = import.meta.env.PROD

  labels: Label[] = []
  progressBar: ProgressBar
  elapsedTime = 0
  complete = false

  onInitialize(engine: Engine) {
    const fontSize = {
      sm: Math.max(engine.drawHeight, engine.drawWidth) / 28,
      lg: Math.max(engine.drawHeight, engine.drawWidth) / 10,
    }

    this.labels.push(
      new Label({
        text: '🧙‍♂️',
        x: engine.drawWidth / 2,
        y: engine.drawHeight / 2,
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
        x: engine.drawWidth / 2,
        y: engine.drawHeight / 2 + fontSize.sm * 2,
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

    engine.add(
      new ScreenElement({
        x: 0,
        y: 0,
        width: engine.drawWidth,
        height: engine.drawHeight,
        color: Color.fromHex('#334155'),
      })
    )
    this.labels.forEach((l) => engine.add(l))

    this.progressBar = new ProgressBar({
      x: engine.drawWidth / 2,
      y: engine.drawHeight - fontSize.sm * 4,
      width: engine.drawWidth * 0.5,
      height: Math.round(fontSize.sm),
    })
    engine.add(this.progressBar)
  }

  onActivate() {
    this.progressBar.progress = 0
    this.progressBar.graphics.opacity = 0
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
    this.progressBar.actions.clearActions()
    this.progressBar.actions.fade(0, 250)

    setTimeout(() => {
      this.emit('continue', undefined)
    }, Math.max(0, 1500 - this.elapsedTime))
  }

  onPreUpdate(_, delta) {
    this.elapsedTime += delta
  }
}

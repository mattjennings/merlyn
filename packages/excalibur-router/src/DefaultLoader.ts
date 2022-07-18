import type { ActorArgs, Engine } from 'excalibur'
import {
  Actor,
  Canvas,
  Color,
  Font,
  FontUnit,
  Label,
  ScreenElement,
  TextAlign,
  Util,
} from 'excalibur'
import { Scene } from 'excalibur'
import { CrossFade } from './transitions/CrossFade.js'

export class DefaultLoader extends Scene {
  transition = new CrossFade()

  defer = true

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
      width: engine.drawWidth * 0.75,
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

class ProgressBar extends Actor {
  progress = 0

  constructor(args: ActorArgs) {
    super(args)
  }

  onInitialize(engine: Engine) {
    const canvas = new Canvas({
      width: this.width,
      height: this.height,
      quality: window.devicePixelRatio,
      draw: (ctx) => {
        Util.DrawUtil.roundRect(
          ctx,
          0,
          0,
          this.width,
          this.height,
          this.height / 2,
          Color.White
        )
        Util.DrawUtil.roundRect(
          ctx,
          0,
          0,
          this.width * Math.max(0.05, Math.min(1, this.progress / 100)),
          this.height,
          this.height / 2,
          Color.White,
          Color.White
        )
      },
    })

    this.graphics.use(canvas)
  }
}

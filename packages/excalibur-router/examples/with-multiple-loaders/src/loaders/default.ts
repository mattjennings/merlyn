import * as ex from 'excalibur'

export default class DefaultLoader extends ex.Scene {
  labels: ex.Label[] = []
  progressBar!: ProgressBar
  elapsedTime = 0
  complete = false

  onInitialize(engine: ex.Engine) {
    const fontSize = {
      sm: Math.max(engine.drawHeight, engine.drawWidth) / 28,
      lg: Math.max(engine.drawHeight, engine.drawWidth) / 10,
    }

    this.progressBar = new ProgressBar({
      x: engine.drawWidth / 2,
      y: engine.drawHeight / 2,
      width: engine.drawWidth * 0.75,
      height: Math.round(fontSize.sm),
    })
    engine.add(this.progressBar)
  }

  onActivate() {
    this.complete = false
  }

  onLoad(progress: number) {
    this.progressBar.progress = progress
  }

  onLoadComplete() {
    this.complete = true
    this.progressBar.actions.clearActions()
  }

  onPreUpdate(engine: ex.Engine, delta: number) {
    this.elapsedTime += delta
  }
}

class ProgressBar extends ex.Actor {
  progress = 0

  constructor(args: ex.ActorArgs) {
    super(args)
  }

  onInitialize(engine: ex.Engine) {
    const canvas = new ex.Canvas({
      width: this.width,
      height: this.height,
      quality: window.devicePixelRatio,
      draw: (ctx) => {
        ex.Util.DrawUtil.roundRect(
          ctx,
          0,
          0,
          this.width,
          this.height,
          this.height / 2,
          ex.Color.White
        )
        ex.Util.DrawUtil.roundRect(
          ctx,
          0,
          0,
          this.width * Math.max(0.05, Math.min(1, this.progress / 100)),
          this.height,
          this.height / 2,
          ex.Color.White,
          ex.Color.White
        )
      },
    })

    this.graphics.use(canvas)
  }
}

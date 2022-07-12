export default class Loading extends ex.Scene {
  defer = import.meta.env.PROD

  labels: ex.Label[] = []
  progressBar: ProgressBar

  initial = true
  onInitialize(engine: ex.Engine) {
    const fontSize = {
      sm: Math.max(engine.drawHeight, engine.drawWidth) / 28,
      lg: Math.max(engine.drawHeight, engine.drawWidth) / 10,
    }

    this.labels.push(
      new ex.Label({
        text: '🧙‍♂️',
        x: engine.drawWidth / 2,
        y: engine.drawHeight / 2,
        z: Infinity,
        font: new ex.Font({
          textAlign: ex.TextAlign.Center,
          family: 'Helvetica',
          size: fontSize.lg,
          unit: ex.FontUnit.Px,
          color: ex.Color.White,
          quality: window.devicePixelRatio,
        }),
      }),
      new ex.Label({
        text: 'made with merlyn',
        x: engine.drawWidth / 2,
        y: engine.drawHeight / 2 + fontSize.sm * 2,
        z: Infinity,
        font: new ex.Font({
          textAlign: ex.TextAlign.Center,
          family: 'Luminari',
          size: fontSize.sm,
          unit: ex.FontUnit.Px,
          color: ex.Color.White,
          quality: window.devicePixelRatio,
        }),
      })
    )

    engine.add(
      new ex.ScreenElement({
        x: 0,
        y: 0,
        width: engine.drawWidth,
        height: engine.drawHeight,
        color: ex.Color.fromHex('#334155'),
        z: Infinity,
      })
    )
    this.labels.forEach((l) => engine.add(l))

    this.progressBar = new ProgressBar({
      x: engine.drawWidth / 2,
      y: engine.drawHeight - fontSize.sm * 4,
      width: engine.drawWidth * 0.75,
      height: Math.round(fontSize.sm),
      z: Infinity,
    })
    engine.add(this.progressBar)
  }

  onActivate() {
    this.progressBar.graphics.opacity = 0
    this.labels.forEach((l) => {
      l.graphics.opacity = 0
    })

    setTimeout(() => {
      this.labels.forEach((l) => {
        l.actions.fade(1, 500)
      })
      if (this.progressBar.progress < 100) {
        this.progressBar.actions.fade(1, 500)
      }
    }, 500)
  }

  onLoad(progress: number) {
    this.progressBar.progress = progress
  }

  onLoadComplete() {
    this.progressBar.actions.clearActions()
    this.progressBar.actions.fade(0, 250)

    if (this.initial) {
      setTimeout(() => {
        this.emit('continue', undefined)
      }, 2000)
    }

    this.initial = false
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

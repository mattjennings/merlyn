export class ProgressBar extends ex.Actor {
  progress = 0

  constructor(args: ex.ActorArgs) {
    super(args)
  }

  onInitialize() {
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
          this.width * Math.max(0.01, Math.min(1, this.progress / 100)),
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

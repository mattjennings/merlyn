import type { ActorArgs } from 'excalibur'
import { Actor, Canvas, Color, Util } from 'excalibur'

export class ProgressBar extends Actor {
  progress = 0

  constructor(args: ActorArgs) {
    super(args)
  }

  onInitialize() {
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
          this.width * Math.max(0.01, Math.min(1, this.progress / 100)),
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

import { engine } from '$game'
import type { Engine } from 'excalibur'
import { ScreenElement, Color } from 'excalibur'
import type { TransitionArgs } from './Transition.js'
import { Transition } from './Transition.js'

export interface CrossFadeArgs extends TransitionArgs {
  duration?: number
}

export class CrossFade extends Transition {
  el: ScreenElement

  screenshot: HTMLImageElement

  constructor({ duration, ...args }: CrossFadeArgs = {}) {
    super({
      ...args,
      duration: {
        outro: 0,
        intro: duration ?? 150,
      },
      z: Infinity,
    })
  }

  onInitialize(engine: Engine): void {
    this.el = new ScreenElement({
      x: 0,
      y: 0,
      z: this.z,
      width: engine.canvasWidth,
      height: engine.canvasHeight,
    })

    this.el.graphics.use(
      new ex.Canvas({
        quality: window.devicePixelRatio,
        width: engine.canvasWidth,
        height: engine.canvasHeight,
        draw: (ctx) => {
          if (this.screenshot) {
            ctx.drawImage(
              this.screenshot,
              0,
              0,
              engine.canvasWidth,
              engine.canvasHeight,
              0,
              0,
              engine.canvasWidth / window.devicePixelRatio,
              engine.canvasHeight / window.devicePixelRatio
            )
          }
        },
      })
    )
    this.addChild(this.el)
  }

  onIntroStart() {
    this.el.graphics.opacity = 1
  }

  onOutroStart() {
    this.takeScreenshot()
  }

  onIntro(progress: number) {
    this.el.graphics.opacity = 1 - progress
  }

  onOutro(progress: number) {}

  onOutroComplete() {}

  private takeScreenshot() {
    engine.screenshot(true).then((el) => {
      this.screenshot = el
    })
  }
}

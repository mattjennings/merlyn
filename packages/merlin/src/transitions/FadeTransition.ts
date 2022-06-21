import { Color, Engine, ScreenElement } from 'excalibur'
import { Transition, TransitionArgs } from './Transition'

export class FadeTransition extends Transition {
  el: ScreenElement

  constructor(args: TransitionArgs) {
    super({
      duration: args.duration,
      out: args.out,
      ...args,
    })
  }

  onInitialize(engine: Engine): void {
    this.el = new ScreenElement({
      x: 0,
      y: 0,
      z: 9999,
      width: engine.currentScene.camera.viewport.width,
      height: engine.currentScene.camera.viewport.height,
      color: Color.Black,
    })

    if (this.out) {
      this.el.graphics.opacity = 0
    } else {
      this.el.graphics.opacity = 1
    }

    this.addChild(this.el)
  }

  onPostUpdate(engine: Engine) {
    if (this.out) {
      this.el.graphics.opacity = this.progress
    } else {
      this.el.graphics.opacity = 1 - this.progress
    }
  }
}

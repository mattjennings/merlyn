import { Color, Engine, ScreenElement } from 'excalibur'
import { Transition, TransitionArgs } from './Transition'

export class FadeTransition extends Transition {
  el: ScreenElement

  constructor(args: TransitionArgs = {}) {
    super({
      duration: 300,
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
    this.el.graphics.opacity = this.isOutro ? 0 : 1
    this.addChild(this.el)
  }

  onIntroStart() {
    this.el.graphics.opacity = 1
  }

  onOutroStart() {
    this.el.graphics.opacity = 0
  }

  onIntro(progress: number) {
    this.el.graphics.opacity = 1 - progress
  }

  onOutro(progress: number) {
    this.el.graphics.opacity = progress
  }
}

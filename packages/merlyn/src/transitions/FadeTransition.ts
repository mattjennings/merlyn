import type { Engine } from 'excalibur'
import { Color, ScreenElement } from 'excalibur'
import type { TransitionArgs } from './Transition.js'
import { Transition } from './Transition.js'

export class FadeTransition extends Transition {
  el: ScreenElement

  constructor(args: TransitionArgs = {}) {
    super({
      duration: 300,
      z: 999999,
      ...args,
    })
  }

  onInitialize(engine: Engine): void {
    // extend element beyond camera bounds incase
    // camera is off by 1 due to pixel snapping
    const buffer = 1

    this.el = new ScreenElement({
      x: -buffer,
      y: -buffer,
      z: this.z,
      width: engine.currentScene.camera.viewport.width + buffer * 2,
      height: engine.currentScene.camera.viewport.height + buffer * 2,
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

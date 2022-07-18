import * as ex from 'excalibur'
import { router } from './router'
import { Fade } from 'excalibur-router/transitions'

export default class Level1 extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(
      new ex.Label({
        x: 100,
        y: 100,
        text: 'Level 1 - click to go to level 2',
        font: new ex.Font({
          size: 48,
        }),
      })
    )
  }

  onActivate() {
    this.engine.input.pointers.primary.once('down', () => {
      router.goto('level2', { transition: new Fade() })
    })
  }
}

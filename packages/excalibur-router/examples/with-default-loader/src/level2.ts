import * as ex from 'excalibur'
import { router } from './router'
import { Fade } from 'excalibur-router/transitions'
import { Bot } from './bot'

export default class Level2 extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(
      new ex.Label({
        x: 100,
        y: 100,
        text: 'Level 2 - click to go to level 1',
        font: new ex.Font({
          size: 48,
        }),
      })
    )
    engine.add(new Bot(engine.screen.center.x, engine.screen.center.y))
  }

  onActivate() {
    this.engine.input.pointers.primary.once('down', () => {
      router.goto('level1', { transition: new Fade() })
    })
  }
}

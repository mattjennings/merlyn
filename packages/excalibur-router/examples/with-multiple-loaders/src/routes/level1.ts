import * as ex from 'excalibur'
import { router } from '../router'
import { Fade } from 'excalibur-router/transitions'

// load these just to show loading screen
router.addResource([
  new ex.Sound('jump.wav'),
  new ex.Sound('hurt.wav'),
  new ex.Sound('gottem.wav'),
])

export default class Level1 extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(
      new ex.Label({
        x: engine.screen.center.x,
        y: 100,
        text: 'Click to go to level 2',
        font: new ex.Font({
          textAlign: ex.TextAlign.Center,

          size: 48,
        }),
      })
    )
    engine.add(
      new ex.Label({
        x: engine.screen.center.x,
        y: 200,
        text: '(try throttling your network in dev tools)',
        font: new ex.Font({
          textAlign: ex.TextAlign.Center,
          size: 32,
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

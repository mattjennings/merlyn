import * as ex from 'excalibur'
import { Router } from 'excalibur-router'
import { Fade } from 'excalibur-router/transitions'

const engine = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreen,
})

class Level1 extends ex.Scene {
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

class Level2 extends ex.Scene {
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
  }

  onActivate() {
    this.engine.input.pointers.primary.once('down', () => {
      router.goto('level1', { transition: new Fade() })
    })
  }
}

const router = new Router({
  routes: {
    level1: Level1,
    level2: Level2,
  },
})

router.start(engine).then(() => {
  router.goto('level1')
})

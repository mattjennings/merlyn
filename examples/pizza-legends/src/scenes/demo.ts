import { Hero } from '$lib/Hero'
import { OverworldMap } from '$lib/OverworldMap'
import { gridToPx } from '$lib/util'
import imgLower from '$res/maps/DemoLower.png'
import imgUpper from '$res/maps/DemoUpper.png'

export default class Main extends ex.Scene {
  onActivate<T>(ctx: ex.SceneActivationContext<T>) {}

  onInitialize(engine: ex.Engine) {
    engine.add(
      new OverworldMap({
        lower: imgLower,
        upper: imgUpper,
      })
    )

    const hero = new Hero({
      x: gridToPx(5),
      y: gridToPx(6),
    })
    engine.add(hero)
  }
}

import { Wizard } from '$lib/Wizard'

export default class Main extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    const center = new ex.Vector(engine.drawWidth / 2, engine.drawHeight / 2)

    engine.add(
      new ex.Label({
        text: 'merlin',
        x: center.x,
        y: center.y - 64,
        font: new ex.Font({
          textAlign: ex.TextAlign.Center,
          family: 'Luminari',
          size: 64,
          unit: ex.FontUnit.Px,
          color: ex.Color.White,
          quality: 2,
        }),
      })
    )

    engine.add(new Wizard({ x: center.x, y: center.y + 64 }))
  }
}

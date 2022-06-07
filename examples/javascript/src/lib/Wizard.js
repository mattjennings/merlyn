import image from '$res/wizard.png'

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image,
  grid: {
    columns: 6,
    rows: 1,
    spriteWidth: 231,
    spriteHeight: 190,
  },
})

// Thanks to Luiz Melo for the wizard sprite
// https://luizmelo.itch.io/wizard-pack
export class Wizard extends ex.Actor {
  constructor(args) {
    super({
      anchor: new ex.Vector(0.475, 0.5),
      ...args,
    })
  }

  onInitialize(engine) {
    const idle = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [0, 1, 2, 3, 4, 5],
      200
    )
    idle.scale = new ex.Vector(2, 2)

    this.graphics.add('idle', idle)
    this.graphics.use('idle')
  }
}

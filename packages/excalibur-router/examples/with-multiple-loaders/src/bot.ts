import * as ex from 'excalibur'
import { router } from './router'

const image = new ex.ImageSource('excalibot.png')

router.addResource(image)

const botSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: image,
  grid: {
    columns: 8,
    rows: 1,
    spriteWidth: 32,
    spriteHeight: 32,
  },
})

export class Bot extends ex.Actor {
  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      scale: new ex.Vector(4, 4),
    })
  }

  onInitialize(engine: ex.Engine) {
    const idle = ex.Animation.fromSpriteSheet(botSpriteSheet, [2, 3], 800)
    this.graphics.use(idle)
  }
}

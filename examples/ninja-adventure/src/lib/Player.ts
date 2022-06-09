import image from '$res/Actor/Characters/GreenNinja/SpriteSheet.png'
import { Engine } from 'excalibur'
import { Character } from './entities/Character'
import { getHeldDirections } from './util/input'

export class Player extends Character {
  constructor(args: ex.ActorArgs) {
    super({
      name: 'player',
      image,
      anchor: new ex.Vector(0, 0),
      collisionType: ex.CollisionType.Active,
      collider: ex.Shape.Box(16, 8, ex.Vector.Zero, ex.vec(0, 10)),
      ...args,
    })
  }

  onInitialize(engine: ex.Engine) {
    super.onInitialize(engine)
  }

  onPreUpdate(engine: Engine, delta: number): void {
    const movement = new ex.Vector(0, 0)
    const heldDirections = getHeldDirections()

    heldDirections.forEach((key) => {
      if (key === 'up') {
        movement.y = -1
      } else if (key === 'down') {
        movement.y = 1
      }

      if (key === 'left') {
        movement.x = -1
      } else if (key === 'right') {
        movement.x = 1
      }
    })

    if (movement.x === 0 && movement.y === 0) {
      this.idle()
    } else {
      this.move(movement)
    }
  }
}

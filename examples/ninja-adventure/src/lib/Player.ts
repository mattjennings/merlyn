import image from '$res/Actor/Characters/GreenNinja/SpriteSheet.png'
import type { Engine } from 'excalibur'
import { Character, type CharacterArgs } from './entities/Character'
import { getHeldDirections } from './util/input'

export class Player extends Character {
  constructor(args: Partial<CharacterArgs>) {
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
    engine.currentScene.camera.strategy.lockToActor(this)

    // this fixes tilemap seaming...??
    engine.currentScene.camera.addStrategy({
      target: null,
      action(target, camera, engine, delta) {
        // round to the 2nd decimal place, add 0.001, artifacing is gone
        const round = (n: number) => Math.round(n * 100) / 100 + 0.001
        return new ex.Vector(round(camera.pos.x), round(camera.pos.y))
      },
    })

    // set camera bounds
    const tilemap = engine.currentScene.tileMaps[0]
    if (tilemap) {
      this.scene.camera.strategy.limitCameraBounds(
        new ex.BoundingBox(
          0,
          0,
          tilemap.tileWidth * tilemap.columns,
          tilemap.tileHeight * tilemap.rows
        )
      )
    }
  }

  onPreUpdate(engine: Engine, delta: number): void {
    if (this.scene.isTransitioning) {
      this.idle()
      return
    }

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

  move(direction: ex.Vector) {
    super.move(direction)
    this.emit('move', direction)
  }
}

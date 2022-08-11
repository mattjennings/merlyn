import { Character } from './Character'
import { Input } from './Input'
import { snapToGrid } from '$lib/util'

export class Hero extends Character {
  input = new Input()

  constructor(args: ex.ActorArgs) {
    super({
      image: $res('characters/people/hero.png'),
      ...args,
    })
  }

  onInitialize(engine: ex.Engine) {
    this.addChild(this.input)
  }

  onPreUpdate(): void {
    const direction = this.input.getHeldDirection()

    if (direction) {
      const isOppositeDirection =
        (this.facing === 'left' && direction === 'right') ||
        (this.facing === 'right' && direction === 'left') ||
        (this.facing === 'up' && direction === 'down') ||
        (this.facing === 'down' && direction === 'up')

      if (isOppositeDirection || this.pos.equals(snapToGrid(this.pos))) {
        this.move(direction)
      } else if (direction !== this.facing) {
        this.stop()
      }
    } else if (this.isMoving) {
      this.stop()
    }
  }
}

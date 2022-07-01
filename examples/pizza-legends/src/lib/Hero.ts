import imgHero from '$res/characters/people/hero.png'
import { Engine } from 'excalibur'
import { Character } from './Character'
import { Input } from './Input'
import { snapToGrid } from './util'

export class Hero extends Character {
  input = new Input()

  constructor(args: ex.ActorArgs) {
    super({
      image: imgHero,
      ...args,
    })
  }

  onInitialize(engine: ex.Engine) {
    this.addChild(this.input)
    // this.move('right', { tiles: 5 }).then(() => {
    //   this.move('up', { tiles: 3 })
    // })
  }

  onPreUpdate(engine: Engine, delta: number): void {
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
    } else {
      this.stop()
    }
  }
}

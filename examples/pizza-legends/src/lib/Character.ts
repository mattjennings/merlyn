import { coroutine, gridToPx, snapToGrid } from '$lib/util'
import imgShadow from '$res/characters/shadow.png'

export interface CharacterArgs extends ex.ActorArgs {
  image: ex.ImageSource
  facing?: Direction
  shadow?: boolean
}

type Direction = 'up' | 'down' | 'left' | 'right'

export class Character extends ex.Actor {
  private _facing: Direction = 'down'

  anims: Record<'up' | 'down' | 'left' | 'right', ex.Animation>
  shadow: boolean

  constructor({
    image,
    facing = 'down',
    shadow = true,
    ...args
  }: CharacterArgs) {
    super({
      anchor: new ex.Vector(8 / 32, 4 / 32),
      ...args,
    })

    this.shadow = shadow

    const spriteSheet = ex.SpriteSheet.fromImageSource({
      image,
      grid: {
        columns: 4,
        rows: 7,
        spriteWidth: 32,
        spriteHeight: 32,
      },
    })

    this.anims = {
      down: ex.Animation.fromSpriteSheet(spriteSheet, [0, 1, 2, 3], 0),
      right: ex.Animation.fromSpriteSheet(spriteSheet, [4, 5, 6, 7], 0),
      up: ex.Animation.fromSpriteSheet(spriteSheet, [8, 9, 10, 11], 0),
      left: ex.Animation.fromSpriteSheet(spriteSheet, [12, 13, 14, 15], 0),
    }

    // draw shadow behind character
    if (this.shadow) {
      this.graphics.onPreDraw = (ctx) => {
        ctx.drawImage(imgShadow.image, -this.anchor.x * 32, -this.anchor.y * 32)
      }
    }

    Object.entries(this.anims).forEach(([name, anim]) => {
      this.graphics.add(name, anim)
    })

    this.facing = facing

    this.on('postupdate', () => {
      if (this.isMoving) {
        this.currentAnim.play()
      } else {
        this.currentAnim.goToFrame(0)
        this.currentAnim.pause()
      }
    })
  }

  get currentAnim() {
    return this.graphics.current[0].graphic as ex.Animation
  }

  get isMoving() {
    return this.vel.x !== 0 || this.vel.y !== 0
  }

  get facing() {
    return this._facing
  }

  set facing(facing: Direction) {
    this._facing = facing

    this.graphics.use(facing)
  }

  /**
   * Waits until character has finished moving onto tile then stops
   */
  async stop() {
    if (!this.isMoving) {
      return
    }

    return new Promise((resolve) => {
      coroutine(function* () {
        while (!snapToGrid(this.pos).equals(this.pos, 1)) {
          yield
        }
        this.vel = new ex.Vector(0, 0)
        this.pos = snapToGrid(this.pos)
        resolve(null)
      }, this)
    })
  }

  async move(
    direction: Direction,
    options: {
      tiles?: number
      speed?: number
    } = {}
  ) {
    const { speed = 100, tiles } = options

    let velocity = this.vel

    if (direction === 'up') {
      velocity = new ex.Vector(0, -speed)
    } else if (direction === 'down') {
      velocity = new ex.Vector(0, speed)
    } else if (direction === 'left') {
      velocity = new ex.Vector(-speed, 0)
    } else if (direction === 'right') {
      velocity = new ex.Vector(speed, 0)
    }

    // walk until amount of tiles have been walked, then stop
    if (tiles) {
      if (this.isMoving) {
        return
      }
      this.facing = direction
      this.currentAnim.frameDuration = speed

      await new Promise((resolve) => {
        coroutine(function* () {
          const xDir = direction === 'left' ? -1 : direction === 'right' ? 1 : 0
          const yDir = direction === 'up' ? -1 : direction === 'down' ? 1 : 0
          const distance = gridToPx(tiles)

          const target = snapToGrid(
            ex.vec(this.pos.x + xDir * distance, this.pos.y + yDir * distance)
          )

          while (!this.pos.equals(target, 1)) {
            this.vel = velocity
            yield
          }

          resolve(null)
        }, this)
      })

      this.vel = new ex.Vector(0, 0)
      this.pos = snapToGrid(this.pos)
    }
    // walk until this.stop() is called
    else {
      this.facing = direction
      this.currentAnim.frameDuration = speed
      this.vel = velocity
    }
  }
}

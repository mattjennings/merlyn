import { coroutine } from '$lib/util/entities'
import imgShadow from '$res/Actor/Characters/Shadow.png'

export interface CharacterArgs extends ex.ActorArgs {
  image: ex.ImageSource
  facing?: Direction
}

type Direction = 'up' | 'down' | 'left' | 'right'
export class Character extends ex.Actor {
  private WALK_SPEED = 100

  facing: Direction = 'down'
  anims: Record<'up' | 'down' | 'left' | 'right', ex.Animation>

  constructor({ image, facing = 'down', ...args }: CharacterArgs) {
    super({
      anchor: new ex.Vector(0, 0),
      ...args,
    })

    this.facing = facing

    const spriteSheet = ex.SpriteSheet.fromImageSource({
      image,
      grid: {
        columns: 4,
        rows: 7,
        spriteWidth: 16,
        spriteHeight: 16,
      },
    })

    this.anims = {
      down: ex.Animation.fromSpriteSheet(spriteSheet, [0, 4, 8, 12], 0),
      up: ex.Animation.fromSpriteSheet(spriteSheet, [1, 5, 9, 13], 0),
      left: ex.Animation.fromSpriteSheet(spriteSheet, [2, 6, 10, 14], 0),
      right: ex.Animation.fromSpriteSheet(spriteSheet, [3, 7, 11, 15], 0),
    }
  }

  onInitialize(engine: ex.Engine) {
    Object.entries(this.anims).forEach(([name, anim]) => {
      this.graphics.add(name, anim)
    })

    // draw shadow behind character
    this.graphics.onPreDraw = (ctx) => {
      ctx.drawImage(imgShadow.image, 2, 11)
    }

    this.updateFacing(this.facing)
    this.idle()
  }

  idle() {
    const anim = this.graphics.current[0].graphic as ex.Animation
    anim.pause()
    anim.goToFrame(0)
    this.vel = new ex.Vector(0, 0)
  }

  move(direction: ex.Vector, speed = this.WALK_SPEED) {
    const anim = this.graphics.current[0].graphic as ex.Animation
    anim.frameDuration = this.WALK_SPEED * 1.5
    this.vel = direction.normalize().scale(speed)
    this.updateFacing()
    anim.play()
  }

  async moveTo(coords: ex.Vector, speed = this.WALK_SPEED) {
    const initialPos = this.pos
    const targetPos = initialPos.add(coords)

    return new Promise((resolve) => {
      coroutine(
        function* (this: Character) {
          const vecDistance = targetPos.sub(this.pos)
          while (this.pos.distance(targetPos) > 4) {
            this.move(
              ex.vec(
                Math.sign(Math.floor(vecDistance.x)),
                Math.sign(Math.floor(vecDistance.y))
              ),
              speed
            )
            yield
          }
          this.pos = targetPos
          this.idle()
          resolve(null)
        }.bind(this)
      )
    })
  }

  /**
   * Updates the facing direction based on the current velocity
   */
  updateFacing(direction?: Direction) {
    const isMovingDiagonal = this.vel.x !== 0 && this.vel.y !== 0
    const xDir = Math.sign(this.vel.x)
    const yDir = Math.sign(this.vel.y)

    if (direction) {
      this.facing = direction
    } else {
      if (isMovingDiagonal) {
        // preserve facing direction if adding diagonal movement to same direction
        if (xDir === -1 && this.facing === 'right') {
          this.facing = 'left'
        } else if (xDir === 1 && this.facing === 'left') {
          this.facing = 'right'
        } else if (yDir === -1 && this.facing === 'down') {
          this.facing = 'up'
        } else if (yDir === 1 && this.facing === 'up') {
          this.facing = 'down'
        }
      } else {
        if (xDir === -1) {
          this.facing = 'left'
        } else if (xDir === 1) {
          this.facing = 'right'
        } else if (yDir === -1) {
          this.facing = 'up'
        } else if (yDir === 1) {
          this.facing = 'down'
        }
      }
    }

    this.graphics.use(this.facing)
  }
}

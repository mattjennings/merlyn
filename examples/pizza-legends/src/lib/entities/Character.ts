import type { Behaviour } from '$lib/components/BehaviourComponent'
import { BehaviourComponent } from '$lib/components/BehaviourComponent'
import { GRID_SIZE, snapToGrid } from '$lib/util'
import imgShadow from '$res/characters/shadow.png'
import { coroutine } from 'merlyn'

export interface CharacterArgs<T = Character> extends ex.ActorArgs {
  image: ex.ImageSource
  facing?: Direction
  shadow?: boolean

  behaviour?: Behaviour<T>[]
}

type Direction = 'up' | 'down' | 'left' | 'right'

export class Character extends ex.Actor {
  private _facing: Direction = 'down'

  anims: Record<'up' | 'down' | 'left' | 'right', ex.Animation>
  behaviour?: Behaviour<typeof this>[]

  constructor({
    image,
    facing = 'down',
    shadow = true,
    behaviour,
    ...args
  }: CharacterArgs) {
    super({
      anchor: new ex.Vector(7 / 32, 4 / 32),
      collisionType: ex.CollisionType.Active,
      collider: new ex.PolygonCollider({
        points: [
          new ex.Vector(0, 0),
          new ex.Vector(16, 0),
          new ex.Vector(16, 16),
          new ex.Vector(0, 16),
        ],
        offset: new ex.Vector(0, 16),
      }),
      ...args,
    })

    this.addComponent(new BehaviourComponent())

    // setup animations
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

    // add animations to self by key
    Object.entries(this.anims).forEach(([name, anim]) => {
      this.graphics.add(name, anim)
    })

    // draw shadow behind character
    if (shadow) {
      this.graphics.onPreDraw = (ctx) => {
        ctx.drawImage(imgShadow.image, -this.anchor.x * 32, -this.anchor.y * 32)
      }
    }

    this.on('initialize', () => {
      if (this.behaviour) {
        this.get(BehaviourComponent)?.execute(this.behaviour, true)
      }
    })
    // pause/play animation when standing/walking
    this.on('postupdate', () => {
      if (this.isMoving) {
        this.currentAnim.play()
      } else {
        this.currentAnim.goToFrame(0)
        this.currentAnim.pause()
      }
    })

    // force standing animation when walking against wall
    this.on('postcollision', () => {
      this.stop()
      this.currentAnim.goToFrame(0)
      this.currentAnim.pause()
    })

    this.facing = facing
    this.behaviour = behaviour
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

  isOnGrid(tolerance = 1) {
    return snapToGrid(this.pos).equals(this.pos, tolerance)
  }

  /**
   * Waits until character has finished moving onto tile then sets
   * velocity to 0
   */
  async stop() {
    // wait until character is on grid coordinate
    if (!this.isOnGrid()) {
      await coroutine(function* () {
        while (!this.isOnGrid()) {
          yield
        }
      }, this)
    }

    this.vel = new ex.Vector(0, 0)
    this.pos = snapToGrid(this.pos)
    this.emit('stop', undefined)
  }

  /**
   * Moves player in direction if possible. Prevents changing
   * direction mid-movement. If `options.tiles` is passed, promise
   * is resolved once movement is complete.
   *
   * @param options.speed - sets the speed of this movement
   * @param options.cancelable - allows this.stop() to cancel this movement
   */
  async moveDistance(
    direction: Direction,
    amount: number,
    options: { speed?: number; cancelable?: boolean } = {}
  ) {
    const { speed, cancelable } = options
    // walk until amount of tiles have been walked, then stop
    if (this.isMoving) {
      return
    }

    return coroutine(function* () {
      let stopped = false
      const xDir = direction === 'left' ? -1 : direction === 'right' ? 1 : 0
      const yDir = direction === 'up' ? -1 : direction === 'down' ? 1 : 0
      const distance = Math.floor(amount * GRID_SIZE)

      const target = snapToGrid(
        ex.vec(this.pos.x + xDir * distance, this.pos.y + yDir * distance)
      )

      const handleStop = () => {
        if (cancelable) {
          stopped = true
        }
      }

      this.on('stop', handleStop)

      while (!stopped && !this.pos.equals(target, 1)) {
        const ray = new ex.Ray(
          ex.vec(Math.abs(xDir * GRID_SIZE), Math.abs(yDir * GRID_SIZE)),
          ex.vec(Math.sign(xDir), Math.sign(yDir))
        )

        // this.scene.
        const collision = this.collider.get().rayCast(ray)
        console.log(ray, collision)

        if (!collision) {
          this.move(direction, speed)
        }
        yield
      }

      this.vel = new ex.Vector(0, 0)
      this.off('stop', handleStop)
    }, this)
  }

  move(direction: Direction, speed = 100) {
    this.facing = direction

    if (speed >= 100) {
      this.currentAnim.frameDuration = 100
    } else {
      this.currentAnim.frameDuration = 175
    }

    if (direction === 'up') {
      this.vel = new ex.Vector(0, -speed)
    } else if (direction === 'down') {
      this.vel = new ex.Vector(0, speed)
    } else if (direction === 'left') {
      this.vel = new ex.Vector(-speed, 0)
    } else if (direction === 'right') {
      this.vel = new ex.Vector(speed, 0)
    }
  }
}

import { engine } from '$game'
import image from '$res/sprites/player.png'
import { Engine, SpriteSheet } from 'excalibur'

const spriteSheet = SpriteSheet.fromImageSource({
  image,
  grid: {
    rows: 2,
    columns: 6,
    spriteWidth: 28,
    spriteHeight: 28,
  },
})

export default class Player extends ex.Actor {
  static resources = [image]

  spawnPoint: ex.Vector
  ANIM_SPEED = 100
  WALK_SPEED = 9
  JUMP_SPEED = 300

  touching = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  }
  flipX = false

  constructor(args: ex.ActorArgs) {
    const collider = ex.Shape.Box(12, 28, new ex.Vector(0.5, 0.5))
    super({
      collisionType: ex.CollisionType.Active,
      // collisionGroup: ex.CollisionGroupManager.groupByName('player'),
      collider,
      ...args,
      // offset y to account for collider
      y: args.y ? args.y - 1 - collider.bounds.height / 2 : 0,
    })
    this.spawnPoint = new ex.Vector(this.pos.x, this.pos.y)
  }

  onInitialize() {
    this.graphics.add(
      'run',
      ex.Animation.fromSpriteSheet(spriteSheet, [0, 1, 2, 3], this.ANIM_SPEED)
    )
    this.graphics.add(
      'run-shoot',
      ex.Animation.fromSpriteSheet(spriteSheet, [4, 5, 6, 7], this.ANIM_SPEED)
    )
    this.graphics.add(
      'idle',
      ex.Animation.fromSpriteSheet(spriteSheet, [8], this.ANIM_SPEED)
    )
    this.graphics.add(
      'idle-shoot',
      ex.Animation.fromSpriteSheet(spriteSheet, [9], this.ANIM_SPEED)
    )
    this.graphics.add(
      'jump',
      ex.Animation.fromSpriteSheet(spriteSheet, [10], this.ANIM_SPEED)
    )
    this.graphics.add(
      'jump-shoot',
      ex.Animation.fromSpriteSheet(spriteSheet, [10], this.ANIM_SPEED)
    )
    this.graphics.use('idle')

    this.on('postcollision', (ev) => this.onPostCollision(ev))
    this.on('precollision', (ev) => this.onPreCollision(ev))
    this.on('collisionend', (ev) => this.onCollisionEnd(ev))
  }

  onCollisionEnd(ev: ex.CollisionEndEvent) {
    if (ev.other?.name === 'solid') {
      this.touching.bottom = false
    }
  }

  onPreCollision(ev: ex.PreCollisionEvent) {}

  onPostCollision(ev: ex.PostCollisionEvent) {
    if (ev.side === ex.Side.Bottom) {
      this.touching.bottom = true
    } else if (ev.side === ex.Side.Left) {
      this.touching.left = true
    } else if (ev.side === ex.Side.Right) {
      this.touching.right = true
    } else if (ev.side === ex.Side.Top) {
      this.touching.top = true
    }

    // died
    if (ev.other.name === 'death') {
      this.pos = this.spawnPoint.clone()
    }

    // Bot has collided on the side, display hurt animation
    // if (
    //   (ev.side === ex.Side.Left || ev.side === ex.Side.Right) &&
    //   ev.other instanceof Baddie
    // ) {
    //   if (this.vel.x < 0 && !this.hurt) {
    //     this.graphics.use('hurtleft')
    //   }
    //   if (this.vel.x >= 0 && !this.hurt) {
    //     this.graphics.use('hurtright')
    //   }
    //   this.hurt = true
    //   this.hurtTime = 1000
    //   Resources.hit.play(0.1)
    // }
  }

  onPreUpdate(engine: ex.Engine, delta: number) {
    // Reset x velocity
    this.vel.x = 0

    // Player input
    if (engine.input.keyboard.isHeld(ex.Input.Keys.Left)) {
      this.vel.x = -this.WALK_SPEED * delta
      this.flipX = true
    }

    if (engine.input.keyboard.isHeld(ex.Input.Keys.Right)) {
      this.vel.x = this.WALK_SPEED * delta
      this.flipX = false
    }

    if (
      engine.input.keyboard.wasPressed(ex.Input.Keys.A) &&
      this.touching.bottom &&
      this.vel.y === 0
    ) {
      this.vel.y = -this.JUMP_SPEED
      this.touching.bottom = false
    } else if (
      engine.input.keyboard.wasReleased(ex.Input.Keys.Space) &&
      !this.touching.bottom &&
      this.vel.y < 0
    ) {
      this.vel.y = 0
    }
  }

  onPostUpdate(engine: Engine, delta: number): void {
    if (!this.touching.bottom) {
      this.graphics.use('jump')
    } else {
      if (this.vel.x !== 0) {
        this.graphics.use('run')
      } else {
        this.graphics.use('idle')
      }
    }

    this.graphics.current[0].graphic.flipHorizontal = this.flipX
    this.touching = {
      left: false,
      right: false,
      top: false,
      bottom: false,
    }
  }
}

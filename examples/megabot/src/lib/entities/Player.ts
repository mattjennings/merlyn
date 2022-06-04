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

  ANIM_SPEED = 100
  WALK_SPEED = 75
  JUMP_SPEED = 300

  onGround = true
  flipX = false

  constructor(args: ex.ActorArgs) {
    const collider = ex.Shape.Box(12, 28, new ex.Vector(0.5, 0.5))
    super({
      collisionType: ex.CollisionType.Active,
      // collisionGroup: ex.CollisionGroupManager.groupByName('player'),
      collider,
      ...args,
      // offset y to account for collider
      y: args.y ? args.y - collider.bounds.height / 2 : 0,
    })
  }

  onInitialize(engine: ex.Engine) {
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
    this.on('postcollision', (evt) => this.onPostCollision(evt))
  }

  onPostCollision(evt: ex.PostCollisionEvent) {
    // Bot has collided with it's Top of another collider
    // console.log(evt.other.name)
    if (evt.side === ex.Side.Bottom) {
      this.onGround = true
    }

    // Bot has collided on the side, display hurt animation
    // if (
    //   (evt.side === ex.Side.Left || evt.side === ex.Side.Right) &&
    //   evt.other instanceof Baddie
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
      this.vel.x = -this.WALK_SPEED
      this.flipX = true
    }

    if (engine.input.keyboard.isHeld(ex.Input.Keys.Right)) {
      this.vel.x = this.WALK_SPEED
      this.flipX = false
    }

    if (engine.input.keyboard.isHeld(ex.Input.Keys.Space) && this.onGround) {
      this.vel.y = -this.JUMP_SPEED
      this.onGround = false
    } else if (
      engine.input.keyboard.wasReleased(ex.Input.Keys.Space) &&
      !this.onGround &&
      this.vel.y < 0
    ) {
      this.vel.y = 0
    }
  }

  onPostUpdate(engine: Engine, delta: number): void {
    if (!this.onGround) {
      this.graphics.use('jump')
    } else {
      if (this.vel.x !== 0) {
        this.graphics.use('run')
      } else {
        this.graphics.use('idle')
      }
    }

    this.graphics.current[0].graphic.flipHorizontal = this.flipX
  }
}

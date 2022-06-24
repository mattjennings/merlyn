import { goToScene } from '$game'
import { TestTransition } from '$lib/transitions/TestTransition'
import { FadeTransition } from '@mattjennings/merlin'

export class Teleporter extends ex.Actor {
  goto: string
  constructor({ goto, ...args }: ex.ActorArgs & { goto: string }) {
    super({
      width: 16,
      height: 16,
      anchor: new ex.Vector(0, 0),
      ...args,
      // color: ex.Color.Red,
      collisionType: ex.CollisionType.Fixed,
    })
    this.goto = goto
  }

  onInitialize(engine: ex.Engine) {
    super.onInitialize(engine)
    this.on('collisionstart', (ev) => {
      if (ev.other.name === 'player') {
        goToScene(this.goto, {
          transition: new TestTransition({
            easing: (t: number) => {
              // easeInOutCubic
              return t < 0.5
                ? 4 * t * t * t
                : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
            },
          }),
        })
      }
    })
  }
}

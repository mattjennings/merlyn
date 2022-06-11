import { goToScene } from '$game'

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
        goToScene(this.goto)
      }
    })
  }
}

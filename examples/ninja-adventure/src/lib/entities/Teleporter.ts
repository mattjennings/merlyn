export class Teleporter extends ex.Actor {
  goto: string
  constructor({ goto, ...args }: ex.ActorArgs & { goto: string }) {
    super({
      ...args,
      width: 16,
      height: 8,
      anchor: new ex.Vector(0, 0),
      // color: ex.Color.Red,
      collisionType: ex.CollisionType.Passive,
    })
    this.goto = goto
  }

  onInitialize(engine: ex.Engine) {
    super.onInitialize(engine)
    this.on('collisionstart', (ev) => {
      if (ev.other.name === 'player') {
        engine.goToScene(this.goto)
      }
    })
  }
}

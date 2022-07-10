import * as ex from 'excalibur'

const blockSprite = $res('block.png').toSprite()

export class Floor extends ex.Actor {
  constructor(x: number, y: number, public cols: number, public rows: number) {
    super({
      name: 'Floor',
      pos: new ex.Vector(x, y),
      scale: new ex.Vector(2, 2),
      anchor: ex.Vector.Zero,
      collider: ex.Shape.Box(20 * cols, 15 * rows, ex.Vector.Zero),
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: ex.CollisionGroupManager.groupByName('floor'),
    })

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.graphics.show(blockSprite, {
          anchor: ex.Vector.Zero,
          offset: ex.vec(i * blockSprite.width, j * blockSprite.height),
        })
      }
    }
  }
}

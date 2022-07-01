import { Image } from './Image'

export interface MapArgs {
  lower: ex.ImageSource
  upper: ex.ImageSource
}

export class OverworldMap extends ex.Actor {
  constructor({ lower, upper }: MapArgs) {
    super({ x: 0, y: 0, anchor: ex.vec(0, 0) })

    const lowerMap = new Image({
      x: 0,
      y: 0,
      anchor: ex.vec(0, 0),
      src: lower,
      z: -100,
    })
    const upperMap = new Image({
      x: 0,
      y: 0,
      anchor: ex.vec(0, 0),
      src: upper,
      z: 100,
    })

    this.addChild(lowerMap)
    this.addChild(upperMap)
  }
}

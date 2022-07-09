import { ImageSource } from 'excalibur'

export class Image extends ex.Actor {
  constructor({ src, ...args }: ex.ActorArgs & { src: ImageSource }) {
    super(args)
    this.graphics.use(src.toSprite())
  }
}

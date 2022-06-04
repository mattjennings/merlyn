export default class TilingSprite extends ex.Actor {
  image: ex.ImageSource
  repeat: ex.Vector
  offset: ex.Vector

  constructor({
    image,
    repeat = new ex.Vector(1, 1),
    offset = new ex.Vector(0, 0),
    ...args
  }: ex.ActorArgs & {
    image: ex.ImageSource
    repeat?: ex.Vector
    offset?: ex.Vector
  }) {
    super({
      ...args,
      width: image.width * repeat.x,
      height: image.height * repeat.y,
    })

    this.image = image
    this.repeat = repeat
    this.offset = offset
  }

  onInitialize() {
    this.graphics.use(
      new ex.Canvas({
        cache: true,
        width: this.width,
        height: this.height,
        draw: (ctx) => {
          for (let x = 0; x < this.repeat.x; x++) {
            for (let y = 0; y < this.repeat.y; y++) {
              ctx.drawImage(
                this.image.data,
                0,
                0,
                this.image.width,
                this.image.height,
                this.offset.x + (this.pos.x + x * this.image.width),
                this.offset.y + (this.pos.y + y * this.image.height),
                this.image.width,
                this.image.height
              )
            }
          }
        },
      })
    )
  }
}

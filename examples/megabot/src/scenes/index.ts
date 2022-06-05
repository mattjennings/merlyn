import Player from '$lib/entities/Player'
import tilemap from '$res/tilemaps/bay-area/tilemap.tmx'
import imgBackground from '$res/tilemaps/bay-area/background.png'
import TilingSprite from '$lib/components/TilingSprite'

export default class Level1 extends ex.Scene {
  player?: Player

  objectMapping: Record<string, any> = {
    Player,
  }

  public onInitialize(engine: ex.Engine) {
    // tilemap
    tilemap.addTiledMapToScene(this)
    const tilemapWidth = tilemap.data.width * tilemap.data.tileWidth
    const tilemapHeight = tilemap.data.height * tilemap.data.tileHeight

    const layers = tilemap.data.getExcaliburObjects()

    for (const layer of layers) {
      for (const obj of layer.objects) {
        const props: Record<string, any> = obj.properties.reduce(
          (acc, prop) => {
            return { ...acc, [prop.name]: prop.value }
          },
          {}
        )

        if (props.class && this.objectMapping[props.class]) {
          const instance = new this.objectMapping[props.class]({
            ...props,
            x: obj.x,
            y: obj.y,
          })

          engine.add(instance)
        }
      }
    }

    // camera
    this.player = this.entities.find((e) => e instanceof Player) as Player
    this.camera.strategy.lockToActorAxis(this.player, ex.Axis.X)
    this.camera.strategy.limitCameraBounds(
      new ex.BoundingBox(0, 0, tilemapWidth, tilemapHeight)
    )

    // background
    const background = new TilingSprite({
      image: imgBackground,
      repeat: new ex.Vector(5, 1),
      pos: new ex.Vector(0, 0),
      anchor: new ex.Vector(0.25, 0.5),
      offset: new ex.Vector(0, 25),
      z: -100,
    })
    background.addComponent(new ex.ParallaxComponent(ex.vec(0.2, 0.1)))
    engine.add(background)

    this.on('preupdate', () => {
      // if (this.player?.pos.y > )
    })
  }
}

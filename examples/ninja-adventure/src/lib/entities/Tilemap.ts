import type { Engine } from 'excalibur'
import type {
  TiledMapResource,
  TiledObject,
  TiledObjectGroup,
} from '@excaliburjs/plugin-tiled'
import { Player } from '$lib/Player'
import { Teleporter } from './Teleporter'

export default class Tilemap extends ex.Entity {
  scene: ex.Scene
  resource: TiledMapResource

  constructor(resource: TiledMapResource, scene: ex.Scene) {
    super()
    this.resource = resource
    this.scene = scene
  }

  onInitialize(engine: Engine): void {
    this.resource.addTiledMapToScene(this.scene)

    const tilemapWidth = this.resource.data.width * this.resource.data.tileWidth
    const tilemapHeight =
      this.resource.data.height * this.resource.data.tileHeight

    const objectLayers = this.resource.data.getExcaliburObjects()

    for (const layer of objectLayers) {
      for (const object of layer.objects) {
        const props = object.properties.reduce(
          (acc, p) => ({ ...acc, [p.name]: p.value }),
          {}
        )

        const obj = this.createObject(object, layer, props)
        if (obj) {
          engine.add(obj)
          this.emit('object-created', obj)
        }
      }
    }

    // create world bounds
    engine.add(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        collider: new ex.CompositeCollider([
          new ex.EdgeCollider({
            begin: ex.vec(0, 0),
            end: ex.vec(0, tilemapHeight),
          }),
          new ex.EdgeCollider({
            begin: ex.vec(0, tilemapHeight),
            end: ex.vec(tilemapWidth, tilemapHeight),
          }),
          new ex.EdgeCollider({
            begin: ex.vec(tilemapWidth, tilemapHeight),
            end: ex.vec(tilemapWidth, 0),
          }),
          new ex.EdgeCollider({
            begin: ex.vec(tilemapWidth, 0),
            end: ex.vec(0, 0),
          }),
        ]),
      })
    )
  }

  createObject(
    object: TiledObject,
    layer: TiledObjectGroup,
    props?: any
  ): ex.Entity | undefined {
    switch (object.class) {
      case 'spawn':
        if (object.name === 'Player') {
          const player = new Player({
            x: object.x,
            y: object.y,
            z: layer.getProperty<number>('z')?.value,
            facing: props.facing,
          })
          return player
        }
        break
      case 'teleporter':
        return new Teleporter({
          x: object.x,
          y: object.y,
          scene: object.name!,
          coordinates: { x: props.x, y: props.y },
          facing: props.facing,
          width: object.width,
          height: object.height,
        })
    }
  }
}

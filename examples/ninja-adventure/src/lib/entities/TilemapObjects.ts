import type { Engine } from 'excalibur'
import type {
  TiledMapResource,
  TiledObject,
  TiledObjectGroup,
} from '@excaliburjs/plugin-tiled'
import { Player } from '$lib/Player'
import { Teleporter } from './Teleporter'

export default class TilemapObjects extends ex.Entity {
  scene: ex.Scene
  map: TiledMapResource

  constructor(map: TiledMapResource, scene: ex.Scene) {
    super()
    this.map = map
    this.scene = scene
  }

  onInitialize(engine: Engine): void {
    const objectLayers = this.map.data.getExcaliburObjects()

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

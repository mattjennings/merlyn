import Tilemap from '$lib/entities/Tilemap'
import tilemap from '$res/Tilemaps/world.tmx'
import { FadeTransition, Scene } from '@mattjennings/merlin'

export default class World extends Scene {
  getTransition(out: boolean) {
    return new FadeTransition({ out })
  }

  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap(tilemap, this))
  }
}

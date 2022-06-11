import Tilemap from '$lib/entities/Tilemap'
import tilemap from '$res/Tilemaps/world.tmx'

export default class World extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap(tilemap, this))
  }
}

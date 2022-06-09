import Tilemap from '$lib/entities/Tilemap'
import tilemap from '$res/Tilemaps/world.tmx'

export default class Main extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap(tilemap, this))
  }
}

import Tilemap from '$lib/entities/Tilemap'
import tilemap from '$res/Tilemaps/house1.tmx'

export default class House1 extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap(tilemap, this))
  }
}

import Tilemap from '$lib/entities/Tilemap'

export default class House1 extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap($res('Tilemaps/house1.tmx'), this))
  }
}

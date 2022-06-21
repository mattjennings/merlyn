import Tilemap from '$lib/entities/Tilemap'
import tilemap from '$res/Tilemaps/house1.tmx'
import { Scene } from '@mattjennings/merlin'

export default class House1 extends Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap(tilemap, this))
  }
}

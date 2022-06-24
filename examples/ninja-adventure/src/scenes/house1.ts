import Tilemap from '$lib/entities/Tilemap'
import { TestTransition } from '$lib/transitions/TestTransition'
import tilemap from '$res/Tilemaps/house1.tmx'
import { Scene } from 'merlyn'

export default class House1 extends Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap(tilemap, this))
  }
}

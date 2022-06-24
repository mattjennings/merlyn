import Tilemap from '$lib/entities/Tilemap'
import tilemap from '$res/Tilemaps/world.tmx'
import { FadeTransition, Scene } from '@mattjennings/merlin'

export default class World extends Scene {
  transition() {
    return new FadeTransition()
  }

  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap(tilemap, this))
  }

  onIntro(progress: number) {}

  onOutro(progress: number) {}
}

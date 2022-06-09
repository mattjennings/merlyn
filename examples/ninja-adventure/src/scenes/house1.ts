import Tilemap from '$lib/entities/Tilemap'
import tilemap from '$res/Tilemaps/house1.tmx'
import { engine, resources } from '$game'
import { SimpleLoader } from '@mattjennings/merlin'

export default class House1 extends ex.Scene {
  onInitialize(engine: ex.Engine) {
    engine.add(new Tilemap(tilemap, this))
  }
}

if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    engine.removeScene('house1')
    engine.addScene('house1', new mod.default())
    engine.start(new SimpleLoader(resources)).then(() => {
      engine.goToScene('house1')
    })
  })
}

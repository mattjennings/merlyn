import Player from '$lib/entities/Player'
import tilemap from '$res/tilemaps/bay-area/tilemap.tmx'

export default class Level1 extends ex.Scene {
  public onInitialize(engine: ex.Engine) {
    tilemap.addTiledMapToScene(this)

    engine.add(new Player(50, 50))
  }
}

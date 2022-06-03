import * as tiled from '@excaliburjs/plugin-tiled'
import map from '$assets/tilemaps/bay-area/tilemap.tmx'
import Player from '$lib/entities/Player'

const tilemap = new tiled.TiledMapResource(map)

export const resources = [tilemap, ...Player.resources]
export default class Level1 extends ex.Scene {
  public onInitialize(engine: ex.Engine) {
    tilemap.addTiledMapToScene(this)

    engine.add(new Player(50, 50))
  }
}

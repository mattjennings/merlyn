import * as tiled from '@excaliburjs/plugin-tiled'
import map from '$assets/tilemaps/bay-area/tilemap.tmx'

const tilemap = new tiled.TiledMapResource(map)

export const resources = [tilemap]
export default class Level1 extends ex.Scene {
  public onInitialize() {
    tilemap.addTiledMapToScene(this)
  }
}

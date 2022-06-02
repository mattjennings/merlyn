import * as tiled from '@excaliburjs/plugin-tiled'
import map from '$assets/tilemaps/bay-area/tilemap.tmx'
import Scene from '$lib/util/Scene'

export default class Level1 extends Scene {
  tilemap = new tiled.TiledMapResource(map)
  resources = [this.tilemap]

  public onLoaded() {
    this.tilemap.addTiledMapToScene(this)
  }
}

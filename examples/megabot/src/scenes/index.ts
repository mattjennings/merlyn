import * as tiled from '@excaliburjs/plugin-tiled'
import map from '$assets/tilemaps/bay-area/tilemap.tmx'
import { Scene } from 'merlin'

const tilemap = new tiled.TiledMapResource(map)
export const resources = [tilemap]
export default class Level1 extends Scene {
  public onLoaded() {
    tilemap.addTiledMapToScene(this)
  }
}

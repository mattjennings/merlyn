import { Engine } from 'excalibur'
import type { Manifest } from '../cli/util/types'
import { Router } from './router'
export {
  addResource,
  addResourceLoaders,
  getResources,
  loader,
} from './resources'
// import { DevTool } from '@excaliburjs/dev-tools'
// export let devtool: DevTool

let router: Router

export let engine: Engine

export async function _start(manifest: Manifest) {
  engine = manifest.game

  router = new Router(manifest)
}

export async function goToScene(key: string, params?: any) {
  return router.goToScene(key, params)
}

export async function getCurrentScene() {
  return router.getCurrentScene()
}

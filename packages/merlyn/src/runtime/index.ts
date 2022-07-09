import type { Engine } from 'excalibur'
import type { Manifest } from '../vite/core/types.js'
import { Router } from './router.js'
export {
  addResource,
  addResourceLoaders,
  getResources,
  loader,
} from './resources.js'
export { isBooting, isTransitioning } from './router.js'

// import { DevTool } from '@excaliburjs/dev-tools'
// export let devtool: DevTool

let router: Router

export let engine: Engine

export async function start(manifest: Manifest) {
  engine = manifest.game

  router = new Router(manifest)
}

export async function goToScene(key: string, params?: any) {
  return router.goToScene(key, params)
}

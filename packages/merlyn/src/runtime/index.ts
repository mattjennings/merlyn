import type { Engine } from 'excalibur'
import { WebAudio } from 'excalibur'
import type { Manifest } from '../vite/core/data/manifest.js'
import { Router } from './router.js'
export {
  addResource,
  addResourceLoaders,
  getResources,
  loader,
} from './resources.js'
export { isBooting, isTransitioning } from './router.js'

import { DevTool } from '@excaliburjs/dev-tools'
export let devtool: DevTool

let router: Router

export let engine: Engine
export let title

export async function start(manifest: Manifest) {
  engine = manifest.game
  title = manifest.title

  if (manifest.devtool?.enabled) {
    devtool = new DevTool(engine)
  }
  router = new Router(manifest)
}

export async function goToScene(key: string, params?: any) {
  return router.goToScene(key, params)
}

window.addEventListener('pointerdown', () => {
  WebAudio.unlock()
})

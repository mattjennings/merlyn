import type { Engine } from 'excalibur'
import { WebAudio } from 'excalibur'
import type { Manifest } from '../vite/core/data/manifest.js'
import { Router } from 'excalibur-router'
import { DevTool } from '@excaliburjs/dev-tools'

export let devtool: DevTool
export let router: Router<any, any>
export let engine: Engine
export let title

export {
  queuedResources,
  addResourceByUrl,
  addResourceLoader,
} from './resources.js'

export async function start(manifest: Manifest) {
  engine = manifest.game
  title = manifest.title

  if (manifest.devtool?.enabled) {
    devtool = new DevTool(engine)
  }

  router = new Router({
    routes: manifest.scenes.files,
    loaders: manifest.loaders.files,
  })

  // load resources needed for loading scenes if necessary
  if (manifest.loaders.resources.length) {
    router.addResource(manifest.loaders.resources)
    // @ts-ignore
    await router.resourceLoader.load()
  }

  router.start(engine).then(() => {
    const loader = 'boot' in manifest.loaders.files ? 'boot' : 'default'

    router.goto(manifest.scenes.boot, {
      loader,
      transition: manifest.transition,
    })
  })
}

window.addEventListener('pointerdown', () => {
  WebAudio.unlock()
})

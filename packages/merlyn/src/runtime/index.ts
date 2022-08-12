import type { Engine } from 'excalibur'
import { WebAudio } from 'excalibur'
import type { Manifest } from '../vite/core/data/manifest.js'
import { FadeTransition, Router } from 'excalibur-router'
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

  if (manifest.debug) {
    if (manifest.debug.show) {
      engine.showDebug(true)
    }
    if (manifest.debug.devtool) {
      devtool = new DevTool(engine)
    }
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
      transition: manifest.transition ?? new FadeTransition(),
    })

    if (manifest.pauseWhenBackgrounded) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          engine.stop()
        } else {
          /**
           * wrapping in raf fixes(?) an issue with 120hz displays where
           * update loops would seem to get doubled up on each resume.
           *
           * - observed on a macbook with promotion display
           * - Chrome/FF only (safari is locked to 60hz for whatever reason)
           * - on FF, would only happen if promotion was enabled.
           * - on Chrome, would happen regardless if promotion was enabled.
           */
          requestAnimationFrame(() => {
            engine.start()
          })
        }
      })
    }
  })
}

window.addEventListener('pointerdown', () => {
  WebAudio.unlock()
})

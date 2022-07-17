import type { Engine } from 'excalibur'
import { WebAudio } from 'excalibur'
import type { Manifest } from '../vite/core/data/manifest.js'
import { Router } from 'excalibur-router'
import { loader } from './resources.js'
export {
  addResource,
  addResourceLoaders,
  getResources,
  loader,
} from './resources.js'

import { DevTool } from '@excaliburjs/dev-tools'
export let devtool: DevTool

export let router: Router<any, any>

export let engine: Engine
export let title

export async function start(manifest: Manifest) {
  engine = manifest.game
  title = manifest.title

  if (manifest.devtool?.enabled) {
    devtool = new DevTool(engine)
  }

  const routes = Object.entries(manifest.scenes.files).reduce(
    (acc, [key, { scene }]) => {
      if (!key.startsWith('loading')) {
        acc[key] = scene
      }
      return acc
    },
    {}
  ) as any

  const loaders = Object.entries(manifest.scenes.files).reduce(
    (acc, [key, { scene }]) => {
      if (key.startsWith('loading')) {
        acc[key] = scene
      }
      return acc
    },
    {}
  ) as any

  router = new Router(engine, {
    routes,
    loaders,
    defaultLoader: manifest.scenes.loading.default,
  })

  // @ts-ignore
  router.loader = loader

  router.addResources(manifest.scenes.loading.resources)

  engine.start().then(() => {
    router.goto(manifest.scenes.boot)
  })
}

export const goToScene = (...args) => router.goto.call(router, ...args)

window.addEventListener('pointerdown', () => {
  WebAudio.unlock()
})

import type { Loadable } from 'excalibur'
import { GameEvent } from 'excalibur'
import { Class } from 'excalibur'

/**
 * The loader responsible for loading all resources for the game. It does
 * not render anything. Instead, it can be listened to for custom loading
 * scenes.
 */
export class Loader extends Class implements Loadable<Loadable<any>[]> {
  data: Loadable<any>[] = []

  constructor(loadables?: any[]) {
    super()
    this.addResources(loadables ?? [])
  }

  async load(resources = this.data) {
    let numLoaded = 0

    this.emit('start', resources)
    this.emit('progress', new ProgressEvent(this, 0))

    await Promise.all(
      resources.map(async (r) => {
        if (!r.isLoaded()) {
          await r.load().finally(() => {
            numLoaded++
            this.emit(
              'progress',
              new ProgressEvent(this, (numLoaded / resources.length) * 100)
            )
          })
        }
      })
    )
    this.emit('complete', resources)

    return resources
  }

  addResources(loadables: any[]) {
    this.data.push(...loadables.filter((l) => !l.isLoaded()))
  }

  isLoaded() {
    return this.data.every((r) => r.isLoaded())
  }

  // stub methods for compatibility with ex.Loader.
  // this is hacky, but we dont want to draw anything as the loader
  canvas = { draw() {} }
  wireEngine() {}
  update() {}
  draw() {}
}

class ProgressEvent extends GameEvent<Loader> {
  progress: number

  constructor(target: Loader, progress: number) {
    super()
    this.target = target
    this.progress = progress
  }
}

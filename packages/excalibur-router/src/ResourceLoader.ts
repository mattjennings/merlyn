import type { Loadable } from 'excalibur'
import { GameEvent } from 'excalibur'
import { Class } from 'excalibur'

/**
 * The loader responsible for loading all resources for the router. It does
 * not render anything. Instead, it can be listened to for custom loading
 * scenes.
 */
export class ResourceLoader extends Class implements Loadable<Loadable<any>[]> {
  data: Loadable<any>[] = []

  constructor(loadables?: any[]) {
    super()
    this.addResources(loadables ?? [])
  }

  async load() {
    let numLoaded = 0
    const resources = this.data.filter((r) => !r.isLoaded())

    this.emit('start', resources)
    this.emit('progress', new ProgressEvent(this, 0))

    const result = await Promise.all(
      resources.map((r) =>
        r.load().finally(() => {
          numLoaded++
          this.emit(
            'progress',
            new ProgressEvent(this, (numLoaded / resources.length) * 100)
          )
        })
      )
    )
    this.emit('progress', new ProgressEvent(this, 100))
    this.emit('complete', resources)
    return result
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

class ProgressEvent extends GameEvent<ResourceLoader> {
  progress: number

  constructor(target: ResourceLoader, progress: number) {
    super()
    this.target = target
    this.progress = progress
  }
}

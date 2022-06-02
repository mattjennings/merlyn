import { Loader } from 'excalibur'

export default class SimpleLoader extends Loader {
  private loadables: any[]
  private numLoaded = 0

  constructor(loadables?: any[]) {
    super()
    this.loadables = loadables ?? []
    this.numLoaded =
      loadables?.reduce((acc, cur) => acc + (cur.isLoaded() ? 1 : 0), 0) ?? 0
  }

  async load() {
    return Promise.all(
      this.loadables.map((r) =>
        r.load().finally(() => {
          this.numLoaded++
          this.emit('progress', (this.numLoaded / this.loadables.length) * 100)
        })
      )
    )
  }

  isLoaded(): boolean {
    return this.numLoaded === this.loadables.length
  }
}

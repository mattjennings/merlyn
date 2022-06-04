import * as ex from 'excalibur'
/**
 * A loader that does not render anything. This can be used to render an HTML UI instead,
 * by listening to its `on('progress')` and on('complete')` events.
 */
export class SimpleLoader extends ex.Loader {
  constructor(loadables?: any[]) {
    super()
    this.addResources(loadables ?? [])
    // @ts-ignore
    this.numLoaded =
      loadables?.reduce((acc, cur) => acc + (cur.isLoaded() ? 1 : 0), 0) ?? 0
  }

  async load() {
    const res = await Promise.all(
      // @ts-ignore
      this._resourceList.map((r) =>
        r.load().finally(() => {
          // @ts-ignore
          this._numLoaded++
          this.emit(
            'progress',
            // @ts-ignore
            (this._numLoaded / this._resourceList.length) * 100
          )
        })
      )
    )
    this.emit('complete', void 0)
    return res
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  draw() {}
}

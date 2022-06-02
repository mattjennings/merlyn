import { Loadable, Loader } from 'excalibur'

export default class LoadingScreen extends Loader {
  public async load(): Promise<Loadable<any>[]> {
    await Promise.all(
      // @ts-ignore
      this._resourceList.map((r) =>
        r.load().finally(() => {
          // capture progress
          // @ts-ignore
          this._numLoaded++
          this.canvas.flagDirty()
        })
      )
    )

    // @ts-ignore
    this._isLoadedResolve()

    this.canvas.flagDirty()

    // @ts-ignore
    return (this.data = this._resourceList)
  }
}

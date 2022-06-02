/* eslint-disable @typescript-eslint/no-empty-function */
import { SvelteComponent } from 'svelte'
import { Loader, Scene as ExScene } from 'excalibur'

export class Scene extends ExScene {
  loadingUi?: SvelteComponent
  loader?: Loader

  constructor({ loader }: { loader: Loader }) {
    super()
    this.loader = loader
  }
  public onInitialize(engine: ex.Engine) {
    if (this.loader && !this.loader.isLoaded()) {
      this.onLoad()
    }

    engine.start(this.loader).then(() => {
      this.onLoaded()
    })
  }

  public onLoad() {}
  public onLoaded() {}
}

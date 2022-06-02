import LoadingScreen from '$lib/ui/LoadingScreen.svelte'
import { SvelteComponent } from 'svelte'
import SimpleLoader from './SimpleLoader'
import { outroAndDestroy } from './svelte'

export default class Scene extends ex.Scene {
  resources?: any[]
  loadingUi?: SvelteComponent
  loader?: SimpleLoader

  public onInitialize(engine: ex.Engine) {
    this.loader = new SimpleLoader(this.resources)

    if (!this.loader.isLoaded()) {
      this.loadingUi = new LoadingScreen({
        target: document.querySelector('#ui')!,
        props: {
          loader: this.loader,
        },
      })
    }
    engine.start(this.loader).then(() => {
      outroAndDestroy(this.loadingUi, 1000)

      this.onLoaded()
    })
  }

  public onLoaded() {}
}

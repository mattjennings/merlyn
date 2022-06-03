import LoadingScreen from '$lib/ui/LoadingScreen.svelte'
import { LoadingScene } from 'merlin'
import { SvelteComponent } from 'svelte'
import { outroAndDestroy } from '$lib/util/svelte'

export default class Loading extends LoadingScene {
  loadingUi?: SvelteComponent

  public onLoadStart() {
    super.onLoadStart()

    if (import.meta.env.PROD) {
      this.loadingUi = new LoadingScreen({
        target: document.querySelector('#ui')!,
        props: {
          loader: this.loader,
        },
        intro: true,
      })
    }
  }

  public onLoadComplete() {
    super.onLoadComplete()
    if (import.meta.env.PROD) {
      outroAndDestroy(this.loadingUi, 1000)
    }
  }
}

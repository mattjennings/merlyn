import LoadingScreen from '$lib/ui/LoadingScreen.svelte'
import { LoadingScene } from 'merlin'
import { SvelteComponent } from 'svelte'
import { outroAndDestroy } from '$lib/util/svelte'

export default class Loading extends LoadingScene {
  loadingUi?: SvelteComponent

  public onLoadStart() {
    super.onLoadStart()
    this.loadingUi = new LoadingScreen({
      target: document.querySelector('#ui')!,
      props: {
        loader: this.loader,
      },
      intro: true,
    })
  }

  public onLoadComplete() {
    super.onLoadComplete()
    outroAndDestroy(this.loadingUi, 1000)
  }
}

import LoadingScreen from '$lib/ui/LoadingScreen.svelte'
import { SimpleLoader } from 'merlin'
import { SvelteComponent } from 'svelte'
import { outroAndDestroy } from '$lib/util/svelte'

export default class SvelteLoader extends SimpleLoader {
  loadingUi?: SvelteComponent

  constructor(resources: any[]) {
    super(resources)

    if (!this.isLoaded()) {
      this.loadingUi = new LoadingScreen({
        target: document.querySelector('#ui')!,
        props: {
          loader: this,
        },
      })

      this.on('complete', () => {
        outroAndDestroy(this.loadingUi, 1000)
      })
    }
  }
}

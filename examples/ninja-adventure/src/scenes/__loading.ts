import LoadingSvelte from '$lib/ui/Loading.svelte'
import { SvelteUI } from '$lib/ui/SvelteUI'

export default class Loading extends ex.Scene {
  svelte!: SvelteUI

  onActivate() {
    this.svelte = new SvelteUI({
      component: LoadingSvelte,
    })
    this.engine.add(this.svelte)
  }

  onDeactivate() {
    this.svelte.kill()
  }
}

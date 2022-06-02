import type { SvelteComponent } from 'svelte'
import { check_outros, group_outros, transition_out } from 'svelte/internal'

// Workaround for https://github.com/sveltejs/svelte/issues/4056
export const outroAndDestroy = (instance?: SvelteComponent, delay?: number) => {
  const destroy = () => {
    // @ts-ignore
    if (instance?.$$.fragment && instance.$$.fragment.o) {
      group_outros()
      transition_out(instance.$$.fragment, 0, 0, () => {
        instance.$destroy()
      })
      check_outros()
    } else {
      instance?.$destroy()
    }
  }

  if (delay) {
    setTimeout(() => {
      destroy()
    }, delay)
  } else {
    destroy()
  }
}

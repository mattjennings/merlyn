import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import merlyn from 'merlyn/vite'

export default {
  plugins: [
    merlyn(),
    svelte({
      preprocess: sveltePreprocess(),
    }),
  ],
}

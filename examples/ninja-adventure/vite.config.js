import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

export default {
  resolve: {
    // preserveSymlinks: true,
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
    }),
  ],
}

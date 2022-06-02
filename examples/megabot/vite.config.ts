import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import sveltePreprocess from 'svelte-preprocess'

export default defineConfig({
  resolve: {
    extensions: ['.js', '.ts', '.svelte', '.json'],
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
    }),
  ],
})

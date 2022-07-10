import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import sveltePreprocess from 'svelte-preprocess'
import merlyn from 'merlyn/vite'

export default defineConfig({
  resolve: {
    extensions: ['.js', '.ts', '.svelte', '.json'],
  },
  plugins: [
    merlyn(),
    svelte({
      preprocess: sveltePreprocess(),
    }),
  ],
})

# Merlin

A meta framework for creating [Excalibur.js games](https://excaliburjs.com). Like Next.js to React, or SvelteKit to Svelte.

This is still in the very early stages. It is not published yet and may not ever be published.

## Features

- Built on Vite
- File-based routing for scenes
  - `src/scenes/level1.ts` -> a scene named `level1`
- Resources are imported as Excalibur resources

  ```js
  // equivalent to new ex.ImageSource(require('$res/player.png'))
  import image from '$res/player.png'

  const sprite = image.toSprite()
  ```

- Imported resources are automatically loaded

## Development

This is a monorepo that uses pnpm.

```
pnpm install
cd packages/merlin
pnpm run dev
```

In another terminal, you can go to the examples and run `pnpm run dev`

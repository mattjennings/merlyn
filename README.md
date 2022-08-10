# Merlyn

A meta framework for creating [Excalibur.js games](https://excaliburjs.com). Like Next.js to React, or SvelteKit to Svelte.

This is still in the very early stages. There are no docs and everything is subject to change and break frequently. Use at your own risk.

## Features

- File-based routing for scenes
  - `src/scenes/level1.ts` -> a scene named `level1`
- Loaders are implemented as Scenes
  - this allows you to use actors and other Excalibur objects in your loading screens
- Automatic resource loading. Loader will be populated and loaded when Scene is navigated to.

  ```js
  // equivalent to ex.ImageSource('/player.png')
  const sprite = $res('/player.png').toSprite()
  actor.graphics.use(sprite)

  // can safely be used inline
  $res('/jump.mp3').play()

  // asset can be referenced inline multiple times - it will only be loaded once
  $res('/jump.mp3').play(0.5)
  ```

## Development

This is a monorepo that uses pnpm.

```
pnpm install
cd packages/merlyn
pnpm run dev
```

In another terminal, you can go to the examples and run `pnpm run dev`

## Contributing

Unless you are willing to contribute, please refrain from creating issues as this is not ready for general usage. I am still exploring what this framework can/will do, and in order to get this to a usable state I am focusing on my own needs for this project for now.

## Credits

Merlyn is heavily inspired by [SvelteKit](https://kit.svelte.dev) (in fact, it originally began as a fork of it). As such, some of its code was copied and used. You can find the license for SvelteKit [here](/LICENSE/LICENSE-SvelteKit).

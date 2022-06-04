# Merlin

A meta framework for creating [Excalibur.js game](https://excaliburjs.com). Like a Next.js to your React, or a SvelteKit to your Svelte.

_This is not published yet_

## Features

- Built on Vite
- File-based scene routing
- Resources are imported as Excalibur resources

  ```js
  import image from '$res/player.png'

  const sprite = image.toSprite()
  ```

- Imported resources are automatically loaded

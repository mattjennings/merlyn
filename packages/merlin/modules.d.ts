declare module '$game' {
  import type { Devtool } from '@excaliburjs/dev-tools'
  import type { Engine, Loadable } from 'excalibur'

  export function addResource<T extends Loadable>(url: string, options?: any): T
  export function addResourceLoaders(
    loaders: Record<string, (url: string) => Loadable<any>>
  )
  export const engine: Engine
  export const devtool: Devtool
}

/* -------------------------------------------------------------------------- */
/*                             resource extensions                            */
/* -------------------------------------------------------------------------- */
declare module '$res/*.tmx' {
  import type { TiledMapResource } from '@excaliburjs/plugin-tiled'
  const value: TiledMapResource
  export default value
}
declare module '$res/*.png' {
  const value: Excalibur.ImageSource
  export default value
}
declare module '$res/*.jpeg' {
  const value: Excalibur.ImageSource
  export default value
}
declare module '$res/*.jpg' {
  const value: Excalibur.ImageSource
  export default value
}
declare module '$res/*.gif' {
  const value: Excalibur.ImageSource
  export default value
}
declare module '$res/*.mp3' {
  const value: Excalibur.Sound
  export default value
}
declare module '$res/*.ogg' {
  const value: Excalibur.Sound
  export default value
}
declare module '$res/*.wav' {
  const value: Excalibur.Sound
  export default value
}

// fallback to any for unknown resource
declare module '$res/*'

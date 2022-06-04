import type * as Excalibur from 'excalibur'
import type { TiledMapResource } from '@excaliburjs/plugin-tiled'

declare global {
  const ex: typeof Excalibur

  /* -------------------------------------------------------------------------- */
  /*                          resource file extensions                          */
  /* -------------------------------------------------------------------------- */
  declare module '$res/*.tmx' {
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
}

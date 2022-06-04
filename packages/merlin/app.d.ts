import type * as Excalibur from 'excalibur'

declare global {
  declare module '*.tmx'
  declare module '*.png'
  declare module '*.jpeg'
  declare module '*.jpg'
  declare module '$res*'

  const ex: typeof Excalibur
}

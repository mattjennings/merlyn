import type * as Excalibur from 'excalibur'

declare global {
  declare module '*.tmx'
  declare module '*.png'
  declare module '*.jpeg'
  declare module '*.jpg'
  const ex: typeof Excalibur
}

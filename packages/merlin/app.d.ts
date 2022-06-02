import type * as Excalibur from 'excalibur'

declare global {
  declare module '*.tmx'
  const ex: typeof Excalibur
}

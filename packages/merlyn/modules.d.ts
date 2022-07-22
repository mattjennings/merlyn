declare module '$game' {
  import type { Devtool } from '@excaliburjs/dev-tools'
  import type { Engine, Loadable } from 'excalibur'
  import type { Loader } from 'merlyn'

  export const engine: Engine
  export const loader: Loader
  export const title: string

  export const isBooting: boolean
  export const isTransitioning: boolean

  export function addResourceLoader<Options extends { as?: string }, T>(
    type: string,
    args: {
      load: (url: string, options?: Options) => Loadable<T>
      extensions?: string[]
    }
  )

  export const devtool: Devtool
}

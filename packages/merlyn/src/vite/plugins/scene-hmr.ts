import type { Plugin } from 'vite'
import { default as MagicString } from 'magic-string'
import type { MerlynConfig } from '../core/config.js'
import { loadConfig } from '../core/config.js'
import { getRouteName } from '../core/utils/index.js'

/**
 * A very bare-bones HMR plugin for scenes. Will HMR scenes that aren't the currentScene.
 * If it is the currentScene, the game will nagivate to the boot scene but keep resources
 * loaded, so time is saved there.
 */
export function sceneHmr(): Plugin {
  let merlynConfig: MerlynConfig
  return {
    name: 'vite-plugin-scene-hmr',
    apply: 'serve',
    async config(config, env) {
      merlynConfig = await loadConfig({ dev: env.mode === 'development' })
    },
    transform(code, id, options) {
      if (options?.ssr || id.includes('node_modules')) return

      const isScene = (id) => {
        return id.includes(merlynConfig.scenes.path) && id.match(/\.(t|j)s$/)
      }

      if (isScene(id)) {
        const name = getRouteName(id, merlynConfig.scenes.path)
        const s = new MagicString(code)

        s.append(/* js */ `
          import { router as __router } from '$game'
          import { Scene as __Scene } from 'excalibur'

          if (import.meta.hot) {            
            let gotoOptions = {}

            __router.on('navigation', ({ to, ...options }) => {
              if (to === ${JSON.stringify(name)}) {
                gotoOptions = { ...options }
                delete gotoOptions.transition
              }
            })

            import.meta.hot.accept((mod) => {
              if (mod) {
                const currentRoute = __router.location.name
                const name = ${JSON.stringify(name)}

                __router.removeRoute(name)
                __router.addRoute(name, mod.default)

                if (currentRoute === name) {
                  __router.addRoute('__hmr__', ex.Scene)
                  __router.goto('__hmr__').then(() => {
                      console.info('[HMR] Restarting current scene')
                      if (!import.meta.hot.warned && (gotoOptions.data || gotoOptions.onActivate)) {
                        console.warn('[HMR] "${name}" was navigated to with "data" or "onActivate" which cannot be hot reloaded. Data/onActivate may be stale.')
                        import.meta.hot.warned = true
                      }

                      __router.removeRoute('__hmr__')
                      __router.goto(name, gotoOptions)                    
                  })
                }             
              }
            })
          }
        `)

        return {
          code: s.toString(),
          map: s
            .generateMap({
              source: id,
              file: id + '.map',
              includeContent: true,
            })
            .toString(),
        }
      }
    },
  }
}
export {}

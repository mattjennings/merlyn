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
            let warned = {
              onActivate: false,
              data: false,
            }
            import.meta.hot.accept((mod) => {
              if (mod) {
                const currentRoute = __router.location.name
                const name = ${JSON.stringify(name)}

                __router.removeRoute(name)
                __router.addRoute(name, mod.default)

                if (currentRoute === name) {
                  __router.addRoute('__hmr__', ex.Scene)
                  __router.goto('__hmr__').then(() => {
                      __router.removeRoute('__hmr__')

                      if (gotoOptions.onActivate) {
                        if (!warned.onActivate) {
                          console.warn('Current scene "${name}" was navigated to with "onActivate" in router.goto(). HMR currently does not support this, navigating back to boot scene')
                          warned.onActivate = true
                        }
                        __router.goto(${JSON.stringify(
                          merlynConfig.scenes.boot
                        )})
                      } else {
                        if (gotoOptions.data && !warned.data) {
                          console.warn('Current scene "${name}" was navigated to with "data" in router.goto(). If it contains any non-serializable data, such as a class instance, it will be stale.')
                          warned.data = true
                        }
                        __router.removeRoute('__hmr__')
                        __router.goto(name, {
                          data: gotoOptions.data
                        })
                    }
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

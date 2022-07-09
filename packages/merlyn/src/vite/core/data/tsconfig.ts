import dedent from 'dedent'
import type { MerlynConfig } from '../types.js'
import { writeIfChanged } from '../utils/index.js'

export function writeTsconfig(dir: string, config: MerlynConfig) {
  writeIfChanged(`${dir}/tsconfig.json`, tsconfig(dir, config))
}

function tsconfig(dir: string, config: MerlynConfig) {
  return dedent(/* json */ `
    {
      "include": [
        "../src/**/*.js",
        "../src/**/*.ts",
        "./types.d.ts"
      ],
      "exclude": [
        "../node_modules/**",
      ],
      "compilerOptions": {
        "types": ["merlyn/types"],
        "baseUrl": "..",
        "paths": {
          "$lib": [
            "src/lib"
          ],
          "$lib/*": [
            "src/lib/*"
          ],
          "$res/*": ["./res/*"]
        },
        "rootDirs": [
          "..",
          "./types"
        ],
        "importsNotUsedAsValues": "error",
        "isolatedModules": true,
        "preserveValueImports": true,
        "lib": [
          "esnext",
          "DOM"
        ],
        "moduleResolution": "node",
        "module": "esnext",
        "target": "esnext"
      }
    }
  `)
}

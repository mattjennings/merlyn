import type { MerlynConfig } from '../config.js'
import { writeIfChanged } from '../utils/index.js'
import { format } from 'prettier'
import path from 'path'

export function writeTsconfig(
  cwd: string,
  outDir: string,
  config: MerlynConfig
) {
  writeIfChanged(path.join(cwd, `${outDir}/tsconfig.json`), tsconfig(), true)
}

function tsconfig() {
  return format(
    /* json */ `
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
  `,
    { parser: 'json' }
  )
}

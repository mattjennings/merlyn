import dedent from 'dedent'
import { writeIfChanged } from '../utils/index.js'

export function writeEntry(dir: string) {
  writeIfChanged(`${dir}/index.js`, entry())
}

function entry() {
  return dedent(/* js */ `
    import * as manifest from './manifest.js' 
    import { start }from 'merlyn/runtime'
    
    start(manifest)
  `)
}

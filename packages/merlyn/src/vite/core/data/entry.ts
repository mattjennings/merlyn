import dedent from 'dedent'
import { writeIfChanged } from '../utils'

export function writeEntry(dir: string) {
  writeIfChanged(`${dir}/index.js`, entry())
}

function entry() {
  return dedent(/* js */ `
    import * as manifest from './manifest.js' 
    import * as runtime from './runtime'
    
    runtime._start(manifest)
  `)
}

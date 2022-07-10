import { writeIfChanged } from '../utils/index.js'
import { format } from 'prettier'
import path from 'path'

export function writeEntry(cwd: string, outDir: string) {
  writeIfChanged(
    path.join(cwd, `${outDir}/index.js`),
    format(entry(), { parser: 'babel' })
  )
}

function entry() {
  return /* js */ `
    import * as manifest from './manifest.js' 
    import { start }from 'merlyn/runtime'
    
    start(manifest)
  `
}

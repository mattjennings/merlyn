import fs from 'fs'
import kleur from 'kleur'
import polka from 'polka'
import sirv from 'sirv'
import { getMerlinConfig } from '../config'

export default async function preview({
  cwd = process.cwd(),
  port = 3000,
} = {}) {
  const {
    build: { outDir },
  } = await getMerlinConfig({ cwd })

  if (!fs.existsSync(outDir)) {
    console.error(
      kleur.red(
        `${outDir} folder does not exist - please run "merlin build" first`
      )
    )
    process.exit(1)
  }

  polka()
    .use(sirv(outDir))
    .listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on localhost:${port}!`)
    })
}

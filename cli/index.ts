import sade from 'sade'
import dev from './commands/dev'
import preview from './commands/preview'
import build from './commands/build'
const prog = sade('merlyn')

prog.version('0.0.1')

prog.command('dev').option('--port, -p', 'Port to listen on').action(dev)

prog.command('build').action(build)
prog
  .command('preview')
  .option('--port, -p', 'Port to listen on')
  .action(preview)

prog.parse(process.argv)

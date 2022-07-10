const fs = require('fs')
const path = require('path')
const merlynPkg = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, './packages/merlyn/package.json'),
    'utf8'
  )
)

function readPackage(pkg, context) {
  if (pkg.peerDependencies) {
    pkg.dependencies = {
      ...pkg.peerDependencies,
      ...pkg.dependencies,
    }
  }

  if (pkg.name.startsWith('example') || pkg.name.startsWith('merlyn-')) {
    // install workspace merlyn deps because pnpm does not do that?
    // todo: make sure this isn't masking a totally different issue.
    // i.e, is this masking a problem that would also happen if merlyn was installed from npm?
    pkg.dependencies = {
      ...pkg.dependencies,
      ...merlynPkg.dependencies,
      merlyn: 'workspace:*',
    }
  }

  if (pkg.dependencies.excalibur) {
    // pkg.dependencies.excalibur = `file:${path.resolve(
    //   __dirname,
    //   '../Excalibur'
    // )}`
  }

  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}

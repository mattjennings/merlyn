function readPackage(pkg, context) {
  if (pkg.peerDependencies) {
    pkg.dependencies = {
      ...pkg.peerDependencies,
      ...pkg.dependencies,
    }
  }

  if (pkg.name.startsWith('example')) {
    // pkg.dependencies.merlin = 'file:../../packages/merlin'
  }

  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}

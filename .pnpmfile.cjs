function readPackage(pkg, context) {
  if (pkg.peerDependencies) {
    pkg.dependencies = {
      ...pkg.peerDependencies,
      ...pkg.dependencies
    }
  }
  
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
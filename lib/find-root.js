var fs = require('fs'),
    path = require('path')


 function findTopPackageJson(dir) {
  var current = path.resolve(dir),
      parent = path.resolve(dir, "..");

  if (current == parent || !hasPackageJson(parent)) {
    if (hasPackageJson(current)) return current
    else return null;
  } else {
    return findTopPackageJson(parent);
  }
}

function hasPackageJson(dir) {
  return fs.existsSync(path.join(dir, "package.json"))
}

module.exports = findTopPackageJson;
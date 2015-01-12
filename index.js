// require-yml

var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')

var extensions = ['.yml', '.yaml']
var ymlCache = {}

var compile = function(fullname) {
  return yaml.load(fs.readFileSync(fullname, 'utf8'))
}

var load = function(target, cache) {
  var content = ymlCache[fullname]
  var fullname = convert2fullname(target)
  // from cache
  if (cache === true || process.env.NODE_ENV === 'production' && cache !== false) {
    content = ymlCache[fullname]
    if (!content) {
      content = ymlCache[fullname] = compile(fullname)
    }
  } else {
    content = compile(fullname)
  }
  return content
}

var convert2fullname = function(target){
  var dirname, basename
  // absolute path
  if (/^(\/|[a-zA-Z]]:)/.test(target)) {
    dirname = path.dirname(target)
    basename = path.basename(target)
  // relative path
  } else {
    dirname = path.dirname(require.main.filename)
    basename = target
  }
  // specified extension
  if (/\.(yml|yaml)$/.test(basename)) {
    return path.resolve(dirname, basename)
 
  } else if (/\/$/.test(basename)) {
  // try unspecified extension's exists
  } else {
    for(var i=0,n=extensions.length; i<n; i++){
      var exists = path.resolve(dirname, basename + extensions[i])
      if (fs.existsSync(exists)) {
        return exists
      }
    }
  }
}

module.exports = load
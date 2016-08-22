// require-yml

var fs = require('fs')
var path = require('path')
var parser = require('js-yaml')

var extensions = ['.yml', '.yaml', '.json', '.js']

var noop = function(json){return json}

var fullpath = function(_path) {
  if (path.resolve(_path) === _path) {
    return _path
  }
  return path.join(process.cwd(), _path)
}

var read = function(target, iterator) {
  if (!iterator) iterator = noop
  
  target = fullpath(target)
  // read specificed file
  if (/\.(yml|yaml)$/.test(target)) {
    try {
      var res = parser.load(fs.readFileSync(target, 'utf8'))
      return res && iterator(res)
    } catch (e) { return }
  } else if (/\.(json|js)$/.test(target)) {
    try {
      var res = require(target);
      
      return res && iterator(res)
    } catch (e) { return }
  }

  // read directory's files
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    var res
    var files = fs.readdirSync(target)
    var len = files.length
    if (!len) return
    for(var i=0;i<len;i++) {
      var file = path.resolve(target, files[i])
      var val = read(file, iterator)
      if (val) {
        if (!res) res = {}
        res[path.basename(file).replace(path.extname(file), '')] = val
      }
    }
    return res
  }
  // try unspecified extension's exists
  for(var i=0,len=extensions.length; i<len; i++){
    var exists = target + extensions[i]
    if (fs.existsSync(exists)) {
      return read(exists, iterator)
    }
  }
  // nothing matches
  return
}

var readAsync = function(target, iterator, cb) {
  setImmediate(function(){
    cb(read(target, iterator))
  })
}

module.exports = function(target, iterator, cb) {
  if (typeof cb !== 'function') {
    return read(target, iterator)
  }
  readAsync.apply(null, arguments)
}

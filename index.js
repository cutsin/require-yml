// require-yml
const { isArray } = Array
const { assign } = Object
const fs = require('fs')
const path = require('path')
const parser = require('js-yaml')

const read = (options) => {
  const {
    targets,
    target = targets,
    onLoadError = req.onLoadError,
    onItrError = onLoadError,
    extensions = ['.js', '.yml', '.yaml', '.json'],
    loaders = [],
    cwd = process.cwd(),
    resolvePath = target => path.resolve(target) === target ? target : path.join(cwd, target),
    readFiles = files => files.slice(1).reduce((current, target) => merge(current, readPath(target)), readPath(files[0])),
    mapper = json => json,
    fileToProp = file => path.basename(file).replace(path.extname(file), ''),
    merge = (current, loaded) => assign(current, loaded),
  } = options

  loaders.push(
    { pattern: /\.(yml|yaml)$/, load: target => parser.load(fs.readFileSync(resolvePath(target), 'utf8')) },
    { pattern: /\.(json|js)$/, load: target => require(resolvePath(target)) },
  )

  return isArray(target) ? readFiles(target) : readPath(target)

  function readPath(target) {
    let res

    //read a signle file of recognized extension
    const loader = loaders.find(({ pattern }) => pattern.test(target))
    if (loader) {
      try {
        res = loader.load(target)
      } catch (e) { return onLoadError(assign(e, { target })) }

      try {
        return res && mapper(res, { prop: fileToProp(target), target })
      } catch (e) { return onItrError(assign(e, { target, loaded: res })) }
    }

    // read directory's files
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      const files = fs.readdirSync(target)
      if (!files.length) return

      return files.filter(file => !extensions.find(ext => file.endsWith(ext))) //unrecognized ext. + directories
        .concat(...extensions.map( ext => files.filter(file => file.endsWith(ext))))   //ext files by injected order
        .reduce((current, file, ix, arr) => {
          const val = readPath(path.resolve(target, file))
          const prop = fileToProp(file)
          const curVal = current[prop]
          if (val) current[prop] = curVal ? merge(curVal, val) : val
          return current
        }, {})
    }

    //unrecognized ext - try appendable extensions
    const found = extensions.filter(ext => fs.existsSync(target + ext))
    if (!found.length) return

    return readFiles(found.map(ext => target + ext))
  }
}

const req = (options, fileMapper, cb) => {
  if ('object' == typeof options && !isArray(options) && 'function' == typeof fileMapper && !cb) [fileMapper, cb] = [null, fileMapper]
  if ('string' == typeof options || isArray(options)) options = { target: options }
  if ('function' == typeof fileMapper) options.mapper = fileMapper

  if ('function' == typeof cb) return process.nextTick(() => cb(read(options)))

  return read(options)
}

req.onLoadError = () => {}

module.exports = req

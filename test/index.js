const assert = require('assert')
const req = require('../')

const v1Cases = [{
  title: 'require a directory - should return the directiry loaded recursvely',
  test: () => {
    var configs = req('./configs')
    assert.ok(configs.root === 'yaml is good')
  }
}, {
  title: 'require a sub directory - should return the sub directiry loaded recursvely',
  test: () => {
    var configs = req('./configs/foo/')
    assert.ok(configs.bar === 'tada')
  }
}, {
  title: 'require a empty directory - should return undefined',
  test: () => {
    var configs = req('./configs/foo/empty')
    assert.ok(configs === undefined)
  }
}, {
  title: 'require a json file - should return the json data',
  test: () => {
    var json = req('./configs/humans/lowb/me.json')
    assert.ok(json.nice === true)
  }
}, {
  title: 'require a no extension json file - should guess the json extension',
  test: () => {
    var json = req('./configs/humans/lowb/me')
    assert.ok(json.nice === true)
  }
}, {
  title: 'require a empty or json file - should suppress the error???',
  //OE: @cutsin - empty JSON file is a broken JSON file. I'm not sure it's the right treatment
  test: () => {
    var json = req('./configs/foo/nothing.json')
    assert.ok(json === undefined)
  }
}, {
  title: 'require a yml file - should return the yaml data',
  test: () => {
    var yml = req('./configs/humans/human.b.yml')
    assert.ok(yml.head === true)
  }
}, {
  title: 'require a no extension yml file',
  test: () => {
    var yml = req('./configs/humans/human-a')
    assert.ok(yml.head === true)
  }
}, {
  title: 'require a empty yml file - should return undefined',
  test: () => {
    var yml = req('./configs/foo/nothing.yml')
    assert.ok(yml === undefined)
  }
}, {
  title: 'require a yaml file - should return the yaml data',
  test: () => {
    var yml = req('./configs/humans/humanC.yaml')
    assert.ok(yml.head === true)
  }
}, {
  title: 'require a no extension yaml file - should guess the yaml extension',
  test: () => {
    var yml = req('./configs/humans/humanC')
    assert.ok(yml.head === true)
  }
}, {
  title: 'when provioded iterator - ',
  test: () => {
    var iterator = function(json) {
      if (json.head) delete json.head
      json.inject = 'everywhere'
      return json
    }

    var yml = req('./configs', iterator)
    assert.equal(yml.humans.humanC.head, undefined)
    assert.ok(yml.foo.sth.inject === 'everywhere')
  }
}, {
  title: 'broken iterator - error handling - using global onLoadError',
  test: () => {
    const origOnErr = req.onLoadError
    var mockError = new Error('oups!')
    var err
    req.onLoadError = function(e) { err = e }
    var yml = req('./configs', function(json) { throw mockError })
    assert.ok(err === mockError)
    req.onLoadError = origOnErr
  }
}, {
  title: 'called with an "async" callback',
  async: true,
  test: () => {
    req('./configs/ext', null, function(yml){
      assert.ok(yml.baz)
    })
  }
}]

const v2Cases = [{
  title: 'options as an array of directory paths - should add all paths and merge them to the same object',
  test: () => {
    var yml = req(['./configs/ext', './configs/humans'])
    assert.deepEqual(Object.keys(yml).sort(), [ 'baz', 'human-a', 'human.b', 'humanC', 'lowb' ])
  }
}, {
  title: 'options as a directory with few files with different extensions - should add all paths and merge them to the same object',
  test: () => {
    var yml = req('./configs/ext')
    cleanupRequireCache()

    assert.ok(yml.baz.js)
    assert.ok(yml.baz.yaml) //both loaded
    assert.ok(yml.baz.name == 'baz-yml') //yaml took precedence
  }
}, {
  title: 'options as a directory with few files with different extensions - user control extension presedence - unrecognized is weakest, last is strongest',
  test: () => {
    cleanupRequireCache()
    var js = req({ target: './configs/ext', extensions: ['.yml', '.yaml', '.json','.js']})
  
    //should add all paths and merge them to the same object
    assert.ok(js.baz.js)
    assert.ok(js.baz.yaml) //both loaded
    assert.equal(js.baz.name, 'baz-js') //js took precedence
  }
}, {
  title: 'when called with options with .targets - should understand the synonim for .target',
  test: () => {
    var yml1 = req({ target: './configs/root.yaml'})
    var yml2 = req({ targets: ['./configs/root.yaml']})
    assert.equal(yml1, yml2)
  }
}, {
  title: 'called with path or paths that lead nowhere - should return undefined',
  test: () => {
    var nothing = req({ target: [ './no/where', './no/such/path' ], onLoadError: () => {} })
    assert.equal(nothing, undefined)
  },
}, {
  title: 'when provided with a custom merger - should use the custom merger',
  test: () => {
    var count = 0
    var yml = req({
      targets: ['./configs/root.yaml', './configs/base.yaml'],
      merge: (cur, v) => {
        if ('string' == typeof cur) cur = { ['str' + ++count ]: cur }
        if ('string' == typeof v) v = { ['str' + ++count ]: v }
        return { ...cur, ...v }        
      }
    })
    assert.deepEqual(yml, { str1: 'yaml is good', str2: 'yaml is awsome' })
  }
}, {
  title: 'mapper passed in options - should be recognized',
  test: () => {
    var mapper = function(json) {
      if (json.head) delete json.head
      json.inject = 'everywhere'
      return json
    }
    var yml = req({ target: './configs/humans', mapper })
    assert.ok(yml.humanC)
    assert.equal(yml.humanC.head, undefined)
  }
}, {
  title: 'mapper passed in options and a callback - should recognize callback',
  async: true,
  test: () => {
    var mapper = function(json, path) {
      if (json.head) delete json.head
      json.inject = 'everywhere'
      return json
    }
    req({ target: './configs/humans', mapper }, (yml) => {
      assert.ok(yml['human-a'])
      assert.ok(yml['human.b'])
      assert.ok(yml.humanC)
      assert.equal(yml.humanC.head, undefined)
    })
  }
}, {
  title: 'when provided a mapper - mapper should be provided also with meta of { prop, target }',
  test: () => {
    var props = []
    var paths = []
    var mapper = (v, {prop, target}) => {
      props.push(prop)
      paths.push(target.replace(/^.*[\/\\]/,''))
      return v
    }

    req({ target: './configs/ext', mapper })
    
    assert.deepEqual(props, ['baz','baz'])
    assert.deepEqual(paths, ['baz.js','baz.yaml'])
  }
}, {
  title: 'target that includes an absolutely empty dir - should not effect',
  test: () => {
    try { require('fs').mkdirSync('./configs/ext/empty') } catch (e) {}
    const yml = req('./configs/ext.empty')
    assert.equal(yml, undefined)
  }
}, {
  title: 'passed a custom onLoadError - should use it. errors are augmented with .target',
  test: () => {
    const targets = []
    req({ target: './configs', onLoadError: e => targets.push(e.target.replace(/^.*[\/\\]/,'')) })
    
    assert.deepEqual( targets, ['nothing.json', 'broken.yaml'])
  }
}, {
  title: 'passed an onMapError and error occurs in mapper - should use it. errors are augmented with target',
  test: () => {
    const messages = []
    const targets = []
    const cfg = req({
      target: './configs/root',
      mapper: () => { throw new Error('oups...') },
      onMapperError: ({message, target}) => {
        messages.push(message)
        targets.push(target.replace(/^.*[\/\\]/,''))
      },
    })
    assert.equal(messages[0], 'oups...')
    assert.equal(targets[0], 'root.yaml')
  }
}, {
  title: 'passed no onMapError and error occurs in mapper - should use onLoadError. errors are augmented with target',
  test: () => {
    const messages = []
    const targets = []
    const cfg = req({
      target: './configs/root',
      mapper: () => { throw new Error('oups!') },
      onLoadError: ({message, target}) => {
        messages.push(message)
        targets.push(target.replace(/^.*[\/\\]/,''))
      },
    })
    assert.equal(messages[0], 'oups!')
    assert.equal(targets[0], 'root.yaml')
  }
}, {
  title: 'provided custom loaders - should use them, shaddowing built-in loaders',
  test: () => {
    try {
      const fs = require('fs')
      const resolvePath = target => target

      const people = req({
        target: './configs/humans/',
        loaders: [{ 
          pattern: /\.(yml|yaml)$/,
          load: target =>  ({  customYml: true, src: target, text: fs.readFileSync(resolvePath(target), 'utf8') })
        }],
      })
      
      assert.ok(people['human-a'].customYml)
      assert.ok(people['human.b'].customYml)
      assert.ok(people['humanC'].customYml)

    } finally {
      cleanupRequireCache()
    }
  }
}, {
  title: 'when provided a directory target and `fileToProp` - should use it',
  test: () => {
    const people = req({
      target: './configs/humans/',
      fileToProp: f => require('lodash/camelCase')(f.replace(/\.[^.]{2,4}$/,'')),
    })
    
    assert.deepEqual(Object.keys(people), ['lowb', 'humanA', 'humanB', 'humanC'])
  }
}, {
  title: 'when provided absolute rootDir - should use it', 
  test: () => {
    const cfg = req({
      rootDir: require('path').join(process.cwd(), 'configs'),
      targets: [ 'ext', 'foo' ],
      onLoadError: () => {},
    })
    assert.deepEqual( Object.keys(cfg), ['baz', 'bar', 'sth'] )
  }
}, {
  title: 'when provided relative rootDir - should use it',
  test: () => {
    const cfg = req({
      rootDir: './configs',
      targets: [ 'ext', 'foo' ],
      onLoadError: () => {},
    })
    assert.deepEqual( Object.keys(cfg), ['baz', 'bar', 'sth'] )
  }
}]

let cases = 0;
let failed = 0;

const FAIL = '\u001b[31mNOK\u001b[39m'
const PASS = '\u001b[32mOK\u001b[39m'
const origOnErr = req.onLoadError
req.onLoadError = () => {}
console.log(`
features of v1.x:
`)
v1Cases.forEach(runCase)

req.onLoadError = origOnErr
console.log(`
features of v2.x
`)
v2Cases.forEach(runCase)

console.log(`

"Async" cases:
`)

process.nextTick(() => {
  console.log(`
Summary:
  %s\ttests ran
  %s\ttests failed`, cases, failed ? FAIL.replace('NOK', failed) : PASS.replace('OK', 0))
  process.exit(failed)
})

function runCase({title, async: asyncTest, test}) {
  const caseNo = ++cases;
  let err
  const catchErr = uncaught => err = uncaught

  if (asyncTest) {
    process.on('uncaughtException', catchErr)
  }

  try {
    test()
    asyncTest || console.log('%s [%s] %s', caseNo, PASS, title)
  } catch (e) {
    err = e
    failed++;
    return console.error('%s [%s] %s:\n', caseNo, FAIL, title, err)
  }

  if (asyncTest) {
    process.nextTick(() => {
      process.removeListener('uncaughtException', catchErr)
      if (err) {
        failed++;
        return console.error('%s [%s] (async) %s\n', caseNo, FAIL, title, err)
      }
      console.log('%s [%s] (async) %s', caseNo, PASS, title)
    })
  }
}

function cleanupRequireCache() {
  Object.keys(require.cache).forEach(k => { delete require.cache[k] }) //cleanup require cache
}

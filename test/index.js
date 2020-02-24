const assert = require('assert')
const req = require('../')
let cases = 0;
let failed = 0;
[{
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
    req('./configs', null, function(yml){
      assert.ok(yml.foo.bar)
    })
  }
}].forEach(runCase)

console.log(`
features of v2.x
`);

[{
  title: 'options as an array of directory paths - should add all paths and merge them to the same object',
  test: () => {
    var yml = req(['./configs/humans', './config/foo'])
    assert.deepEqual(Object.keys(yml).sort(), [ 'human-a', 'human.b', 'humanC', 'lowb' ])
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
    var yml1 = req({ target: './config/root.yaml'})
    var yml2 = req({ targets: ['./config/root.yaml']})
    assert.equal(yml1, yml2)
  }
}, {
  title: 'iterator passed in options - should be recognized',
  test: () => {
    var mapper = function(json) {
      if (json.head) delete json.head
      json.inject = 'everywhere'
      return json
    }
    var yml = req({ target: './configs', mapper })
    assert.equal(yml.humans.humanC.head, undefined)
    assert.ok(yml.foo.sth.inject === 'everywhere')
  }
}, {
  title: 'passed iterator in options and a callback - should recognize callback',
  async: true,
  test: () => {
    var mapper = function(json) {
      if (json.head) delete json.head
      json.inject = 'everywhere'
      return json
    }
    req({ target: './configs', mapper }, function(yml){
      assert.equal(yml.humans.humanC.head, undefined)
      assert.ok(yml.foo.sth.inject === 'everywhere')
      assert.ok(yml.foo.bar)
    })
  }
}, {
  title: 'target includes an absolutely empty dir',
  test: () => {
    try { require('fs').mkdirSync('./configs/ext/empty') } catch (e) {}
    var yml = req('./configs/ext.empty')
    assert.equal(yml, undefined)
  }
}].forEach(runCase)


console.log(`

"Async" cases:
`)

process.nextTick(() => {
  console.log('%s\ttests ran\n %s\ttests failed', cases, failed)
  process.exit(failed)
})

function runCase({title, async: asyncTest, test}) {
  const caseNo = ++cases;
  let err

  console.log('\ncase %s\t- %s', caseNo, title)

  if (asyncTest) { 
     process.on('error', catchErr)
     process.nextTick(() => {
       process.removeListener('error', catchErr)
       console.log('\ncase %s\t- ASYNC: %s', caseNo, title)
       if (err) { 
         failed++;
         return console.error(err)
       } 
       console.log('\t- OK')
     })
  }

  try {
    test()
    console.log(asyncTest ? '\t- <async>' : '\t- OK')
  } catch (e) {
    err = e
    failed++;
    return console.error(err)
  }

  function catchErr(uncaught) {
    err = uncaught
  }
}


function cleanupRequireCache() {
  Object.keys(require.cache).forEach(k => { delete require.cache[k] }) //cleanup require cache
}


var assert = require('assert')
var req = require('../')

// require a directory
var configs = req('./configs')
assert.ok(configs.root === 'yaml is good')

// require a directory
var configs = req('./configs/foo/')
assert.ok(configs.bar === 'tada')

// require a empty directory
var configs = req('./configs/foo/empty')
assert.ok(configs === undefined)

// require a json file
var json = req('./configs/humans/lowb/me.json')
assert.ok(json.nice === true)

// require a no extension json file
var json = req('./configs/humans/lowb/me')
assert.ok(json.nice === true)

// require a empty json file
var json = req('./configs/foo/nothing.json')
assert.ok(json === undefined)

// require a yml file
var yml = req('./configs/humans/human.b.yml')
assert.ok(yml.head === true)

// require a no extension yml file
var yml = req('./configs/humans/human-a')
assert.ok(yml.head === true)

// require a empty yml file
var yml = req('./configs/foo/nothing.yml')
assert.ok(yml === undefined)

// require a yaml file
var yml = req('./configs/humans/humanC.yaml')
assert.ok(yml.head === true)

// require a no extension yaml file
var yml = req('./configs/humans/humanC')
assert.ok(yml.head === true)

// iterator
var iterator = function(json) {
	if (json.head) delete json.head
	json.inject = 'everywhere'
	return json
}
var yml = req('./configs', iterator)
assert.equal(yml.humans.humanC.head)
assert.ok(yml.foo.sth.inject === 'everywhere')

// broken iterator - error handling - using global onLoadError
var mockError = new Error('oups!')
var err
req.onLoadError = function(e) { err = e }
var yml = req('./configs', function(json) { throw mockError })
assert.ok(err === mockError)
req.onLoadError = function() {}

// async
req('./configs', null, function(yml){
	assert.ok(yml.foo.bar)
})


//features of v2.xObject.keys(yml).sort()

//options as an array  of directory paths
var yml = req(['./configs/humans', './config/foo'])
//should add all paths and merge them to the same object
assert.deepEqual(Object.keys(yml).sort(), [ 'human-a', 'human.b', 'humanC', 'lowb' ])

//options as a directory with few files with different extensions
var yml = req('./configs/ext')
//should add all paths and merge them to the same object
assert.ok(yml.baz.js)
assert.ok(yml.baz.yaml) //both loaded
assert.ok(yml.baz.name == 'baz-js') //yaml took precedence

//options as a directory with few files with different extensions - user control extension presedence - unrecognized is weakest, last is strongest
var yml = req({ target: './configs/ext', extensions: ['.js', '.yml', '.yaml', '.json']})
//should add all paths and merge them to the same object
assert.ok(yml.baz.js)
assert.ok(yml.baz.yaml) //both loaded
assert.ok(yml.baz.name == 'baz-yml') //yaml took precedence

//iterator in options
var mapper = function(json) {
	if (json.head) delete json.head
	json.inject = 'everywhere'
	return json
}
var yml = req({ target: './configs', mapper })
assert.equal(yml.humans.humanC.head)
assert.ok(yml.foo.sth.inject === 'everywhere')



console.log('test ok.')

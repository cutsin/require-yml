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
var yaml = req('./configs/humans/humanC.yaml')
assert.ok(yaml.head === true)

// require a no extension yaml file
var yaml = req('./configs/humans/humanC')
assert.ok(yaml.head === true)

// iterator
var iterator = function(json) {
	if (json.head) delete json.head
	json.inject = 'everywhere'
	return json
}
var yml = req('./configs', iterator)
assert.equal(yml.humans.humanC.head)
assert.ok(yml.foo.sth.inject === 'everywhere')

// async
req('./configs', null, function(yml){
	assert.ok(yml.foo.bar)
})

console.log('test ok.')
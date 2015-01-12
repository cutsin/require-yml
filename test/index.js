var assert = require('assert')
var human = require('../')('./human', true)
console.log(human)

assert.ok(human.head === true)

console.log('test ok.')
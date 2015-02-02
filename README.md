# require-yml

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

[中文文档](README.zh-CN.md)

## Why?

It's instead of [require-yaml](https://www.npmjs.com/package/require-yaml) because of [this reason](http://nodejs.org/api/globals.html#globals_require_extensions).

And, it can require a yml/yaml/json file/whole directory, or with iterator, or use async callback.

## Install

```bash
npm install require-yml
```

## Usage

configs directory:
```bash
configs/
 |- foo/
    |- bar/
      |- a.yml
      |- b.yaml
      |- c.json
    |- empty/
```
```javascript
var req = require('require-yml')
```

### require a file (yml/yaml/json)

```javascript
var yml = req('./configs/foo/bar/a.yml')
var yaml = req('./configs/foo/bar/b')	// b.yaml
var json = req('./configs/foo/bar/c.json')
console.log(yml, yaml, json)
// >> {}, {}, {}
```

### require a directory

```javascript
var all = req('./configs')
console.log(all)
// >> json object {"foo":{"bar":[Object Object]}
```

### require an empty file/directory

```javascript
var empty = req('./configs/empty')
console.log(empty)
// >> undefined
```

### require with iterator

```javascript
var iterator = function(json) {
	json.inject = 'everywhere'
	return json
}
var yml = req('./configs', iterator)
console.log(yml.foo.bar.a.inject)
// >> 'everywhere'
```

### async require

```javascript
req('./configs', null, function(yml){
	console.log(yml.foo.bar.a)
})
// >> {}
```

## Test

```
npm test
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/require-yml.svg?style=flat
[npm-url]: https://npmjs.org/package/require-yml
[travis-image]: https://travis-ci.org/cutsin/require-yml.svg
[travis-url]: https://travis-ci.org/cutsin/require-yml
[downloads-image]: https://img.shields.io/npm/dm/require-yml.svg?style=flat
[downloads-url]: https://npmjs.org/package/require-yml
[coveralls-image]: https://img.shields.io/coveralls/cutsin/require-yml.svg?style=flat
[coveralls-url]: https://coveralls.io/r/cutsin/require-yml

# require-yml

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

## Why?

It's instead of [require-yaml](https://www.npmjs.com/package/require-yaml) because of [this reason](http://nodejs.org/api/globals.html#globals_require_extensions).

And, it can load a yml|yaml|json file or whole directory.

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

// require a yml file
var yml = req('./configs/foo/bar/b.yml')
console.log(yml)  // json object {}

// require a no extension yaml file
var yaml = req('./configs/foo/bar/b')
console.log(yaml)  // json object {}

// require whole directory
var all = req('./configs')
console.log(all)  // json object {"foo":{"bar":[Object Object]}

// require a empty directory
var empty = req('./configs/empty')
console.log(empty)  // undefined

```


## Todo

Async support.

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
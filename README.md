# require-yml

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]

## Why?

It's instead of [require-yaml](https://www.npmjs.com/package/require-yaml) because of this reason: __http://nodejs.org/api/globals.html#globals_require_extensions__

## Install

```
npm install require-yml
```

## Usage

```javascript
var json = require('require-yml')('./foo')
console.log(config)
// >> json object {}
```
With cache:
```javascript
var json = require('require-yml')('./foo.yml', true)
```
Disable cache if NODE_ENV=production:
```javascript
var json = require('require-yml')('./foo.yaml', false)
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

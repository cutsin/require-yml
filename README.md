# require-yml

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

[中文文档](README.zh-CN.md)

## Why

It's instead of [require-yaml](https://www.npmjs.com/package/require-yaml) because of [this reason](http://nodejs.org/api/globals.html#globals_require_extensions).

And, it can require a yml/yaml/json file/whole directory, or with iterator, or use async callback.

## Install

```bash
npm install require-yml
```

## Usage

configs directory:

```sh
configs/
  |- foo/
    |- bar/
      |- a.yml
      |- b.yaml
      |- c.json
    |- empty/
```

```javascript
const req = require('require-yml')
```

### require a file (yml/yaml/json)

```javascript
const yml = req('./configs/foo/bar/a.yml')
const yaml = req('./configs/foo/bar/b')  // b.yaml
const json = req('./configs/foo/bar/c.json')
console.log(yml, yaml, json)
// >> {}, {}, {}
```

### require a list of files, the later cascades

```javascript
const yml = req(['./config/default.yml', './configs/local.yml'])
```

### require a list of files, the later cascades, but let the tool guess extensions
```javascript
const yml = req(['./config/default', './configs/local'])
```
***Notes***: 
 - by default, tool tries extensions by this order: `.js`, `.yml`, `.yaml`, `.json`.
   All found are merged on each other, the later *cascades*.
 - the built-in `.js` first - gives you more power allowing to starting with a type that is not native to `yaml`/`json`,  e.g:
   ```javascript
   //file: config/strategies/banner.js
   module.export = function Banner() { }
   Banner.prototype.header = function(title) { return this.text.replace(/@TITLE/, title) }
   ```
   ```yaml
   Banner:
     prototype:
       header: |
         -----------------------
         |     @TITLE          |
         -----------------------
   ```

### require a list of files, but you control what extensions to try and in what order 

```javascript
const yml = req({ 
  targets: ['./config/default', './configs/local'],
  extensions: [ '.json', '.yaml' ]
})
```
* When more than one is found - the later cascades

### Provide your own custom loaders

```javascript
const fs = require('fs')
const jsonc = require('jsonc')
const yml = req({
  targets: ['./config/default', './configs/local'],
  loaders: [{ 
    pattern: /.jsonc?$/, //<-- this will match .json and .jsonc alike
    load: target => jsonc.parse(fs.readFileSync(target)),
  }]
```

***Notes***: 
 * user loaders precede built-in ones.
   The built-in loaders are:
   ```
     { pattern: /\.(yml|yaml)$/, load: target => jsYaml.load(fs.readFileSync(resolvePath(target), 'utf8')) },
     { pattern: /\.(json|js)$/, load: target => require(resolvePath(target)) },
   ```
 * order of `loaders` does not effect order of files (order of `extensions` does, but only between files of same name in same directory)
 * You may support custom extensions by providing both `extensions` and custom `loaders`


### require a directory

```javascript
const all = req('./configs')
console.log(all)
// >> json object {"foo":{"bar":[Object Object]}
```

### an empty file/directory returns `undefined`

```javascript
const empty = req('./configs/empty')
console.log(empty)
// >> undefined
```

### require with iterator

```javascript
const iterator = function(json) {
  json.inject = 'everywhere'
  return json
}
const yml = req('./configs', iterator)
console.log(yml.foo.bar.a.inject)
// >> 'everywhere'
```

### handle require or iterator errors

```javascript
const yml = req('./configs', function brokenIterator(json) { 
  a = b // -> throws `a is undefined`
})
req.onLoadError = function(err) {
  // handle your errors here
  switch(e.CODE) {
    ...
  }
}
```

### async require

```javascript
req('./configs', null, function(yml){
  console.log(yml.foo.bar.a)
})
// >> {}
```


## Test

```sh
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

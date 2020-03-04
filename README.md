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
## Breaking changes in `2.0.0`
 - version `1.x` defaults to *suppresses* load/parse errors, version `2.x` defaults to *throw* them.
 - `v1.4.x` and `v2.x` let you provide your own error handlers: restore original behavior by providing your own `onLoadError` as an empty function.

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
 - the built-in `.js` first - gives you more power allowing to start with a type that is not native to `yaml`/`json`,  e.g:
   ```javascript
   //file: config/strategies/banner.js
   module.export = function Banner() { }
   Banner.prototype.header = function(title) { return this.text.replace(/@TITLE/, title) }
   ```
   ```yaml
   #file: config/strategies/banner.yaml
   Banner:
     prototype:
       text: |
         -----------------------
         |     @TITLE          |
         -----------------------
   ```

### require a list of files with unspecified endings, but you control what extensions to try and in what order 

```javascript
const yml = req({ 
  targets: ['./config/default', './configs/local'],
  extensions: [ '.json', '.yaml' ]
})
```
* this results in try the following load order:
  * try as dir `./config/default/`
    else try files: 
     * `./config/default.json`
     * `./config/default.yaml`
  * try as dir: `./config/local/`
	  else try files: 
     * `./config/local.json`
     * `./config/local.yaml`
* values in a later file merge into earlier, the later cascades
* Mind the difference between this example and `req({targets: ['/config'], ...})`. 
  Both return a single value, but the former merges all files together, and the later returns an object with keys `default` and `local`, each of which is a merge of the `yaml` version cascading the `json` version.

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
 * user loaders precede built-in ones. Loader of first matched pattern is used.
   The built-in loaders are:
   ```
     { pattern: /\.(yml|yaml)$/, load: target => jsYaml.load(fs.readFileSync(resolvePath(target), 'utf8')) },
     { pattern: /\.(json|js)$/, load: target => require(resolvePath(target)) },
   ```
 * order of `loaders` does not effect order of loaded files (order of `extensions` does, and only between files in same directory)
 * You can support custom extensions by providing `loaders`
 * You can have the tool try your custom extensions for paths you provide without extension by including it in `extensions`

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

### require with a mapper iterator

```javascript
const mapper = function(json) {
  json.inject = 'everywhere'
  return json
}
// v >= 2.0
const yml2 = req({ target: './configs', mapper })
console.log(yml2.foo.bar.a.inject)
// >> 'everywhere'

// legacy form (supported for backward compatibility)
const yml1 = req('./configs', mapper)
console.log(yml1.foo.bar.a.inject)

```

 * mapper iterator is called for every value that is loaded before being added to the value tree.
 * use mappers to map or mutate loaded values.
 * suppress loaded values by returning a falsy value.


### handle require or iterator errors

```javascript
const yml = req({
  target: './configs',
  mapper: function broken(json) { 
    a = b // -> throws `a is undefined`
  },
  onLoadError: err => {
    // handle your errors here
    switch(e.CODE) {
      ...
    }
  },
})
```
or use the global hook:
```
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
***Note:*** operation is pseudo async. 


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

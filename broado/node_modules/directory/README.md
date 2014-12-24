# directory
[![Build Status](https://secure.travis-ci.org/tblobaum/directory.png)](http://travis-ci.org/tblobaum/directory) 

require all files and directories inside a directory synchronously

## Example
Any of the below

```javascript

// return an object hash
var dir = require('directory')

// or pass a callback
require('directory')(function (module, name) {
  exports[name] = module
})

// or pass a different path
var dir = require('directory')(__dirname +'/../plugins/')

// or pass both
var dir = require('directory')(__dirname +'/plugins/', function (module, name) {
  exports[name] = module
})

````

## Installation

`npm install directory`

## Usage

require('directory')([dirname, iterator])

## Tests

`npm install mocha -g` and `make test`

## License

MIT 


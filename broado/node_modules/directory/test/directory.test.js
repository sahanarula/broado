
// Dependencies
var assert = require('assert')
  , directory = require(__dirname +'/..')

// Run tests
describe('directory', function () {

  it('should not require the file it is called from', function (done) {
    var dir = directory()
    assert.strictEqual(dir['directory.test'], undefined, 'directory.test should not be required')
    done()
  })
  
  directory(function (fn, filename) {
    it('should work with just a callback', function (done) {
      assert.equal(typeof filename, typeof 'string', 'filename should be a string')
      assert.notEqual(fn, undefined, 'fn should not be undefined')
      done()
    })
  })
  
  it('should work with a path and callback', function (done) {
    var dir = directory(__dirname +'/one/two/', function (fn, filename) {
      assert.equal(typeof filename, typeof 'string', 'filename should be a string')
    })
    assert.equal(typeof dir, typeof {}, 'it should return an object')
    assert.strictEqual(dir.hello, 'hello world', 'hello world should be returned')
    assert.strictEqual(dir.three.hello, 'hello world', 'hello world should be returned')
    done()
  })
  
  it('should work with a path', function (done) {
    var dir = directory(__dirname +'/one/two/')
    assert.equal(typeof dir, typeof {}, 'it should return an object')
    assert.strictEqual(dir.hello, 'hello world', 'hello world should be returned')
    assert.strictEqual(dir.three.hello, 'hello world', 'hello world should be returned')
    done()
  })
    
  it('should work with no arguments', function (done) {
    var dir = directory()
    assert.equal(typeof dir, typeof {}, 'it should return an object')
    assert.strictEqual(dir.hello, 'hello world', 'hello world should be returned')
    assert.strictEqual(dir.one.hello, 'hello world', 'hello world should be returned')
    assert.strictEqual(dir.one.two.hello, 'hello world', 'hello world should be returned')
    assert.strictEqual(dir.one.two.three.hello, 'hello world', 'hello world should be returned')
    assert.strictEqual(dir.one.two.three.four.hello, 'hello world', 'hello world should be returned')
    done()
  })
  
})

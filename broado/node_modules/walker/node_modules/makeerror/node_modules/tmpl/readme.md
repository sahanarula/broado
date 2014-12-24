tmpl
====

Simple string formatting using `{}`.

```javascript
assert.equal(
  tmpl('the answer is {answer}', { answer: 42 }),
  'the answer is 42')
```

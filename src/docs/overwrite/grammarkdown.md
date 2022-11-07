---
uid: 'requirement-interpreter!'
title: API Reference
---

`requirement-interpreter` has an API that can be consumed:

```js
var requirement-interpreter = require("requirement-interpreter")
  , Grammar = requirement-interpreter.Grammar
  , EmitFormat = requirement-interpreter.EmitFormat

var filename = "...";
var source = "...";
var output;

// parse
var interpreter = new Grammar(
  [filename],
  { format: EmitFormat.markdown },
  function () { return source; });

// bind (optional, bind happens automatically during check)
interpreter.bindSync();

// check (optional, check happens automatically during emit)
interpreter.checkSync();

// emit
interpreter.emitSync(undefined, function (file, text) { output = text; });

console.log(output);
```
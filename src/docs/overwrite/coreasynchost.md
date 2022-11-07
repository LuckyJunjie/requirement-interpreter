---
uid: 'requirement-interpreter!CoreAsyncHost:class'
example:
  - *content
---

The following example shows how you can create a @requirement-interpreter!CoreAsyncHost:class from a `Map`:

## [JavaScript](#tab/js)
```ts
const files = new Map([
  ["a.interpreter", "..."],
  ["b.interpreter", "..."]
]);
const host = new CoreAsyncHost({
  ignoreCase: false,
  useBuiltinGrammers: false,
  resolveFile: file => file,
  readFile: file => files.get(file)
});
```
***

---
uid: 'requirement-interpreter!CoreAsyncHost.forFile:member(1)'
example:
  - *content
---

The following example shows how you can create a @requirement-interpreter!CoreAsyncHost:class for a `string`:

## [JavaScript](#tab/js)
```ts
const content = "...";
const host = CoreAsyncHost.forFile(content);
```
***
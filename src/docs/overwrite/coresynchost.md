---
uid: 'requirement-interpreter!CoreSyncHost:class'
example:
  - *content
---

The following example shows how you can create a @requirement-interpreter!CoreSyncHost:class from a `Map`:

```ts
const files = new Map([
  ["a.interpreter", "..."],
  ["b.interpreter", "..."]
]);
const host = new CoreSyncHost({
  ignoreCase: false,
  useBuiltinGrammers: false,
  resolveFile: file => file,
  readFileSync: file => files.get(file)
});
```

---
uid: 'requirement-interpreter!CoreSyncHost.forFile:member(1)'
example:
  - *content
---

The following example shows how you can create a @requirement-interpreter!CoreSyncHost:class for a `string`:

```ts
const content = "...";
const host = CoreSyncHost.forFile(content);
```

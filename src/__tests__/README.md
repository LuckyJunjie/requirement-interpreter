## interpreter tests using `.interpreter` files
interpreter tests are handled by `scripts/interpreterTest.js`, which is a Jest transformer that generates a set of tests from a `.interpreter` file. This transformer is referenced in `jest.config.js`:

```js
module.exports = {
    ...,
    moduleFileExtensions: [
        "js",
        "jsx",
        "ts",
        "tsx",
        "json",
        "node",
        "interpreter" // added here to be recognized as a test module by Jest
    ],
    transform: {
        ...,
        "^.+\\.interpreter": require.resolve("./scripts/interpreterTest.js") // specifies transformer for .interpreter
    },
    testRegex: "/__tests__/.*(\\.test\\.ts|\\.interpreter)$", // pick up .interpreter files for tests
    ...
};
```
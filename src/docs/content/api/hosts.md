---
uid: hosts
title: Host API
---

# Host API
The Host API provides the mechanism through which other Grammarkdown Service APIs can interact with the file system asynchronously.
API operations using an asynchronous host use the native ECMAScript `Promise` to signal the completion of operations.

# Host Class Hierarchy

- @requirement-interpreter!CoreAsyncHost:class
  - @requirement-interpreter!NodeAsyncHost:class
  - @requirement-interpreter!StringAsyncHost:class

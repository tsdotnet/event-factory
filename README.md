![@tsdotnet/event-factory: Publish once. Many listen. Typed events with clean unsubscribe.](https://cdn.jsdelivr.net/gh/tsdotnet/event-factory@master/assets/banner.svg)

[![npm version](https://img.shields.io/npm/v/@tsdotnet/event-factory.svg?style=flat-square)](https://www.npmjs.com/package/@tsdotnet/event-factory)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/tsdotnet/event-factory/blob/master/LICENSE)

Create a typed event, publish a payload once, and every subscribed listener receives it, with easy unsubscribe.

## Install

```sh
npm install @tsdotnet/event-factory
```

## Usage

```ts
import eventFactory from '@tsdotnet/event-factory';

const changed = eventFactory<string>();

const off = changed.dispatcher.subscribe(name => console.log('hello', name));
changed.publish('Ada'); // hello Ada
off();                  // unsubscribe
changed.publish('Bob'); // nothing listens
```

`dispatcher.subscribe.once()` with no listener returns a promise for the next payload. Pass a number to `eventFactory` to stop publishing after that many events.

## Use it from

ESM (`import eventFactory from '@tsdotnet/event-factory';`) or CommonJS (`const eventFactory = require('@tsdotnet/event-factory').default;`).

<details><summary>In a browser, without a bundler</summary>

```html
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/type@1/dist/umd/type.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/compare@1/dist/umd/compare.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/exceptions@1/dist/umd/exceptions.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/collection-base@2/dist/umd/collection-base.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/disposable@2/dist/umd/disposable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/lazy@2/dist/umd/lazy.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/linked-node-list@1/dist/umd/linked-node-list.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/ordered-registry@1/dist/umd/ordered-registry.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/event-factory@2/dist/umd/event-factory.min.js"></script>
<script>
  const eventFactory = tsdotnet.eventFactory.default;
</script>
```

</details>

## Docs

[tsdotnet.github.io/event-factory](https://tsdotnet.github.io/event-factory/)

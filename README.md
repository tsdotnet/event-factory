# ![alt text](https://avatars1.githubusercontent.com/u/64487547?s=30 "tsdotnet") tsdotnet / event-factory

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/tsdotnet/event-factory/blob/master/LICENSE)
![npm-publish](https://github.com/tsdotnet/event-factory/workflows/npm-publish/badge.svg)
[![npm version](https://img.shields.io/npm/v/@tsdotnet/event-factory.svg?style=flat-square)](https://www.npmjs.com/package/@tsdotnet/event-factory)

A strongly typed protected event creator/publisher/signaler for use with TypeScript and JavaScript.

## Docs

[tsdotnet.github.io/event-factory](https://tsdotnet.github.io/event-factory/)

## Purpose
* Provides an API that separates event listening/subscribing from dispatching/publishing.
* Simplifies adding events to any object.

## Example
```ts
import { Event, EventPublisher } from '../src/EventPublisher';

export class MyObservable<T> {

	readonly start:Event<void>;
	readonly update:Event<T>;
	readonly complete:Event<void>;

	private readonly _dispatcher:{
		start:EventPublisher<void>,
		update:EventPublisher<T>,
		complete:EventPublisher<void>
	};

	constructor()
	{
		const start = new EventPublisher<void>(1);
		const update = new EventPublisher<T>();
		const complete = new EventPublisher<void>(1);
		this._dispatcher = { start, update, complete };
		this.start = start.event;
		this.update = update.event;
		this.complete = complete.event;
	}
}
```

## API

### Event
```ts
type Listener<T> = (value: T) => void;
type Unsubscribe = () => void;

interface Event<T>
{
	/**
	 * Adds a listener and return an unsubscribe function.
	 * @param listener
	 */
	(listener: Listener<T>): Unsubscribe;

	/**
	* Add an entry to the end of the registry.
	* @param value
	*/

	add(value: T): number;
	/**
	* Remove an entry.
	* @param id
	*/
	remove(id: number): boolean;
	
	/**
	* Adds an entry to the registry if it doesn't exist.
	* @param value
	*/
	register(value: T): number;
	
	/**
	* Clears all entries.
	*/
	clear(): void;
}
```

### EventPublisher
```ts
interface IEventPublisher<T>
{
	publish(payload: T): void;
	publishReverse(payload: T): void;

	readonly event: Readonly<Event<T>>;
}
```

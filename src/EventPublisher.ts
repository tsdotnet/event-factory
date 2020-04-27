/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import {IOrderedRegistry, OrderedRegistry} from "ordered-registry";

export type Listener<T> = (value: T) => void;
export type Unsubscribe = () => void;

export interface Event<T> extends Readonly<IOrderedRegistry<Listener<T>>>
{
	/**
	 * Adds a listener and return an unsubscribe function.
	 * @param listener
	 */
	(listener: Listener<T>): Unsubscribe;
}

export const enum ErrorHandling
{
	Throw = 0,
	Log = 1,
	Ignore = -1
}

export interface EventPublisherOptions
{
	/**
	 * When true, events will be published in reverse order.
	 */
	reversePublish?: boolean;

	/**
	 * When true, errors thrown by listeners will be logged, but not thrown.
	 */
	errorHandling?: ErrorHandling;

	/**
	 * When true, will clear listeners after every publish.
	 */
	clearListenersAfterPublish?: boolean;

	/**
	 * The remaining number of publishes that will emit to listeners.
	 * When this number is zero all listeners are cleared and none can be added.
	 */
	remaining?: number;
}


export class EventPublisher<T>
{
	protected readonly _registry = new OrderedRegistry<Listener<T>>();
	protected readonly _pre = new OrderedRegistry<EventPublisher<T>>();
	protected readonly _post = new OrderedRegistry<EventPublisher<T>>();
	protected readonly _event: Event<T>;

	public options: EventPublisherOptions;

	constructor(remaining?: number)
	constructor(options?: EventPublisherOptions)
	constructor(options?: EventPublisherOptions | number)
	{
		const r = this._registry, o = createOptions(options);
		this.options = o;
		const add = (listener: Listener<T>) =>
		{
			const rem = o.remaining;
			return rem && rem > 0 ? r.add(listener) : NaN;
		};
		const remove = (id: number) => r.remove(id);
		const event = (listener: Listener<T>) =>
		{
			const id = add(listener);
			return isNaN(id) ? dummy : () =>
			{
				remove(id)
			};
		};
		event.add = add;
		event.remove = remove;
		event.register = (listener: Listener<T>) =>
		{
			const rem = o.remaining;
			return rem && rem > 0 ? r.register(listener) : NaN;
		};
		event.clear = () => r.clear();
		this._event = Object.freeze(event);
		Object.freeze(this);
	}

	/**
	 * Adds an event publisher to be triggered before the event is published.
	 */
	addPre(remaining?: number): EventPublisher<T>
	addPre(options?: EventPublisherOptions): EventPublisher<T>
	addPre(options?: any): EventPublisher<T>
	{
		const p = new EventPublisher<T>(options);
		this._pre.add(p);
		return p;
	}

	/**
	 * Adds an event publisher to be triggered after the event is published.
	 */
	addPost(remaining?: number): EventPublisher<T>
	addPost(options?: EventPublisherOptions): EventPublisher<T>
	addPost(options?: any): EventPublisher<T>
	{
		const p = new EventPublisher<T>(options);
		this._post.add(p);
		return p;
	}

	/**
	 * Gets the remaining number of publishes that will emit to listeners.
	 * When this number is zero all listeners are cleared and none can be added.
	 */
	get remaining(): number
	{
		const rem = this.options.remaining;
		return typeof rem == 'number' ? rem : Number.POSITIVE_INFINITY;
	}

	/**
	 * Sets the remaining number of publishes that will emit to listeners.
	 * A value of zero will clear all listeners.
	 * @param value
	 */
	set remaining(value: number)
	{
		if (isNaN(value)) return;
		this.options.remaining = value;
		if (!value) this._registry.clear();
	}

	/**
	 * The event object to subscribe to.
	 */
	get event(): Event<T>
	{
		return this._event;
	}

	/**
	 * Dispatches payload to listeners.
	 * @param payload
	 */
	publish(payload: T): void
	{
		const _ = this, o = _.options;
		let r = o.remaining;
		if (r === 0) return;
		if (!r || isNaN(r)) r = Number.POSITIVE_INFINITY;
		if (r < 0) return;

		if (isFinite(r)) o.remaining = --r;

		try
		{
			_._pre.forEach(publish);
			if (o.reversePublish) _._registry.forEachReverse(trigger);
			else _._registry.forEach(trigger);
			_._post.forEach(publish);
		} catch (e)
		{
			switch (o.errorHandling)
			{
				case ErrorHandling.Ignore:
					break;
				case ErrorHandling.Log:
					console.error(e);
					break;
				default:
					throw e;
			}
		} finally
		{
			if (r == 0 || o.clearListenersAfterPublish) _._registry.clear();
		}

		// abstract away ids.
		function trigger(listener: Listener<T>)
		{
			listener(payload);
		}

		function publish(p: EventPublisher<T>)
		{
			p.publish(payload);
		}
	}
}


export default EventPublisher;

function dummy()
{
}

function createOptions(options?: EventPublisherOptions | number): EventPublisherOptions
{
	return typeof options == 'number' ? {remaining: options} : !options ? {} : {
		reversePublish: options.reversePublish,
		errorHandling: options.errorHandling,
		clearListenersAfterPublish: options.clearListenersAfterPublish,
		remaining: options.remaining
	};
}

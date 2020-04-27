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

export interface IEventPublisher<T>
{
	publish(payload: T, reverse?: boolean): void;

	publishForward(payload: T): void;

	publishReverse(payload: T): void;

	readonly event: Readonly<Event<T>>;
}

export class EventPublisher<T> implements IEventPublisher<T>
{
	protected readonly _registry: OrderedRegistry<Listener<T>>;
	protected readonly _event: Event<T>;

	/**
	 * When true, will clear listeners after every publish.
	 */
	public clearListenersAfterPublish: boolean = false;

	constructor(
		protected _remaining: number = Number.POSITIVE_INFINITY)
	{
		const r = new OrderedRegistry<Listener<T>>();
		this._registry = r;
		const add = (listener: Listener<T>) =>
		{
			return this._remaining > 0 ? r.add(listener) : NaN;
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
			return this._remaining > 0 ? r.register(listener) : NaN;
		};
		event.clear = () => r.clear();
		this._event = Object.freeze(event);
	}

	/**
	 * Gets the remaining number of publishes that will emit to listeners.
	 * When this number is zero all listeners are cleared and none can be added.
	 */
	get remaining(): number
	{
		return this._remaining;
	}

	/**
	 * Sets the remaining number of publishes that will emit to listeners.
	 * A value of zero will clear all listeners.
	 * @param value
	 */
	set remaining(value: number)
	{
		if (isNaN(value)) return;
		this._remaining = value;
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
	 * @param reverse
	 */
	publish(payload: T, reverse: boolean = false): void
	{
		let r = this._remaining;
		if (isNaN(r) || r <= 0) return;
		if (isFinite(r)) r = --this._remaining;
		if (reverse) this._registry.forEachReverse(f);
		else this._registry.forEach(f);
		if (r == 0 || this.clearListenersAfterPublish) this._registry.clear();

		function f(listener: Listener<T>)
		{
			listener(payload);
		}
	}

	/**
	 * Dispatches payload to listeners.
	 * @param payload
	 */
	publishForward(payload: T): void
	{
		this.publish(payload);
	}

	/**
	 * Dispatches payload to in reverse order.
	 * @param payload
	 */
	publishReverse(payload: T): void
	{
		this.publish(payload, true);
	}
}

export default EventPublisher;

function dummy()
{
}

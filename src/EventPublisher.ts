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
	publish(payload: T): void;
	publishReverse(payload: T): void;

	readonly event: Readonly<Event<T>>;
}

export class EventPublisher<T> implements IEventPublisher<T>
{
	private readonly _registry: OrderedRegistry<Listener<T>>;
	private readonly _event: Event<T>;

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
		this._registry.forEach((listener:Listener<T>) =>
		{
			listener(payload);
		});
	}

	/**
	 * Dispatches payload to in reverse order.
	 * @param payload
	 */
	publishReverse(payload: T): void
	{
		this._registry.forEachReverse((listener:Listener<T>) =>
		{
			listener(payload);
		});
	}

	constructor()
	{
		const r = new OrderedRegistry<Listener<T>>();
		this._registry = r;
		const add = (listener: Listener<T>) => r.add(listener);
		const remove = (id: number) => r.remove(id);
		const event = (listener: Listener<T>) => {
			const id = add(listener);
			return ()=>{remove(id)};
		};
		event.add = add;
		event.remove = remove;
		event.register = (listener: Listener<T>) => r.register(listener);
		event.clear = () => r.clear();
		this._event = Object.freeze(event);
	}
}

export default EventPublisher;

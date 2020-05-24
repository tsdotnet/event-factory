/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
/**
 * @packageDocumentation
 * @module event-factory
 */

import DisposableBase from '@tsdotnet/disposable';
import ObjectDisposedException from '@tsdotnet/disposable/dist/ObjectDisposedException';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import InvalidOperationException from '@tsdotnet/exceptions/dist/InvalidOperationException';
import {Lazy} from '@tsdotnet/lazy';
import {OrderedAutoRegistry} from '@tsdotnet/ordered-registry';
import {ErrorHandling} from './ErrorHandling';
import {Event, EventRegistry, Listener, Subscribe} from './Event';
import {EventDispatchBehavior} from './EventDispatchBehavior';

const LISTENER = 'listener';

export class EventDispatcher<T>
	extends DisposableBase
	implements EventRegistry<T>
{
	private _lookup?: WeakMap<Listener<T>, number>;
	private _registry?: OrderedAutoRegistry<Listener<T>>;
	private readonly _behavior: Readonly<Required<EventDispatchBehavior>>;
	private _publicSubscribe = Lazy.create(() => Object.freeze(this.createSubscribe()));
	private _publicEvent = Lazy.create(() => {
		const sub: any = this.createSubscribe();
		sub.add = (listener: Listener<T>) => this.add(listener);
		sub.register = (listener: Listener<T>) => this.add(listener);
		sub.clear = () => this.clear();
		sub.remove = (id: number) => this.remove(id);
		return Object.freeze(sub);
	});

	constructor (behavior?: EventDispatchBehavior, finalizer?: () => void)
	{
		super('EventManager', finalizer);
		this._behavior = Object.freeze({
			reversePublish: behavior?.reversePublish==true,
			errorHandling: behavior?.errorHandling || ErrorHandling.Throw,
			clearListenersAfterPublish: behavior?.clearListenersAfterPublish==true
		});

		this._lookup = new WeakMap<Listener<T>, number>();
		this._registry = new OrderedAutoRegistry<Listener<T>>();
		Object.freeze(this);
	}

	/**
	 * The scope independent function for subscribing to an event.
	 * @return {Subscribe<T>}
	 */
	get subscribe (): Subscribe<T>
	{
		return this._publicSubscribe.value;
	}

	/**
	 * The scope independent event registry for subscribing and managing listeners.
	 * @return {Readonly<Event<T>>}
	 */
	get event (): Event<T>
	{
		return this._publicEvent.value;
	}

	/**
	 * Attempts to add a listener.
	 * @throws `ArgumentNullException` if the listener is null.
	 * @throws `ArgumentException` if the listener already exists.
	 * @param {Listener<T>} listener
	 * @return {number} The registered `Id` of the listener. Returns NaN if this has been disposed.
	 */
	add (listener: Listener<T>): number
	{
		if(!listener) throw new ArgumentNullException(LISTENER);
		const lookup = this._lookup;
		if(!lookup) return NaN;
		if(lookup.has(listener)) throw new ArgumentException(LISTENER, 'is already registered.');
		return this._registry!.add(listener);
	}

	/**
	 * Registers a listener.
	 * If the listener already exists, nothing changes and the original `Id` is returned.
	 * @throws `ArgumentNullException` if the listener is null.
	 * @param {Listener<T>} listener
	 * @return {number} The registered `Id` of the listener. Returns NaN if this has been disposed.
	 */
	register (listener: Listener<T>): number
	{
		if(!listener) throw new ArgumentNullException(LISTENER);
		const lookup = this._lookup;
		if(!lookup) return NaN;
		if(lookup.has(listener)) return lookup.get(listener)!;
		return this._registry!.add(listener);
	}

	/**
	 * Removes a listener by `Id`.
	 * @param {number} id The registered `Id` of the listener.
	 * @return {Listener<T> | undefined} The listener or undefined if not found.
	 */
	remove (id: number): Listener<T> | undefined
	{
		const listener = this._registry?.remove(id);
		if(listener) this._lookup!.delete(listener);
		return listener;
	}

	/**
	 * Clears all listeners.
	 * @return {number} The number of listeners cleared. Returns NaN if this has been disposed.
	 */
	clear (): number
	{
		const lookup = this._lookup;
		if(!lookup) return NaN;
		const reg = this._registry!;
		for(const kvp of reg) lookup.delete(kvp.value);
		return reg.clear();
	}

	/**
	 * Dispatches payload to listeners.
	 * @throws `ObjectDisposedException` If this has been disposed.
	 * @param payload
	 */
	dispatch (payload: T): void
	{
		const reg = this._registry;
		if(!reg) throw new ObjectDisposedException('EventManager');

		const behavior = this._behavior;
		try
		{
			if(behavior?.reversePublish) for(const e of reg.reversed.toArray()) trigger(e.value);
			else for(const e of reg.toArray()) trigger(e.value);
		}
		catch(e)
		{
			switch(behavior?.errorHandling)
			{
				case ErrorHandling.Ignore:
					break;
				case ErrorHandling.Log:
					console.error(e);
					break;
				default:
					throw e;
			}
		}
		finally
		{
			if(behavior?.clearListenersAfterPublish) reg.clear();
		}

		// abstract away ids.
		function trigger (listener: Listener<T>)
		{
			listener(payload);
		}
	}

	protected _onDispose (): void
	{
		this.clear();
		this._lookup = undefined;
		this._registry = undefined;
		this._publicEvent.dispose();
		this._publicSubscribe.dispose();
	}

	/**
	 * Creates a scope independent function for subscribing to an event.
	 * @return {Subscribe<T>}
	 */
	protected createSubscribe (): Subscribe<T>
	{
		if(!this._registry) throw new ObjectDisposedException('EventManager');
		return (listener: Listener<T>) => {
			const id = this.register(listener);
			if(isNaN(id)) throw new InvalidOperationException('Unable to subscribe to a disposed event.');
			return () => { this.remove(id); };
		};
	}
}

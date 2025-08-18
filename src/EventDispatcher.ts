/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import {DisposableBase} from '@tsdotnet/disposable';
import {ArgumentException, ArgumentNullException, InvalidOperationException} from '@tsdotnet/exceptions';
import {Lazy} from '@tsdotnet/lazy';
import {OrderedAutoRegistry} from '@tsdotnet/ordered-registry';
import type {Event, EventRegistry, Listener, Subscribe} from './Event';
import type {EventDispatchBehavior} from './EventDispatchBehavior';

const LISTENER = 'listener';

export class EventDispatcher<T>
	extends DisposableBase
	implements EventRegistry<T>
{
	private readonly _lookup: WeakMap<Listener<T>, number>;
	private readonly _registry: OrderedAutoRegistry<Listener<T>>;
	private readonly _behavior: Readonly<EventDispatchBehavior>;
	private readonly _publicSubscribe = Lazy.create(() => Object.freeze(this.createSubscribe()));
	private readonly _publicEvent = Lazy.create(() => {
		const sub: any = this.createSubscribe();
		sub.add = (listener: Listener<T>) => this.add(listener);
		sub.register = (listener: Listener<T>) => this.add(listener);
		sub.clear = () => this.clear();
		sub.remove = (id: number) => this.remove(id);
		sub.subscribe = this._publicSubscribe.value;
		return Object.freeze(sub) as Event<T>;
	});
	private readonly _autoDispose = Lazy.create(() => new EventDispatcher<void>());

	constructor (behavior?: EventDispatchBehavior, finalizer?: () => void)
	{
		super('EventDispatcher', finalizer);
		this._behavior = Object.freeze({
			reversePublish: behavior?.reversePublish==true,
			onError: behavior?.onError,
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
	 * A lazy-initialized event for listening for disposal.
	 * @return {Event<void>}
	 */
	get onDispose (): Event<void>
	{
		return this._autoDispose.value.event;
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
		if(this.wasDisposed) return NaN;
		if(this._lookup.has(listener)) return this._lookup.get(listener)!;
		return this._registry!.add(listener);
	}

	/**
	 * Removes a listener by `Id`.
	 * @param {number} id The registered `Id` of the listener.
	 * @return {Listener<T> | undefined} The listener or undefined if not found.
	 */
	remove (id: number): Listener<T> | undefined
	{
		const listener = this._registry.remove(id);
		if(listener) this._lookup.delete(listener);
		return listener;
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
		if(this.wasDisposed) return NaN;
		if(this._lookup.has(listener)) throw new ArgumentException(LISTENER, 'is already registered.');
		return this._registry!.add(listener);
	}

	/**
	 * Clears all listeners.
	 * @return {number} The number of listeners cleared. Returns NaN if this has been disposed.
	 */
	clear (): number
	{
		if(this.wasDisposed) return NaN;
		for(const kvp of this._registry) this._lookup.delete(kvp.value);
		return this._registry.clear();
	}

	/**
	 * Dispatches payload to listeners.
	 * @throws `ObjectDisposedException` If this has been disposed.
	 * @param payload
	 */
	dispatch (payload: T): void
	{
		this.throwIfDisposed();
		const reg = this._registry;
		if(reg.isEmpty) return;
		const behavior = this._behavior;
		const listeners = reg.values.toArray();
		try
		{
			if(behavior.reversePublish)
			{
				let i = listeners.length;
				while(--i>=0) listeners[i]!(payload);
			}
			else
			{
				for(const e of listeners) e(payload);
			}
		}
		catch(ex)
		{
			if(behavior.onError) behavior.onError(ex);
			else throw ex;
		}
		finally
		{
			if(behavior.clearListenersAfterPublish) reg.clear();
		}
	}

	protected _onDispose (): void
	{
		this.clear();
		this._publicEvent.dispose();
		this._publicSubscribe.dispose();
		const autoDispose = this._autoDispose.valueReference;
		autoDispose?.dispatch();
		autoDispose?.dispose();
		this._autoDispose.dispose();
	}

	/**
	 * Creates a scope independent function for subscribing to an event.
	 * @return {Subscribe<T>}
	 */
	protected createSubscribe (): Subscribe<T>
	{
		const sub = (listener: Listener<T>, count?: number) => {
			// Cover 0 or less cases where NaN is considered positive infinity.
			if(typeof count=='number' && count<1) return dummy;
			const id = this.register(typeof count=='number' && isFinite(count) ? (payload: T) => {
				if(--count!<1) this.remove(id);
				return listener(payload);
			} : listener);
			if(isNaN(id)) throw new InvalidOperationException('Unable to subscribe to a disposed event.');
			return () => { this.remove(id); };
		};

		sub.once = (listener?: Listener<T>) => {
			if(listener) return sub(listener, 1);

			/* NOTE: Since promises are deferred:
			 * we have to be careful to capture an event that happens before initialization. */
			let result: { payload: T } | undefined;
			const preInit = sub(p => { result = {payload: p}; });
			return new Promise<T>((resolve, reject) => {
				if(result) resolve(result.payload);
				preInit(); // Unsubscribe.
				// Lazy throw if already disposed.
				const d = this.onDispose(() => {
					reject(new Error('Event was disposed.'));
				});
				sub((p => {
					d(); // remove dispose handler.
					resolve(p);
				}), 1); // Resubscribe.  This may throw if disposed.
			});
		};

		return sub as Subscribe<T>;
	}
}

function dummy () { }

Object.freeze(dummy);

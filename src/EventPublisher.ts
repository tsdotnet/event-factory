/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import DisposableBase from '@tsdotnet/disposable';
import Disposable from '@tsdotnet/disposable/dist/Disposable';
import {Lazy} from '@tsdotnet/lazy';
import {OrderedAutoRegistry} from '@tsdotnet/ordered-registry';
import {ErrorHandling} from './ErrorHandling';
import {EventDispatcher} from './EventDispatcher';
import {EventPublisherOptions} from './EventPublisherOptions';

export default class EventPublisher<T>
	extends DisposableBase
{
	public readonly options: EventPublisherOptions;
	protected readonly _pre = Lazy.create(() => new OrderedAutoRegistry<EventPublisher<T>>());
	protected readonly _dispatcher = Lazy.create(() => new EventDispatcher<T>(this.options));
	protected readonly _post = Lazy.create(() => new OrderedAutoRegistry<EventPublisher<T>>());

	constructor (remaining: number, finalizer?: () => void)
	constructor (options?: EventPublisherOptions | number | null, finalizer?: () => void)
	constructor (options?: EventPublisherOptions | number | null, finalizer?: () => void)
	{
		super('EventPublisher', finalizer);
		this.options = createOptions(options);
		Object.freeze(this);
	}

	/**
	 * Sets the remaining number of publishes that will emit to listeners.
	 * A value of zero will clear all listeners.
	 * @param value
	 */
	set remaining (value: number)
	{
		if(isNaN(value)) return;
		this.throwIfDisposed('Updating remaining for disposed publisher.');
		this.options.remaining = value;
		if(!value) this._dispatcher.valueReference?.clear();
	}


	/**
	 * Gets the remaining number of publishes that will emit to listeners.
	 * When this number is zero all listeners are cleared and none can be added.
	 */
	get remaining (): number
	{
		const rem = this.options.remaining;
		return typeof rem=='number' ? rem : Number.POSITIVE_INFINITY;
	}

	/**
	 * The event dispatcher.
	 */
	get dispatcher (): EventDispatcher<T>
	{
		return this._dispatcher.value;
	}

	/**
	 * Adds an event publisher to be triggered before the event is published.
	 * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
	 * @param {number} remaining
	 * @return {EventPublisher<T>}
	 */
	addPre (remaining: number): EventPublisher<T>

	/**
	 * Adds an event publisher to be triggered before the event is published.
	 * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
	 * @param {EventPublisherOptions} options
	 * @return {EventPublisher<T>}
	 */
	addPre (options?: EventPublisherOptions): EventPublisher<T>

	/**
	 * Adds an event publisher to be triggered before the event is published.
	 * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
	 * @param {number | EventPublisherOptions} options
	 * @return {EventPublisher<T>}
	 */
	addPre (options?: number | EventPublisherOptions): EventPublisher<T>
	{
		this.throwIfDisposed();
		return addPub(this._pre.value, options);
	}

	/**
	 * Adds an event publisher to be triggered after the event is published.
	 * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
	 * @param {number} remaining
	 * @return {EventPublisher<T>}
	 */
	addPost (remaining: number): EventPublisher<T>

	/**
	 * Adds an event publisher to be triggered after the event is published.
	 * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
	 * @param {EventPublisherOptions} options
	 * @return {EventPublisher<T>}
	 */
	addPost (options?: EventPublisherOptions): EventPublisher<T>

	/**
	 * Adds an event publisher to be triggered after the event is published.
	 * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
	 * @param {number | EventPublisherOptions} options
	 * @return {EventPublisher<T>}
	 */
	addPost (options?: number | EventPublisherOptions): EventPublisher<T>
	{
		this.throwIfDisposed();
		return addPub(this._post.value, options);
	}

	/**
	 * Dispatches payload to listeners.
	 * @param payload
	 */
	publish (payload: T): void
	{
		const _ = this, o = _.options;
		let r = o.remaining;
		if(r===0) return;
		if(!r || isNaN(r)) r = Number.POSITIVE_INFINITY;
		if(r<0) return;

		if(isFinite(r)) o.remaining = --r;

		try
		{
			const
				d    = _._dispatcher.valueReference,
				pre  = _._pre.valueReference?.map(getValue).toArray(),
				post = _._post.valueReference?.map(getValue).toArray();
			if(pre) for(const e of pre) e.publish(payload);
			if(d) d.dispatch(payload);
			if(post) for(const e of post) e.publish(payload);
		}
		catch(e)
		{
			switch(o.errorHandling)
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
			if(r==0 || o.clearListenersAfterPublish) _._dispatcher.valueReference?.clear();
		}
	}

	protected _onDispose ()
	{
		const d = this._dispatcher;
		d.valueReference?.dispose();
		d.dispose();
		cleanReg(this._pre.valueReference)?.dispose();
		cleanReg(this._post.valueReference)?.dispose();
	}
}

function createOptions (options?: EventPublisherOptions | number | null): EventPublisherOptions
{
	return typeof options=='number' ? {remaining: options} : !options ? {} : {
		reversePublish: options.reversePublish,
		errorHandling: options.errorHandling,
		clearListenersAfterPublish: options.clearListenersAfterPublish,
		remaining: options.remaining
	};
}

function addPub<T> (
	reg: OrderedAutoRegistry<EventPublisher<T>>,
	options?: EventPublisherOptions | number): EventPublisher<T>
{
	let id = 0;
	const p = new EventPublisher<T>(options, () => reg.remove(id));
	id = reg.add(p);
	return p;
}

function cleanReg<TDisposable extends Disposable> (reg?: OrderedAutoRegistry<TDisposable>): OrderedAutoRegistry<TDisposable> | undefined
{
	if(!reg) return reg;
	for(const r of reg.toArray()) r.value.dispose();
	reg.clear();
	return reg;
}

function getValue<TValue> (e: { value: TValue }): TValue
{
	return e.value;
}

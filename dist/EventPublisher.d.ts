/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
/**
 * @packageDocumentation
 * @module event-factory
 */
import DisposableBase from '@tsdotnet/disposable';
import { Lazy } from '@tsdotnet/lazy';
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';
import { EventDispatcher } from './EventDispatcher';
import { EventPublisherOptions } from './EventPublisherOptions';
export default class EventPublisher<T> extends DisposableBase {
    readonly options: EventPublisherOptions;
    protected readonly _pre: Lazy<OrderedAutoRegistry<EventPublisher<T>>>;
    protected readonly _dispatcher: Lazy<EventDispatcher<T>>;
    protected readonly _post: Lazy<OrderedAutoRegistry<EventPublisher<T>>>;
    constructor(remaining: number, finalizer?: () => void);
    constructor(options?: EventPublisherOptions | number | null, finalizer?: () => void);
    /**
     * Sets the remaining number of publishes that will emit to listeners.
     * A value of zero will clear all listeners.
     * @param value
     */
    set remaining(value: number);
    /**
     * Gets the remaining number of publishes that will emit to listeners.
     * When this number is zero all listeners are cleared and none can be added.
     */
    get remaining(): number;
    /**
     * The event dispatcher.
     */
    get dispatcher(): EventDispatcher<T>;
    /**
     * Adds an event publisher to be triggered before the event is published.
     * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
     * @param {number} remaining
     * @return {EventPublisher<T>}
     */
    addPre(remaining: number): EventPublisher<T>;
    /**
     * Adds an event publisher to be triggered before the event is published.
     * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
     * @param {EventPublisherOptions} options
     * @return {EventPublisher<T>}
     */
    addPre(options?: EventPublisherOptions): EventPublisher<T>;
    /**
     * Adds an event publisher to be triggered after the event is published.
     * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
     * @param {number} remaining
     * @return {EventPublisher<T>}
     */
    addPost(remaining: number): EventPublisher<T>;
    /**
     * Adds an event publisher to be triggered after the event is published.
     * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
     * @param {EventPublisherOptions} options
     * @return {EventPublisher<T>}
     */
    addPost(options?: EventPublisherOptions): EventPublisher<T>;
    /**
     * Dispatches payload to listeners.
     * @param payload
     */
    publish(payload: T): void;
    protected _onDispose(): void;
}

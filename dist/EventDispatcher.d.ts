/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
/**
 * @packageDocumentation
 * @module event-factory
 */
import DisposableBase from '@tsdotnet/disposable';
import { Event, EventRegistry, Listener, Subscribe } from './Event';
import { EventDispatchBehavior } from './EventDispatchBehavior';
export declare class EventDispatcher<T> extends DisposableBase implements EventRegistry<T> {
    private readonly _lookup;
    private readonly _registry;
    private readonly _behavior;
    private readonly _publicSubscribe;
    private readonly _publicEvent;
    private readonly _autoDispose;
    constructor(behavior?: EventDispatchBehavior, finalizer?: () => void);
    /**
     * The scope independent function for subscribing to an event.
     * @return {Subscribe<T>}
     */
    get subscribe(): Subscribe<T>;
    /**
     * The scope independent event registry for subscribing and managing listeners.
     * @return {Readonly<Event<T>>}
     */
    get event(): Event<T>;
    /**
     * A lazy-initialized event for listening for disposal.
     * @return {Event<void>}
     */
    get onDispose(): Event<void>;
    /**
     * Registers a listener.
     * If the listener already exists, nothing changes and the original `Id` is returned.
     * @throws `ArgumentNullException` if the listener is null.
     * @param {Listener<T>} listener
     * @return {number} The registered `Id` of the listener. Returns NaN if this has been disposed.
     */
    register(listener: Listener<T>): number;
    /**
     * Removes a listener by `Id`.
     * @param {number} id The registered `Id` of the listener.
     * @return {Listener<T> | undefined} The listener or undefined if not found.
     */
    remove(id: number): Listener<T> | undefined;
    /**
     * Attempts to add a listener.
     * @throws `ArgumentNullException` if the listener is null.
     * @throws `ArgumentException` if the listener already exists.
     * @param {Listener<T>} listener
     * @return {number} The registered `Id` of the listener. Returns NaN if this has been disposed.
     */
    add(listener: Listener<T>): number;
    /**
     * Clears all listeners.
     * @return {number} The number of listeners cleared. Returns NaN if this has been disposed.
     */
    clear(): number;
    /**
     * Dispatches payload to listeners.
     * @throws `ObjectDisposedException` If this has been disposed.
     * @param payload
     */
    dispatch(payload: T): void;
    protected _onDispose(): void;
    /**
     * Creates a scope independent function for subscribing to an event.
     * @return {Subscribe<T>}
     */
    protected createSubscribe(): Subscribe<T>;
}

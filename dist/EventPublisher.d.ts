/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';
export declare type Listener<T> = (value: T) => void;
export declare type Unsubscribe = () => void;
export interface Event<T> {
    /**
     * Adds a listener and return an unsubscribe function.
     * @param listener
     */
    (listener: Listener<T>): Unsubscribe;
    add(listener: Listener<T>): number;
    register(listener: Listener<T>): number;
    remove(id: number): Listener<T> | undefined;
    clear(): number;
}
export declare const enum ErrorHandling {
    Throw = 0,
    Log = 1,
    Ignore = -1
}
export interface EventPublisherOptions {
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
export declare class EventPublisher<T> {
    protected readonly _registry: OrderedAutoRegistry<Listener<T>>;
    protected readonly _pre: OrderedAutoRegistry<EventPublisher<T>>;
    protected readonly _post: OrderedAutoRegistry<EventPublisher<T>>;
    protected readonly _event: Event<T>;
    readonly options: EventPublisherOptions;
    constructor(remaining: number);
    constructor(options?: EventPublisherOptions);
    /**
     * Gets the remaining number of publishes that will emit to listeners.
     * When this number is zero all listeners are cleared and none can be added.
     */
    get remaining(): number;
    /**
     * Sets the remaining number of publishes that will emit to listeners.
     * A value of zero will clear all listeners.
     * @param value
     */
    set remaining(value: number);
    /**
     * The event object to subscribe to.
     */
    get event(): Readonly<Event<T>>;
    /**
     * Adds an event publisher to be triggered before the event is published.
     * @param {number} remaining
     * @return {EventPublisher<T>}
     */
    addPre(remaining: number): EventPublisher<T>;
    /**
     * Adds an event publisher to be triggered before the event is published.
     * @param {EventPublisherOptions} options
     * @return {EventPublisher<T>}
     */
    addPre(options?: EventPublisherOptions): EventPublisher<T>;
    /**
     * Adds an event publisher to be triggered after the event is published.
     * @param {number} remaining
     * @return {EventPublisher<T>}
     */
    addPost(remaining: number): EventPublisher<T>;
    /**
     * Adds an event publisher to be triggered after the event is published.
     * @param {EventPublisherOptions} options
     * @return {EventPublisher<T>}
     */
    addPost(options?: EventPublisherOptions): EventPublisher<T>;
    /**
     * Dispatches payload to listeners.
     * @param payload
     */
    publish(payload: T): void;
}
export default EventPublisher;

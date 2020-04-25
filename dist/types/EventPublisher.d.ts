/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { IOrderedRegistry } from "ordered-registry";
export declare type Listener<T> = (value: T) => void;
export declare type Unsubscribe = () => void;
export interface Event<T> extends Readonly<IOrderedRegistry<Listener<T>>> {
    /**
     * Adds a listener and return an unsubscribe function.
     * @param listener
     */
    (listener: Listener<T>): Unsubscribe;
}
export interface IEventPublisher<T> {
    publish(payload: T): void;
    publishReverse(payload: T): void;
    readonly event: Readonly<Event<T>>;
}
export declare class EventPublisher<T> implements IEventPublisher<T> {
    private readonly _registry;
    private readonly _event;
    /**
     * The event object to subscribe to.
     */
    get event(): Event<T>;
    /**
     * Dispatches payload to listeners.
     * @param payload
     */
    publish(payload: T): void;
    /**
     * Dispatches payload to in reverse order.
     * @param payload
     */
    publishReverse(payload: T): void;
    constructor();
}
export default EventPublisher;

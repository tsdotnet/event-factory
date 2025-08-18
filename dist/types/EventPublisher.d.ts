/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
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
    set remaining(value: number);
    get remaining(): number;
    get dispatcher(): EventDispatcher<T>;
    addPre(remaining: number): EventPublisher<T>;
    addPre(options?: EventPublisherOptions): EventPublisher<T>;
    addPost(remaining: number): EventPublisher<T>;
    addPost(options?: EventPublisherOptions): EventPublisher<T>;
    publish(payload: T): void;
    protected _onDispose(): void;
}

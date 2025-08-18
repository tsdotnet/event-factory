/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
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
    get subscribe(): Subscribe<T>;
    get event(): Event<T>;
    get onDispose(): Event<void>;
    register(listener: Listener<T>): number;
    remove(id: number): Listener<T> | undefined;
    add(listener: Listener<T>): number;
    clear(): number;
    dispatch(payload: T): void;
    protected _onDispose(): void;
    protected createSubscribe(): Subscribe<T>;
}

/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
/**
 * @packageDocumentation
 * @module event-factory
 */
import DisposableBase from '@tsdotnet/disposable';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import InvalidOperationException from '@tsdotnet/exceptions/dist/InvalidOperationException';
import { Lazy } from '@tsdotnet/lazy';
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';
const LISTENER = 'listener';
export class EventDispatcher extends DisposableBase {
    constructor(behavior, finalizer) {
        super('EventDispatcher', finalizer);
        this._publicSubscribe = Lazy.create(() => Object.freeze(this.createSubscribe()));
        this._publicEvent = Lazy.create(() => {
            const sub = this.createSubscribe();
            sub.add = (listener) => this.add(listener);
            sub.register = (listener) => this.add(listener);
            sub.clear = () => this.clear();
            sub.remove = (id) => this.remove(id);
            return Object.freeze(sub);
        });
        this._behavior = Object.freeze({
            reversePublish: (behavior === null || behavior === void 0 ? void 0 : behavior.reversePublish) == true,
            errorHandling: (behavior === null || behavior === void 0 ? void 0 : behavior.errorHandling) || 0 /* Throw */,
            clearListenersAfterPublish: (behavior === null || behavior === void 0 ? void 0 : behavior.clearListenersAfterPublish) == true
        });
        this._lookup = new WeakMap();
        this._registry = new OrderedAutoRegistry();
        Object.freeze(this);
    }
    /**
     * The scope independent function for subscribing to an event.
     * @return {Subscribe<T>}
     */
    get subscribe() {
        return this._publicSubscribe.value;
    }
    /**
     * The scope independent event registry for subscribing and managing listeners.
     * @return {Readonly<Event<T>>}
     */
    get event() {
        return this._publicEvent.value;
    }
    /**
     * Attempts to add a listener.
     * @throws `ArgumentNullException` if the listener is null.
     * @throws `ArgumentException` if the listener already exists.
     * @param {Listener<T>} listener
     * @return {number} The registered `Id` of the listener. Returns NaN if this has been disposed.
     */
    add(listener) {
        if (!listener)
            throw new ArgumentNullException(LISTENER);
        const lookup = this._lookup;
        if (!lookup)
            return NaN;
        if (lookup.has(listener))
            throw new ArgumentException(LISTENER, 'is already registered.');
        return this._registry.add(listener);
    }
    /**
     * Registers a listener.
     * If the listener already exists, nothing changes and the original `Id` is returned.
     * @throws `ArgumentNullException` if the listener is null.
     * @param {Listener<T>} listener
     * @return {number} The registered `Id` of the listener. Returns NaN if this has been disposed.
     */
    register(listener) {
        if (!listener)
            throw new ArgumentNullException(LISTENER);
        const lookup = this._lookup;
        if (!lookup)
            return NaN;
        if (lookup.has(listener))
            return lookup.get(listener);
        return this._registry.add(listener);
    }
    /**
     * Removes a listener by `Id`.
     * @param {number} id The registered `Id` of the listener.
     * @return {Listener<T> | undefined} The listener or undefined if not found.
     */
    remove(id) {
        var _a;
        const listener = (_a = this._registry) === null || _a === void 0 ? void 0 : _a.remove(id);
        if (listener)
            this._lookup.delete(listener);
        return listener;
    }
    /**
     * Clears all listeners.
     * @return {number} The number of listeners cleared. Returns NaN if this has been disposed.
     */
    clear() {
        const lookup = this._lookup;
        if (!lookup)
            return NaN;
        const reg = this._registry;
        for (const kvp of reg)
            lookup.delete(kvp.value);
        return reg.clear();
    }
    /**
     * Dispatches payload to listeners.
     * @throws `ObjectDisposedException` If this has been disposed.
     * @param payload
     */
    dispatch(payload) {
        this.throwIfDisposed();
        const reg = this._registry;
        const behavior = this._behavior;
        try {
            if (behavior === null || behavior === void 0 ? void 0 : behavior.reversePublish)
                for (const e of reg.reversed.toArray())
                    trigger(e.value);
            else
                for (const e of reg.values.toArray())
                    trigger(e);
        }
        catch (e) {
            switch (behavior === null || behavior === void 0 ? void 0 : behavior.errorHandling) {
                case -1 /* Ignore */:
                    break;
                case 1 /* Log */:
                    console.error(e);
                    break;
                default:
                    throw e;
            }
        }
        finally {
            if (behavior === null || behavior === void 0 ? void 0 : behavior.clearListenersAfterPublish)
                reg.clear();
        }
        // abstract away ids.
        function trigger(listener) {
            listener(payload);
        }
    }
    _onDispose() {
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
    createSubscribe() {
        this.throwIfDisposed();
        return (listener) => {
            const id = this.register(listener);
            if (isNaN(id))
                throw new InvalidOperationException('Unable to subscribe to a disposed event.');
            return () => { this.remove(id); };
        };
    }
}
//# sourceMappingURL=EventDispatcher.js.map
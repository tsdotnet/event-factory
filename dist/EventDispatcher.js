"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
/**
 * @packageDocumentation
 * @module event-factory
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
const tslib_1 = require("tslib");
const disposable_1 = tslib_1.__importDefault(require("@tsdotnet/disposable"));
const ArgumentException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentException"));
const ArgumentNullException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentNullException"));
const InvalidOperationException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/InvalidOperationException"));
const lazy_1 = require("@tsdotnet/lazy");
const ordered_registry_1 = require("@tsdotnet/ordered-registry");
const LISTENER = 'listener';
class EventDispatcher extends disposable_1.default {
    constructor(behavior, finalizer) {
        super('EventDispatcher', finalizer);
        this._publicSubscribe = lazy_1.Lazy.create(() => Object.freeze(this.createSubscribe()));
        this._publicEvent = lazy_1.Lazy.create(() => {
            const sub = this.createSubscribe();
            sub.add = (listener) => this.add(listener);
            sub.register = (listener) => this.add(listener);
            sub.clear = () => this.clear();
            sub.remove = (id) => this.remove(id);
            sub.subscribe = this._publicSubscribe.value;
            return Object.freeze(sub);
        });
        this._behavior = Object.freeze({
            reversePublish: (behavior === null || behavior === void 0 ? void 0 : behavior.reversePublish) == true,
            errorHandling: (behavior === null || behavior === void 0 ? void 0 : behavior.errorHandling) || 0 /* Throw */,
            clearListenersAfterPublish: (behavior === null || behavior === void 0 ? void 0 : behavior.clearListenersAfterPublish) == true
        });
        this._lookup = new WeakMap();
        this._registry = new ordered_registry_1.OrderedAutoRegistry();
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
            throw new ArgumentNullException_1.default(LISTENER);
        const lookup = this._lookup;
        if (!lookup)
            return NaN;
        if (lookup.has(listener))
            throw new ArgumentException_1.default(LISTENER, 'is already registered.');
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
            throw new ArgumentNullException_1.default(LISTENER);
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
        const sub = (listener, count) => {
            // Cover 0 or less cases where NaN is considered positive infinity.
            if (typeof count == 'number' && count < 1)
                return dummy;
            const id = this.register(typeof count == 'number' && isFinite(count) ? (payload) => {
                if (--count < 1)
                    this.remove(id);
                return listener(payload);
            } : listener);
            if (isNaN(id))
                throw new InvalidOperationException_1.default('Unable to subscribe to a disposed event.');
            return () => { this.remove(id); };
        };
        sub.once = (listener) => sub(listener, 1);
        return sub;
    }
}
exports.EventDispatcher = EventDispatcher;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function dummy() { }
Object.freeze(dummy);
//# sourceMappingURL=EventDispatcher.js.map
"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
const disposable_1 = require("@tsdotnet/disposable");
const exceptions_1 = require("@tsdotnet/exceptions");
const lazy_1 = require("@tsdotnet/lazy");
const ordered_registry_1 = require("@tsdotnet/ordered-registry");
const LISTENER = 'listener';
class EventDispatcher extends disposable_1.DisposableBase {
    constructor(behavior, finalizer) {
        super(finalizer);
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
        this._autoDispose = lazy_1.Lazy.create(() => new EventDispatcher());
        this._behavior = Object.freeze({
            reversePublish: (behavior === null || behavior === void 0 ? void 0 : behavior.reversePublish) == true,
            onError: behavior === null || behavior === void 0 ? void 0 : behavior.onError,
            clearListenersAfterPublish: (behavior === null || behavior === void 0 ? void 0 : behavior.clearListenersAfterPublish) == true
        });
        this._lookup = new WeakMap();
        this._registry = new ordered_registry_1.OrderedAutoRegistry();
        Object.freeze(this);
    }
    get subscribe() {
        return this._publicSubscribe.value;
    }
    get event() {
        return this._publicEvent.value;
    }
    get onDispose() {
        return this._autoDispose.value.event;
    }
    register(listener) {
        if (!listener)
            throw new exceptions_1.ArgumentNullException(LISTENER);
        if (this.wasDisposed)
            return NaN;
        if (this._lookup.has(listener))
            return this._lookup.get(listener);
        return this._registry.add(listener);
    }
    remove(id) {
        const listener = this._registry.remove(id);
        if (listener)
            this._lookup.delete(listener);
        return listener;
    }
    add(listener) {
        if (!listener)
            throw new exceptions_1.ArgumentNullException(LISTENER);
        if (this.wasDisposed)
            return NaN;
        if (this._lookup.has(listener))
            throw new exceptions_1.ArgumentException(LISTENER, 'is already registered.');
        return this._registry.add(listener);
    }
    clear() {
        if (this.wasDisposed)
            return NaN;
        for (const kvp of this._registry)
            this._lookup.delete(kvp.value);
        return this._registry.clear();
    }
    dispatch(payload) {
        this.assertIsAlive();
        const reg = this._registry;
        if (reg.isEmpty)
            return;
        const behavior = this._behavior;
        const listeners = reg.values.toArray();
        try {
            if (behavior.reversePublish) {
                let i = listeners.length;
                while (--i >= 0)
                    listeners[i](payload);
            }
            else {
                for (const e of listeners)
                    e(payload);
            }
        }
        catch (ex) {
            if (behavior.onError)
                behavior.onError(ex);
            else
                throw ex;
        }
        finally {
            if (behavior.clearListenersAfterPublish)
                reg.clear();
        }
    }
    _onDispose() {
        this.clear();
        this._publicEvent.dispose();
        this._publicSubscribe.dispose();
        const autoDispose = this._autoDispose.valueReference;
        autoDispose === null || autoDispose === void 0 ? void 0 : autoDispose.dispatch();
        autoDispose === null || autoDispose === void 0 ? void 0 : autoDispose.dispose();
        this._autoDispose.dispose();
    }
    createSubscribe() {
        const sub = (listener, count) => {
            if (typeof count == 'number' && count < 1)
                return dummy;
            const id = this.register(typeof count == 'number' && isFinite(count) ? (payload) => {
                if (--count < 1)
                    this.remove(id);
                return listener(payload);
            } : listener);
            if (isNaN(id))
                throw new exceptions_1.InvalidOperationException('Unable to subscribe to a disposed event.');
            return () => { this.remove(id); };
        };
        sub.once = (listener) => {
            if (listener)
                return sub(listener, 1);
            let result;
            const preInit = sub(p => { result = { payload: p }; });
            return new Promise((resolve, reject) => {
                if (result)
                    resolve(result.payload);
                preInit();
                const d = this.onDispose(() => {
                    reject(new Error('Event was disposed.'));
                });
                sub((p => {
                    d();
                    resolve(p);
                }), 1);
            });
        };
        return sub;
    }
}
exports.EventDispatcher = EventDispatcher;
function dummy() { }
Object.freeze(dummy);
//# sourceMappingURL=EventDispatcher.js.map
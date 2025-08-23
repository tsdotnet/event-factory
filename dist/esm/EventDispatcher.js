import { DisposableBase } from '@tsdotnet/disposable';
import { ArgumentNullException, ArgumentException, InvalidOperationException } from '@tsdotnet/exceptions';
import { Lazy } from '@tsdotnet/lazy';
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';

/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
const LISTENER = 'listener';
class EventDispatcher extends DisposableBase {
    _lookup;
    _registry;
    _behavior;
    _publicSubscribe = Lazy.create(() => Object.freeze(this.createSubscribe()));
    _publicEvent = Lazy.create(() => {
        const sub = this.createSubscribe();
        sub.add = (listener) => this.add(listener);
        sub.register = (listener) => this.add(listener);
        sub.clear = () => this.clear();
        sub.remove = (id) => this.remove(id);
        sub.subscribe = this._publicSubscribe.value;
        return Object.freeze(sub);
    });
    _autoDispose = Lazy.create(() => new EventDispatcher());
    constructor(behavior, finalizer) {
        super(finalizer);
        this._behavior = Object.freeze({
            reversePublish: behavior?.reversePublish == true,
            onError: behavior?.onError,
            clearListenersAfterPublish: behavior?.clearListenersAfterPublish == true
        });
        this._lookup = new WeakMap();
        this._registry = new OrderedAutoRegistry();
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
            throw new ArgumentNullException(LISTENER);
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
            throw new ArgumentNullException(LISTENER);
        if (this.wasDisposed)
            return NaN;
        if (this._lookup.has(listener))
            throw new ArgumentException(LISTENER, 'is already registered.');
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
        autoDispose?.dispatch();
        autoDispose?.dispose();
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
                throw new InvalidOperationException('Unable to subscribe to a disposed event.');
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
function dummy() { }
Object.freeze(dummy);

export { EventDispatcher };
//# sourceMappingURL=EventDispatcher.js.map

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tsdotnet/disposable'), require('@tsdotnet/lazy'), require('@tsdotnet/ordered-registry'), require('@tsdotnet/exceptions')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tsdotnet/disposable', '@tsdotnet/lazy', '@tsdotnet/ordered-registry', '@tsdotnet/exceptions'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.tsdotnet = global.tsdotnet || {}, global.tsdotnet.eventFactory = global.tsdotnet.eventFactory || {}), global.tsdotnet.disposable, global.tsdotnet.lazy, global.tsdotnet.orderedRegistry, global.tsdotnet.exceptions));
})(this, (function (exports, disposable, lazy, orderedRegistry, exceptions) { 'use strict';

    /*!
     * @author electricessence / https://github.com/electricessence/
     * Licensing: MIT
     */
    const LISTENER = 'listener';
    class EventDispatcher extends disposable.DisposableBase {
        _lookup;
        _registry;
        _behavior;
        _publicSubscribe = lazy.Lazy.create(() => Object.freeze(this.createSubscribe()));
        _publicEvent = lazy.Lazy.create(() => {
            const sub = this.createSubscribe();
            sub.add = (listener) => this.add(listener);
            sub.register = (listener) => this.add(listener);
            sub.clear = () => this.clear();
            sub.remove = (id) => this.remove(id);
            sub.subscribe = this._publicSubscribe.value;
            return Object.freeze(sub);
        });
        _autoDispose = lazy.Lazy.create(() => new EventDispatcher());
        constructor(behavior, finalizer) {
            super(finalizer);
            this._behavior = Object.freeze({
                reversePublish: behavior?.reversePublish == true,
                onError: behavior?.onError,
                clearListenersAfterPublish: behavior?.clearListenersAfterPublish == true
            });
            this._lookup = new WeakMap();
            this._registry = new orderedRegistry.OrderedAutoRegistry();
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
                throw new exceptions.ArgumentNullException(LISTENER);
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
                throw new exceptions.ArgumentNullException(LISTENER);
            if (this.wasDisposed)
                return NaN;
            if (this._lookup.has(listener))
                throw new exceptions.ArgumentException(LISTENER, 'is already registered.');
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
                    throw new exceptions.InvalidOperationException('Unable to subscribe to a disposed event.');
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

    /*!
     * @author electricessence / https://github.com/electricessence/
     * Licensing: MIT
     */
    class EventPublisher extends disposable.DisposableBase {
        options;
        _pre = lazy.Lazy.create(() => new orderedRegistry.OrderedAutoRegistry());
        _dispatcher = lazy.Lazy.create(() => new EventDispatcher(this.options));
        _post = lazy.Lazy.create(() => new orderedRegistry.OrderedAutoRegistry());
        constructor(options, finalizer) {
            super(finalizer);
            this.options = createOptions(options);
            Object.freeze(this);
        }
        set remaining(value) {
            if (isNaN(value))
                return;
            this.assertIsAlive();
            this.options.remaining = value;
            if (!value)
                this._dispatcher.valueReference?.clear();
        }
        get remaining() {
            const rem = this.options.remaining;
            return typeof rem == 'number' ? rem : Number.POSITIVE_INFINITY;
        }
        get dispatcher() {
            return this._dispatcher.value;
        }
        addPre(options) {
            this.assertIsAlive();
            return addPub(this._pre.value, options);
        }
        addPost(options) {
            this.assertIsAlive();
            return addPub(this._post.value, options);
        }
        publish(payload) {
            this.assertIsAlive();
            const _ = this, o = _.options;
            let r = o.remaining;
            if (r === 0)
                return;
            if (!r || isNaN(r))
                r = Number.POSITIVE_INFINITY;
            if (r < 0)
                return;
            if (isFinite(r))
                o.remaining = --r;
            try {
                const d = _._dispatcher.valueReference, pre = _._pre.valueReference?.values.toArray(), post = _._post.valueReference?.values.toArray();
                publish(pre, payload);
                if (d)
                    d.dispatch(payload);
                publish(post, payload);
            }
            catch (ex) {
                if (o.onError)
                    o.onError(ex);
                else
                    throw ex;
            }
            finally {
                if (r == 0 || o.clearListenersAfterPublish)
                    _._dispatcher.valueReference?.clear();
            }
        }
        _onDispose() {
            const d = this._dispatcher;
            d.valueReference?.dispose();
            d.dispose();
            cleanReg(this._pre.valueReference)?.dispose();
            cleanReg(this._post.valueReference)?.dispose();
        }
    }
    function publish(p, payload) {
        if (p)
            for (const e of p)
                e.publish(payload);
    }
    function createOptions(options) {
        return typeof options == 'number' ? { remaining: options } : !options ? {} : {
            reversePublish: options.reversePublish,
            onError: options.onError,
            clearListenersAfterPublish: options.clearListenersAfterPublish,
            remaining: options.remaining
        };
    }
    function addPub(reg, options) {
        let id = 0;
        const p = new EventPublisher(options, () => reg.remove(id));
        id = reg.add(p);
        return p;
    }
    function cleanReg(reg) {
        if (!reg)
            return reg;
        for (const r of reg.toArray())
            r.value.dispose();
        reg.clear();
        return reg;
    }

    /*!
     * @author electricessence / https://github.com/electricessence/
     * @license MIT
     */
    function eventFactory(options, finalizer) {
        return new EventPublisher(options, finalizer);
    }

    exports.EventDispatcher = EventDispatcher;
    exports.EventPublisher = EventPublisher;
    exports.default = eventFactory;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=event-factory.js.map

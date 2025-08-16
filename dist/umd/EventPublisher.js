/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@tsdotnet/disposable", "@tsdotnet/lazy", "@tsdotnet/ordered-registry", "./EventDispatcher"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const disposable_1 = require("@tsdotnet/disposable");
    const lazy_1 = require("@tsdotnet/lazy");
    const ordered_registry_1 = require("@tsdotnet/ordered-registry");
    const EventDispatcher_1 = require("./EventDispatcher");
    class EventPublisher extends disposable_1.DisposableBase {
        options;
        _pre = lazy_1.Lazy.create(() => new ordered_registry_1.OrderedAutoRegistry());
        _dispatcher = lazy_1.Lazy.create(() => new EventDispatcher_1.EventDispatcher(this.options));
        _post = lazy_1.Lazy.create(() => new ordered_registry_1.OrderedAutoRegistry());
        constructor(options, finalizer) {
            super('EventPublisher', finalizer);
            this.options = createOptions(options);
            Object.freeze(this);
        }
        /**
         * Sets the remaining number of publishes that will emit to listeners.
         * A value of zero will clear all listeners.
         * @param value
         */
        set remaining(value) {
            if (isNaN(value))
                return;
            this.throwIfDisposed('Updating remaining for disposed publisher.');
            this.options.remaining = value;
            if (!value)
                this._dispatcher.valueReference?.clear();
        }
        /**
         * Gets the remaining number of publishes that will emit to listeners.
         * When this number is zero all listeners are cleared and none can be added.
         */
        get remaining() {
            const rem = this.options.remaining;
            return typeof rem == 'number' ? rem : Number.POSITIVE_INFINITY;
        }
        /**
         * The event dispatcher.
         */
        get dispatcher() {
            return this._dispatcher.value;
        }
        /**
         * Adds an event publisher to be triggered before the event is published.
         * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
         * @param {number | EventPublisherOptions} options
         * @return {EventPublisher<T>}
         */
        addPre(options) {
            this.throwIfDisposed();
            return addPub(this._pre.value, options);
        }
        /**
         * Adds an event publisher to be triggered after the event is published.
         * Disposing the returned `EventPublisher<T>` removes it from it's parent (this).
         * @param {number | EventPublisherOptions} options
         * @return {EventPublisher<T>}
         */
        addPost(options) {
            this.throwIfDisposed();
            return addPub(this._post.value, options);
        }
        /**
         * Dispatches payload to listeners.
         * @param payload
         */
        publish(payload) {
            this.throwIfDisposed();
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
    exports.default = EventPublisher;
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
});
//# sourceMappingURL=EventPublisher.js.map
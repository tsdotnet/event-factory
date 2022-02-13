"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const disposable_1 = (0, tslib_1.__importDefault)(require("@tsdotnet/disposable"));
const lazy_1 = require("@tsdotnet/lazy");
const ordered_registry_1 = require("@tsdotnet/ordered-registry");
const EventDispatcher_1 = require("./EventDispatcher");
class EventPublisher extends disposable_1.default {
    constructor(options, finalizer) {
        super('EventPublisher', finalizer);
        this._pre = lazy_1.Lazy.create(() => new ordered_registry_1.OrderedAutoRegistry());
        this._dispatcher = lazy_1.Lazy.create(() => new EventDispatcher_1.EventDispatcher(this.options));
        this._post = lazy_1.Lazy.create(() => new ordered_registry_1.OrderedAutoRegistry());
        this.options = createOptions(options);
        Object.freeze(this);
    }
    /**
     * Sets the remaining number of publishes that will emit to listeners.
     * A value of zero will clear all listeners.
     * @param value
     */
    set remaining(value) {
        var _a;
        if (isNaN(value))
            return;
        this.throwIfDisposed('Updating remaining for disposed publisher.');
        this.options.remaining = value;
        if (!value)
            (_a = this._dispatcher.valueReference) === null || _a === void 0 ? void 0 : _a.clear();
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
        var _a, _b, _c;
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
            const d = _._dispatcher.valueReference, pre = (_a = _._pre.valueReference) === null || _a === void 0 ? void 0 : _a.values.toArray(), post = (_b = _._post.valueReference) === null || _b === void 0 ? void 0 : _b.values.toArray();
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
                (_c = _._dispatcher.valueReference) === null || _c === void 0 ? void 0 : _c.clear();
        }
    }
    _onDispose() {
        var _a, _b, _c;
        const d = this._dispatcher;
        (_a = d.valueReference) === null || _a === void 0 ? void 0 : _a.dispose();
        d.dispose();
        (_b = cleanReg(this._pre.valueReference)) === null || _b === void 0 ? void 0 : _b.dispose();
        (_c = cleanReg(this._post.valueReference)) === null || _c === void 0 ? void 0 : _c.dispose();
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
//# sourceMappingURL=EventPublisher.js.map
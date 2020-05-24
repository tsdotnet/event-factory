/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
/**
 * @packageDocumentation
 * @module event-factory
 */
import DisposableBase from '@tsdotnet/disposable';
import { Lazy } from '@tsdotnet/lazy';
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';
import { EventDispatcher } from './EventDispatcher';
export default class EventPublisher extends DisposableBase {
    constructor(options, finalizer) {
        super('EventPublisher', finalizer);
        this._pre = Lazy.create(() => new OrderedAutoRegistry());
        this._dispatcher = Lazy.create(() => new EventDispatcher(this.options));
        this._post = Lazy.create(() => new OrderedAutoRegistry());
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
        catch (e) {
            switch (o.errorHandling) {
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
function publish(p, payload) {
    if (p)
        for (const e of p)
            e.publish(payload);
}
function createOptions(options) {
    return typeof options == 'number' ? { remaining: options } : !options ? {} : {
        reversePublish: options.reversePublish,
        errorHandling: options.errorHandling,
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
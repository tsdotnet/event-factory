/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { DisposableBase } from '@tsdotnet/disposable';
import { Lazy } from '@tsdotnet/lazy';
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';
import { EventDispatcher } from './EventDispatcher';
export default class EventPublisher extends DisposableBase {
    options;
    _pre = Lazy.create(() => new OrderedAutoRegistry());
    _dispatcher = Lazy.create(() => new EventDispatcher(this.options));
    _post = Lazy.create(() => new OrderedAutoRegistry());
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
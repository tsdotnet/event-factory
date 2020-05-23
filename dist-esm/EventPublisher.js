/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { OrderedAutoRegistry } from '@tsdotnet/ordered-registry';
export class EventPublisher {
    constructor(options) {
        this._registry = new OrderedAutoRegistry();
        this._pre = new OrderedAutoRegistry();
        this._post = new OrderedAutoRegistry();
        const r = this._registry, o = createOptions(options);
        this.options = o;
        const add = (listener) => {
            const rem = o.remaining;
            return rem && rem > 0 ? r.add(listener) : NaN;
        };
        const remove = (id) => r.remove(id);
        const event = (listener) => {
            const id = add(listener);
            return isNaN(id) ? dummy : () => {
                remove(id);
            };
        };
        event.add = add;
        event.remove = remove;
        event.register = (listener) => {
            const rem = o.remaining;
            return rem && rem > 0 ? r.register(listener) : NaN;
        };
        event.clear = () => r.clear();
        this._event = Object.freeze(event);
        Object.freeze(this);
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
     * Sets the remaining number of publishes that will emit to listeners.
     * A value of zero will clear all listeners.
     * @param value
     */
    set remaining(value) {
        if (isNaN(value))
            return;
        this.options.remaining = value;
        if (!value)
            this._registry.clear();
    }
    /**
     * The event object to subscribe to.
     */
    get event() {
        return this._event;
    }
    /**
     * Adds an event publisher to be triggered before the event is published.
     * @param {number | EventPublisherOptions} options
     * @return {EventPublisher<T>}
     */
    addPre(options) {
        const p = new EventPublisher(options);
        this._pre.add(p);
        return p;
    }
    /**
     * Adds an event publisher to be triggered after the event is published.
     * @param {number | EventPublisherOptions} options
     * @return {EventPublisher<T>}
     */
    addPost(options) {
        const p = new EventPublisher(options);
        this._post.add(p);
        return p;
    }
    /**
     * Dispatches payload to listeners.
     * @param payload
     */
    publish(payload) {
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
            for (const e of _._pre)
                publish(e.value);
            if (o.reversePublish)
                for (const e of _._registry.reversed)
                    trigger(e.value);
            else
                for (const e of _._registry)
                    trigger(e.value);
            for (const e of _._post)
                publish(e.value);
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
                _._registry.clear();
        }
        // abstract away ids.
        function trigger(listener) {
            listener(payload);
        }
        function publish(p) {
            p.publish(payload);
        }
    }
}
export default EventPublisher;
function dummy() {
}
function createOptions(options) {
    return typeof options == 'number' ? { remaining: options } : !options ? {} : {
        reversePublish: options.reversePublish,
        errorHandling: options.errorHandling,
        clearListenersAfterPublish: options.clearListenersAfterPublish,
        remaining: options.remaining
    };
}
//# sourceMappingURL=EventPublisher.js.map
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { OrderedRegistry } from "ordered-registry";
export class EventPublisher {
    constructor(options) {
        this._registry = new OrderedRegistry();
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
    addPre(options) {
        const p = new EventPublisher(options);
        (this._pre || (this._pre = new OrderedRegistry())).add(p);
        return p;
    }
    addPost(options) {
        const p = new EventPublisher(options);
        (this._post || (this._post = new OrderedRegistry())).add(p);
        return p;
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
     * Dispatches payload to listeners.
     * @param payload
     */
    publish(payload) {
        var _a, _b;
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
            (_a = _._pre) === null || _a === void 0 ? void 0 : _a.forEach(publish);
            if (o.reversePublish)
                _._registry.forEachReverse(trigger);
            else
                _._registry.forEach(trigger);
            (_b = _._post) === null || _b === void 0 ? void 0 : _b.forEach(publish);
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
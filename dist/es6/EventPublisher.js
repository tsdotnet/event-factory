/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { OrderedRegistry } from "ordered-registry";
export class EventPublisher {
    constructor(_remaining = Number.POSITIVE_INFINITY) {
        this._remaining = _remaining;
        /**
         * When true, will clear listeners after every publish.
         */
        this.clearListenersAfterPublish = false;
        const r = new OrderedRegistry();
        this._registry = r;
        const add = (listener) => {
            return this._remaining > 0 ? r.add(listener) : NaN;
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
            return this._remaining > 0 ? r.register(listener) : NaN;
        };
        event.clear = () => r.clear();
        this._event = Object.freeze(event);
    }
    /**
     * Gets the remaining number of publishes that will emit to listeners.
     * When this number is zero all listeners are cleared and none can be added.
     */
    get remaining() {
        return this._remaining;
    }
    /**
     * Sets the remaining number of publishes that will emit to listeners.
     * A value of zero will clear all listeners.
     * @param value
     */
    set remaining(value) {
        if (isNaN(value))
            return;
        this._remaining = value;
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
     * @param reverse
     */
    publish(payload, reverse = false) {
        let r = this._remaining;
        if (isNaN(r) || r <= 0)
            return;
        if (isFinite(r))
            r = --this._remaining;
        if (reverse)
            this._registry.forEachReverse(f);
        else
            this._registry.forEach(f);
        if (r == 0 || this.clearListenersAfterPublish)
            this._registry.clear();
        function f(listener) {
            listener(payload);
        }
    }
    /**
     * Dispatches payload to listeners.
     * @param payload
     */
    publishForward(payload) {
        this.publish(payload);
    }
    /**
     * Dispatches payload to in reverse order.
     * @param payload
     */
    publishReverse(payload) {
        this.publish(payload, true);
    }
}
export default EventPublisher;
function dummy() {
}
//# sourceMappingURL=EventPublisher.js.map
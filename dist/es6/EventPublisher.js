/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { OrderedRegistry } from "ordered-registry";
export class EventPublisher {
    constructor(remaining = Number.POSITIVE_INFINITY) {
        this.remaining = remaining;
        this.clearListenersAfterPublish = false;
        const r = new OrderedRegistry();
        this._registry = r;
        const add = (listener) => {
            return this.remaining > 0 ? r.add(listener) : NaN;
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
            return this.remaining > 0 ? r.register(listener) : NaN;
        };
        event.clear = () => r.clear();
        this._event = Object.freeze(event);
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
        let r = this.remaining;
        if (isNaN(r) || r <= 0)
            return;
        if (isFinite(r))
            r = --this.remaining;
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
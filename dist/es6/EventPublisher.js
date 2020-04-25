/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { OrderedRegistry } from "ordered-registry";
export class EventPublisher {
    constructor() {
        const r = new OrderedRegistry();
        this._registry = r;
        const add = (listener) => r.add(listener);
        const remove = (id) => r.remove(id);
        const event = (listener) => {
            const id = add(listener);
            return () => { remove(id); };
        };
        event.add = add;
        event.remove = remove;
        event.register = (listener) => r.register(listener);
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
     */
    publish(payload) {
        this._registry.forEach((listener) => {
            listener(payload);
        });
    }
    /**
     * Dispatches payload to in reverse order.
     * @param payload
     */
    publishReverse(payload) {
        this._registry.forEachReverse((listener) => {
            listener(payload);
        });
    }
}
export default EventPublisher;
//# sourceMappingURL=EventPublisher.js.map
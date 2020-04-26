"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ordered_registry_1 = require("ordered-registry");
var EventPublisher = /** @class */ (function () {
    function EventPublisher() {
        var r = new ordered_registry_1.OrderedRegistry();
        this._registry = r;
        var add = function (listener) { return r.add(listener); };
        var remove = function (id) { return r.remove(id); };
        var event = function (listener) {
            var id = add(listener);
            return function () { remove(id); };
        };
        event.add = add;
        event.remove = remove;
        event.register = function (listener) { return r.register(listener); };
        event.clear = function () { return r.clear(); };
        this._event = Object.freeze(event);
    }
    Object.defineProperty(EventPublisher.prototype, "event", {
        /**
         * The event object to subscribe to.
         */
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispatches payload to listeners.
     * @param payload
     */
    EventPublisher.prototype.publish = function (payload) {
        this._registry.forEach(function (listener) {
            listener(payload);
        });
    };
    /**
     * Dispatches payload to in reverse order.
     * @param payload
     */
    EventPublisher.prototype.publishReverse = function (payload) {
        this._registry.forEachReverse(function (listener) {
            listener(payload);
        });
    };
    return EventPublisher;
}());
exports.EventPublisher = EventPublisher;
exports.default = EventPublisher;
//# sourceMappingURL=EventPublisher.js.map
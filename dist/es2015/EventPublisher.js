"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ordered_registry_1 = require("ordered-registry");
var EventPublisher = /** @class */ (function () {
    function EventPublisher(remaining) {
        var _this = this;
        if (remaining === void 0) { remaining = Number.POSITIVE_INFINITY; }
        this.remaining = remaining;
        this.clearListenersAfterPublish = false;
        var r = new ordered_registry_1.OrderedRegistry();
        this._registry = r;
        var add = function (listener) {
            return _this.remaining > 0 ? r.add(listener) : NaN;
        };
        var remove = function (id) { return r.remove(id); };
        var event = function (listener) {
            var id = add(listener);
            return isNaN(id) ? dummy : function () {
                remove(id);
            };
        };
        event.add = add;
        event.remove = remove;
        event.register = function (listener) {
            return _this.remaining > 0 ? r.register(listener) : NaN;
        };
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
     * @param reverse
     */
    EventPublisher.prototype.publish = function (payload, reverse) {
        if (reverse === void 0) { reverse = false; }
        var r = this.remaining;
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
    };
    /**
     * Dispatches payload to listeners.
     * @param payload
     */
    EventPublisher.prototype.publishForward = function (payload) {
        this.publish(payload);
    };
    /**
     * Dispatches payload to in reverse order.
     * @param payload
     */
    EventPublisher.prototype.publishReverse = function (payload) {
        this.publish(payload, true);
    };
    return EventPublisher;
}());
exports.EventPublisher = EventPublisher;
exports.default = EventPublisher;
function dummy() {
}
//# sourceMappingURL=EventPublisher.js.map
"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ordered_registry_1 = require("ordered-registry");
var EventPublisher = /** @class */ (function () {
    function EventPublisher(_remaining) {
        var _this = this;
        if (_remaining === void 0) { _remaining = Number.POSITIVE_INFINITY; }
        this._remaining = _remaining;
        /**
         * When true, will clear listeners after every publish.
         */
        this.clearListenersAfterPublish = false;
        var r = new ordered_registry_1.OrderedRegistry();
        this._registry = r;
        var add = function (listener) {
            return _this._remaining > 0 ? r.add(listener) : NaN;
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
            return _this._remaining > 0 ? r.register(listener) : NaN;
        };
        event.clear = function () { return r.clear(); };
        this._event = Object.freeze(event);
    }
    Object.defineProperty(EventPublisher.prototype, "remaining", {
        /**
         * Gets the remaining number of publishes that will emit to listeners.
         * When this number is zero all listeners are cleared and none can be added.
         */
        get: function () {
            return this._remaining;
        },
        /**
         * Sets the remaining number of publishes that will emit to listeners.
         * A value of zero will clear all listeners.
         * @param value
         */
        set: function (value) {
            if (isNaN(value))
                return;
            this._remaining = value;
            if (!value)
                this._registry.clear();
        },
        enumerable: true,
        configurable: true
    });
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
        var r = this._remaining;
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
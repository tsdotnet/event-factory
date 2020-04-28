"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ordered_registry_1 = require("ordered-registry");
var EventPublisher = /** @class */ (function () {
    function EventPublisher(options) {
        this._registry = new ordered_registry_1.OrderedRegistry();
        var r = this._registry, o = createOptions(options);
        this.options = o;
        var add = function (listener) {
            var rem = o.remaining;
            return rem && rem > 0 ? r.add(listener) : NaN;
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
            var rem = o.remaining;
            return rem && rem > 0 ? r.register(listener) : NaN;
        };
        event.clear = function () { return r.clear(); };
        this._event = Object.freeze(event);
        Object.freeze(this);
    }
    EventPublisher.prototype.addPre = function (options) {
        var p = new EventPublisher(options);
        (this._pre || (this._pre = new ordered_registry_1.OrderedRegistry())).add(p);
        return p;
    };
    EventPublisher.prototype.addPost = function (options) {
        var p = new EventPublisher(options);
        (this._post || (this._post = new ordered_registry_1.OrderedRegistry())).add(p);
        return p;
    };
    Object.defineProperty(EventPublisher.prototype, "remaining", {
        /**
         * Gets the remaining number of publishes that will emit to listeners.
         * When this number is zero all listeners are cleared and none can be added.
         */
        get: function () {
            var rem = this.options.remaining;
            return typeof rem == 'number' ? rem : Number.POSITIVE_INFINITY;
        },
        /**
         * Sets the remaining number of publishes that will emit to listeners.
         * A value of zero will clear all listeners.
         * @param value
         */
        set: function (value) {
            if (isNaN(value))
                return;
            this.options.remaining = value;
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
     */
    EventPublisher.prototype.publish = function (payload) {
        var _a, _b;
        var _ = this, o = _.options;
        var r = o.remaining;
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
    };
    return EventPublisher;
}());
exports.EventPublisher = EventPublisher;
exports.default = EventPublisher;
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
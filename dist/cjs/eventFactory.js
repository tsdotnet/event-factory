"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = exports.EventPublisher = void 0;
exports.default = eventFactory;
const tslib_1 = require("tslib");
const EventPublisher_js_1 = tslib_1.__importDefault(require("./EventPublisher.js"));
exports.EventPublisher = EventPublisher_js_1.default;
var EventDispatcher_js_1 = require("./EventDispatcher.js");
Object.defineProperty(exports, "EventDispatcher", { enumerable: true, get: function () { return EventDispatcher_js_1.EventDispatcher; } });
function eventFactory(options, finalizer) {
    return new EventPublisher_js_1.default(options, finalizer);
}
//# sourceMappingURL=eventFactory.js.map
"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
const tslib_1 = require("tslib");
const EventPublisher_1 = (0, tslib_1.__importDefault)(require("./EventPublisher"));
var EventDispatcher_1 = require("./EventDispatcher");
Object.defineProperty(exports, "EventDispatcher", { enumerable: true, get: function () { return EventDispatcher_1.EventDispatcher; } });
function eventFactory(options, finalizer) {
    return new EventPublisher_1.default(options, finalizer);
}
exports.default = eventFactory;
//# sourceMappingURL=eventFactory.js.map
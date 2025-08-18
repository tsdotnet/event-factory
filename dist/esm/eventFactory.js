import EventPublisher from './EventPublisher.js';
export { EventDispatcher } from './EventDispatcher.js';

/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */
function eventFactory(options, finalizer) {
    return new EventPublisher(options, finalizer);
}

export { EventPublisher, eventFactory as default };
//# sourceMappingURL=eventFactory.js.map

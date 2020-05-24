/**!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 * @packageDocumentation
 * @module event-factory
 * @ignore
 */
import EventPublisher from './EventPublisher';
export { EventDispatcher } from './EventDispatcher';
export default function eventFactory(options, finalizer) {
    return new EventPublisher(options, finalizer);
}
//# sourceMappingURL=eventFactory.js.map
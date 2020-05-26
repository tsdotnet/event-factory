/**!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 * @packageDocumentation
 * @module event-factory
 * @ignore
 */

import EventPublisher from './EventPublisher';
import {EventPublisherOptions} from './EventPublisherOptions';

export {EventDispatchBehavior} from './EventDispatchBehavior';
export {EventDispatcher} from './EventDispatcher';
export {Listener, Unsubscribe, Subscribe, EventRegistry, Event} from './Event';

export default function eventFactory (
	options?: EventPublisherOptions | number | null,
	finalizer?: () => void) {
	return new EventPublisher(options, finalizer);
}


/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import EventPublisher from './EventPublisher';
import { EventPublisherOptions } from './EventPublisherOptions';

export { EventPublisher, type EventPublisherOptions };
export type { EventDispatchBehavior } from './EventDispatchBehavior';
export { EventDispatcher } from './EventDispatcher';
export type { Listener, Unsubscribe, Subscribe, Subscribable, SubscribeFn, SubscribableOnce, EventRegistry, Event } from './Event';

export default function eventFactory<T = unknown>(
	options?: EventPublisherOptions | number | null,
	finalizer?: () => void) {
	return new EventPublisher<T>(options, finalizer);
}


/*!
 * @author electricessence / https://github.com/electricessence/
 * @license MIT
 */

import EventPublisher from './EventPublisher.js';
import type { EventPublisherOptions } from './EventPublisherOptions.js';

export { EventPublisher, type EventPublisherOptions };
export type { EventDispatchBehavior } from './EventDispatchBehavior.js';
export { EventDispatcher } from './EventDispatcher.js';
export type { Listener, Unsubscribe, Subscribe, Subscribable, SubscribeFn, SubscribableOnce, EventRegistry, Event } from './Event.js';

export default function eventFactory<T = unknown>(
	options?: EventPublisherOptions | number | null,
	finalizer?: () => void) {
	return new EventPublisher<T>(options, finalizer);
}


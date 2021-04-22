/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import {EventDispatchBehavior} from './EventDispatchBehavior';

export interface EventPublisherOptions
	extends EventDispatchBehavior
{
	/**
	 * The remaining number of publishes that will emit to listeners.
	 * When this number is zero all listeners are cleared and none can be added.
	 */
	remaining?: number;
}

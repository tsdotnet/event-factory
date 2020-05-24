/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
/**
 * @packageDocumentation
 * @module event-factory
 */

import {ErrorHandling} from './ErrorHandling';

export interface EventDispatchBehavior
{
	/**
	 * When true, events will be published in reverse order.
	 */
	reversePublish?: boolean;

	/**
	 * By default `Throw` (0) will allow errors to be thrown and subsequent execution will cease.
	 * Set this option to `Log` (1) to send the errors to the console.
	 * Set this option to `Ignore` (-1) to silently swallow all errors.
	 */
	errorHandling?: ErrorHandling;

	/**
	 * When true, will clear listeners after every publish.
	 * Useful for events that will only occur once.
	 */
	clearListenersAfterPublish?: boolean;
}

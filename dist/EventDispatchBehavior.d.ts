/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

export interface EventDispatchBehavior
{
	/**
	 * When true, events will be published in reverse order.
	 */
	reversePublish?: boolean;

	/**
	 * By default any errors caused by listeners will be thrown unless an error handler is specified here.
	 * For example, specifying console.error as the handler will send it to the console instead of throwing.
	 * You may want to inject a different error handler here.
	 */
	onError?: (error: unknown) => void;

	/**
	 * When true, will clear listeners after every publish.
	 * Useful for events that will only occur once.
	 */
	clearListenersAfterPublish?: boolean;
}

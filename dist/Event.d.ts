/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
/**
 * @packageDocumentation
 * @module event-factory
 */

/**
 * Event listener for events.
 */
export type Listener<T> = (value: T) => void;

/**
 * A callback for unsubscribing from an event.
 */

export type Unsubscribe = () => void;

/**
 * Adds a listener and returns an unsubscribe function.
 * @param listener
 */
export type Subscribe<T> = (listener: Listener<T>) => Unsubscribe;

export interface EventRegistry<T>
{
	/**
	 * Attempts to add a listener.
	 * @throws `ArgumentNullException` if the listener is null.
	 * @throws `ArgumentException` if the listener already exists.
	 * @param {Listener<T>} listener
	 * @return {number} The registered `Id` of the listener.
	 */
	add (listener: Listener<T>): number;

	/**
	 * Registers a listener.
	 * If the listener already exists, nothing changes and the original `Id` is returned.
	 * @throws `ArgumentNullException` if the listener is null.
	 * @param {Listener<T>} listener
	 * @return {number} The registered `Id` of the listener.
	 */
	register (listener: Listener<T>): number;

	/**
	 * Removes a listener by `Id`.
	 * @param {number} id The registered `Id` of the listener.
	 * @return {Listener<T> | undefined} The listener or undefined if not found.
	 */
	remove (id: number): Listener<T> | undefined;

	/**
	 * Clears all listeners.
	 * @return {number} The number of listeners cleared.
	 */
	clear (): number;
}

export type Event<T> = EventRegistry<T> & Subscribe<T>;

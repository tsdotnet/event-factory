/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { Event, EventPublisher } from '../src/EventPublisher';

export class MyObservable<T> {

	readonly start:Event<void>;
	readonly update:Event<T>;
	readonly complete:Event<void>;

	private readonly _dispatcher:{
		start:EventPublisher<void>,
		update:EventPublisher<T>,
		complete:EventPublisher<void>
	};

	constructor()
	{
		const start = new EventPublisher<void>();
		const update = new EventPublisher<T>();
		const complete = new EventPublisher<void>();
		this._dispatcher = { start, update, complete };
		this.start = start.event;
		this.update = update.event;
		this.complete = complete.event;
	}
}

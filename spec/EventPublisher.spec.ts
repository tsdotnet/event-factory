/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import EventPublisher from '../src/EventPublisher';

describe('EventPublisher', () =>
{
	it('should publish events while remaining is positive', () =>
	{
		let count = 0;
		const max = 3;
		const pub = new EventPublisher<void>(max);
		pub.event.add(() => ++count);
		for (let i = 1; i <= max; i++)
		{
			pub.publish();
			expect(count).toBe(i);
		}
		pub.publish();
		expect(count).toBe(3);
	});

	it('when configured, should clear event registration for every publish', () =>
	{
		let count = 0;
		const max = 3;
		const pub = new EventPublisher<void>(max);
		pub.clearListenersAfterPublish = true;
		for (let i = 1; i <= max; i++)
		{
			pub.event.add(() => ++count);
			pub.publish();
			expect(count).toBe(i);
		}
		pub.publish();
		expect(count).toBe(3);
	});

});



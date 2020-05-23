/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import {expect} from 'chai';
import EventPublisher from '../src/EventPublisher';

describe('EventPublisher', () =>
{
	it('should publish events while remaining is positive', () => {
		let count = 0;
		const max = 3;
		const pub = new EventPublisher<void>(max);
		pub.event.add(() => ++count);
		for(let i = 1; i<=max; i++)
		{
			pub.publish();
			expect(count).equal(i);
		}
		pub.publish();
		expect(count).equal(3);
	});

	it('when configured, should clear event registration for every publish', () => {
		let count = 0;
		const max = 3;
		const pub = new EventPublisher<void>({
			remaining: max,
			clearListenersAfterPublish: true
		});
		for(let i = 1; i<=max; i++)
		{
			pub.event.add(() => ++count);
			pub.publish();
			expect(count).equal(i);
		}
		pub.publish();
		expect(count).equal(3);
	});

	function testChildPub(max: number, parent: EventPublisher<void>, child: EventPublisher<void>)
	{
		let count = 0;
		child.event.add(() => ++count);
		for(let i = 1; i<=max; i++)
		{
			parent.publish();
			expect(count).equal(i);
		}
		parent.publish();
		expect(count).equal(3);
	}

	it('should publish to pre events', () =>
	{
		const max = 3;
		const pub = new EventPublisher<void>(max);
		testChildPub(max, pub, pub.addPre(max).addPre(max));
	});

	it('should publish to post events', () =>
	{
		const max = 3;
		const pub = new EventPublisher<void>(max);
		testChildPub(max, pub, pub.addPost(max).addPost(max));
	});

});



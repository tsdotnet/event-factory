/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import {expect} from 'chai';
import EventPublisher from '../src/EventPublisher';

describe('EventPublisher', () => {
	it('should publish events while remaining is positive', () => {
		let count = 0;
		const max = 3;
		const pub = new EventPublisher<void>(max);
		pub.dispatcher.event.add(() => ++count);
		for(let i = 1; i<=max; i++)
		{
			pub.publish();
			expect(count).equal(i);
		}
		pub.publish();
		expect(count).equal(3);
	});

	it('should only receive event count requested', () => {
		let count = 0;
		const max = 3;
		const pub = new EventPublisher<void>();
		pub.dispatcher.event.subscribe(() => ++count, 2);
		for(let i = 1; i<=max; i++) pub.publish();
		pub.publish();
		expect(count).equal(2);
		count = 0;
		pub.dispatcher.event.subscribe.once(() => ++count);
		for(let i = 1; i<=max; i++) pub.publish();
		expect(count).equal(1);
		count = 0;
		pub.dispatcher.event.once(() => ++count);
		for(let i = 1; i<=max; i++) pub.publish();
		expect(count).equal(1);
	});

	it('should resolve async', async () => {
		const pub = new EventPublisher<string>();
		const p1 = pub.dispatcher.event.once();
		pub.publish('hello');
		expect(await p1).equal('hello');
		let result;
		const p2 = pub.dispatcher.event.once();
		pub.dispose();
		try
		{
			// Disposed events should resolve faulted.
			result = await p2;
		}
		catch(e)
		{
			result = 'goodbye';
		}
		expect(result).equal('goodbye');
	});

	it('should resolve fulfilled promises', () => {
		const pub = new EventPublisher<string>();
		const p = pub.dispatcher.event.once()
			.then(result => expect(result).equal('hello'));
		pub.publish('hello');
		return p;
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
			pub.dispatcher.add(() => ++count);
			pub.publish();
			expect(count).equal(i);
		}
		pub.publish();
		expect(count).equal(3);
	});

	function testChildPub (max: number, parent: EventPublisher<void>, child: EventPublisher<void>)
	{
		let count = 0;
		child.dispatcher.add(() => ++count);
		for(let i = 1; i<=max; i++)
		{
			parent.publish();
			expect(count).equal(i);
		}
		parent.publish();
		expect(count).equal(3);
	}

	it('should publish to pre events', () => {
		const max = 3;
		const pub = new EventPublisher<void>(max);
		testChildPub(max, pub, pub.addPre(max).addPre(max));
	});

	it('should publish to post events', () => {
		const max = 3;
		const pub = new EventPublisher<void>(max);
		testChildPub(max, pub, pub.addPost(max).addPost(max));
	});

});



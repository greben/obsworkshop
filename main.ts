import { interval, Observable, Subscription } from 'rxjs'; 
import { take } from 'rxjs/operators';

console.clear();

// The difference is where you manage the observable from, Author completes, Consumer unsubscribes

// in FileA, API Author
// Author manages the observable with take
const obs = interval(1000).pipe(take(5));

// in FileB, consumer
// Consumer manages the observable by storing the subscription and calling unsubscribe
const sub2 = obs.subscribe(console.log, console.log, () => 
    console.log("complete")
);

setTimeout(() => sub2.unsubscribe(), 6000);

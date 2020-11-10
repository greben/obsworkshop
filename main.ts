import { interval, Observable, Subscription } from 'rxjs'; 
import { take } from 'rxjs/operators';

console.clear();

const o = new Observable(observer => {
    observer.next([4,5,6]);    
    observer.complete();    // when you call complete all subscription call unsubscribe on themselves
}); 

let result: Subscription = o.subscribe(
    val => console.log(val), // next callback
    err => console.error(err), // error callback
    () => console.log('Observable complete') // complete callback
);

result.unsubscribe();   

// using take to complete the observable subscription after 5 intervals
const sub = interval(1000)
    .pipe(take(5))
    .subscribe(console.log, console.log, () => console.log("sub complete"));

const sub2 = interval(1000)
    .subscribe(console.log, console.log, () => console.log("sub2 complete"));

// if we unsubscribe we have not completed the observable
setTimeout(() => sub2.unsubscribe(), 3000);

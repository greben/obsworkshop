import { Observable,  } from 'rxjs'; 
import { share } from 'rxjs/operators';

console.clear();

// in FileA
const o = new Observable(observer => {
    console.log("About to do http");
    // pretend we did http
    setTimeout(() => {
        console.log("Did http");
        observer.next([5,6,7]);    
    }, 1000);
    
}); // .pipe(share())
// share() will make this only create the observable once

// in FileB
// this create a new observable that is shared, but does not modify the original observable o
// can only mutated can't modify
// since the new observable is shared it will only be created once
const myObs = o.pipe(share());

myObs.subscribe(console.log);
myObs.subscribe(console.log);
myObs.subscribe(console.log);


// in FileC 
// subscribe to the FileA observable that is not shared, will create the observable with each subscription 
o.subscribe(console.log);
o.subscribe(console.log);
o.subscribe(console.log);




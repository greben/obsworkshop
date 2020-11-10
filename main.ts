import { interval, Observable,  } from 'rxjs'; 
import { filter, map, pairwise,take } from 'rxjs/operators';

console.clear();

// basically an interval observable
// const o = new Observable(observer => {
//     let count = 0;
//     setTimeout(() => {
//         observer.next(count++);    
//     }, 1000);
// }); 


// How you do chaining with observables
const o = interval(1000).pipe(
    filter(num => num % 2 == 0),
    map(num => num * 3),
    pairwise()
)

o.subscribe(console.log);




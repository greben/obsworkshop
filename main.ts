import { Observable } from 'rxjs';

// Eager vs Lazy
console.clear();

const promise = new Promise((resolve, reject) => {
    console.log('Creating Promise');
    resolve([1,2,3])
});

const observable = new Observable(observer => {
    console.log('Creating Observable');
    observer.next([4,5,6]);
});

// if you don't subscribe the observable doesn't get created
// the promise is eager so it fires when it is created
//promise.then(result => console.log(result));
//observable.subscribe(result => console.log(result));

/*
Creating Promise
Creating Observable
[ 4, 5, 6 ]
Creating Observable
[ 4, 5, 6 ]        
Creating Observable
[ 4, 5, 6 ]    
*/

//promise.then(result => console.log(result));

// promise.then(
//     result => {
//         console.log(result);
//     },
//         err => console.log(err)
// );

//observable.subscribe(result => console.log(result));

// observable.subscribe(
//     result => {
//         console.log(result);
//     },
//         err => console.log(err)
// );

setTimeout(() => {
    observable.subscribe(result => console.log(result));
}, 2000);

import { of, interval } from 'rxjs'; 
import { fromFetch } from 'rxjs/fetch';
import { map, switchMap, take } from 'rxjs/operators';


interval(100).pipe(
  take(5), 
  switchMap(val => {
    return fromFetch("https://www.mocky.io/v2/5d8b0e90350000e104d46b9b?mocky-delay=1000ms")
  })
).subscribe(console.log);

// https://stackblitz.com/edit/obsworkshop-cancellation?file=index.ts
// interval(1000).subscribe(console.log)
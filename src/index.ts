import './styles.scss';
import { BehaviorSubject, combineLatest, fromEvent, merge, of } from 'rxjs';
import { fromFetch } from 'rxjs/internal/observable/dom/fetch';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { GIPHY_API_KEY } from './constants';
import { elements } from './elements';

// need to pipe the event and map to return the value of the input
// map to the value of the target
// cast the event.target to an html input, then return value
const searchTermChange$ = fromEvent(elements.search, 'keyup').pipe(
    map(event => (event.target as HTMLInputElement).value),
);
const limitLowClick$ = fromEvent(elements.limits.low, 'click');
const limitMidClick$ = fromEvent(elements.limits.mid, 'click');
const limitHighClick$ = fromEvent(elements.limits.high, 'click');
const prevPageClick$ = fromEvent(elements.prevPage, 'click');
const nextPageClick$ = fromEvent(elements.nextPage, 'click');

const DEFAULT_SEARCH = 'HI';
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 0;


const search$ = new BehaviorSubject(DEFAULT_SEARCH);
const limit$ = new BehaviorSubject(DEFAULT_LIMIT);
const page$ = new BehaviorSubject(DEFAULT_PAGE);
const userPage$ = page$.pipe(map(val => val + 1));  // show user page starting at 1 rather than 0
const totalResults$ = new BehaviorSubject(0);
const totalPages$ = combineLatest(totalResults$, limit$).pipe(
    map(([totalResults, limit]) => Math.ceil(totalResults / limit))
);

search$.subscribe(console.log);

// add the BehaviorSubjects to the window so w can trigger the next function in the browser dev console
// @ts-ignore
window._ = {search$, limit$, page$};

const changes$ = combineLatest([search$, limit$, page$]);

// combineLatest will emit an array of the latest values from the observables. the array is in same order as the original arguments 
const gifsData$ = changes$.pipe(
    debounceTime(200),  // don't spam the api with every key stroke

    switchMap(([search, limit, page]) => {
        return fromFetch(
                // prettier-ignore
                `https://api.giphy.com/v1/gifs/search?q=${search}&offset=${page * limit}&limit=${limit}&api_key=${GIPHY_API_KEY}`,
            );
    }),
    // fetch returns a response, and we have to switch to the .json call
    switchMap(response => response.json()),
    tap(res => totalResults$.next(res.pagination.total_count))  // set the total_count on the BehaviorSubject
);


// Remove just the gifs data from the response
const gifs$ = gifsData$.pipe(map(data => data.data));

gifsData$.subscribe(console.log);


gifs$.subscribe(gifs => {
    // Clear out all gifs
    elements.gifContainer.innerHTML = '';

    // Create new gifs and add to DOM
    gifs.forEach(gif => {
        const img = document.createElement('img');
        img.src = gif.images.fixed_height_small.url;
        elements.gifContainer.appendChild(img);
    });
});



searchTermChange$.pipe(
    tap(value => search$.next(value))
).subscribe();

// when search term changes and new value to the input element
// need to cast element or use ignore 
//search$.subscribe(val => (elements.search as HTMLInputElement).value = val);
// @ts-ignore
//search$.pipe.subscribe(val => elements.search.value = val);
search$.pipe(
    // @ts-ignore
    tap((val => elements.search.value = val))
).subscribe();

totalResults$.pipe(
    tap(val => elements.totalResults.innerHTML = val.toString())
).subscribe();

totalPages$.subscribe(val => elements.totalPages.innerHTML = val.toString())

userPage$.subscribe(page => {
    elements.pageNum.innerHTML = `${page}`//page.toString();
    if (page === 1) {
        elements.prevPage.setAttribute('disabled', 'true');
    } else {
        elements.prevPage.removeAttribute('disabled');
    }
 });

 combineLatest([totalPages$, userPage$]).subscribe(([total, userPage]) => {
    elements.prevPage.removeAttribute('disabled');
    elements.nextPage.removeAttribute('disabled');
    if (userPage === 1) {
        elements.prevPage.setAttribute('disabled', 'true');
    }    
     if (userPage >= total) {
        elements.nextPage.setAttribute('disabled', 'true');
    }
 });

// merge the three buttons together and pass the value to limits$
 merge(limitLowClick$, limitMidClick$, limitHighClick$).subscribe(e => {
     const target = e.target as HTMLInputElement;
     const value = target.innerHTML;

     // put the value back on the limit$ so the stream refires with the new limit
     limit$.next(parseInt(value, 10));
 });

 limit$.subscribe(limit => {
     // check all three buttons and disable the clicked button 
     [elements.limits.low, elements.limits.mid, elements.limits.high].forEach(
        button => {
           if (button.innerHTML === `${limit}`) {
               button.setAttribute('disabled', 'true');
           } else {
               button.removeAttribute('disabled');
           }
       }
    );
 })


prevPageClick$.subscribe(() => {
    // get the current value of page BehaviorSubject, only BehaviorSubject have this method because you have to set a default value
    // you can't put new data in a Observable
    const currentPage = page$.getValue();   
    page$.next(currentPage - 1);
});

nextPageClick$.subscribe(() => {
    const currentPage = page$.getValue();
    page$.next(currentPage + 1);
})
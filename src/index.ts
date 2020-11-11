import './styles.scss';
import { BehaviorSubject, combineLatest, fromEvent, of } from 'rxjs';
import { fromFetch } from 'rxjs/internal/observable/dom/fetch';
import { debounceTime, map, switchMap } from 'rxjs/operators';
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
const limitNighClick$ = fromEvent(elements.limits.high, 'click');
const prevPageClick$ = fromEvent(elements.prevPage, 'click');
const nextPageClick$ = fromEvent(elements.nextPage, 'click');

const DEFAULT_SEARCH = 'HI';
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 0;


const search$ = new BehaviorSubject(DEFAULT_SEARCH);
const limit$ = new BehaviorSubject(DEFAULT_LIMIT);
const page$ = new BehaviorSubject(DEFAULT_PAGE);

search$.subscribe(console.log);
search$.next("GOODBYE");    // now we'll see goodbye gifs

// add the BehaviorSubjects to the window so w can trigger the next function in the browser dev console
// @ts-ignore
window._ = {search$, limit$, page$};

const changes$ = combineLatest([search$, limit$, page$]);

// combineLatest will emit an array of the latest values from the observables. the array is in same order as the original arguments 
const gifsData$ = changes$.pipe(
    debounceTime(200),  // don't spam the api with every key stroke
    // post the search term to external server 
    switchMap((values) => { // values is an array[] of the observables: search$, limit$, page$ latest values 
        return fromFetch('MyServer.com', {
            method: "POST",
            body: "{search: " + values[0] + "}"   // use the first element since search is the first argument/item
        }).pipe(
            switchMap(res => of(values))    // put the values back in the stream
        )
    }),
    switchMap(([search, limit, page]) => {
        return fromFetch(
                // prettier-ignore
                `https://api.giphy.com/v1/gifs/search?q=${search}&offset=${page * limit}&limit=${limit}&api_key=${GIPHY_API_KEY}`,
            );
    }),

    // fetch returns a response, and we have to switch to the .json call
    switchMap(response => response.json()),
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



searchTermChange$.subscribe(value => search$.next(value))
import {Injectable} from '@angular/core';
import {Place} from "./place.model";

@Injectable({
    providedIn: 'root'
})
export class PlacesService {

    private _places: Place[] = [
        {
            id: 'p1',
            title: 'Manhattan Mansion',
            description: 'In the heart of New York City',
            imageUrl: 'https://media.gettyimages.com/id/1897042270/photo/tianjin-city.jpg?s=2048x2048&w=gi&k=20&c=Oxk7wbHSp6-lPSnveF_mncvFlTUf4sNbKfr_Y27JdCI=',
            price: 149.99,
            featured: true,
            availableFrom: new Date('2025-07-01'),
            availableTo: new Date('2025-10-31')
        },
        {
            id: 'p2',
            title: 'L\'Amour Toujours',
            description: 'A romantic place in Paris',
            imageUrl: 'https://media.gettyimages.com/id/1952253409/photo/skyline-paris.jpg?s=2048x2048&w=gi&k=20&c=rT6Rz16hMbGXH1Rs0_pecWnXtcw9umcbLhP_ke0LU9o=',
            price: 189.99,
            featured: false,
            availableFrom: new Date('2025-08-01'),
            availableTo: new Date('2025-09-30')
        },
        {
            id: 'p3',
            title: 'The Foggy Palace',
            description: 'Not you average city trip!',
            imageUrl: 'https://media.gettyimages.com/id/2184226101/photo/park-krasi%C5%84skich-in-warsaw-poland.jpg?s=2048x2048&w=gi&k=20&c=fwJhYfrupLCGeyJ54w-jviLfj56-PRZqpJPbR_3EBsY=',
            price: 99.99,
            featured: false,
            availableFrom: new Date('2025-06-01'),
            availableTo: new Date('2025-07-31')
        }
    ];

    constructor() {
    }

    get places() {
        return [...this._places];
    }

    getPlace(id: string): Place {
        return {...this._places.find(place => place.id === id)} as Place;
    }
}

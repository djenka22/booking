import {Injectable} from '@angular/core';
import {Place} from "./place.model";
import {AuthService} from "../auth/auth.service";
import {BehaviorSubject, delay, map, Observable, take, tap} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PlacesService {

    private _places = new BehaviorSubject<Place[]>([
        {
            id: 'p1',
            title: 'Manhattan Mansion',
            description: 'In the heart of New York City',
            imageUrl: 'https://media.gettyimages.com/id/1897042270/photo/tianjin-city.jpg?s=2048x2048&w=gi&k=20&c=Oxk7wbHSp6-lPSnveF_mncvFlTUf4sNbKfr_Y27JdCI=',
            price: 149.99,
            featured: true,
            availableFrom: new Date('2025-07-01'),
            availableTo: new Date('2025-10-31'),
            userId: '2'
        },
        {
            id: 'p2',
            title: 'L\'Amour Toujours',
            description: 'A romantic place in Paris',
            imageUrl: 'https://media.gettyimages.com/id/1952253409/photo/skyline-paris.jpg?s=2048x2048&w=gi&k=20&c=rT6Rz16hMbGXH1Rs0_pecWnXtcw9umcbLhP_ke0LU9o=',
            price: 189.99,
            featured: false,
            availableFrom: new Date('2025-08-01'),
            availableTo: new Date('2025-09-30'),
            userId: '1'
        },
        {
            id: 'p3',
            title: 'The Foggy Palace',
            description: 'Not you average city trip!',
            imageUrl: 'https://media.gettyimages.com/id/2184226101/photo/park-krasi%C5%84skich-in-warsaw-poland.jpg?s=2048x2048&w=gi&k=20&c=fwJhYfrupLCGeyJ54w-jviLfj56-PRZqpJPbR_3EBsY=',
            price: 99.99,
            featured: false,
            availableFrom: new Date('2025-06-01'),
            availableTo: new Date('2025-07-31'),
            userId: '3'
        }
    ]);

    constructor(private authService: AuthService) {
    }

    get places() {
        return this._places.asObservable();
    }

    getPlace(id: string): Observable<Place> {
        return this._places.pipe(
            take(1),
            map(places => {
                return {...places.find(p => p.id === id) as Place};
            })
        );
    }

    addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
        const newPlace: Place = {
            id: Math.random().toString(),
            title,
            description,
            imageUrl: 'https://media.gettyimages.com/id/2184226101/photo/park-krasi%C5%84skich-in-warsaw-poland.jpg?s=2048x2048&w=gi&k=20&c=fwJhYfrupLCGeyJ54w-jviLfj56-PRZqpJPbR_3EBsY=',
            price,
            featured: false,
            availableFrom: dateFrom,
            availableTo: dateTo,
            userId: this.authService.userId
        };

        return this.places.pipe(
            take(1),
            delay(1500),
            tap({
                next: (places) => {
                    this._places.next(places.concat(newPlace));
                }
            })
        );
    }

    updatePlace(placeId: string, title: string, description: string, price: number, availableFrom: Date, availableTo: Date) {
        return this.places.pipe(
            take(1),
            delay(1500),
            tap({
                next: (places) => {
                    const updatedPlaces = places.map(p => {
                        if (p.id === placeId) {
                            return {
                                ...p, // Copy all existing properties
                                title,
                                description,
                                price,
                                availableFrom,
                                availableTo
                            };
                        }
                        return p; // Return unchanged place
                    });
                    this._places.next(updatedPlaces);
                }
            })
        );
    }
}

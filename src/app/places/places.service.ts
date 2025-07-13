import {Injectable} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {BehaviorSubject, delay, map, Observable, take, tap} from "rxjs";
import {Place} from "./model/place.model";
import {NewPlace} from "./model/new-place.model";
import {addDoc, collection, collectionData, doc, docData, Firestore} from "@angular/fire/firestore";
import {Timestamp} from "firebase/firestore";

@Injectable({
    providedIn: 'root'
})
export class PlacesService {

    private _places = new BehaviorSubject<Place[]>([]);

    constructor(private authService: AuthService,
                private firestore: Firestore) {
    }

    get places() {
        const placesRef = collection(this.firestore, 'places');
        return collectionData(placesRef, {idField: 'id'}) as Observable<Place[]>;
    }

    getPlaceById(id: string): Observable<Place> {
        const placeDocRef = doc(this.firestore, 'places', id);
        const placeObs = docData(placeDocRef, {idField: 'id'}) as Observable<Place>;
        return placeObs.pipe(take(1), map(place => {
            if (!place) {
                throw new Error(`No place found with ID: ${id}`);
            }
            return {...place} as Place;
        }));
    }

    addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
        const newPlace: NewPlace = {
            title,
            description,
            imageUrl: 'https://media.gettyimages.com/id/2184226101/photo/park-krasi%C5%84skich-in-warsaw-poland.jpg?s=2048x2048&w=gi&k=20&c=fwJhYfrupLCGeyJ54w-jviLfj56-PRZqpJPbR_3EBsY=',
            price,
            featured: false,
            availableFrom: dateFrom,
            availableTo: dateTo,
            userId: this.authService.userId
        };

        return addDoc(collection(this.firestore, 'places'), newPlace);
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
                                availableFrom: Timestamp.fromDate(availableFrom),
                                availableTo: Timestamp.fromDate(availableTo)
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

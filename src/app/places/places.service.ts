import {Injectable} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {BehaviorSubject, map, Observable, of, take, tap} from "rxjs";
import {Place} from "./model/place.model";
import {NewPlace} from "./model/new-place.model";
import {
    addDoc,
    collection,
    collectionData,
    doc,
    docData,
    Firestore,
    query,
    updateDoc,
    where
} from "@angular/fire/firestore";
import {Timestamp} from "firebase/firestore";

@Injectable({
    providedIn: 'root'
})
export class PlacesService {

    private _places = new BehaviorSubject<Place[]>([]);
    private _offers = new BehaviorSubject<Place[]>([]);

    constructor(private authService: AuthService,
                private firestore: Firestore) {
    }

    get places() {
        return this._places.asObservable();
    }

    get offers() {
        return this._offers.asObservable();
    }

    fetchPlaces() {
        const placesRef = collection(this.firestore, 'places');
        const placesObservable = collectionData(placesRef, {idField: 'id'}) as Observable<Place[]>;
        return placesObservable.pipe(
            tap(
                places => {
                    this._places.next(places);
                }
            )
        )

    }

    getOffersByUserId(userId: string) {
        const placesRef = collection(this.firestore, 'places');
        const q = query(placesRef, where("userId", "==", userId));
        const observable = collectionData(q, {idField: 'id'}) as Observable<Place[]>;
        return observable.pipe(
            tap(places => {
                this._offers.next(places);
            })
        )

    }

    getPlaceById(id: string): Observable<Place> {
        const placeDocRef = doc(this.firestore, 'places', id);
        const placeObs = docData(placeDocRef, {idField: 'id'}) as Observable<Place>;
        return placeObs.pipe(
            take(1),
            map(place => {
                if (!place) {
                    throw new Error(`No place found with ID: ${id}`);
                }
                return {...place} as Place;
            })
        );
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

    update(placeId: string, title: string, description: string, price: number, availableFrom: Date, availableTo: Date) {
        const placeDocRef = doc(this.firestore, 'places', placeId);
        return updateDoc(placeDocRef, {
            title,
            description,
            price,
            availableFrom: Timestamp.fromDate(availableFrom),
            availableTo: Timestamp.fromDate(availableTo)
        })
    }

    validatePlaceUpdated(place: Place): Observable<Place | null> {
        if (!place) {
            return of(place);
        }

        return this.getPlaceById(place.id).pipe(
            tap(fetchedPlace => {
                if (fetchedPlace.title !== place.title ||
                    fetchedPlace.description !== place.description ||
                    fetchedPlace.availableFrom !== place.availableFrom ||
                    fetchedPlace.availableTo !== place.availableTo) {
                    console.log('Place updated from server.');
                    return fetchedPlace; // Return the updated place
                } else {
                    console.log('Place is already up to date.');
                    return place; // Return the original place if no changes
                }
            })
        );
    }
}

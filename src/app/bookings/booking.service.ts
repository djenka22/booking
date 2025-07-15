import {Injectable} from '@angular/core';
import {Booking, NewBooking,} from "./booking.model";
import {BehaviorSubject, forkJoin, lastValueFrom, map, Observable, of, switchMap, take, tap} from "rxjs";
import {AuthService} from '../auth/auth.service';
import {PlacesService} from "../places/places.service";
import {Place} from "../places/model/place.model";
import {
    addDoc,
    collection,
    collectionData,
    deleteDoc,
    doc,
    DocumentReference,
    Firestore,
    query,
    where
} from "@angular/fire/firestore";
import {User} from "../auth/user.model";

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    private _bookings = new BehaviorSubject<Booking[]>([]);

    constructor(private authService: AuthService,
                private placesService: PlacesService,
                private firestore: Firestore) {
    }

    get bookings() {
        return this._bookings.asObservable();
    }

    fetchBookings() {

        const bookingsRef = collection(this.firestore, 'bookings');
        const userDocRef = doc(this.firestore, 'users', this.authService.userId);
        const q = query(bookingsRef, where("user", "==", userDocRef));

        const bookingsObservable = collectionData(q, {idField: 'id'}) as Observable<Booking[]>;

        return bookingsObservable.pipe(
            switchMap(
                bookings => {
                    if (bookings.length === 0) {
                        return of([]);
                    }
                    const bookingsWithPlaceObservables = bookings.map(
                        booking => {
                            const placeObservable = this.placesService.getPlaceById(booking.place.id);
                            return placeObservable.pipe(
                                take(1),
                                map(place => {
                                    return {...booking, fetchedPlace: place} as Booking;
                                })
                            );
                        }
                    )
                    return forkJoin(bookingsWithPlaceObservables);
                }),
            tap(
                bookingsWithFetchedPlaces => {
                    this._bookings.next(bookingsWithFetchedPlaces);
                }
            )
        );
    }

    async addBooking(placeId: string, guestNumber: number, dateFrom: Date, dateTo: Date) {
        const place = await lastValueFrom(this.placesService.getPlaceById(placeId));

        if (!place) {
            return Promise.reject(new Error('Place with ID ${placeId} not found'));
        }

        const booking = new NewBooking(
            doc(this.firestore, 'places', placeId) as DocumentReference<Place>,
            doc(this.firestore, 'users', this.authService.userId) as DocumentReference<User>,
            guestNumber,
            dateFrom,
            dateTo
        );

        return addDoc(collection(this.firestore, 'bookings'), {...booking, bookedFrom: dateFrom, bookedTo: dateTo});
    }

    cancelBooking(bookingId: string) {
        const bookingsRef = doc(this.firestore, 'bookings', bookingId);
        return deleteDoc(bookingsRef);
    }
}

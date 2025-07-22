import {Injectable} from '@angular/core';
import {Booking, NewBooking,} from "./booking.model";
import {BehaviorSubject, combineLatest, forkJoin, lastValueFrom, map, Observable, of, switchMap, take, tap} from "rxjs";
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
    getDocs,
    limit,
    query,
    updateDoc,
    where
} from "@angular/fire/firestore";
import {User} from "../auth/user.model";
import {Timestamp} from "firebase/firestore";

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    private _bookings = new BehaviorSubject<Booking[]>([]);
    private bookingsCollection = collection(this.firestore, 'bookings');

    constructor(private authService: AuthService,
                private placesService: PlacesService,
                private firestore: Firestore) {
    }

    get bookings() {
        return this._bookings.asObservable();
    }

    fetchBookings() {

        return this.authService.userId.pipe(
            take(1),
            switchMap(userId => {
                if (!userId) {
                    return of([]);
                }
                const bookingsRef = this.bookingsCollection;
                const userDocRef = doc(this.firestore, 'users', userId);
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
                                    let placeObservable;
                                    try {
                                        placeObservable = this.placesService.getPlaceById(booking.place.id);
                                    } catch (error) {
                                        console.error('Error fetching place for booking:', booking.id, error);
                                        return of({...booking, fetchedPlace: null} as Booking);
                                    }
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
            })
        )

    }

    async addBooking(placeId: string, guestNumber: number, dateFrom: Date, dateTo: Date) {
        const userId = await lastValueFrom(this.authService.userId);
        if (!userId) {
            return Promise.reject(new Error('User is not authenticated'));
        }

        const place = await lastValueFrom(this.placesService.getPlaceById(placeId));
        if (!place) {
            return Promise.reject(new Error('Place with ID ${placeId} not found'));
        }

        const booking = new NewBooking(
            doc(this.firestore, 'places', placeId) as DocumentReference<Place>,
            doc(this.firestore, 'users', userId) as DocumentReference<User>,
            guestNumber,
            Timestamp.fromDate(dateFrom),
            Timestamp.fromDate(dateTo)
        );

        return addDoc(this.bookingsCollection, {...booking, bookedFrom: dateFrom, bookedTo: dateTo});
    }

    cancelBooking(bookingId: string) {
        const bookingsRef = doc(this.firestore, 'bookings', bookingId);
        return deleteDoc(bookingsRef);
    }

    updateBooking(bookingId: string, dateFrom: Date, dateTo: Date, guestNumber: number): Promise<void> {
        const bookingRef = doc(this.firestore, 'bookings', bookingId);
        return updateDoc(bookingRef, {
            bookedFrom: Timestamp.fromDate(dateFrom),
            bookedTo: Timestamp.fromDate(dateTo),
            guestNumber: guestNumber
        });
    }

    async findBookingByPlaceIdAndUserId(placeId: string, userId: string) {

        const bookingsCollection = this.bookingsCollection;
        const userRef = doc(this.firestore, 'users', userId);
        const placeRef = doc(this.firestore, 'places', placeId);

        const q = query(
            bookingsCollection,
            where('user', '==', userRef),
            where('place', '==', placeRef)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null; // No booking found
        }

        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        const booking: Booking = {
            id: docSnap.id,
            place: data['place'] as DocumentReference<Place>,
            user: data['user'] as DocumentReference<User>,
            guestNumber: data['guestNumber'],
            bookedFrom: data['bookedFrom'],
            bookedTo: data['bookedTo'],
            fetchedPlace: null
        };

        return booking;
    }

    findAllBookingsByPlaceId(placeId: string): Observable<Booking[]> {
        const bookingsRef = this.bookingsCollection;
        const placeRef = doc(this.firestore, 'places', placeId) as DocumentReference<Place>;

        const q = query(bookingsRef, where('place', '==', placeRef));

        return collectionData(q, {idField: 'id'}) as Observable<Booking[]>;
    }

    findAllBookingsByPlaceIdExcludeBookingId(placeId: string, bookingId: string): Observable<Booking[]> {
        const bookingsRef = this.bookingsCollection;
        const placeRef = doc(this.firestore, 'places', placeId) as DocumentReference<Place>;

        console.log('Finding all bookings for place:', placeId, 'excluding booking ID:', bookingId);
        // Create a query that excludes the specified booking ID
        const q = query(
            bookingsRef,
            where('place', '==', placeRef),
            where('__name__', '!=', bookingId)
        );

        return collectionData(q, {idField: 'id'}) as Observable<Booking[]>;
    }

    findAllBookingsByPlaceIdAfterDate(placeId: string, date: Date): Observable<Booking[]> {
        const placeRef = doc(this.firestore, 'places', placeId) as DocumentReference<Place>;
        const cutoffTimestamp = Timestamp.fromDate(date);

        // --- Query 1: bookedFrom >= date ---
        const q1 = query(
            this.bookingsCollection,
            where('place', '==', placeRef),
            where('bookedFrom', '>=', cutoffTimestamp)
        );
        const bookings$1 = collectionData(q1, { idField: 'id' }) as Observable<Booking[]>;

        // --- Query 2: bookedTo >= date ---
        const q2 = query(
            this.bookingsCollection,
            where('place', '==', placeRef),
            where('bookedTo', '>=', cutoffTimestamp)
        );
        const bookings$2 = collectionData(q2, { idField: 'id' }) as Observable<Booking[]>;

        // --- Combine results and deduplicate ---
        return combineLatest([bookings$1, bookings$2]).pipe(
            take(1),
            map(([bookingsFrom, bookingsTo]) => {
                const uniqueBookings = new Map<string, Booking>(); // Use a Map for efficient deduplication

                // Add bookings from the first query
                bookingsFrom.forEach(booking => {
                    uniqueBookings.set(booking.id!, booking); // Use booking.id! assuming it's always present after idField
                });

                // Add bookings from the second query (will overwrite if already present, ensuring uniqueness)
                bookingsTo.forEach(booking => {
                    uniqueBookings.set(booking.id!, booking);
                });
                // Convert the Map values back to an array
                return Array.from(uniqueBookings.values());
            })
        );
    }


    searchBookings(searchTerm: string): Observable<Booking[]> {
        if (!searchTerm || searchTerm.trim() === '') {
            return new Observable(observer => observer.next([])); // Return empty if no search term
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        // Option 2: `array-contains-any` (finds documents that contain ANY of the individual words in the search term)
        // This is generally more useful for multi-word searches.
        const searchTermsArray = lowerCaseSearchTerm.split(/\s+/).filter(term => term.length > 0);

        if (searchTermsArray.length === 0) {
            return new Observable(observer => observer.next([]));
        }

        return this.authService.userId.pipe(
            take(1),
            switchMap(userId => {
                    if (!userId) {
                        return of([]);
                    }

                    return this.placesService.searchPlaces(searchTerm).pipe(
                        take(1),
                        switchMap(places => {
                            if (places.length === 0) {
                                return of([]); // No places found
                            }

                            const placeRefs = places.map(place => {
                                return doc(this.firestore, 'places', place.id) as DocumentReference<Place>;
                            });
                            const userRef = doc(this.firestore, 'users', userId);

                            const q = query(
                                this.bookingsCollection,
                                where('place', 'in', placeRefs),
                                where('user', '==', userRef),
                                limit(1)
                            );

                            const bookingObservable = collectionData(q, {idField: 'id'}) as Observable<Booking[]>;
                            return bookingObservable.pipe(
                                take(1),
                                switchMap(bookings => {
                                    if (bookings.length === 0) {
                                        return of([]); // No bookings found
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
                                    );
                                    return forkJoin(bookingsWithPlaceObservables);
                                }));
                        }))
                }
            )
        );
    }

    async hasPlaceFutureBookings(place: Place) {
        const bookings = await lastValueFrom(this.findAllBookingsByPlaceIdAfterDate(place.id, new Date()));
        return bookings.length > 0;
    }
}

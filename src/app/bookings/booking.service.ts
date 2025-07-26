import {Injectable} from '@angular/core';
import {Booking, BookingDto,} from "./booking.model";
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    forkJoin,
    lastValueFrom,
    map,
    Observable,
    of,
    switchMap,
    take,
    tap
} from "rxjs";
import {AuthService} from '../auth/auth.service';
import {PlacesService} from "../places/places.service";
import {Place} from "../places/model/place.model";
import {
    collection,
    collectionData,
    deleteDoc,
    doc,
    DocumentReference,
    Firestore,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from "@angular/fire/firestore";
import {User} from "../auth/user.model";
import {Timestamp} from "firebase/firestore";
import {DateUtilsService} from "../shared/utils/date-utils.service";

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
                                    const placeObservable = this.placesService.getPlaceById(booking.place.id).pipe(
                                        take(1),
                                        catchError((error) => {
                                            return of(null)
                                        }),
                                    );
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
                        bookings => {
                            const bookingsWithFetchedPlaces = bookings.filter(booking => !!booking.fetchedPlace);
                            this._bookings.next(bookingsWithFetchedPlaces);
                        }
                    )
                );
            })
        )

    }

    async createBooking(bookingDto: BookingDto) {
        const userId = await lastValueFrom(this.authService.userId);
        if (!userId) {
            return Promise.reject(new Error('User is not authenticated'));
        }

        const place = await lastValueFrom(this.placesService.getPlaceById(bookingDto.placeId!));
        if (!place) {
            return Promise.reject(new Error('Place with ID ${placeId} not found'));
        }

        const datesInRange = DateUtilsService.getDatesInRange(bookingDto.bookedFrom!, bookingDto.bookedTo!);
        const docRef = doc(this.bookingsCollection);
        const bookingId = docRef.id;

        const normalizedBookedFrom = DateUtilsService.normalizeDateToMidnight(bookingDto.bookedFrom!);
        const normalizedBookedTo = DateUtilsService.normalizeDateToMidnight(bookingDto.bookedTo!);

        const booking: Booking = new Booking(
            bookingId,
            doc(this.firestore, 'places', bookingDto.placeId!) as DocumentReference<Place>,
            doc(this.firestore, 'users', userId) as DocumentReference<User>,
            bookingDto.guestNumber!,
            Timestamp.fromDate(normalizedBookedFrom),
            Timestamp.fromDate(normalizedBookedTo),
            datesInRange,
        );

        return setDoc(docRef, {...booking});
    }

    cancelBooking(bookingId: string) {
        const bookingsRef = doc(this.firestore, 'bookings', bookingId);
        return deleteDoc(bookingsRef);
    }

    updateBooking(bookingDto: BookingDto): Promise<void> {
        const bookingRef = doc(this.firestore, 'bookings', bookingDto.id!);

        const normalizedBookedFrom = DateUtilsService.normalizeDateToMidnight(bookingDto.bookedFrom!);
        const normalizedBookedTo = DateUtilsService.normalizeDateToMidnight(bookingDto.bookedTo!);

        return updateDoc(bookingRef, {
            bookedFrom: Timestamp.fromDate(normalizedBookedFrom),
            bookedTo: Timestamp.fromDate(normalizedBookedTo),
            guestNumber: bookingDto.guestNumber,
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

        const resultSnap = querySnapshot.docs[0];
        const result = resultSnap.data();

        const booking: Booking = {
            id: resultSnap.id,
            place: result['place'] as DocumentReference<Place>,
            user: result['user'] as DocumentReference<User>,
            guestNumber: result['guestNumber'],
            bookedFrom: result['bookedFrom'],
            bookedTo: result['bookedTo'],
            fetchedPlace: null,
            datesInRange: result['datesInRange']
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

    findAllBookingsByPlaceIdAfterBookingDate(placeId: string, date: Date): Observable<Booking[]> {
        const placeRef = doc(this.firestore, 'places', placeId) as DocumentReference<Place>;
        const cutoffTimestamp = Timestamp.fromDate(date);

        // --- Query 1: bookedFrom >= date ---
        const q1 = query(
            this.bookingsCollection,
            where('place', '==', placeRef),
            where('bookedFrom', '>=', cutoffTimestamp),
            orderBy('bookedFrom', 'asc')
        );
        return  collectionData(q1, {idField: 'id'}) as Observable<Booking[]>;
    }

    findActiveBookingByPlaceId(placeId: string): Observable<Booking | null> {
        const placeRef = doc(this.firestore, 'places', placeId) as DocumentReference<Place>;
        const currentDate = new Date();

        // --- Query 1: bookedFrom >= date ---
        const q1 = query(
            this.bookingsCollection,
            where('place', '==', placeRef),
            where('bookedFrom', '<=', currentDate),
            where('bookedTo', '>=', currentDate),
            limit(1)
        );
        return (collectionData(q1, {idField: 'id'}) as Observable<Booking[]>).pipe(take(1), map(bookings => bookings.length > 0 ? bookings[0] : null));
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

    findBookingsByDatesInRange(dateFrom: Date | null, dateTo: Date | null, placeId: string): Observable<Booking[]> {
        if (!dateFrom && !dateTo) {
            return of([]);
        }

        const normalizedDateFrom = DateUtilsService.normalizeDateToMidnight(new Date(dateFrom!));
        const normalizedDateTo = DateUtilsService.normalizeDateToMidnight(new Date(dateTo!));

        if (normalizedDateFrom && !normalizedDateTo) {
            const dateFromQuery = query(
                this.bookingsCollection,
                where('place', '==', doc(this.firestore, 'places', placeId)),
                where('bookedFrom', '>=', normalizedDateFrom)
            );
            const dateToQuery = query(
                this.bookingsCollection,
                where('place', '==', doc(this.firestore, 'places', placeId)),
                where('bookedFrom', '<=', normalizedDateFrom),
                where('bookedTo', '>=', normalizedDateFrom)
            );
            const bookedAfterDateFrom = collectionData(dateFromQuery) as Observable<Booking[]>;
            const bookedBeforeDateFromAndBookedToAfterDateFrom = collectionData(dateToQuery) as Observable<Booking[]>;
            return combineLatest([bookedAfterDateFrom, bookedBeforeDateFromAndBookedToAfterDateFrom]).pipe(
                take(1),
                map(([bookedAfterDateFrom, bookedBeforeDateFromAndBookedToAfterDateFrom]) => {
                    const uniqueBookings = new Map<string, Booking>();

                    bookedAfterDateFrom.forEach(booking => {
                        uniqueBookings.set(booking.id, booking)
                    });
                    bookedBeforeDateFromAndBookedToAfterDateFrom.forEach(booking => {
                        uniqueBookings.set(booking.id, booking)
                    });
                    return Array.from(uniqueBookings.values());
                })
            );
        }

        if (!normalizedDateFrom && normalizedDateTo) {
            const dateFromQuery = query(
                this.bookingsCollection,
                where('place', '==', doc(this.firestore, 'places', placeId)),
                where('bookedTo', '<=', normalizedDateTo),
            );
            const dateToQuery = query(
                this.bookingsCollection,
                where('place', '==', doc(this.firestore, 'places', placeId)),
                where('bookedFrom', '<=', normalizedDateTo),
                where('bookedTo', '>=', normalizedDateTo)
            );
            const bookedBeforeDateTo = collectionData(dateFromQuery) as Observable<Booking[]>;
            const bookedBeforeDateToAndBookedToAfterDateTo = collectionData(dateToQuery) as Observable<Booking[]>;
            return combineLatest([bookedBeforeDateTo, bookedBeforeDateToAndBookedToAfterDateTo]).pipe(
                take(1),
                map(([bookedBeforeDateTo, bookedBeforeDateToAndBookedToAfterDateTo]) => {
                    const uniqueBookings = new Map<string, Booking>();
                    bookedBeforeDateTo.forEach(booking => uniqueBookings.set(booking.id, booking));
                    bookedBeforeDateToAndBookedToAfterDateTo.forEach(booking => uniqueBookings.set(booking.id, booking));
                    return Array.from(uniqueBookings.values());
                })
            );
        }

        const includeBothDatesQuery = query(
            this.bookingsCollection,
            where('place', '==', doc(this.firestore, 'places', placeId)),
            where('bookedFrom', '>=', normalizedDateFrom),
            where('bookedTo', '<=', normalizedDateTo)
        );
        const dateFromBeforeDateToAfterDateFromQuery = query(
            this.bookingsCollection,
            where('place', '==', doc(this.firestore, 'places', placeId)),
            where('bookedFrom', '<=', normalizedDateFrom),
            where('bookedTo', '>=', normalizedDateFrom)
        );
        const dateFromBeforeDateToAfterDateToQuery = query(
            this.bookingsCollection,
            where('place', '==', doc(this.firestore, 'places', placeId)),
            where('bookedFrom', '<=', normalizedDateTo),
            where('bookedTo', '>=', normalizedDateTo)
        );

        const includeBothDates$ = collectionData(includeBothDatesQuery) as Observable<Booking[]>;
        const dateFromBeforeDateToAfterDateFromQuery$ = collectionData(dateFromBeforeDateToAfterDateFromQuery) as Observable<Booking[]>;
        const dateFromBeforeDateToAfterDateToQuery$ = collectionData(dateFromBeforeDateToAfterDateToQuery) as Observable<Booking[]>;
        return combineLatest([includeBothDates$, dateFromBeforeDateToAfterDateFromQuery$, dateFromBeforeDateToAfterDateToQuery$]).pipe(
            take(1),
            map(([includeBothDates, dateFromBeforeDateToAfterDateFromQuery, dateFromBeforeDateToAfterDateToQuery]) => {
                const uniqueBookings = new Map<string, Booking>();
                includeBothDates.forEach(booking => uniqueBookings.set(booking.id, booking));
                dateFromBeforeDateToAfterDateFromQuery.forEach(booking => uniqueBookings.set(booking.id, booking));
                dateFromBeforeDateToAfterDateToQuery.forEach(booking => uniqueBookings.set(booking.id, booking));
                return Array.from(uniqueBookings.values());
            })
        );
    }

}

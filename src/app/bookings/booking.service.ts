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

    async createBooking(createBookingDto: BookingDto) {
        const userId = await lastValueFrom(this.authService.userId);
        if (!userId) {
            return Promise.reject(new Error('User is not authenticated'));
        }

        const place = await lastValueFrom(this.placesService.getPlaceById(createBookingDto.placeId!));
        if (!place) {
            return Promise.reject(new Error('Place with ID ${placeId} not found'));
        }

        const datesInRange = DateUtilsService.getDatesInRange(createBookingDto.bookedFrom!, createBookingDto.bookedTo!);
        const docRef = doc(this.bookingsCollection);
        const bookingId = docRef.id;

        const booking: Booking = new Booking(
            bookingId,
            doc(this.firestore, 'places', createBookingDto.placeId!) as DocumentReference<Place>,
            doc(this.firestore, 'users', userId) as DocumentReference<User>,
            createBookingDto.guestNumber!,
            Timestamp.fromDate(createBookingDto.bookedFrom!),
            Timestamp.fromDate(createBookingDto.bookedTo!),
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
        return updateDoc(bookingRef, {
            bookedFrom: Timestamp.fromDate(bookingDto.bookedFrom!),
            bookedTo: Timestamp.fromDate(bookingDto.bookedTo!),
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

    findActiveBookingByPlaceId(placeId: string): Observable<Booking> {
        const placeRef = doc(this.firestore, 'places', placeId) as DocumentReference<Place>;
        const currentDate = new Date();

        // --- Query 1: bookedFrom >= date ---
        const q1 = query(
            this.bookingsCollection,
            where('place', '==', placeRef),
            where('bookedFrom', '<=', currentDate),
            limit(1)
        );
        const bookings$1 = collectionData(q1, {idField: 'id'}) as Observable<Booking[]>;

        // --- Query 2: bookedTo >= date ---
        const q2 = query(
            this.bookingsCollection,
            where('place', '==', placeRef),
            where('bookedTo', '>=', currentDate),
            limit(1)
        );
        const bookings$2 = collectionData(q2, {idField: 'id'}) as Observable<Booking[]>;

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
                return Array.from(uniqueBookings.values())[0];
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

    findBookingsByDatesInRange(dateFrom: Date | null, dateTo: Date | null, placeId: string): Observable<Booking[]> {
        if (!dateFrom && !dateTo) {
            return of([]);
        }

        if (dateFrom && !dateTo) {
            const dateFromQuery = query(
                this.bookingsCollection,
                where('place', '==', doc(this.firestore, 'places', placeId)),
                where('bookedFrom', '>=', dateFrom)
            );
            const dateToQuery = query(
                this.bookingsCollection,
                where('place', '==', doc(this.firestore, 'places', placeId)),
                where('bookedFrom', '<=', dateFrom),
                where('bookedTo', '>=', dateFrom)
            );
            const bookedAfterDateFrom = collectionData(dateFromQuery) as Observable<Booking[]>;
            const bookedBeforeDateFromAndBookedToAfterDateFrom = collectionData(dateToQuery) as Observable<Booking[]>;
            return combineLatest([bookedAfterDateFrom, bookedBeforeDateFromAndBookedToAfterDateFrom]).pipe(
                take(1),
                map(([bookedAfterDateFrom, bookedBeforeDateFromAndBookedToAfterDateFrom]) => {
                    const uniqueBookings = new Map<string, Booking>();

                    bookedAfterDateFrom.forEach(booking => {
                        console.log('Booking after dateFrom:', booking);
                        uniqueBookings.set(booking.id, booking)
                    });
                    bookedBeforeDateFromAndBookedToAfterDateFrom.forEach(booking => {
                        console.log('Booking before dateFrom and bookedTo after dateFrom:', booking);
                        uniqueBookings.set(booking.id, booking)
                    });
                    return Array.from(uniqueBookings.values());
                })
            );
        }

        if (!dateFrom && dateTo) {
            const dateFromQuery = query(
                this.bookingsCollection,
                where('place', '==', doc(this.firestore, 'places', placeId)),
                where('bookedTo', '<=', dateTo),
            );
            const dateToQuery = query(
                this.bookingsCollection,
                where('place', '==', doc(this.firestore, 'places', placeId)),
                where('bookedFrom', '<=', dateTo),
                where('bookedTo', '>=', dateTo)
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
            where('bookedFrom', '>=', dateFrom),
            where('bookedTo', '<=', dateTo)
        );
        const dateFromBeforeDateToAfterDateFromQuery = query(
            this.bookingsCollection,
            where('place', '==', doc(this.firestore, 'places', placeId)),
            where('bookedFrom', '<=', dateFrom),
            where('bookedTo', '>=', dateFrom)
        );
        const dateFromBeforeDateToAfterDateToQuery = query(
            this.bookingsCollection,
            where('place', '==', doc(this.firestore, 'places', placeId)),
            where('bookedFrom', '<=', dateTo),
            where('bookedTo', '>=', dateTo)
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

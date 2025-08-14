import {Injectable} from '@angular/core';
import {
    collection,
    collectionData,
    doc,
    DocumentReference,
    Firestore,
    getCountFromServer,
    query,
    where
} from "@angular/fire/firestore";
import {from, map, Observable, of, switchMap} from "rxjs";
import {getDocs, Timestamp} from "firebase/firestore";
import {Place, PlaceWithDaysDto} from '../places/model/place.model';
import {Booking} from "../bookings/booking.model";


@Injectable({
    providedIn: 'root'
})
export class OverviewService {

    private placesCollection = collection(this.firestore, 'places');
    private bookingsCollection = collection(this.firestore, 'bookings');

    constructor(private firestore: Firestore) {
    }

    getPlacesCount(userId: string) {
        const userRef = doc(this.firestore, `users/${userId}`);

        const q = query(
            this.placesCollection,
            where('user', '==', userRef)
        );

        return from(getCountFromServer(q)).pipe(
            map(snapshot => snapshot.data().count),
        );
    }


    async getReservationsCountByPlace(userId: string, startDate: Date, endDate: Date): Promise<PlaceWithDaysDto[]> {
        const start = Timestamp.fromDate(startDate);
        const end = Timestamp.fromDate(endDate);

        const userRef = doc(this.firestore, `users/${userId}`);
        const placesQ = query(
            this.placesCollection,
            where('user', '==', userRef)
        );
        const placesSnap = await getDocs(placesQ);

        if (placesSnap.empty) {
            return [];
        }

        const placesMap = new Map<string, { title: string, ref: DocumentReference<Place> }>();
        placesSnap.forEach(docSnap => {
            const place = docSnap.data() as Place;
            placesMap.set(docSnap.ref.path, {title: place.title, ref: docSnap.ref as DocumentReference<Place>});
        });

        const bookingsQ = query(
            this.bookingsCollection,
            where('place', 'in', Array.from(placesMap.values()).map(p => p.ref)),
            where('bookedFrom', '>=', start),
            where('bookedFrom', '<=', end)
        );

        const bookingsSnap = await getDocs(bookingsQ);

        const counts = new Map<string, number>();
        bookingsSnap.forEach(docSnap => {
            const booking = docSnap.data() as Booking;
            const placeId = booking.place.path;
            counts.set(placeId, (counts.get(placeId) ?? 0) + booking.datesInRange.length);
        });

        const results: PlaceWithDaysDto[] = [];
        counts.forEach((count, placeId) => {
            const placeData = placesMap.get(placeId);
            if (placeData) {
                results.push({
                    placeTitle: placeData.title,
                    daysCount: count
                });
            }
        });

        return results;
    }

    getPlacesAvailability(userId: string, date: Date): Observable<PlaceWithDaysDto[]> {
        const monthStart = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0));
        const monthEnd = Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999));

        const today = new Date();
        const userRef = doc(this.firestore, `users/${userId}`);

        const placesQ = query(
            this.placesCollection,
            where('user', '==', userRef),
            where('availableFrom', '<=', monthEnd),
            where('availableTo', '>=', monthStart)
        );
        const placesObs = collectionData(placesQ, { idField: 'id' }) as Observable<Place[]>;

        return placesObs.pipe(
            switchMap((places: Place[]) => {
                if (places.length === 0) {
                    return of([]);
                }

                const placeRefs = places.map(p => doc(this.firestore, `places/${p.id}`));
                const bookingsQ = query(
                    this.bookingsCollection,
                    where('place', 'in', placeRefs),
                    where('bookedFrom', '<=', monthEnd),
                    where('bookedTo', '>=', monthStart)
                );
                const bookingsObs = collectionData(bookingsQ, { idField: 'id' }) as Observable<Booking[]>;

                return bookingsObs.pipe(
                    map((bookings: Booking[]) => {
                        return places.map(place => {
                            // Determine the actual availability window for this place within the month
                            const placeAvailableFrom = place.availableFrom.toDate();
                            const placeAvailableTo = place.availableTo.toDate();

                            // Adjust availableStart if this is the current month and today is later than start
                            let availableStart = new Date(Math.max(
                                monthStart.toDate().getTime(),
                                placeAvailableFrom.getTime(),
                                (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear())
                                    ? today.getTime()
                                    : monthStart.toDate().getTime()
                            ));

                            let availableEnd = new Date(Math.min(
                                monthEnd.toDate().getTime(),
                                placeAvailableTo.getTime()
                            ));

                            // If the place is entirely outside the month or after today's date, skip
                            if (availableStart > availableEnd) {
                                return null;
                            }

                            // Get bookings for this place
                            const placeBookings = bookings.filter(b => b.place.path.endsWith(place.id));

                            // Track booked days
                            const coveredDays = new Set<string>();
                            placeBookings.forEach(b => {

                                for (let d of b.datesInRange) {
                                    coveredDays.add(d);
                                }
                            });

                            // Count available days in range
                            let availableDaysCount = 0;
                            for (let d = new Date(availableStart); d <= availableEnd; d.setDate(d.getDate() + 1)) {
                                const dayStr = d.toISOString().split('T')[0];
                                if (!coveredDays.has(dayStr)) {
                                    availableDaysCount++;
                                }
                            }

                            return {
                                placeTitle: place.title,
                                daysCount: availableDaysCount
                            } as PlaceWithDaysDto;
                        }).filter((dto): dto is PlaceWithDaysDto => dto !== null);
                    })
                );
            })
        );
    }
}

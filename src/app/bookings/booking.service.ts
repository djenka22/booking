import {Injectable} from '@angular/core';
import {Booking} from "./booking.model";

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    private _bookings: Booking[] = [
        {
            id: '1',
            place: {
                id: 'p1',
                title: 'Manhattan Mansion',
                description: 'In the heart of New York City',
                imageUrl: 'https://media.gettyimages.com/id/1897042270/photo/tianjin-city.jpg?s=2048x2048&w=gi&k=20&c=Oxk7wbHSp6-lPSnveF_mncvFlTUf4sNbKfr_Y27JdCI=',
                price: 149.99,
                featured: true,
                availableFrom: new Date('2025-07-01'),
                availableTo: new Date('2025-10-31')
            },
            userId: '1',
            guestNumber: 0
        }
    ];

    constructor() {
    }

    get bookings(): Booking[] {
        return [...this._bookings];
    }
}

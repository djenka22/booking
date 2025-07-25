import {Place} from "../places/model/place.model";
import {User} from "../auth/user.model";
import {DocumentReference} from "@angular/fire/firestore";
import {Timestamp} from "firebase/firestore";

export class Booking {

    public fetchedPlace!: Place | null

    constructor(public id: string,
                public place: DocumentReference<Place>,
                public user: DocumentReference<User>,
                public guestNumber: number,
                public bookedFrom: Timestamp,
                public bookedTo: Timestamp,
                public datesInRange: string[]) {
    }
}

export class BookingDto {
    public id?: string;
    public placeId?: string;
    public guestNumber?: number;
    public bookedFrom?: Date;
    public bookedTo?: Date;

    constructor(data: Partial<BookingDto>) {
        Object.assign(this, data);
    }
}

export interface BookingFormDto {
    bookingData?: {
        existingBookingId?: string,
        guestNumber: number,
        startDate: Date,
        endDate: Date,
    },
    role: 'cancel' | 'confirm' | 'update'
}

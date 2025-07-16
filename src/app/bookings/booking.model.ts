import {Place} from "../places/model/place.model";
import {User} from "../auth/user.model";
import {DocumentReference} from "@angular/fire/firestore";
import {Timestamp} from "firebase/firestore";

export class Booking {

    public fetchedPlace?: Place;

    constructor(public id: string,
                public place: DocumentReference<Place>,
                public user: DocumentReference<User>,
                public guestNumber: number,
                public bookedFrom: Timestamp,
                public bookedTo: Timestamp) {
    }
}

export class NewBooking {

    public fetchedPlace?: Place;

    constructor(public place: DocumentReference<Place>,
                public user: DocumentReference<User>,
                public guestNumber: number,
                public bookedFrom: Timestamp,
                public bookedTo: Timestamp) {
    }
}



export interface CreateBookingDto {
    bookingData?: {
        guestNumber: number,
        startDate: Date,
        endDate: Date
    },
    role: 'cancel' | 'confirm' | 'update'
}


export class Booking {

    constructor(public id: string,
                public placeId: string,
                public userId: string,
                public placeTitle: string,
                public placeImage: string,
                public firstName: string,
                public lastName: string,
                public guestNumber: number,
                public bookedFrom: Date,
                public bookedTo: Date) {
    }

}

export interface CreateBookingDto {
    bookingData?: {
        firstName: string,
        lastName: string,
        guestNumber: number,
        startDate: Date,
        endDate: Date
    },
    role: 'cancel' | 'confirm'
}

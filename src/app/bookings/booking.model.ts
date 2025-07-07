import {Place} from "../places/place.model";

export class Booking {

    constructor(public id: string, public place: Place, public userId: string, public guestNumber: number ) {
    }

}

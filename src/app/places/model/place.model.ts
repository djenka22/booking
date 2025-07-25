import {Timestamp} from 'firebase/firestore'
import {DocumentReference} from "@angular/fire/firestore";
import {User} from "../../auth/user.model";

export interface Place {

    id: string;
    title: string;
    description: string;
    imageUrl: string;
    guestNumber: number;
    price: number;
    featured: boolean
    availableFrom: Timestamp;
    availableTo: Timestamp;
    user: DocumentReference<User>,
    searchKeywords: string[];
}

export class PlaceDto {
    public id?: string;
    public title?: string;
    public description?: string;
    public imageUrl?: string;
    public guestNumber?: number;
    public price?: number;
    public featured?: boolean
    public availableFrom?: Timestamp;
    public availableTo?: Timestamp;
    public user?: DocumentReference<User>;
    public searchKeywords?: string[];

    constructor(data: Partial<PlaceDto>) {
        Object.assign(this, data);
    }
}

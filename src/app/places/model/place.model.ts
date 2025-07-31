import {Timestamp} from 'firebase/firestore'
import {DocumentReference} from "@angular/fire/firestore";
import {User} from "../../auth/user.model";

export class Place {

    id: string;
    title: string;
    description: string;
    imageUrl: string;
    guestNumber: number;
    price: number;
    featured: boolean
    availableFrom: Timestamp;
    availableTo: Timestamp;
    user: DocumentReference<User>;
    searchKeywords: string[];

    constructor(id: string, title: string, description: string, imageUrl: string, guestNumber: number, price: number,
                featured: boolean, availableFrom: Timestamp, availableTo:
                Timestamp, user: DocumentReference<User>, searchKeywords: string[]) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.guestNumber = guestNumber;
        this.price = price;
        this.featured = featured;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.user = user;
        this.searchKeywords = searchKeywords;
    }
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

import {DocumentReference} from "@angular/fire/firestore";
import {User} from "../../auth/user.model";

export class NewPlace {
    id?: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    guestNumber: number;
    featured: boolean
    availableFrom: Date;
    availableTo: Date;
    user: DocumentReference<User>;
    searchKeywords: string[];


    constructor(title: string, description: string, imageUrl: string, guestNumber: number, price: number, featured: boolean, availableFrom: Date, availableTo: Date, user: DocumentReference<User>, searchKeywords: string[], id?: string) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.featured = featured;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.user = user;
        this.searchKeywords = searchKeywords;
        this.guestNumber = guestNumber;
    }
}

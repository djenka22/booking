import {Timestamp} from 'firebase/firestore'
import {DocumentReference} from "@angular/fire/firestore";
import {User} from "../../auth/user.model";

export interface Place {

    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    featured: boolean
    availableFrom: Timestamp;
    availableTo: Timestamp;
    user: DocumentReference<User>,
    searchKeywords: string[];
}

import {Timestamp} from 'firebase/firestore'

export interface Place {

    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    featured: boolean
    availableFrom: Timestamp;
    availableTo: Timestamp;
    userId: string
}

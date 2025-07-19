import {Injectable} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {BehaviorSubject, lastValueFrom, map, Observable, of, take, tap} from "rxjs";
import {Place} from "./model/place.model";
import {NewPlace} from "./model/new-place.model";
import {
    addDoc,
    collection,
    collectionData,
    deleteDoc,
    doc,
    docData,
    DocumentReference,
    Firestore,
    limit,
    query,
    updateDoc,
    where,
} from "@angular/fire/firestore";
import {Timestamp} from "firebase/firestore";
import {StorageReference} from "@firebase/storage";
import {deleteObject, getDownloadURL, ref, Storage, uploadBytes} from "@angular/fire/storage";
import {User} from "../auth/user.model";

@Injectable({
    providedIn: 'root'
})
export class PlacesService {

    private _places = new BehaviorSubject<Place[]>([]);
    private _offers = new BehaviorSubject<Place[]>([]);
    private placesCollection = collection(this.firestore, 'places');

    constructor(private authService: AuthService,
                private firestore: Firestore,
                private storage: Storage) {
    }

    get places() {
        return this._places.asObservable();
    }

    get offers() {
        return this._offers.asObservable();
    }

    fetchPlaces() {
        const placesRef = this.placesCollection;
        const placesObservable = collectionData(placesRef, {idField: 'id'}) as Observable<Place[]>;
        return placesObservable.pipe(
            tap(
                places => {
                    this._places.next(places);
                }
            )
        )
    }

    getOffersByUserId(userId: string) {
        const placesRef = this.placesCollection;
        const userDocRef = doc(this.firestore, 'users', userId) as DocumentReference<User>;
        const q = query(placesRef, where("user", "==", userDocRef));
        const observable = collectionData(q, {idField: 'id'}) as Observable<Place[]>;
        return observable.pipe(
            tap(places => {
                this._offers.next(places);
            })
        )

    }

    getPlaceById(id: string): Observable<Place> {
        const placeDocRef = doc(this.firestore, 'places', id);
        const placeObs = docData(placeDocRef, {idField: 'id'}) as Observable<Place>;
        return placeObs.pipe(
            take(1),
            map(place => {
                if (!place) {
                    throw new Error(`No place found with ID: ${id}`);
                }
                return {...place} as Place;
            })
        );
    }

    addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
        const searchKeywords = this.generateSearchKeywords(title);
        const userDocRef = doc(this.firestore, 'users', this.authService.userId) as DocumentReference<User>;
        const newPlace: NewPlace = {
            title,
            description,
            imageUrl: '',
            price,
            featured: false,
            availableFrom: dateFrom,
            availableTo: dateTo,
            user: userDocRef,
            searchKeywords
        };

        return addDoc(this.placesCollection, newPlace);
    }

    update(placeId: string, title: string, description: string, price: number, availableFrom: Date, availableTo: Date) {
        const placeDocRef = doc(this.firestore, 'places', placeId);
        return updateDoc(placeDocRef, {
            title,
            description,
            price,
            availableFrom: Timestamp.fromDate(availableFrom),
            availableTo: Timestamp.fromDate(availableTo)
        })
    }

    async delete(place: Place) {
        const placeDocRef = doc(this.firestore, 'places', place.id);
        await deleteDoc(placeDocRef);
        this.deleteImage(place.imageUrl);
    }

    async updateImageUrl(placeId: string, imageUrl: string) {
        const place = await lastValueFrom(this.getPlaceById(placeId).pipe(take(1)));
        const oldImageUrl = place.imageUrl;
        const placeDocRef = doc(this.firestore, 'places', place.id);
        return updateDoc(placeDocRef, {
            ...place,
            imageUrl: imageUrl,
        }).then(() => {
            if (oldImageUrl && oldImageUrl.length > 0) {
                this.deleteImage(oldImageUrl);
            }
        });
    }

    validatePlaceUpdated(place: Place): Observable<Place | null> {
        if (!place) {
            return of(place);
        }

        return this.getPlaceById(place.id).pipe(
            tap(fetchedPlace => {
                if (fetchedPlace.title !== place.title ||
                    fetchedPlace.description !== place.description ||
                    fetchedPlace.availableFrom !== place.availableFrom ||
                    fetchedPlace.availableTo !== place.availableTo) {
                    return fetchedPlace;
                } else {
                    return of(null);
                }
            })
        );
    }

    async uploadImage(placeId: string, file: File): Promise<string> {
        const uniqueFileName = placeId + '_' + file.name; // Generate unique filename
        const storageRef: StorageReference = ref(this.storage, uniqueFileName);

        try {
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error; // Re-throw to be handled by the calling component
        }
    }

    async deleteImage(path: string): Promise<void> {
        const imageRef: StorageReference = ref(this.storage, path);
        try {
            await deleteObject(imageRef);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    searchPlaces(searchTerm: string): Observable<Place[]> {
        if (!searchTerm || searchTerm.trim() === '') {
            return new Observable(observer => observer.next([])); // Return empty if no search term
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        // Option 2: `array-contains-any` (finds documents that contain ANY of the individual words in the search term)
        // This is generally more useful for multi-word searches.
        const searchTermsArray = lowerCaseSearchTerm.split(/\s+/).filter(term => term.length > 0);

        if (searchTermsArray.length === 0) {
            return new Observable(observer => observer.next([]));
        }

        // Firestore's `array-contains-any` can take up to 10 distinct values.
        // If your user types more than 10 words, you'll need to truncate or refine this.
        const q = query(
            this.placesCollection,
            where('searchKeywords', 'array-contains-any', searchTermsArray.slice(0, 10)), // Limit to first 10 words
            limit(20)
        );

        const placeObservable = collectionData(q, { idField: 'id' }).pipe() as Observable<Place[]>;
        return placeObservable.pipe(take(1));
    }

    searchOffers(searchTerm: string): Observable<Place[]> {
        if (!searchTerm || searchTerm.trim() === '') {
            return new Observable(observer => observer.next([])); // Return empty if no search term
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        // Option 2: `array-contains-any` (finds documents that contain ANY of the individual words in the search term)
        // This is generally more useful for multi-word searches.
        const searchTermsArray = lowerCaseSearchTerm.split(/\s+/).filter(term => term.length > 0);

        if (searchTermsArray.length === 0) {
            return new Observable(observer => observer.next([]));
        }


        const userDocRef = doc(this.firestore, 'users', this.authService.userId);

        // Firestore's `array-contains-any` can take up to 10 distinct values.
        // If your user types more than 10 words, you'll need to truncate or refine this.
        const q = query(
            this.placesCollection,
            where('user', '==', userDocRef),
            where('searchKeywords', 'array-contains-any', searchTermsArray.slice(0, 10)), // Limit to first 10 words
            limit(20)
        );

        const placeObservable = collectionData(q, { idField: 'id' }).pipe() as Observable<Place[]>;
        return placeObservable.pipe(take(1));
    }

    // Function to generate search keywords
    private generateSearchKeywords(title: string): string[] {
        const keywords: Set<string> = new Set();

        // Split title and description into words, convert to lowercase, and add to set
        title.toLowerCase().split(/\s+/).forEach(word => {
            if (word.length > 0) {
                keywords.add(word);
                for (let i = 1; i <= word.length; i++) {
                    keywords.add(word.substring(0, i));
                }
            }
        });

        return Array.from(keywords);
    }
}

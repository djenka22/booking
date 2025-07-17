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
    Firestore,
    query,
    updateDoc,
    where,
} from "@angular/fire/firestore";
import {Timestamp} from "firebase/firestore";
import {StorageReference} from "@firebase/storage";
import {deleteObject, getDownloadURL, ref, Storage, uploadBytes} from "@angular/fire/storage";

@Injectable({
    providedIn: 'root'
})
export class PlacesService {

    private _places = new BehaviorSubject<Place[]>([]);
    private _offers = new BehaviorSubject<Place[]>([]);

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
        const placesRef = collection(this.firestore, 'places');
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
        const placesRef = collection(this.firestore, 'places');
        const q = query(placesRef, where("userId", "==", userId));
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
        const newPlace: NewPlace = {
            title,
            description,
            imageUrl: '',
            price,
            featured: false,
            availableFrom: dateFrom,
            availableTo: dateTo,
            userId: this.authService.userId
        };

        return addDoc(collection(this.firestore, 'places'), newPlace);
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
}

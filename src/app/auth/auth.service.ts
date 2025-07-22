import {Injectable, OnInit} from '@angular/core';
import {doc, docData, Firestore, setDoc} from "@angular/fire/firestore";
import {BehaviorSubject, concatMap, filter, from, lastValueFrom, map, Observable, take} from "rxjs";
import {User} from "./user.model";
import {
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    UserCredential
} from "@angular/fire/auth";


@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnInit {

    private _user = new BehaviorSubject<User | null | undefined>(undefined);

    constructor(private firestore: Firestore,
                private auth: Auth) {
        console.log('AuthService: Initializing authentication state listener...');
        this.auth.onAuthStateChanged(async firebaseUser => {
            if (firebaseUser) {
                const userData = await lastValueFrom(this.findUserById(firebaseUser.uid));
                const user = new User(
                    firebaseUser.uid,
                    firebaseUser.email!,
                    userData.firstName,
                    userData.lastName
                );
                this._user.next(user);
                console.log('AuthService: User session restored or logged in:', user.email);
            } else {
                this._user.next(null);
                console.log('AuthService: User logged out or no session found.');
            }
        })
    }

    ngOnInit(): void {
    }

    get isAuthenticated() {
        console.log(' Checking authentication status...');
        return this._user.asObservable().pipe(
            filter(user => user !== undefined),
            take(1),
            map(user => {
                return !!user;
            })
        );
    }

    get user() {
        return this._user.asObservable().pipe(
            take(1),
            map(user => {
                if (user) {
                    return user;
                }
                return null;
            })
        );
    }

    get userId() {
        return this._user.asObservable().pipe(
            take(1),
            map(user => {
                if (user) {
                    return user.id
                }
                return null;
            }));
    }

    login(email: string, password: string): Observable<UserCredential> {
        return from(signInWithEmailAndPassword(this.auth, email, password))
            .pipe(
                concatMap(userCredential => from(this.setUserData(userCredential)).pipe(
                        map(() => userCredential)
                    )
                )
            );
    }

    async logout() {
        await signOut(this.auth);
        this._user.next(null);
    }

    signup(email: string, password: string, firstName: string, lastName: string): Observable<UserCredential> {
        return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
            concatMap(response => from(this.setUserData(response, firstName, lastName)).pipe(
                    map(() => response)
                )
            ));
    }

    createUser(userId: string, email: string, firstName: string, lastName: string) {
        const userDocRef = doc(this.firestore, 'users', userId);
        const userData = {
            id: userId,
            email: email,
            firstName: firstName,
            lastName: lastName
        };
        return setDoc(userDocRef, {...userData});
    }

    findUserById(userId: string): Observable<UserData> {
        const userDocRef = doc(this.firestore, 'users', userId);
        return (docData(userDocRef, {idField: 'id'}) as Observable<UserData>).pipe(take(1));
    }

    private async setUserData(userCredential: UserCredential, firstName?: string, lastName?: string) {

        if (!userCredential.user) {
            throw new Error('User credential is not available');
        }

        const userId = userCredential.user.uid;
        const userEmail = userCredential.user.email!;


        if (firstName && lastName) {
            await this.createUser(userId, userEmail, firstName, lastName);
        }

        const userData = await lastValueFrom(this.findUserById(userId));

        const user = new User(
            userId,
            userEmail,
            userData.firstName,
            userData.lastName,
        );

        this._user.next(user);
    }
}

export interface UserData {
    id: string
    email: string;
    firstName: string;
    lastName: string;
}

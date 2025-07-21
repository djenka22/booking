import {Injectable, OnDestroy} from '@angular/core';
import {doc, docData, Firestore, setDoc} from "@angular/fire/firestore";
import {BehaviorSubject, concatMap, from, lastValueFrom, map, Observable, of, switchMap, take, tap} from "rxjs";
import {User} from "./user.model";
import {HttpClient} from "@angular/common/http";
import {apiKey} from "../../environments/environment";
import {Preferences} from '@capacitor/preferences';
import {Auth, signOut} from "@angular/fire/auth";

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {

    signupUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey;
    signInUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + apiKey;

    private _user = new BehaviorSubject<User | null>(null);
    private activeLogoutTimer: any;


    constructor(private firestore: Firestore,
                private httpClient: HttpClient,
                private afAuth: Auth) {
    }

    ngOnDestroy(): void {
        if (this.activeLogoutTimer) {
            clearTimeout(this.activeLogoutTimer);
        }
    }

    get isAuthenticated() {
        return this._user.asObservable().pipe(
            map(
                user => {
                    if (user) {
                        return !!user.token
                    }
                    return false;
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

    login(email: string, password: string) {
        return this.httpClient.post<AuthResponseData>(this.signInUrl, {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(
            tap(this.setUserData.bind(this))
        )
    }

    async logout() {
        if (this.activeLogoutTimer) {
            clearTimeout(this.activeLogoutTimer);
        }
        await signOut(this.afAuth);
        this._user.next(null);
        Preferences.remove({key: 'user'});
    }

    signup(email: string, password: string, firstName: string, lastName: string): Observable<AuthResponseData> {
        return this.httpClient.post<AuthResponseData>(
            this.signupUrl,
            {email: email, password: password, returnSecureToken: true},
        ).pipe(
            concatMap(response =>  from(this.setUserData(response, firstName, lastName)).pipe(
                map (() => response)
            )
        ));
    }

    createUser(authResponseData: AuthResponseData, firstName: string, lastName: string) {
        const userDocRef = doc(this.firestore, 'users', authResponseData.localId);
        const userData = {
            id: authResponseData.localId,
            email: authResponseData.email,
            firstName: firstName,
            lastName: lastName
        };
        return setDoc(userDocRef, {...userData} );
    }

    findUserById(userId: string): Observable<UserData> {
        const userDocRef = doc(this.firestore, 'users', userId);
        return (docData(userDocRef, {idField: 'id'}) as Observable<UserData>).pipe(take(1));
    }

    private async setUserData(authResponseData: AuthResponseData, firstName?: string, lastName?: string) {

        if (firstName && lastName) {
            await this.createUser(authResponseData, firstName, lastName);
        }

        const userData = await lastValueFrom(this.findUserById(authResponseData.localId));

        const expirationDate = new Date(new Date().getTime() + +authResponseData.expiresIn * 1000);

        const user = new User(
            authResponseData.localId,
            authResponseData.email,
            userData.firstName,
            userData.lastName,
            authResponseData.idToken,
            expirationDate
        );

        this._user.next(user);
        this.autoLogout(user.tokenDuration);
        this.storeAuthData(user.id, authResponseData.idToken, expirationDate.toISOString(), user.email);
    }

    autoLogin() {
        let token: string;
        let expirationDate: Date;
        return from(Preferences.get({key: 'user'})).pipe(
            switchMap(storedData => {
                if (!storedData || !storedData.value) {
                    return of(null);
                }
                const parsedData = JSON.parse(storedData.value) as {token:string, expirationDate: string, userId: string, email: string};
                 expirationDate = new Date(parsedData.expirationDate);

                token = parsedData.token;
                if (expirationDate <= new Date()) {
                    return of(null);
                }

                return this.findUserById(parsedData.userId);
            }),
            switchMap(userData => {
                if (userData) {
                    const user = new User(
                        userData.id,
                        userData.email,
                        userData.firstName,
                        userData.lastName,
                        token,
                        expirationDate
                    );
                    this._user.next(user);
                    this.autoLogout(user.tokenDuration);
                    return of(user);
                }
                return of(null);
            }),
            map(user => {
                return !!user;
            })
        );
    }

    autoLogout(duration: number) {
        if (this.activeLogoutTimer) {
            clearTimeout(this.activeLogoutTimer);
        }

        this.activeLogoutTimer = setTimeout(() => {
            this.logout();
        }, duration);
    }

    private storeAuthData(userId: string, token: string, expirationDate: string, email: string) {
        Preferences.set(
            {
                key: 'user',
                value: JSON.stringify({
                    userId: userId,
                    token: token,
                    expirationDate: expirationDate,
                    email: email
                })
            }
        )
    }
}

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

export interface UserData {
    id: string
    email: string;
    firstName: string;
    lastName: string;
}

import {Injectable} from '@angular/core';
import {doc, docData, Firestore} from "@angular/fire/firestore";
import {map, Observable, take} from "rxjs";
import {User} from "./user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isAuthenticated = true;
  private _userId = '8sSETRsQbmsJ6iQHVNbp';

  constructor(private firestore: Firestore) { }

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  get userId() {
    return this._userId;
  }

  login() {
    this._isAuthenticated = true;
  }

  logout() {
    this._isAuthenticated = false;
  }

  getLoggedInUser(): Observable<User> {
    const userDocRef = doc(this.firestore, 'users', this._userId);
    const userObs = docData(userDocRef, {idField: 'id'}) as Observable<User>;
    return userObs.pipe(
        take(1),
        map(user => {
          if (!user) {
            throw new Error(`No user found with ID: ${this._userId}`);
          }
          return {...user} as User;
        })
    );
  }

}

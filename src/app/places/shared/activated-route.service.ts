import {Injectable} from '@angular/core';
import {ActivatedRoute, ParamMap} from "@angular/router";
import {PlacesService} from "../places.service";
import {Observable, switchMap, take, tap, throwError} from "rxjs";
import {Place} from "../model/place.model";

@Injectable({
    providedIn: 'root'
})
export class ActivatedRouteService {

    constructor(private placesService: PlacesService) {
    }

    findPlaceBasedOnRoute(activatedRoute: ActivatedRoute, pathId: string): Observable<Place> {
        return activatedRoute.paramMap.pipe(
            switchMap((paramMap: ParamMap) => {
                if (!paramMap.has(pathId)) {
                    return throwError(() => new Error(`No path parameter found for: ${pathId}`));
                }

                const placeId = paramMap.get(pathId);

                if (!placeId) {
                    return throwError(() => new Error(`Place ID is missing or empty for pathId: ${pathId}`));
                }

                return this.placesService.getPlaceById(placeId).pipe(
                    tap( {
                        next: (place: Place) => {
                            return place;
                        }
                    })
                );
            }),
            take(1)
        );
    }
}

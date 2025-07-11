import {Injectable} from '@angular/core';
import {Place} from "../place.model";
import {ActivatedRoute} from "@angular/router";
import {PlacesService} from "../places.service";
import {Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ActivatedRouteService {

  private placeSubscription?: Subscription;

  constructor(private placesService: PlacesService) { }

  findPlaceBasedOnRoute( activatedRoute:ActivatedRoute, pathId: string): Place | undefined {
    let place: Place | undefined;
    // Subscription is always live, it will update if the params change even if ngOnInit is already executed
    activatedRoute.paramMap.subscribe(paramMap => {
      if (paramMap.has(pathId)) {
        const placeId = paramMap.get(pathId);
        if (placeId) {
          this.placeSubscription = this.placesService.getPlace(placeId).subscribe(
              p => place = p
          );
          this.removePlaceSubscription();
        }
      }
    })

    return place;
  }

  removePlaceSubscription() {
    if (this.placeSubscription) {
      this.placeSubscription.unsubscribe();
    }
  }

  }

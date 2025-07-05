import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader, IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {Place} from "../../place.model";
import {PlacesService} from "../../places.service";
import {resolve} from "@angular/compiler-cli";

@Component({
    selector: 'app-offer-bookings',
    templateUrl: './offer-bookings.page.html',
    styleUrls: ['./offer-bookings.page.scss'],
    standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, IonButton, RouterLink, IonSpinner]
})
export class OfferBookingsPage implements OnInit {

    _place!: Place;

    constructor(private activatedRoute: ActivatedRoute,
                private placesService: PlacesService) {
    }

    ngOnInit() {
        // Subscription is always live, it will update if the params change even if ngOnInit is already executed
        this.activatedRoute.paramMap.subscribe(params => {
            if (params.has('placeId')) {
              const placeId = params.get('placeId');
              if (placeId) {
                this._place = this.placesService.getPlace(placeId);
              }
            }
        })
    }
}

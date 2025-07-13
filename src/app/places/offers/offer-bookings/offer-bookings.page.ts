import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    NavController
} from '@ionic/angular/standalone';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {Place} from "../../model/place.model";
import {ActivatedRouteService} from "../../shared/activated-route.service";

@Component({
    selector: 'app-offer-bookings',
    templateUrl: './offer-bookings.page.html',
    styleUrls: ['./offer-bookings.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, IonButton, RouterLink]
})
export class OfferBookingsPage implements OnInit {

    _place!: Place;

    constructor(private navController: NavController,
                private activatedRouteService: ActivatedRouteService,
                private activatedRoute: ActivatedRoute){
    }

    ngOnInit() {
        let place = this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute,'placeId');
        if (!place) {
            this.navController.navigateBack('/places/tabs/offers');
            return;
        }
        this._place = place;
    }
}

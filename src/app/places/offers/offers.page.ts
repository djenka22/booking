import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonList,
    IonMenuButton,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {OfferItemComponent} from "./offer-item/offer-item.component";
import {PlacesService} from "../places.service";
import {Place} from "../place.model";
import {addIcons} from "ionicons";
import {addOutline} from "ionicons/icons";
import {RouterLink} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-offers',
    templateUrl: './offers.page.html',
    styleUrls: ['./offers.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCol, IonGrid, IonList, IonRow, OfferItemComponent, IonButtons, IonButton, IonIcon, RouterLink, IonMenuButton]
})
export class OffersPage implements OnInit, OnDestroy {

    offers!: Place[];
    private placesSubscription!: Subscription;

    constructor(private placesService: PlacesService) {
        addIcons({addOutline})
    }

    ngOnDestroy(): void {
        if (this.placesSubscription) {
            this.placesSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.placesSubscription = this.placesService.places.subscribe(
            places => {this.offers = places;
            });
    }

}

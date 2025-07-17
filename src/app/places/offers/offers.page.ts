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
    IonItemSliding,
    IonList,
    IonMenuButton,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {OfferItemComponent} from "./offer-item/offer-item.component";
import {PlacesService} from "../places.service";
import {Place} from "../model/place.model";
import {addIcons} from "ionicons";
import {addOutline} from "ionicons/icons";
import {RouterLink} from "@angular/router";
import {Subscription} from "rxjs";
import {AuthService} from "../../auth/auth.service";

@Component({
    selector: 'app-offers',
    templateUrl: './offers.page.html',
    styleUrls: ['./offers.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCol, IonGrid, IonList, IonRow, OfferItemComponent, IonButtons, IonButton, IonIcon, RouterLink, IonMenuButton, IonSpinner]
})
export class OffersPage implements OnInit, OnDestroy {

    loading: boolean = false;
    offers!: Place[];
    private placesSubscription!: Subscription;
    ionItemSliding?: IonItemSliding;

    constructor(private placesService: PlacesService,
                private authService: AuthService) {
        addIcons({addOutline})
    }

    ngOnDestroy(): void {
        if (this.placesSubscription) {
            this.placesSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        console.log('OffersPage ngOnInit');
        this.loading = true;
        this.placesSubscription = this.placesService.getOffersByUserId(this.authService.userId).subscribe(
            places => {
                this.offers = places;
                this.loading = false;
            }
        )
    }

    ionViewWillEnter() {
        if (this.ionItemSliding) {
            this.ionItemSliding.closeOpened();
        }
    }

    onSlidingItemOutput(ionItemSliding: IonItemSliding) {
        this.ionItemSliding = ionItemSliding;
    }
}

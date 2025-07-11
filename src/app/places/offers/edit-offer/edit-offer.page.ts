import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonLoading,
    IonTitle,
    IonToolbar,
    NavController
} from '@ionic/angular/standalone';
import {Place} from "../../place.model";
import {ActivatedRoute} from "@angular/router";
import {ActivatedRouteService} from "../../shared/activated-route.service";
import {addIcons} from "ionicons";
import {checkmarkOutline} from "ionicons/icons";
import {OfferFormComponent} from "../offer-form/offer-form.component";
import {PlacesService} from "../../places.service";

@Component({
    selector: 'app-edit-offer',
    templateUrl: './edit-offer.page.html',
    styleUrls: ['./edit-offer.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, ReactiveFormsModule, IonButton, IonIcon, OfferFormComponent, IonLoading]
})
export class EditOfferPage implements OnInit {

    private _place!: Place;
    private _offerForm?: FormGroup;
    private _loading: boolean = false;

    constructor(private navController: NavController,
                private activatedRoute: ActivatedRoute,
                private activatedRouteService: ActivatedRouteService,
                private placesService: PlacesService) {

        addIcons({checkmarkOutline});
    }

    ngOnInit() {
        let place = this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute, 'offerId');
        if (!place) {
            this.navController.navigateBack('/places/tabs/offers');
            return;
        }
        this._place = place;
    }

    get place() {
        return this._place;
    }

    get loading() {
        return this._loading;
    }

    onSaveOffer() {
        if (this._offerForm?.invalid) {
            return;
        }
        this._loading = true;
        this.placesService.updatePlace(
            this.place.id,
            this.offerForm?.value['title'],
            this.offerForm?.value['description'],
            this.offerForm?.value['price'],
            new Date(this.offerForm?.value['availableFrom']),
            new Date(this.offerForm?.value['availableTo'])
        ).subscribe(() => {
            this._offerForm?.reset();
            this._loading = false;
        });
    }

    onFormReady($event: FormGroup) {
        this._offerForm = $event;
    }

    get offerForm() {
        return this._offerForm;
    }

    onOfferUpdated() {
        this.navController.navigateBack(['/', 'places', 'tabs', 'offers', this._place.id]);
    }
}

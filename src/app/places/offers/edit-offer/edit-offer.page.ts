import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonLoading,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToolbar,
    NavController
} from '@ionic/angular/standalone';
import {Place} from "../../model/place.model";
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
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, ReactiveFormsModule, IonButton, IonIcon, OfferFormComponent, IonLoading, IonSpinner, IonGrid, IonRow, IonCol]
})
export class EditOfferPage implements OnInit {

    private _place!: Place;
    private _offerForm?: FormGroup;
    private _loading: boolean = false;
    private _fetchLoading: boolean = false;

    constructor(private navController: NavController,
                private activatedRoute: ActivatedRoute,
                private activatedRouteService: ActivatedRouteService,
                private placesService: PlacesService) {

        addIcons({checkmarkOutline});
    }

    ngOnInit() {
        try {
            this._fetchLoading = true;

            this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute, 'offerId').subscribe(
                p => {
                    this._place = p;
                    this._fetchLoading = false;
                }
            )
        } catch (e) {
            this.navController.navigateBack('/places/tabs/offers');
            return;
        }
    }

    get fetchLoading() {
        return this._fetchLoading;
    }

    get place() {
        return this._place;
    }

    get loading() {
        return this._loading;
    }

    async onSaveOffer() {
        if (this._offerForm?.invalid) {
            return;
        }
        this._loading = true;
        await this.placesService.update(
            this.place.id,
            this.offerForm?.value['title'],
            this.offerForm?.value['description'],
            this.offerForm?.value['price'],
            new Date(this.offerForm?.value['availableFrom']),
            new Date(this.offerForm?.value['availableTo'])
        );
        this._loading = false;
    }

    onFormReady($event: FormGroup) {
        this._offerForm = $event;
    }

    get offerForm() {
        return this._offerForm;
    }

    onOfferUpdated() {
        this.navController.navigateBack(['/', 'places', 'tabs', 'offers', this._place.id]);
        this._offerForm?.reset();
    }
}

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

@Component({
    selector: 'app-edit-offer',
    templateUrl: './edit-offer.page.html',
    styleUrls: ['./edit-offer.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, ReactiveFormsModule, IonButton, IonIcon, OfferFormComponent]
})
export class EditOfferPage implements OnInit {


    private _place!: Place;
    private _offerForm?: FormGroup;

    constructor(private navController: NavController,
                private activatedRoute: ActivatedRoute,
                private activatedRouteService: ActivatedRouteService) {

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

    onSaveOffer() {
        if (this._offerForm?.invalid) {
            return;
        }
        console.log(this.offerForm?.value);
        this.navController.navigateBack(['/', 'places', 'tabs', 'offers', this._place.id]);
    }

    onFormReady($event: FormGroup) {
        this._offerForm = $event;
    }

    get offerForm() {
        return this._offerForm;
    }
}

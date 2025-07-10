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
    IonToolbar
} from '@ionic/angular/standalone';
import {addIcons} from "ionicons";
import {calendarOutline, checkmarkOutline} from "ionicons/icons";
import {OfferFormComponent} from "../offer-form/offer-form.component";

@Component({
    selector: 'app-new-offer',
    templateUrl: './new-offer.page.html',
    styleUrls: ['./new-offer.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon, ReactiveFormsModule, OfferFormComponent]
})
export class NewOfferPage implements OnInit {
    _offerForm?: FormGroup;

    constructor() {
        addIcons({checkmarkOutline})
        addIcons({calendarOutline})
    }

    ngOnInit() {
    }

    onCreateOffer() {
        if (this._offerForm?.invalid) {
            return;
        }
        console.log(this._offerForm);
    }

    onFormReady($event: FormGroup) {
        this._offerForm = $event;
    }
}

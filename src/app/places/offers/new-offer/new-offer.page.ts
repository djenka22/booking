import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {addIcons} from "ionicons";
import {calendarOutline, checkmarkOutline} from "ionicons/icons";
import {OfferFormComponent} from "../offer-form/offer-form.component";
import {PlacesService} from "../../places.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-new-offer',
    templateUrl: './new-offer.page.html',
    styleUrls: ['./new-offer.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon, ReactiveFormsModule, OfferFormComponent, IonLoading]
})
export class NewOfferPage implements OnInit, OnDestroy {
    _offerForm?: FormGroup;
    loading: boolean = false;
    newOfferSubscription!: Subscription

    constructor(private placeService: PlacesService,
                private navController: NavController) {
        addIcons({checkmarkOutline})
        addIcons({calendarOutline})
    }

    ngOnDestroy(): void {
        if (this.newOfferSubscription) {
            this.newOfferSubscription.unsubscribe();
        }
    }

    ngOnInit() {
    }

    async onCreateOffer() {
        if (this._offerForm?.invalid || !this._offerForm?.get('image')?.value) {
            console.log('Form is invalid or image is not selected');
            return;
        }
        this.loading = true;
        await this.placeService.addPlace(
            this._offerForm?.value['title'],
            this._offerForm?.value['description'],
            this._offerForm?.value['price'],
            new Date(this._offerForm?.value['availableFrom']),
            new Date(this._offerForm?.value['availableTo']),
        ).then(
            async (doc) => {
                const imageUrl = await this.placeService.uploadImage(doc.id, this._offerForm?.value['image']);
                await this.placeService.updateImageUrl(doc.id, imageUrl);
                this._offerForm?.reset();
                this.loading = false;
            });
    }

    onOfferCreated() {
        this.navController.navigateBack('/places/tabs/offers');
    }

    get offerForm() {
        return this._offerForm;
    }

    onFormReady($event: FormGroup) {
        console.log('NewOfferPage: Form is ready', $event);
        this._offerForm = $event;
    }
}

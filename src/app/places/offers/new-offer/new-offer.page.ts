import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    AlertController,
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
    newOfferSubscription!: Subscription;
    createdPlaceTitle: string = '';

    constructor(private placeService: PlacesService,
                private navController: NavController,
                private alertController: AlertController) {
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
            {
                title: this._offerForm!.value['title'],
                description: this._offerForm!.value['description'],
                price: this._offerForm!.value['price'],
                guestNumber: this._offerForm!.value['guestNumber'],
                availableFrom: new Date(this._offerForm!.value['availableFrom']),
                availableTo: new Date(this._offerForm!.value['availableTo']),
            }
        ).then(
            async (doc) => {
                this.createdPlaceTitle = this._offerForm?.value['title'];
                const imageUrl = await this.placeService.uploadImage(doc.id, this._offerForm?.value['image']);
                await this.placeService.updateImageUrl(doc.id, imageUrl);
                this.loading = false;
            });
    }

    onOfferCreated() {
        this.presentOfferCreatedAlert()
    }


    get offerForm() {
        return this._offerForm;
    }

    onFormReady($event: FormGroup) {
        this._offerForm = $event;
    }

    private presentOfferCreatedAlert() {
        return this.alertController.create({
            header: `${this.createdPlaceTitle}`,
            message: 'Your offer has been successfully created.',
            buttons: [{
                text: 'Okay',
                role: 'destructive',
                handler: () => {
                    this.navController.navigateBack('/places/tabs/offers');
                    this._offerForm?.reset();
                }

            }],
        }).then(alert => {
            alert.present();
        })
    }
}

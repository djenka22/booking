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
import {PlaceDto} from "../../model/place.model";
import {Timestamp} from "firebase/firestore";
import {AuthService} from "../../../auth/auth.service";

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
                private alertController: AlertController,
                private authService: AuthService) {
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
        let featuredPlace = false;
        this.authService.user.subscribe(
            user => {
                if (user!.roles.includes('premium')) {
                    featuredPlace = true;
                }
            }
        )
        this.loading = true;
        await this.placeService.createPlace(
            new PlaceDto(
                {
                    title: this._offerForm!.value['title'],
                    description: this._offerForm!.value['description'],
                    price: this._offerForm!.value['price'],
                    guestNumber: this._offerForm!.value['guestNumber'],
                    availableFrom: Timestamp.fromDate(new Date(this._offerForm!.value['availableFrom'])),
                    availableTo: Timestamp.fromDate(new Date(this._offerForm!.value['availableTo'])),
                    featured: featuredPlace,
                }
            )
        ).then(
            async (placeId) => {
                this.createdPlaceTitle = this._offerForm!.value['title'];
                const imageUrl = await this.placeService.uploadImage(placeId, this._offerForm?.value['image']);
                await this.placeService.updateImageUrl(placeId, imageUrl);
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

import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    AlertController,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonImg,
    IonRow,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
    NavController
} from '@ionic/angular/standalone';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {Place} from "../../model/place.model";
import {ActivatedRouteService} from "../../shared/activated-route.service";
import {PlacesService} from "../../places.service";
import {BookingService} from "../../../bookings/booking.service";
import {switchMap, take} from "rxjs";

@Component({
    selector: 'app-offer-bookings',
    templateUrl: './offer-bookings.page.html',
    styleUrls: ['./offer-bookings.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, IonButton, RouterLink, IonCol, IonGrid, IonRow, IonSpinner, IonImg, IonText]
})
export class OfferBookingsPage implements OnInit {

    private _place!: Place;
    private _fetchLoading: boolean = false;
    private _hasPlaceFutureBookings: boolean = false;

    constructor(private navController: NavController,
                private activatedRouteService: ActivatedRouteService,
                private activatedRoute: ActivatedRoute,
                private placeService: PlacesService,
                private bookingService: BookingService,
                private alertController: AlertController) {
    }

    ngOnInit() {
        console.log('OfferBookingsPage ngOnInit');
        this._fetchLoading = true;
        this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute, 'placeId').pipe(
            take(1),
            switchMap(place => {
                this._place = place;
                return this.bookingService.hasPlaceFutureBookings(place);
            })

        ).subscribe(
            {
                next: hasPlaceFutureBookings => {
                    this._hasPlaceFutureBookings = hasPlaceFutureBookings;
                    this._fetchLoading = false;
                },
            }
        );
    }

    ionViewWillEnter() {
        this.placeService.validatePlaceUpdated(this.place).subscribe(
            place => {
                if (place) {
                    this._place = place;
                }
            }
        );
    }

    get hasPlaceFutureBookings(): boolean {
        return this._hasPlaceFutureBookings;
    }

    get place(): Place {
        return this._place;
    }

    get fetchLoading(): boolean {
        return this._fetchLoading;
    }

    onDeleteOffer() {
        this.alertController.create({
            header: 'Are you sure?',
            message: 'Are you sure you want to delete this offer?.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    cssClass: 'delete-button-color',
                    handler: async () => await this.deleteOfferAndShowAlert()
                }]
        }).then(alert => {
            alert.present();
        })
    }

    async deleteOfferAndShowAlert() {
        await this.placeService.delete(this.place).then(() => {
            this.alertController.create({
                header: 'Offer deleted',
                message: `The offer for ${this.place.title} has been successfully deleted.`,
                buttons: [{
                    text: 'Okay',
                    role: 'destructive',
                    handler: () => {
                        this.navController.navigateBack('/places/tabs/offers');
                    }
                }]
            }).then(alert => {
                alert.present();
            })
        })
    }

}

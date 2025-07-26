import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    AlertController,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
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
import {forkJoin, map, of, switchMap, take} from "rxjs";
import {BookingItemComponent, BookingWithUser} from "../../../bookings/booking-item/booking-item.component";
import {addIcons} from "ionicons";
import {closeCircleOutline} from "ionicons/icons";
import {AuthService} from "../../../auth/auth.service";

@Component({
    selector: 'app-offer-detail',
    templateUrl: './offer-detail.page.html',
    styleUrls: ['./offer-detail.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, IonButton, RouterLink, IonCol, IonGrid, IonRow, IonSpinner, IonImg, IonText, BookingItemComponent, IonLabel, IonModal, IonIcon, IonItem, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList]
})
export class OfferDetailPage implements OnInit {
    @ViewChild('futureBookingsModal') futureBookingsModal!: IonModal;
    @ViewChild('activeBookingsModal') activeBookingsModal!: IonModal;

    private _place!: Place;
    private _fetchLoading: boolean = false;
    private _hasFutureBookings: boolean = false;
    private _hasActiveBooking: boolean = false;
    private _activeBookingWithUser!: BookingWithUser

    constructor(private navController: NavController,
                private activatedRouteService: ActivatedRouteService,
                private activatedRoute: ActivatedRoute,
                private placeService: PlacesService,
                private bookingService: BookingService,
                private alertController: AlertController,
                private authService: AuthService) {
        addIcons({closeCircleOutline})
    }

    ngOnInit() {
        console.log('OfferDetailPage ngOnInit');
        this._fetchLoading = true;
        this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute, 'placeId').pipe(
            take(1),
            switchMap(place => {
                this._place = place;

                return forkJoin({
                    activeBooking: this.bookingService.findActiveBookingByPlaceId(place.id).pipe(take(1)),
                    futureBookings: this.bookingService.findAllBookingsByPlaceIdAfterBookingDate(place.id, new Date()).pipe(take(1))
                })
            }),
            switchMap(({activeBooking, futureBookings }) => {
                this._hasActiveBooking = !!activeBooking;
                this._hasFutureBookings = futureBookings.length > 0;
                return forkJoin({
                    user: this.hasActiveBooking ? this.authService.findUserById(activeBooking!.user.id).pipe(take(1)) : of(null),
                    activeBooking: of(activeBooking)
                });

            }),
            map(({user, activeBooking}) => {
                if (user && activeBooking) {
                    this._activeBookingWithUser = {
                        booking: {...activeBooking},
                        user: user
                    };
                }
            })
        ).subscribe(
            {
                next: () => {
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

    get hasFutureBookings(): boolean {
        return this._hasFutureBookings;
    }

    get hasActiveBooking(): boolean {
        return this._hasActiveBooking;
    }

    get place(): Place {
        return this._place;
    }

    get fetchLoading(): boolean {
        return this._fetchLoading;
    }

    get activeBookingWithUser(): BookingWithUser {
        return this._activeBookingWithUser;
    }

    onDeleteOffer() {
        this.alertController.create({
            header: 'Are you sure?',
            message: 'Are you sure you want to delete this offer?',
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
                    handler: () => {
                        this.navController.navigateBack('/places/tabs/offers');
                    }
                }]
            }).then(alert => {
                alert.present();
            })
        })
    }

    onCancelFutureBookingsModal() {
        this.futureBookingsModal.dismiss();
    }

    onCancelActiveBookingModal() {
        this.activeBookingsModal.dismiss();
    }
}

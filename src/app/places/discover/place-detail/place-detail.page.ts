import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    AlertController,
    IonActionSheet,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonImg,
    IonLoading,
    IonModal,
    IonRow,
    IonSpinner,
    IonTitle,
    IonToolbar,
    NavController
} from '@ionic/angular/standalone';
import {ActivatedRoute} from "@angular/router";
import {Place} from "../../model/place.model";
import {ActivatedRouteService} from "../../shared/activated-route.service";
import {CreateBookingComponent} from "../../../bookings/create-booking/create-booking.component";
import {BookingService} from "../../../bookings/booking.service";
import {Booking, CreateBookingDto} from "../../../bookings/booking.model";
import {AuthService} from "../../../auth/auth.service";
import {PlacesService} from "../../places.service";

@Component({
    selector: 'app-place-detail',
    templateUrl: './place-detail.page.html',
    styleUrls: ['./place-detail.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonModal, CreateBookingComponent, IonActionSheet, IonImg, IonGrid, IonRow, IonCol, IonLoading, IonSpinner]
})
export class PlaceDetailPage implements OnInit {

    place!: Place;
    _bookModalOpen: boolean = false
    _actionSheetOpen = false;
    private _bookModalActionMode!: 'select' | 'random';
    private _loading: boolean = false;
    isBookable: boolean = false;
    private _fetchLoading: boolean = false;
    private _existingBooking!: Booking


    public actionSheetButtons = [
        {
            text: 'Select Date',
            handler: () => {
                this.openBookModal('select')
            }
        },
        {
            text: 'Random Date',
            handler: () => this.openBookModal('random')

        },
        {
            text: 'Cancel',
            role: 'cancel',
            data: {
                action: 'cancel',
            },
        },
    ];


    constructor(private navController: NavController,
                private activatedRouteService: ActivatedRouteService,
                private activatedRoute: ActivatedRoute,
                private bookingService: BookingService,
                private authService: AuthService,
                private alertController: AlertController,
                private placeService: PlacesService) {
    }


    ngOnInit() {
        this._fetchLoading = true;
        this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute, 'placeId').subscribe(
            {
                next: async place => {
                    this.place = place;
                    this.isBookable = place.userId !== this.authService.userId;
                    await this.bookingService.findBookingByPlaceIdAndUserId(this.place.id, this.authService.userId).then((booking) => {
                        if (booking) {
                            this._existingBooking = booking;
                        }
                        this._fetchLoading = false;
                    });
                },
                error: () => {
                    this._fetchLoading = false;
                    this.alertController.create({
                        header: 'An error occurred',
                        message: 'Could not load place details. Please try again later.',
                        buttons: [{
                            text: 'Okay',
                            handler: () => {
                                this.navController.navigateBack('/places/tabs/discover');
                            }
                        }]
                    }).then(alert => {
                        alert.present();
                    })
                }
            })
    }

    ionViewWillEnter() {
        this.placeService.validatePlaceUpdated(this.place).subscribe(
            place => {
                if (place) {
                    this.place = place;
                }
            }
        );
    }

    get existingBooking() {
        return this._existingBooking;
    }

    get fetchLoading() {
        return this._fetchLoading;
    }

    get loading() {
        return this._loading;
    }

    public get bookModalOpen() {
        return this._bookModalOpen;
    }

    setModalOpen(isOpen: boolean) {
        this._bookModalOpen = isOpen;
    }

    get actionSheetOpen() {
        return this._actionSheetOpen;
    }

    setActionSheetOpen(open: boolean) {
        this._actionSheetOpen = open;
    }

    get bookModalActionMode() {
        return this._bookModalActionMode;
    }

    openBookModal(actionMode: 'select' | 'random') {
        this._bookModalActionMode = actionMode;
        this.setModalOpen(true);
        this.setActionSheetOpen(false);
    }

    openBookModalForEdit() {
        this.setModalOpen(true);
    }

    async onModalClosed(event: CreateBookingDto) {
        if (event.role === 'cancel') {
            this.closeModal();
            return;
        }

        if (event.bookingData) {
            this._loading = true;
            if (event.role === 'confirm') {
                await this.bookingService.addBooking(
                    this.place.id,
                    event.bookingData.guestNumber,
                    event.bookingData.startDate,
                    event.bookingData.endDate
                );
            } else {
                await this.bookingService.updateBooking(
                    this._existingBooking.id,
                    event.bookingData.startDate,
                    event.bookingData.endDate,
                    event.bookingData.guestNumber,
                );
            }
            this._loading = false;
            this.closeModal();
        }
    }

    onPlaceBooked() {
        setTimeout(() => {
            this.navController.navigateBack('/bookings');
        }, 200)
    }

    closeModal() {
        this.setModalOpen(false);
    }

}

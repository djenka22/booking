import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
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
    IonTitle,
    IonToolbar,
    NavController
} from '@ionic/angular/standalone';
import {ActivatedRoute} from "@angular/router";
import {Place} from "../../place.model";
import {ActivatedRouteService} from "../../shared/activated-route.service";
import {CreateBookingComponent} from "../../../bookings/create-booking/create-booking.component";
import {BookingService} from "../../../bookings/booking.service";
import {CreateBookingDto} from "../../../bookings/booking.model";
import {AuthService} from "../../../auth/auth.service";

@Component({
    selector: 'app-place-detail',
    templateUrl: './place-detail.page.html',
    styleUrls: ['./place-detail.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonModal, CreateBookingComponent, IonActionSheet, IonImg, IonGrid, IonRow, IonCol, IonLoading]
})
export class PlaceDetailPage implements OnInit {

    place!: Place;
    _bookModalOpen: boolean = false
    _actionSheetOpen = false;
    private _bookModalActionMode!: 'select' | 'random';
    private _loading: boolean = false;
    isBookable: boolean = false;


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
                private authService: AuthService) {
    }

    ngOnInit() {
        let place = this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute, 'placeId');
        console.log(place);
        if (!place) {
            this.navController.navigateBack('/places/tabs/offers');
            return;
        }
        this.place = place;
        this.isBookable = place.userId !== this.authService.userId;
    }

    get loading() {
        return this._loading;
    }

    get bookModalOpen() {
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

    onModalClosed(event: CreateBookingDto) {
        if (event.role === 'confirm' && event.bookingData) {
            this._loading = true;
            this.bookingService.addBooking(
                this.place.id,
                this.place.title,
                this.place.imageUrl,
                event.bookingData.firstName,
                event.bookingData.lastName,
                event.bookingData.guestNumber,
                event.bookingData.startDate,
                event.bookingData.endDate
            ).subscribe(() => {
                this._loading = false;
                this.closeModal();
            });
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

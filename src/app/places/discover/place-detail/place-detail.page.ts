import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonActionSheet,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    NavController
} from '@ionic/angular/standalone';
import {ActivatedRoute} from "@angular/router";
import {Place} from "../../place.model";
import {ActivatedRouteService} from "../../shared/activated-route.service";
import {CreateBookingComponent} from "../../../bookings/create-booking/create-booking.component";

@Component({
    selector: 'app-place-detail',
    templateUrl: './place-detail.page.html',
    styleUrls: ['./place-detail.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonModal, CreateBookingComponent, IonActionSheet]
})
export class PlaceDetailPage implements OnInit {

    place!: Place;
    _bookModalOpen: boolean = false
    _actionSheetOpen = false;
    private _bookModalActionMode!: 'select' | 'random';


    public actionSheetButtons = [
        {
            text: 'Select Date',
            handler: () => {
                this.openBookModal('select')}
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
                private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        let place = this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute, 'placeId');
        console.log(place);
        if (!place) {
            this.navController.navigateBack('/places/tabs/offers');
            return;
        }
        this.place = place;
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

    onModalClosed(event: any) {
        this._bookModalOpen = false;
        console.log(event);
    }
}

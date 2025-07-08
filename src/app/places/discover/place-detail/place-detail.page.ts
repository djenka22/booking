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


    public actionSheetButtons = [
        {
            text: 'Select Date',
            handler: () => this.setModalOpen(true)
        },
        {
            text: 'Random Date',
            handler: () => this.setModalOpen(true)

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

}

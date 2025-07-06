import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    ModalController,
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
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonModal, CreateBookingComponent]
})
export class PlaceDetailPage implements OnInit {

    _place!: Place;
    isBookModalOpen: boolean = false

    constructor(private navController: NavController,
                private activatedRouteService: ActivatedRouteService,
                private activatedRoute: ActivatedRoute,
                private modalController: ModalController) {
    }

    ngOnInit() {
        let place = this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute, 'placeId');
        if (!place) {
            this.navController.navigateBack('/places/tabs/offers');
            return;
        }
        this._place = place;
    }

    setModalOpen(isOpen: boolean) {
        this.isBookModalOpen = isOpen;
    }

    onModalClosed($event: string) {
        this.setModalOpen(false);
    }
}

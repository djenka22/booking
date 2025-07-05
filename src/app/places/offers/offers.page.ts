import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonList,
    IonMenuButton,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {NonFeaturedPlaceComponent} from "../shared/non-featured-place/non-featured-place.component";
import {PlacesService} from "../places.service";
import {Place} from "../place.model";
import {addIcons} from "ionicons";
import {addOutline} from "ionicons/icons";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-offers',
    templateUrl: './offers.page.html',
    styleUrls: ['./offers.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCol, IonGrid, IonList, IonRow, NonFeaturedPlaceComponent, IonButtons, IonButton, IonIcon, RouterLink, IonMenuButton]
})
export class OffersPage implements OnInit {

    loadedOffers?: Place[];

    constructor(private placesService: PlacesService) {
        addIcons({addOutline})
    }

    ngOnInit() {
        this.loadedOffers = this.placesService.places;
    }

}

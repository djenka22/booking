import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonList,
    IonMenuButton,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {PlacesService} from "../places.service";
import {Place} from "../place.model";
import {FeaturedPlacesFilterPipe} from "../pipes/FeaturedPlacesFilterPipe";
import {FeaturedPlaceComponent} from "../shared/featured-place/featured-place.component";
import {CommonPlaceComponent} from "../shared/common-place/common-place.component";

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonRow, IonCol, IonList, FeaturedPlacesFilterPipe, IonButtons, FeaturedPlaceComponent, IonMenuButton, CommonPlaceComponent]
})
export class DiscoverPage implements OnInit {

  loadedPlaces!: Place[];

  constructor(private placesService: PlacesService) { }

  ngOnInit() {
    this.loadedPlaces = this.placesService.places;
  }
}

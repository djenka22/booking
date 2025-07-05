import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton, IonButtons,
  IonCard, IonCardContent,
  IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader, IonImg, IonItem, IonLabel, IonList,
  IonRow, IonThumbnail,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {PlacesService} from "../places.service";
import {Place} from "../place.model";
import {FeaturedPlacesFilterPipe} from "../pipes/FeaturedPlacesFilterPipe";
import {RouterLink} from "@angular/router";
import {FeaturedPlaceComponent} from "../shared/featured-place/featured-place.component";
import {NonFeaturedPlaceComponent} from "../shared/non-featured-place/non-featured-place.component";

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonImg, IonList, IonItem, IonThumbnail, IonLabel, FeaturedPlacesFilterPipe, IonButton, RouterLink, IonButtons, FeaturedPlaceComponent, NonFeaturedPlaceComponent]
})
export class DiscoverPage implements OnInit {

  loadedPlaces!: Place[];

  constructor(private placesService: PlacesService) { }

  ngOnInit() {
    this.loadedPlaces = this.placesService.places;
  }
}

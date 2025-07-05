import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar, NavController
} from '@ionic/angular/standalone';
import {ActivatedRoute, Router} from "@angular/router";
import {PlacesService} from "../../places.service";
import {Place} from "../../place.model";

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton]
})
export class PlaceDetailPage implements OnInit {

  _place!: Place;

  constructor(private navController: NavController,
              private placesService: PlacesService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      if (params.has('placeId')) {
        const placeId = params.get('placeId');
        if (placeId) {
          this._place = this.placesService.getPlace(placeId);
        }
      }
    })
  }

  onBookPlace() {
    this.navController.navigateBack(['/', 'places', 'tabs', 'discover', ]);
  }
}

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
import {ActivatedRouteService} from "../../shared/activated-route.service";

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
              private activatedRouteService: ActivatedRouteService,
              private activatedRoute: ActivatedRoute){
  }

  ngOnInit() {
    let place = this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute,'placeId');
    if (!place) {
      this.navController.navigateBack('/places/tabs/offers');
      return;
    }
    this._place = place;
  }

  onBookPlace() {
    this.navController.navigateBack(['/', 'places', 'tabs', 'discover', ]);
  }
}

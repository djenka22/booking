import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  NavController
} from '@ionic/angular/standalone';
import {Place} from "../../place.model";
import {ActivatedRoute} from "@angular/router";
import {PlacesService} from "../../places.service";
import {ActivatedRouteService} from "../../shared/activated-route.service";

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons]
})
export class EditOfferPage implements OnInit {

  _place!: Place;

  constructor(private navController: NavController,
              private activatedRoute: ActivatedRoute,
              private activatedRouteService: ActivatedRouteService) { }

  ngOnInit() {
    let place = this.activatedRouteService.findPlaceBasedOnRoute(this.activatedRoute,'offerId');
    if (!place) {
      this.navController.navigateBack('/places/tabs/offers');
      return;
    }
    this._place = place;
  }

}

import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar} from '@ionic/angular/standalone';
import {Place} from "../../place.model";
import {ActivatedRoute} from "@angular/router";
import {PlacesService} from "../../places.service";

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons]
})
export class EditOfferPage implements OnInit {

  _place!: Place;

  constructor(private placesService: PlacesService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      if (params.has('offerId')) {
        const placeId = params.get('offerId');
        if (placeId) {
          this._place = this.placesService.getPlace(placeId);
        }
      }
    })
  }

}

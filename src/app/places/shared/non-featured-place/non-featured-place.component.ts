import { Component, input, OnInit } from '@angular/core';
import {Place} from "../../place.model";
import {RouterLink} from "@angular/router";
import {IonImg, IonItem, IonLabel, IonThumbnail} from "@ionic/angular/standalone";

@Component({
  selector: 'app-non-featured-place',
  templateUrl: './non-featured-place.component.html',
  styleUrls: ['./non-featured-place.component.scss'],
  imports: [
    RouterLink,
    IonImg,
    IonThumbnail,
    IonItem,
    IonLabel
  ]
})
export class NonFeaturedPlaceComponent  implements OnInit {

  _place = input.required<Place>();
  _routerLinkPath = input.required<string[]>();

  constructor() { }

  ngOnInit() {}

}

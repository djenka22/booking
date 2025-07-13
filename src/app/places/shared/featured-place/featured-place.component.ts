import {Component, input, OnInit} from '@angular/core';
import {Place} from "../../model/place.model";
import {CurrencyPipe} from "@angular/common";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonImg
} from "@ionic/angular/standalone";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-featured-place',
  templateUrl: './featured-place.component.html',
  styleUrls: ['./featured-place.component.scss'],
  imports: [
    CurrencyPipe,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonImg,
    RouterLink
  ]
})
export class FeaturedPlaceComponent  implements OnInit {

  _place = input.required<Place>();
  _routerLinkPath = input.required<string[]>();

  constructor() { }

  ngOnInit() {}

}

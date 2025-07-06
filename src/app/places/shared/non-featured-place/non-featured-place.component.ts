import {Component, input, OnInit} from '@angular/core';
import {Place} from "../../place.model";
import {IonItemOption, IonItemOptions, IonItemSliding,} from "@ionic/angular/standalone";
import {CommonPlaceComponent} from "../common-place/common-place.component";

@Component({
  selector: 'app-non-featured-place',
  templateUrl: './non-featured-place.component.html',
  styleUrls: ['./non-featured-place.component.scss'],
  imports: [
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    CommonPlaceComponent
  ]
})
export class NonFeaturedPlaceComponent  implements OnInit {

  place = input.required<Place>();
  routerLinkPath = input.required<string[]>();

  constructor() { }

  ngOnInit() {}

}

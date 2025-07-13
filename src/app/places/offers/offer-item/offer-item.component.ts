import {Component, input, OnInit} from '@angular/core';
import {Place} from "../../model/place.model";
import {IonIcon, IonItemOption, IonItemOptions, IonItemSliding, NavController,} from "@ionic/angular/standalone";
import {CommonPlaceComponent} from "../../shared/common-place/common-place.component";
import {addIcons} from "ionicons";
import {createOutline} from "ionicons/icons";

@Component({
  selector: 'app-offer-item',
  templateUrl: './offer-item.component.html',
  styleUrls: ['./offer-item.component.scss'],
  imports: [
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    CommonPlaceComponent,
    IonIcon
  ]
})
export class OfferItemComponent implements OnInit {

  place = input.required<Place>();
  offerDetailPath = input.required<string[]>();
  editOfferPath = input.required<string[]>();

  constructor(private navController: NavController) {
    addIcons({createOutline})
  }

  ngOnInit() {}

  onEdit(slidingItem: IonItemSliding) {
    slidingItem.close();
    this.navController.navigateForward(this.editOfferPath());
  }

}

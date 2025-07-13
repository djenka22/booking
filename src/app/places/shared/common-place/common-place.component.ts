import {Component, input, OnInit} from '@angular/core';
import {IonImg, IonItem, IonLabel, IonThumbnail} from "@ionic/angular/standalone";
import {RouterLink} from "@angular/router";
import {Place} from "../../model/place.model";

@Component({
    selector: 'app-common-place',
    templateUrl: './common-place.component.html',
    styleUrls: ['./common-place.component.scss'],
    imports: [
        IonItem,
        RouterLink,
        IonImg,
        IonThumbnail,
        IonLabel
    ]
})
export class CommonPlaceComponent  implements OnInit {

    place = input.required<Place>();
    routerLinkPath = input.required<string[]>();

    constructor() { }

  ngOnInit() {}

}

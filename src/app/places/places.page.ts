import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonTabs,

} from '@ionic/angular/standalone';
import {addIcons} from "ionicons";
import { searchOutline } from 'ionicons/icons';
import { cardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonTabs, IonTabBar, IonTabButton, IonIcon]
})
export class PlacesPage implements OnInit {

  constructor() {
    addIcons({searchOutline});
    addIcons({cardOutline});
  }

  ngOnInit() {
  }

}

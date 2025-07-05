import {Component} from '@angular/core';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {addIcons} from "ionicons";
import {businessOutline, checkboxOutline, exitOutline} from "ionicons/icons";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, RouterLink, IonMenuToggle],
})
export class AppComponent {
  constructor() {
    addIcons({businessOutline})
    addIcons({checkboxOutline})
    addIcons({exitOutline})
  }

  onLogout() {
    console.log('Logout clicked');
  }
}

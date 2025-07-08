import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonLoading,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonLoading, IonGrid, IonRow, IonCol, IonList, IonItem, IonInput]
})
export class AuthPage implements OnInit {

  loading: boolean = false;

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
  }

  onLogin() {
    this.loading = true;
    this.authService.login();
    setTimeout( () => {
          this.loading = false;
        }
        , 1000)
  }

  openHomePage() {
    this.router.navigate(['/', 'places', 'tabs', 'discover']);
  }
}

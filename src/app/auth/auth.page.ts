import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonButton, IonContent, IonHeader, IonTitle, IonToolbar} from '@ionic/angular/standalone';
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton]
})
export class AuthPage implements OnInit {

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
  }

  onLogin() {
    this.authService.login();
    this.router.navigate(['/', 'places', 'tabs', 'discover']);
  }
}

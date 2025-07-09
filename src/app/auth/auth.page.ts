import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
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
    IonText,
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
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButton, IonLoading, IonGrid, IonRow, IonCol, IonList, IonItem, IonInput, FormsModule, ReactiveFormsModule, IonText]
})
export class AuthPage implements OnInit {

    loading: boolean = false;
    authForm!: FormGroup;

    constructor(private authService: AuthService,
                private router: Router,
                private formBuilder: FormBuilder) {
        this.authForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit() {
    }

    get email() {
      return this.authForm.get('email');
    }

    get password() {
      return this.authForm.get('password');
    }

    onLogin() {
        this.loading = true;
        this.authService.login();
        setTimeout(() => {
                this.loading = false;
            }
            , 1000)
    }

    openHomePage() {
        this.router.navigate(['/', 'places', 'tabs', 'discover']);
    }
}
